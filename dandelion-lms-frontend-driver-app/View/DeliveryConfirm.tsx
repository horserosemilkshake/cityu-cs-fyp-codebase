import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Pressable, Alert, TouchableHighlight } from 'react-native';
import axios from 'axios';
import request from 'superagent';
import "../Utils/Constant";
import CookieManager from '@react-native-cookies/cookies';
import { setUname, serverDomain, baseURL } from '../global.ts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store.ts';
import { setUsernameGlobal } from '../State/Profile/ProfileSlice.ts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { stackScreens } from '../App.tsx';
import { sha256, sha256Bytes } from 'react-native-sha256';
import { incrementPointerBy } from '../State/TaskListPointer/TaskListPointerSlice.ts';
import { setValue } from '../State/CurrentJobDone/CurrentJobDone.ts';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { stringMd5 } from 'react-native-quick-md5';
import { add } from '../State/Delivered/DeliveredSlice.ts';


type RootStackParamList = {
    Screen1: undefined;
    Screen2: { data: string[] };
};

type propsType = NativeStackScreenProps<stackScreens, "DeliveryConfirm">

const DeliveryConfirmScreen = (props: propsType) => {
    const [key, setKey] = useState('');

    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);

    const warehouseNeededInThisRound = useSelector((state: RootState) => state.profile.warehouseNeededInThisRound);

    const pointer = useSelector((state: RootState) => state.taskListPointer.taskListPointer);
    const price = useSelector((state: RootState) => state.price.value);

    const dispatch = useDispatch();

    const { navigation, route } = props;

    const { data } = route.params;

    const package_id = data[0];
    const client_name = data[1];
    const upper_limit = +data[2];

    const handleInputChange = (value: any, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }) => {
        setter(value);
    };

    function computeMatic(package_length: number, package_width: number, package_height: number): number {
        const s: number = (package_length * package_width * package_height) / 100;
        const k: number = 10;
        return 1 - Math.pow(Math.E, -s / k);
    }


    const handleVerification = async () => {
        if (key) {
            const hash = stringMd5(client_name.concat(package_id).concat("salt"));
            console.log(hash.slice(0, 6));
            if (hash.slice(0, 6) === key) {
                dispatch(add(package_id));

                const finishData = {
                    username: usernameGlobal,
                    packageId: data[0],
                    warehousePresent: warehouseNeededInThisRound,
                }

                const url = baseURL + '/api/v1/driver/package';
                console.log(finishData);
                const res = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                    body: JSON.stringify(finishData),
                });

                let transferAmount = 0.01;

                price.forEach((p) => {
                    if (p[0] === package_id) {
                        transferAmount = p[1];
                    }
                });

                const response = await fetch(baseURL + "/api/v1/auth/transfer", {
                    method: 'POST',
                    mode: "cors",
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                    body: JSON.stringify({
                        packageID: package_id,
                        payerName: "root",
                        receiverName: usernameGlobal,
                        payerRole: "ADMIN",
                        receiverRole: "DRIVER",
                        amount: transferAmount
                    }),
                })
                
                if (pointer < upper_limit - 1) {
                    // Add finish ETA
                    dispatch(incrementPointerBy(1));
                }
                if (pointer == upper_limit - 1) {
                    dispatch(setValue(true));
                }
                navigation.goBack();
            } else {
                Alert.alert("Wrong Key.");
            }
        } else {
            Alert.alert("The signature key should not be null!");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Delivery Confirmation Widget</Text>
            {/* <Text>{key}</Text>
            <Text>{package_id}</Text>
            <Text>{client_name}</Text> */}
            <TextInput placeholder="Package Signature Key (Six Characters)" style={styles.input} value={key}
                onChangeText={(value) => handleInputChange(value, setKey)} />

            <Pressable style={styles.button} onPress={() => { Alert.alert("Contact the client to get the key. (Refer to package for contacts)") }}>
                <Text style={styles.buttonText}>How to get it?</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleVerification}>
                <Text style={styles.buttonText}>Confirm Delivery</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
    },
    title: {
        color: '#000000',
        fontSize: 18,
        textAlign: 'justify',
        lineHeight: 60,
        fontWeight: 'bold',
        letterSpacing: 0.25,
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        marginVertical: 5,
        backgroundColor: 'black',
    },
    buttonText: {
        fontSize: 12,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
});

export default DeliveryConfirmScreen;