import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../State/Store";
import { Package } from "./PackageSelection";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Pressable, StyleSheet, Alert, Clipboard } from "react-native";
import { isEnabled } from "react-native/Libraries/Performance/Systrace";
import { baseURL, computeMatic } from "../global";
import CookieManager from "@react-native-cookies/cookies";

interface HistoryScreenProps {
    navigation: any;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [packages, setPackages] = useState<Package[]>([]);

    const gList = useSelector((state: RootState) => state.list.value); //selectedList
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const warehouseNeededInThisRound = useSelector((state: RootState) => state.profile.warehouseNeededInThisRound);

    const trunkLength = useSelector((state: RootState) => state.profile.trunkLength);
    const trunkWidth = useSelector((state: RootState) => state.profile.trunkWidth);
    const trunkHeight = useSelector((state: RootState) => state.profile.trunkHeight);

    const amount = useSelector((state: RootState) => state.counter.value);

    const [trd, setTRD] = useState<string>("null");

    const dispatch = useDispatch();

    const handleHowToCheckClicked = async () => {
        Alert.alert("Explain", "You can click on an item in this list for its corresponding transaction hash (proving that your wallet received the delivery fees) and vet it in Polygonscan.", [
            { text: 'Ok', onPress: () => { } },
        ]);
    }

    const handleHistoryClicked = async (pID: string) => {
        console.log("handleHistoryClicked invoked");
        try {
            setLoading(true);
            const response: Response = await fetch(baseURL + '/api/v1/driver/transaction-reference-hash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify({ pID: pID }),
            });

            const res = await response.text();
            setTRD(res);
        } catch (Error) {
            console.log(Error);
        } finally {
            setLoading(false);
        }

        if (!loading) {
            if (trd !== null && trd !== "null" && trd !== "" && trd !== " " && trd !== "Error") {
                Alert.alert('Transaction hash validating that you\'ve been paid.', trd, [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Copy', onPress: () => Clipboard.setString(trd) },
                ]);
            } else {
                Alert.alert('Error', 'Transaction hash not found. This may be an internal transaction or the payment failed. Please contact administrator if in doubt.', [
                    { text: 'Ok', onPress: () => { } },
                ]);
            }
        }
    }

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const url = baseURL + "/api/v1/driver/record";
                const data = {
                    username: usernameGlobal,
                    warehouse: warehouseNeededInThisRound,
                }
                // let cookie: any;
                // CookieManager.get(baseURL)
                //     .then((cookies) => {
                //         cookie = cookies;
                //         console.log('CookieManager.get =>', cookies);
                //     });

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                    body: JSON.stringify(data),
                });
                setPackages(await res.json());
            } catch (error) {
                console.error(error);
            } finally {
                console.log(packages);
                setLoading(false);
            }
        }
        if (loading) {
            fetchPackages();
        }
    }), [packages];

    if (loading) {
        return (
            <>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text> Loading.... </Text>
                    <Pressable style={styles.bigButton} onPress={() => { navigation.navigate('Main'); }}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </>
        );
    } else if (packages.length === 0) {
        return (
            <>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text>No record detected. Deliver packages to add content to this page.</Text>
                    <Pressable style={styles.bigButton} onPress={() => { navigation.navigate('Main'); }}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </Pressable>
                </View>
            </>
        )
    } else {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.caption}>History</Text>
                <ScrollView style={styles.scrollView}>
                    {packages.map((packageItem) => {
                        return (
                            <TouchableOpacity
                                key={packageItem.package_id}
                                style={styles.selectedPackageItem}
                                onPress={() => { handleHistoryClicked(packageItem.package_id) }}
                            >
                                <Text>ID: {packageItem.package_id}</Text>
                                <Text>Content: {packageItem.package_description}</Text>
                                <Text>Pickup Location: {packageItem.package_pickup_location}</Text>
                                <Text>Delivery Location: {packageItem.package_destination}</Text>
                                <Text>Amount Received: {+computeMatic(packageItem.package_length, packageItem.package_width, packageItem.package_height)}</Text>
                                <Text>✓</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
                <Pressable style={styles.bigButton} onPress={() => { handleHowToCheckClicked() }}>
                    <Text style={styles.buttonText}>How to check my payment?</Text>
                </Pressable>
                <Pressable style={styles.bigButton} onPress={() => { navigation.navigate('Main'); }}>
                    <Text style={styles.buttonText}>Go Back</Text>
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
        marginVertical: 20,
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
        lineHeight: 21,
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        marginLeft: 8,
    },
});

export default HistoryScreen;