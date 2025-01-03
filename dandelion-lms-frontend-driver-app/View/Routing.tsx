import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { stackScreens } from "../App";
import { GOOGLE_MAPS_API_KEY, baseURL, externalServiceURL, getUsername, routingURL } from "../global";
import { Package } from "./PackageSelection";
import { useEffect, useState } from "react";
import { Button, GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import MapView, { Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../State/Store";
import RouteSlice, { add, clear } from "../State/Route/RouteSlice";
import MapViewDirections from 'react-native-maps-directions';
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Modal } from 'react-native';
import { setValue } from "../State/CurrentJobDone/CurrentJobDone";


const routingServiceURL = routingURL + "/route/v1";

// L.Marker.prototype.options.icon = L.icon({
//     iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//     iconSize: [35, 46],
//     iconAnchor: [17, 46]
// });

type RootStackParamList = {
    Screen1: undefined;
    Screen2: { data: any };
};

type propsType = NativeStackScreenProps<stackScreens, "Routing">

const Routing = (props: propsType) => {
    const { navigation, route } = props;
    const { data } = route.params;

    const [loading, setLoading] = useState<boolean>(true);
    const [distance, setDistance] = useState<number>(0);
    const [path, setPath] = useState<number[][]>([]);

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);

    const [listOfTasks, setListOfTasks] = useState<[]>([]);

    const dispatch = useDispatch();

    const handleItemClick = (index: number) => {
        if (expandedIndex === index) {
            setExpandedIndex(null); // Collapse if already expanded
        } else {
            setExpandedIndex(index); // Expand if not expanded
        }
    };

    let fullPath: number[][] = [];

    // const [pointer, setPointer] = useState<number>(0);
    const pointer = useSelector((state: RootState) => state.taskListPointer.taskListPointer);
    const done = useSelector((state: RootState) => state.currentJobDone.value);

    const fetchPackages = async () => {
        try {
            setDistance(0);
            setPath([]);
            const url = externalServiceURL + '/plan';
            console.log(data);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(data),
            });
            const temp = await res.json();
            setDistance(+temp["dist"] / 1000);

            let pickup_and_Delivery: number[][] = data["content"]["pickup"];
            pickup_and_Delivery = pickup_and_Delivery.concat(data["content"]["delivery"]);

            fullPath = []
            temp["route"].forEach((pos: number) => {
                fullPath.push(pickup_and_Delivery[pos]);
            });
            console.log(fullPath);

            const notifyURL = baseURL + "/api/v1/driver/path";
            await fetch(notifyURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify({
                    "username": usernameGlobal,
                    "path": fullPath,
                }),
            });

            setPath(fullPath);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const [position, setPosition] = useState({
        latitude: 10,
        longitude: 10,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    });

    const [targetLocation, setTargetLocation] = useState({
        latitude: 11,
        longitude: 11,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        let task: string[] = [];
        let temp: {
            [package_id: string]: Package;
        } = {};
        for (let index = 0; index < path.length; index++) {
            let target_coordinate = path[index];
            data["content"]["auxiliary_list"].forEach((p: Package) => {
                // number_of_processable_items_in_this_location = number_of_processable_items_in_this_location + 1;
                if (+p.package_pickup_coordinate.split(",")[0] === target_coordinate[0] && +p.package_pickup_coordinate.split(",")[1] === target_coordinate[1]) {
                    task.push("Pickup ".concat(p.package_id));
                    temp["Pickup ".concat(p.package_id)] = p;
                }
                if (+p.package_destination_coordinate.split(",")[0] === target_coordinate[0] && +p.package_destination_coordinate.split(",")[1] === target_coordinate[1]) {
                    task.push("Deliver ".concat(p.package_id));
                    temp["Deliver ".concat(p.package_id)] = p;
                }
            });
        }
        console.log("Content of task:");
        console.log(task.toString());
        if (task.length !== 0) {
            console.log(task[pointer].startsWith("Pickup") ? temp[task[pointer]].package_pickup_coordinate.split(",")[0] : temp[task[pointer]].package_destination_coordinate.split(",")[0]);
            console.log(task[pointer].startsWith("Pickup") ? temp[task[pointer]].package_pickup_coordinate.split(",")[1] : temp[task[pointer]].package_destination_coordinate.split(",")[1]);
            setTargetLocation({
                latitude: task[pointer].startsWith("Pickup") ? +temp[task[pointer]].package_pickup_coordinate.split(",")[0] : +temp[task[pointer]].package_destination_coordinate.split(",")[0],
                longitude: task[pointer].startsWith("Pickup") ? +temp[task[pointer]].package_pickup_coordinate.split(",")[1] : +temp[task[pointer]].package_destination_coordinate.split(",")[1],
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            })
        }
    }, [loading, pointer])

    // setTargetLocation({
    //     latitude: task[pointer].startsWith("Pickup") ? +temp[task[pointer]].package_pickup_location.split(",")[0] : +temp[task[pointer]].package_destination_coordinate.split(",")[0],
    //     longitude: task[pointer].startsWith("Pickup") ? +temp[task[pointer]].package_pickup_location.split(",")[1] : +temp[task[pointer]].package_destination_coordinate.split(",")[1],
    //     latitudeDelta: 0.1,
    //     longitudeDelta: 0.1,
    // })

    useFocusEffect(() => {
        const id = setInterval(() => Geolocation.getCurrentPosition((pos) => {
            const crd = pos.coords;
            const last_crd = { latitude: (position.latitude === 10) ? pos.coords.latitude : position.latitude, longitude: (position.longitude === 10) ? pos.coords.longitude : position.longitude };
            setPosition({
                latitude: crd.latitude,
                longitude: crd.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });

            const posUpdateurl = baseURL + "/api/v1/driver/update-position";
            const posData = {
                username: usernameGlobal,
                currentCoordinate: String(crd.latitude).concat(",").concat(String(crd.longitude)),
                lastCoordinate: String(last_crd.latitude).concat(",").concat(String(last_crd.longitude)),
                updateTimeInterval: 5.0,
            }

            fetch(posUpdateurl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(posData),
            });

        }), 5000);

        return () => clearInterval(id);
    });

    interface ButtonProps {
        onPress: (title: string) => void;
        title: string;
    }

    const ButtonP: React.FC<ButtonProps> = ({ onPress, title }) => {
        const handlePress = () => {
            onPress(title);
        };

        return (
            <TouchableOpacity key={title} style={styles.button} onPress={handlePress}>
                <Text key={title} style={styles.buttonText}>{title}</Text>
            </TouchableOpacity>
        );
    };

    function isEmptyObject(obj: any) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    const [modalVisible, setModalVisible] = useState(false);

    const renderCurrentJob = () => {
        let task: string[] = [];
        let temp: {
            [package_id: string]: Package;
        } = {};
        for (let index = 0; index < path.length; index++) {
            let target_coordinate = path[index];
            data["content"]["auxiliary_list"].forEach((p: Package) => {
                // number_of_processable_items_in_this_location = number_of_processable_items_in_this_location + 1;
                if (+p.package_pickup_coordinate.split(",")[0] === target_coordinate[0] && +p.package_pickup_coordinate.split(",")[1] === target_coordinate[1]) {
                    task.push("Pickup ".concat(p.package_id));
                    temp["Pickup ".concat(p.package_id)] = p;
                }
                if (+p.package_destination_coordinate.split(",")[0] === target_coordinate[0] && +p.package_destination_coordinate.split(",")[1] === target_coordinate[1]) {
                    task.push("Deliver ".concat(p.package_id));
                    temp["Deliver ".concat(p.package_id)] = p;
                }
            });
        }

        console.log("Content of temp:");
        console.log(temp);

        if (isEmptyObject(temp)) {
            return (
                <ScrollView style={styles.scrollView}>
                    {
                        <TouchableOpacity>
                            <View style={styles.expandedMessage}>
                                <Text key={pointer}>Rendering...</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </ScrollView>
            )
        }

        if (done) {
            return (
                <ScrollView style={styles.scrollView}>
                    {
                        <TouchableOpacity>
                            <View style={styles.expandedMessage}>
                                <Text key={pointer}>None</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </ScrollView>
            )
        }

        return (
            <ScrollView style={styles.scrollView}>
                {
                    <TouchableOpacity onPress={() => {
                        setModalVisible(false);
                        let type: string = task[pointer].split(' ')[0];
                        let package_id: string = task[pointer].split(' ')[1];
                        console.log(package_id);
                        if (type.includes("Pickup")) {
                            navigation.navigate("Scanner", { data: [package_id, type] });
                        } else {
                            navigation.navigate("DeliveryConfirm", { data: [package_id, temp[task[pointer]].package_recipient_name, String(task.length)] });
                        }
                    }}>
                        <View style={styles.expandedMessage}>
                            <Text key={pointer}>{task[pointer]}</Text>
                            <Text ellipsizeMode='tail' numberOfLines={2} style={{ width: 100 }} >From {temp[task[pointer]].package_pickup_location} to {temp[task[pointer]].package_destination}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </ScrollView>
        )
    }

    const pickedupList = useSelector((state: RootState) => state.pickup.value);
    const renderPickedup = () => {

        if (pickedupList.length === 0) {
            return (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.expandedMessage}>
                        <Text key={"None"}>None</Text>
                    </View>
                </ScrollView>
            )
        }

        return (
            <ScrollView style={styles.scrollView}>
                {
                    pickedupList.map(o =>
                        <View key={o.toString()} style={styles.expandedMessage}>
                            <Text key={o.toString()}>{o}</Text>
                        </View>
                    )
                }
            </ScrollView>
        )
    }

    const deliveredList = useSelector((state: RootState) => state.delivered.value);
    const renderDelivered = () => {

        if (deliveredList.length === 0) {
            return (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.expandedMessage}>
                        <Text key={"None"}>None</Text>
                    </View>
                </ScrollView>
            )
        }

        return (
            <ScrollView style={styles.scrollView}>
                {
                    deliveredList.map(o =>
                        <View key={o.toString()} style={styles.expandedMessage}>
                            <Text key={o.toString()}>{o}</Text>
                        </View>
                    )
                }
            </ScrollView>
        )
    }

    const renderDone = () => {
        if (done) {
            return (
                <Pressable
                    style={[styles.button, styles.buttonOpen]}
                    onPress={() => {
                        dispatch(setValue(false));
                        navigation.navigate("MainScreen");
                    }}>
                    <Text style={styles.textStyle}>Exit</Text>
                </Pressable>
            )
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.caption}>Total distance to pickup and deliver all the packages (excluding the traversal distance to the first pickup location): {distance.toPrecision(4)} Km.</Text>
            {(position.latitude === 10 && position.longitude == 10) && <Text>Loading Map...</Text>}
            {(position.latitude !== 10 && position.longitude !== 10) && <MapView
                style={styles.map}
                initialRegion={position}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followsUserLocation={true}
                showsCompass={true}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}>
                <Marker
                    title='Go Here.'
                    description='This is where you do pickup or delivery.'
                    coordinate={targetLocation} />
                <MapViewDirections
                    origin={position}
                    destination={targetLocation}
                    apikey={GOOGLE_MAPS_API_KEY}
                    strokeWidth={3}
                    strokeColor="hotpink"
                />
            </MapView>}
            {/* {renderProcessableItems()} */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>Current Task: </Text>
                        {renderCurrentJob()}
                        <Text>Picked Up: </Text>
                        {renderPickedup()}
                        <Text>Delivered: </Text>
                        {renderDelivered()}
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.textStyle}>Hide Tasks</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            {(!done) && <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.textStyle}>Show Tasks</Text>
            </Pressable>}
            {(done) && <Pressable
                    style={[styles.button, styles.buttonOpen]}
                    onPress={() => {
                        dispatch(setValue(false));
                        navigation.navigate("Main");
                    }}>
                    <Text style={styles.textStyle}>Exit</Text>
            </Pressable>}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#fff',
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
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginVertical: '5%',
    },
    expandedItem: {
        backgroundColor: '#f0f0f0',
    },
    itemText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    expandedMessage: {
        marginTop: 10,
        width: 300,
        padding: 10,
        backgroundColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 14,
        color: 'blue',
    },
    scrollView: {
        flex: 1,
        borderWidth: 0,
        borderColor: 'black',
        width: '100%',
        maxWidth: '100%',
        height: 600,
        maxHeight: 600,
        lineHeight: 600,
    },
    button: {
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignContent: "center",
        elevation: 3,
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
        width: "40%",
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    map: {
        width: "100%",
        height: "70%",
        marginVertical: '5%',
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    // button: {
    //     borderRadius: 20,
    //     padding: 10,
    //     elevation: 2,
    //     marginTop: 20,
    // },
    buttonOpen: {
        backgroundColor: 'black',
    },
    buttonClose: {
        backgroundColor: 'black',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});

export default Routing;

// const renderProcessableItems = (index: number) => {

//     let target_coordinate = path[index];
//     let pickup: string[] = [];
//     let delivery: string[] = [];
//     // let number_of_processable_items_in_this_location: number = 0;
//     // const pickedupList = useSelector((state: RootState) => state.pickup.value);

//     data["content"]["auxiliary_list"].forEach((p: Package) => {
//         // number_of_processable_items_in_this_location = number_of_processable_items_in_this_location + 1;
//         if (+p.package_pickup_coordinate.split(",")[0] === target_coordinate[0] && +p.package_pickup_coordinate.split(",")[1] === target_coordinate[1]) {
//             pickup.push(p.package_id);
//         }
//         if (+p.package_destination_coordinate.split(",")[0] === target_coordinate[0] && +p.package_destination_coordinate.split(",")[1] === target_coordinate[1]) {
//             delivery.push(p.package_id);
//         }
//     });


//     const qrVerification = (t: string) => {
//         let type: string = t.split(' ')[0];
//         let package_id: string = t.split(' ')[1];
//         console.log(package_id);
//         navigation.navigate("Scanner", { data: [package_id, type] });
//     }

//     return (
//         <>
//             {pickup.map((item, index) => (
//                 <>
//                     {/* <ButtonP key={item} title={"Pickup " + item} onPress={qrVerification} /> */}
//                     {/* {(pickedupList.indexOf(item) !== -1) ? <ButtonP key={item} title={"Pickup " + item} onPress={qrVerification} /> : <Text>{"Pickup " + item + " Done."}</Text> && number_of_processable_items_in_this_location--} */}
//                     <ButtonP key={item} title={"Pickup " + item} onPress={qrVerification} />
//                 </>
//             ))}
//             {delivery.map((item, index) => (
//                 <>
//                     <ButtonP key={item} title={"Deliver " + item} onPress={qrVerification} />
//                 </>
//             ))}
//         </>
//     )
// }

{/* <ScrollView style={styles.scrollView}>
                {path.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.itemContainer, expandedIndex === index && styles.expandedItem]}
                        onPress={() => {
                            handleItemClick(index);
                            setTargetLocation({
                                latitude: item[0],
                                longitude: item[1],
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            });
                        }}
                    >
                        <Text key={index} style={styles.itemText}>{index + 1}: {item[0]}, {item[1]}</Text>
                        {expandedIndex === index && (
                            <View style={styles.expandedMessage}>
                                {renderProcessableItems(index)}
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView> */}