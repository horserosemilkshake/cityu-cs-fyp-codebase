import React, { useContext, useEffect, useState, useMemo } from 'react';
import { View, Button, StyleSheet, Text, Pressable, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import CookieManager, { Cookie } from '@react-native-cookies/cookies';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store.ts';
import { baseURL, calculateTimeDifference, computeMatic } from '../global.ts';
import { clear } from '../State/List/ListSlice.ts';
import { incrementByAmount, setAmount } from '../State/Counter/CounterSlice.ts';
import { add } from '../State/Prices/PriceSlice.ts';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';


interface PackageSelectionProps {
    navigation: any;
}

// Define a type for the package data
export type Package = {
    id: string,
    package_id: string,
    package_description: string,
    package_weight_in_kg: Double,
    package_height: Double,
    package_length: Double,
    package_width: Double,
    package_recipient_name: string,
    package_pickup_location: string,
    package_pickup_coordinate: string,
    package_destination: string,
    package_destination_coordinate: string,
    finished: boolean,
    responsible_driver_name: string | null,
    // deadline: string | number[]
    deadline: string
};

export type PackingSchemeObject = {
    id: string,
    size: [number, number, number],
    count: number
};

export type PackingSchemeBody = {
    username: string,
    content: {
        box: { dimensions: [number, number, number] },
        items: PackingSchemeObject[],
        method: string
    }
};

export interface IHash {
    [deatils: string]: number[][],
}

export interface DHash {
    [deatils: string]: number[],
}

export interface PHash {
    [deatils: string]: string[],
}

const PackageSelection: React.FC<PackageSelectionProps> = ({ navigation }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [packages, setPackages] = useState<Package[]>([]);

    const gList = useSelector((state: RootState) => state.list.value); //selectedList
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const warehouseNeededInThisRound = useSelector((state: RootState) => state.profile.warehouseNeededInThisRound);

    const trunkLength = useSelector((state: RootState) => state.profile.trunkLength);
    const trunkWidth = useSelector((state: RootState) => state.profile.trunkWidth);
    const trunkHeight = useSelector((state: RootState) => state.profile.trunkHeight);

    const amount = useSelector((state: RootState) => state.counter.value);

    const lat = useSelector((state: RootState) => state.position.lat);
    const lon = useSelector((state: RootState) => state.position.lon);

    const price = useSelector((state: RootState) => state.price.value);

    const dispatch = useDispatch();

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const allAvailableAlgo = ["NN", "ACO", "TS"];

    const radioButtons: RadioButtonProps[] = useMemo(() => ([
        {
            id: '1', // acts as primary key, should be unique and non-empty string
            label: 'NN',
            value: 'NN'
        },
        {
            id: '2',
            label: 'ACO',
            value: 'NN'
        },
        {
            id: '3',
            label: 'TS',
            value: 'NN'
        }
    ]), []);

    const [selectedMode, setSelectedMode] = useState<string>("1");

    const fetchPackages = async () => {
        try {
            const url = baseURL + "/api/v1/driver/package";
            const data = {
                username: usernameGlobal,
                warehouse: warehouseNeededInThisRound,
            }
            let cookie: any;
            CookieManager.get(baseURL)
                .then((cookies) => {
                    cookie = cookies;
                    console.log('CookieManager.get =>', cookies);
                });

            const posUpdateurl = baseURL + "/api/v1/driver/update-position";
            const posData = {
                username: usernameGlobal,
                currentCoordinate: String(lat).concat(",").concat(String(lon)),
                lastCoordinate: String(lat).concat(",").concat(String(lon)),
                updateTimeInterval: 5.0,
            }

            await fetch(posUpdateurl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookie,
                    // Add any additional headers if required
                },
                body: JSON.stringify(posData),
            });

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookie,
                    // Add any additional headers if required
                },
                body: JSON.stringify(data),
            });
            setPackages(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        dispatch(setAmount(0));
        dispatch(clear());
        fetchPackages();
    }, []);

    const handlePackageSelect = (packageId: string) => {
        console.log("In handlePackageSelect: " + packageId.toString());
        const packageItem = packages.find((p) => p.package_id === packageId);
        if (packageItem) {
            navigation.navigate('Package Detail', { data: packageItem, handler: null });
        } else {
            console.log("Empty.");
        }
    };

    const handlePackingScheme = () => {
        let listToBeSubmitted: PackingSchemeObject[] = [];
        gList.forEach((p) => {
            let retrivedPackage: Package = packages.filter((obj) => obj.package_id === p)[0];
            listToBeSubmitted.push({ id: retrivedPackage.package_id, size: [retrivedPackage.package_length, retrivedPackage.package_width, retrivedPackage.package_height], count: 1 });
            dispatch(add([retrivedPackage.id, computeMatic(retrivedPackage.package_length, retrivedPackage.package_width, retrivedPackage.package_height)]));
        })
        let contentToBePassed: PackingSchemeBody = {
            username: usernameGlobal,
            content: {
                box: { dimensions: [trunkLength, trunkWidth, trunkHeight] },
                items: listToBeSubmitted,
                method: isEnabled ? "DBLF" : "SBBT",
            }
        };
        console.log(contentToBePassed);
        navigation.navigate("Packing Scheme", { data: contentToBePassed });
    }

    const handleRouting = async () => {
        let listToBeSubmitted: Package[] = [];
        gList.forEach((p) => {
            let retrivedPackage = packages.filter((obj) => obj.package_id === p)[0];
            listToBeSubmitted.push(retrivedPackage);
        })
        let pickup = new Set<number[]>();
        let delivery = new Set<number[]>();
        let pickup_point_of: IHash = {};
        let deadline_of: DHash = {};

        const url = baseURL + "/api/v1/driver/package"; //reserve package
        const requestData = {
            username: usernameGlobal,
            packageIds: gList,
            warehousePresent: warehouseNeededInThisRound,
        }
        let cookie: any;
        CookieManager.get(baseURL)
            .then((cookies) => {
                cookie = cookies;
                console.log('CookieManager.get =>', cookies);
            });
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie,
                // Add any additional headers if required
            },
            body: JSON.stringify(requestData),
        });
        console.log("res:");
        console.log(res);


        const currentDate = new Date();

        const currentHour = currentDate.getHours(); // Get current hour (0-23)
        const currentMinute = currentDate.getMinutes(); // Get current minute (0-59)

        const current_time = [currentHour, currentMinute]

        listToBeSubmitted.forEach((p) => {

            pickup.add([+p.package_pickup_coordinate.split(", ")[0], +p.package_pickup_coordinate.split(", ")[1]]);
            delivery.add([+p.package_destination_coordinate.split(", ")[0], +p.package_destination_coordinate.split(", ")[1]]);
            if (pickup_point_of[p.package_destination_coordinate] === undefined) {
                pickup_point_of[p.package_destination_coordinate] = [[+p.package_pickup_coordinate.split(", ")[0], +p.package_pickup_coordinate.split(", ")[1]]];
            } else {
                pickup_point_of[p.package_destination_coordinate].push([+p.package_pickup_coordinate.split(", ")[0], +p.package_pickup_coordinate.split(", ")[1]]);
                pickup_point_of[p.package_destination_coordinate] = Array.from(new Set<number[]>(pickup_point_of[p.package_destination_coordinate]));
            }
            // add deadline
            if (deadline_of[p.package_destination_coordinate] === undefined) {
                if (p.deadline.length === 5) {
                    if (p.deadline !== null) {
                        deadline_of[p.package_destination_coordinate] = [+p.deadline.toString().split(":")[0], +p.deadline.toString().split(":")[1]];
                    } else {
                        deadline_of[p.package_destination_coordinate] = [23, 59]
                    }
                } else {
                    deadline_of[p.package_destination_coordinate] = calculateTimeDifference((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1).toString().replace("T", " ").slice(0, 19), p.deadline);
                }
            } else {
                if (p.deadline.length === 5) {
                    const newTime = [+p.deadline.toString().split(":")[0], +p.deadline.toString().split(":")[1]];
                    const oldTime = deadline_of[p.package_destination_coordinate];
                    if (oldTime[0] * 100 + oldTime[1] > newTime[0] * 100 + newTime[1]) {
                        deadline_of[p.package_destination_coordinate] = newTime; //earliest deadline
                    }
                } else {
                    let newDeadline = calculateTimeDifference((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1).toString().replace("T", " ").slice(0, 19), p.deadline);
                    let oldDeadline = deadline_of[p.package_destination_coordinate];
                    if (newDeadline[0] * 60 + newDeadline[1] < oldDeadline[0] * 60 + oldDeadline[1]) {
                        deadline_of[p.package_destination_coordinate] = newDeadline; //earliest deadline
                    }
                }
            }
        })

        let routingContent = {
            username: usernameGlobal,
            content: {
                pickup: Array.from(pickup),
                delivery: Array.from(delivery),
                pickup_point_of: pickup_point_of,
                current_time: current_time,
                deadline_of: deadline_of,
                auxiliary_list: listToBeSubmitted,
                start: [lat, lon],
                method: allAvailableAlgo[+selectedMode - 1],
            }
        }

        navigation.navigate("Routing", { data: routingContent });
    }

    if (loading || packages.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text> Loading.... There seems to be no package available for delivery right now. </Text>
                <Pressable style={styles.bigButton} onPress={() => { navigation.navigate('Main'); }}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </Pressable>
            </View>
        );
    } else {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.caption}>Select Packages For Delivery</Text>
                <ScrollView style={styles.scrollView}>
                    {packages.map((packageItem) => {
                        return (
                            <TouchableOpacity
                                key={packageItem.package_id}
                                style={gList.includes(packageItem.package_id) ? styles.selectedPackageItem : styles.packageItem}
                                onPress={() => handlePackageSelect(packageItem.package_id)}
                            >
                                <Text>Content: {packageItem.package_description}</Text>
                                <Text>Pickup Location: {packageItem.package_pickup_location}</Text>
                                <Text>Delivery Location: {packageItem.package_destination}</Text>
                                {gList.includes(packageItem.package_id) && <Text>✓</Text>}
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
                <Text style={styles.caption}>{gList.length === 0 ? "No package selected." : "Number of packages selected: " + gList.length.toString()}</Text>
                <Text style={styles.caption}>{amount === 0 ? "No income." : "Total income after finishing all selected orders: ~ " + amount.toFixed(3) + " MATIC"}</Text>
                <View style={styles.switchContainer}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#ffffff' }}
                        thumbColor={isEnabled ? '#ccc' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />
                    <Text style={styles.text}>{isEnabled ? 'Scheme Computes With DBLF' : 'Scheme Computes With SBBT'}</Text>
                </View>
                <RadioGroup
                        radioButtons={radioButtons}
                        onPress={setSelectedMode}
                        selectedId={selectedMode}
                        layout='row'
                    />
                <Pressable style={gList.length != 0 ? styles.bigButton : styles.bigDisabledButton} onPress={gList.length === 0 ? null : handlePackingScheme}>
                    <Text style={styles.buttonText}>Compute Packing Scheme (Optional)</Text>
                </Pressable>
                <Pressable style={gList.length != 0 ? styles.bigButton : styles.bigDisabledButton} onPress={gList.length === 0 ? null : handleRouting}>
                    <Text style={styles.buttonText}>Plan Delivery Route With {allAvailableAlgo[+selectedMode - 1]} and Start Working</Text>
                </Pressable>
            </SafeAreaView>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    caption: {
        color: '#000000',
        fontSize: 18,
        width: '80%',
        textAlign: 'justify',
        fontWeight: 'bold',
        marginTop: '5%',
        marginLeft: '5%',
    },
    bigButton: {
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginVertical: 15,
        backgroundColor: 'black',
    },
    bigDisabledButton: {
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginVertical: 5,
        backgroundColor: '#808080',
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 15,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    scrollView: {
        borderWidth: 1,
        borderColor: 'black',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '40%',
        marginVertical: '5%',
    },
    packageItem: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedPackageItem: {
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        padding: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#ccc',
    },
    switchContainer: {
        marginTop: '5%',
        marginBottom: '5%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 8,
    },
});

export default PackageSelection;