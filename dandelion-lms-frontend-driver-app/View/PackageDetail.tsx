import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useRef, useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { stackScreens } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Package } from './PackageSelection';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store';
import { add, remove } from '../State/List/ListSlice';
import { GOOGLE_MAPS_API_KEY, routingURL } from '../global';
import { Dimensions } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';
import { incrementByAmount } from '../State/Counter/CounterSlice';


const routingServiceURL = routingURL + "/route/v1";

// L.Marker.prototype.options.icon = L.icon({
//     iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//     iconSize: [35, 46],
//     iconAnchor: [17, 46]
// });

type RootStackParamList = {
    Screen1: undefined;
    Screen2: { data: string };
};

type propsType = NativeStackScreenProps<stackScreens, "PackageDetails">

const PackageDetail = (props: propsType) => {
    const { navigation, route } = props;
    const { data, handler } = route.params;
    const list = useSelector((state: RootState) => state.list.value);
    // const [selected, setSelected] = useState(false);
    // setSelected(list.includes(data.package_id));
    const dispatch = useDispatch();

    const handleSelect = () => {
        if (list.includes(data.package_id)) {
            // setSelected(false);
            dispatch(remove(data.package_id));
            dispatch(incrementByAmount(-computeMatic(data.package_length, data.package_width, data.package_height)));
            console.log("package id removed to list");
            console.log(list);
        } else {
            // setSelected(true);
            dispatch(add(data.package_id));
            dispatch(incrementByAmount(computeMatic(data.package_length, data.package_width, data.package_height)));
            console.log("package id added to list");
            console.log(list);
        }
    };

    const [draggableMarkerCoord, setDraggableMarkerCoord] = useState({
        longitude: 148.11,
        latitude: -26.85
    });
    const mapRef = useRef(null);

    const onRegionChange = (region: any) => {
        console.log(region);
    };

    function computeMatic(package_length: number, package_width: number, package_height: number): number {
        const s: number = (package_length * package_width * package_height) / 100;
        const k: number = 10;
        return 1 - Math.pow(Math.E, -s / k);
    }

    return (
        <View style={styles.packageDetailContainer}>
            {/* <Text style={styles.caption}>Package ID: {data.package_id}</Text>
            <Text style={styles.caption}>Package description: {data.package_description}</Text>
            <Text style={styles.caption}>Package dimension: ({data.package_length} * {data.package_width} *{data.package_height})</Text>
            <Text style={styles.caption}>Package Pickup Location: {data.package_pickup_location}</Text>
            <Text style={styles.caption}>Package Pickup Coordinate: ({data.package_pickup_coordinate})</Text>
            <Text style={styles.caption}>Package Destination: {data.package_destination}</Text>
            <Text style={styles.caption}>Package Destination Coordinate: ({data.package_destination_coordinate})</Text>
            <Text style={styles.caption}>Deadline: {data.deadline}</Text> */}

            <ScrollView style={styles.container}>
                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.headerCell}>Field</Text>
                        <Text style={styles.headerCell}>Value</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package ID</Text>
                        <Text style={styles.cell}>{data.package_id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Description</Text>
                        <Text style={styles.cell}>{data.package_description}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Height</Text>
                        <Text style={styles.cell}>{data.package_height}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Length</Text>
                        <Text style={styles.cell}>{data.package_length}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Width</Text>
                        <Text style={styles.cell}>{data.package_width}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Recipient Name</Text>
                        <Text style={styles.cell}>{data.package_recipient_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Pickup Location</Text>
                        <Text style={styles.cell}>{data.package_pickup_location}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Pickup Coordinate</Text>
                        <Text style={styles.cell}>{data.package_pickup_coordinate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Destination</Text>
                        <Text style={styles.cell}>{data.package_destination}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Package Destination Coordinate</Text>
                        <Text style={styles.cell}>{data.package_destination_coordinate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Finished</Text>
                        <Text style={styles.cell}>{data.finished.toString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>Deadline</Text>
                        <Text style={styles.cell}>{data.deadline || "Not Applicable."}</Text>
                    </View>
                </View>

                <MapView
                    provider={PROVIDER_GOOGLE}
                    ref={mapRef}
                    style={styles.map}
                    onRegionChange={onRegionChange}
                    initialRegion={{
                        latitude: 22.3501863,
                        latitudeDelta: 0.35,
                        longitude: 114.1214779,
                        longitudeDelta: 0.35,
                    }}
                >
                    <Marker key={`Pickup Coordinate`} title={`Pickup Coordinate`} coordinate={{
                        latitude: +data.package_pickup_coordinate.split(",")[0],
                        longitude: +data.package_pickup_coordinate.split(",")[1],
                    }} />
                    <Marker key={`Destination Coordinate`} title={`Destination Coordinate`} coordinate={{
                        latitude: +data.package_destination_coordinate.split(",")[0],
                        longitude: +data.package_destination_coordinate.split(",")[1],
                    }} />

                </MapView>

                <Text style={styles.caption}>By delivering this package, you will get {computeMatic(data.package_length, data.package_width, data.package_height)} MATIC.</Text>

                <Pressable style={list.includes(data.package_id) ? styles.bigSelectedButton : styles.bigButton} onPress={handleSelect}>
                    <Text style={styles.buttonText}>{list.includes(data.package_id) ? 'Unselect' : 'Select'}</Text>
                </Pressable>
            </ScrollView>

            {/* <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={styles.map}
                onRegionChange={onRegionChange}
                initialRegion={{
                    latitude: 22.3501863,
                    latitudeDelta: 0.35,
                    longitude: 114.1214779,
                    longitudeDelta: 0.35,
                }}
            >
                <Marker key={`Pickup Coordinate`} title={`Pickup Coordinate`} coordinate={{
                    latitude: +data.package_pickup_coordinate.split(",")[0],
                    longitude: +data.package_pickup_coordinate.split(",")[1],
                }} />
                <Marker key={`Destination Coordinate`} title={`Destination Coordinate`} coordinate={{
                    latitude: +data.package_destination_coordinate.split(",")[0],
                    longitude: +data.package_destination_coordinate.split(",")[1],
                }} />

            </MapView>

            <Text style={styles.caption}>By delivering this package, you will get {computeMatic(data.package_length, data.package_width, data.package_height)} MATIC.</Text>

            <Pressable style={list.includes(data.package_id) ? styles.bigSelectedButton : styles.bigButton} onPress={handleSelect}>
                <Text style={styles.buttonText}>{list.includes(data.package_id) ? 'Unselect' : 'Select'}</Text>
            </Pressable> */}
            {/* <Button title={list.includes(data.package_id) ? 'Unselect' : 'Select'} onPress={handleSelect} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 24,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    table: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    headerCell: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontWeight: 'bold',
    },
    cell: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    packageDetailContainer: {
        flex: 1,
        alignItems: 'center',
    },
    caption: {
        color: '#000000',
        fontSize: 12,
        alignItems: 'center',
        width: '100%',
        fontWeight: 'bold',
        marginTop: '5%',
        marginBottom: '5%',
        textAlign: 'center',
    },
    bigButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginVertical: 10,
        backgroundColor: 'black',
    },
    bigSelectedButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginVertical: 10,
        backgroundColor: 'red',
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    map: {
        marginVertical: '5%',
        width: '100%',
        height: 150,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
});

export default PackageDetail;