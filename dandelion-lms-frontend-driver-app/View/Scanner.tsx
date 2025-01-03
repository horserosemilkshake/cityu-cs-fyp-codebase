import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Button, StyleSheet, Text, Pressable, TouchableOpacity, ScrollView, SafeAreaView, ImageURISource, Alert } from 'react-native';
import CookieManager, { Cookie } from '@react-native-cookies/cookies';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store.ts';
import { baseURL, externalServiceURL, routingURL } from '../global.ts';
import { PackingSchemeBody } from './PackageSelection.tsx';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { stackScreens } from '../App.tsx';
import { Image } from 'react-native';
import { add as pickupadd } from '../State/PickedUp/PickedUpSlice.ts';
import { add as deliveredadd } from '../State/Delivered/DeliveredSlice.ts';
import { RNCamera } from 'react-native-camera';
import { incrementPointerBy } from '../State/TaskListPointer/TaskListPointerSlice.ts';
// import {ViewPropTypes} from 'deprecated-react-native-prop-types';

type RootStackParamList = {
  Screen1: undefined;
  Screen2: { data: string[] };
};

type propsType = NativeStackScreenProps<stackScreens, "Scanner">

// npm install react-native-camera @react-navigation/native @react-navigation/stack
const Scanner = (props: propsType) => {
  const cameraRef = useRef<RNCamera | null>(null);

  const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);

  const warehouseNeededInThisRound = useSelector((state: RootState) => state.profile.warehouseNeededInThisRound);

  const { navigation, route } = props;

  const { data } = route.params;

  const dispatch = useDispatch();

  let processing = false;

  const pickedupList = useSelector((state: RootState) => state.pickup.value);

  useEffect(() => {
    if (pickedupList.indexOf(data[0]) !== -1 && (data[1] === "Pickup" || data[1] === "Pickup")) {
      Alert.alert("Already Admitted");
      navigation.goBack();
    }
  });

  function timeout(delay: number) {
    return new Promise(res => setTimeout(res, delay));
  }

  const handleBarcodeRead = async (event: any) => {
    // Decode the QR code
    if (processing) { return; }
    processing = true;

    const decoded_data = event.data;

    console.log("Barcode Found! \nType: " + event.type + "\nData: " + event.data);

    if (decoded_data !== data[0]) {
      Alert.alert(decoded_data + " not equals " + data[0]);
      processing = false;
    } else {
      if ((data[1] === "Pickup" || data[1] === "Pickup ") && pickedupList.find((elem) => elem === data[0]) === undefined) {
        Alert.alert("Correct. Package transaction admitted. Please go back.");

        const pickupData = {
          username: usernameGlobal,
          packageId: data[0],
          warehousePresent: warehouseNeededInThisRound,
        }

        const url = baseURL + '/api/v1/driver/pickup';
        console.log(pickupData);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
          },
          body: JSON.stringify(pickupData),
        });

        dispatch(pickupadd(data[0]));
        dispatch(incrementPointerBy(1));
        await timeout(2000);
      }

      processing = false;
    }

    // navigation.navigate('Routing');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RNCamera
        style={{ flex: 1 }}
        ref={cameraRef}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
        onBarCodeRead={handleBarcodeRead}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      />
    </SafeAreaView>
  );
}

export default Scanner;