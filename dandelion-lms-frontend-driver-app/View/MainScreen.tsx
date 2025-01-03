import React, { useCallback, useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Pressable, Alert } from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import { baseURL, externalServiceURL, getUsername, getWalletBalance, setWarehousePresent, webRequest } from '../global.ts';
import { RootState } from '../State/Store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { setCryptoWalletAddress, setMaticBalance, setNickname, setPassword, setPhone, setSpeed, setTrunkHeight, setTrunkLength, setTrunkWidth, setUsernameGlobal, setWarehouseNeededInThisRound } from '../State/Profile/ProfileSlice.ts';
import { useFocusEffect } from '@react-navigation/native';
import GetLocation from 'react-native-get-location';
import Geolocation from '@react-native-community/geolocation';
import { getTimerId, setTimerId, timerId } from '../Utils/Constant.tsx';
import MapView, { Marker } from 'react-native-maps';
import { setLat, setLon } from '../State/Position/PositionSlice.ts';

interface MainScreenProps {
  navigation: any;
}

type DriverProfile = {
  id: number,
  username: string,
  password: string,
  nickname: string,
  eight_digit_hk_phone_number: string,
  vehicle_capacity_in_kg: number,
  container_height: number,
  container_length: number,
  container_width: number,
  current_coordinate: string,
  last_coordinate: string,
  speed: number,
  ready: boolean,
  cryptowallet_address: string
};

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
  const maticBalance = useSelector((state: RootState) => state.profile.maticBalance);
  const nickname = useSelector((state: RootState) => state.profile.nickname);
  const warehouseNeededInThisRound = useSelector((state: RootState) => state.profile.warehouseNeededInThisRound);
  const speed = useSelector((state: RootState) => state.profile.speed);
  const currentCoordinate = useSelector((state: RootState) => state.profile.currentCoordinate);
  const lastCoordinate = useSelector((state: RootState) => state.profile.lastCoordinate);
  const trunkLength = useSelector((state: RootState) => state.profile.trunkLength);
  const trunkWidth = useSelector((state: RootState) => state.profile.trunkWidth);
  const trunkHeight = useSelector((state: RootState) => state.profile.trunkHeight);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = baseURL + "/api/v1/driver/user-info";
        const data = {
          username: usernameGlobal,
        }
        let cookie: any;
        CookieManager.get(baseURL)
          .then((cookies) => {
            cookie = cookies;
            console.log('CookieManager.get =>', cookies);
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
        const parsedUserInfo: DriverProfile = await res.json();
        console.log(parsedUserInfo);
        dispatch(setCryptoWalletAddress(parsedUserInfo.cryptowallet_address));
        dispatch(setPassword(parsedUserInfo.password));
        dispatch(setTrunkLength(parsedUserInfo.container_length));
        dispatch(setTrunkWidth(parsedUserInfo.container_width));
        dispatch(setTrunkHeight(parsedUserInfo.container_height));
        dispatch(setNickname(parsedUserInfo.nickname));
        dispatch(setPhone(parsedUserInfo.eight_digit_hk_phone_number));

        getWalletBalance(parsedUserInfo.cryptowallet_address, 2)
          .then(
            val => {
              dispatch(setMaticBalance(val));
            }
          ).catch(
            async failure => {
              console.log("Why getting wallet amount on chain using web3.js failed:" + failure.toString());
              console.log("Invoking backup...");

              const extUrl = externalServiceURL + '/balance';
              const balance: string = await webRequest(extUrl, 'POST', JSON.stringify({ "wallet_address": parsedUserInfo.cryptowallet_address }));
              dispatch(setMaticBalance(+balance));
            }
          )
      } catch (error) {
        console.error(error);
      }
    }

    fetchProfile();
  }, []);

  // const [timerId, setTimerId] = useState<NodeJS.Timeout | undefined>(undefined);

  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useFocusEffect(() => {
    const id = setInterval(() => Geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords;
      console.log(crd);
      setPosition({
        latitude: crd.latitude,
        longitude: crd.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
      const url = baseURL + "/api/v1/driver/update-position";
      const data = {
        username: usernameGlobal,
        currentCoordinate: crd.latitude.toString().concat(",").concat(crd.longitude.toString()),
        lastCoordinate: crd.latitude.toString().concat(",").concat(crd.longitude.toString()),
        updateTimeInterval: 0.083,
      };
      try {
        console.log("Calling registration API.");
        const response = fetch(url, {
          method: 'PUT',
          mode: "cors",
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
          },
          body: JSON.stringify(data),
        }).then((response) => {
          console.log(response.headers);
          return response.json();
        })
          .then(async (responseData) => {
            // Handle the response data here
            console.log(responseData);
            if (responseData["code"] === 200) {
            }
          })
      } catch (error) {
        console.error(error); // Handle any errors
      }
    }), 5000);

    return () => clearInterval(id);
  });

  // useFocusEffect(
  //   useCallback(() => {
  //     startPeriodicFunction();
  //     return () => {
  //       stopPeriodicFunction();
  //     };
  //   }, [timerId])
  // );

  const handleLogout = () => {
    // Implement logout functionality, clear saved cookie
    CookieManager.clearAll();
    dispatch(setUsernameGlobal(""));
    dispatch(setMaticBalance(0));
    dispatch(setWarehouseNeededInThisRound(0));

    const url = baseURL + "/api/v1/driver/logout";
    const data = {
      username: usernameGlobal,
    };
    try {
      console.log("Calling logout API.");
      const response = fetch(url, {
        method: 'POST',
        mode: "cors",
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if required
        },
        body: JSON.stringify(data),
      }).then((response) => {
        console.log(response.headers);
        return response.json();
      })
        .then(async (responseData) => {
          // Handle the response data here
          console.log(responseData);
          if (responseData["code"] === 200) {
          }
        })
    } catch (error) {
      console.error(error); // Handle any errors
    }

    navigation.navigate('Login');
  };

  const handleW2PButtonClicked = () => {
    // Implement logout functionality, clear saved cookie
    setWarehousePresent(1);
    dispatch(setWarehouseNeededInThisRound(1));

    dispatch(setLat(position.latitude));
    dispatch(setLon(position.longitude));

    navigation.navigate('Package Selection');
  };

  const handleP2PButtonClicked = () => {
    // Implement logout functionality, clear saved cookie
    setWarehousePresent(0);
    dispatch(setWarehouseNeededInThisRound(0));

    dispatch(setLat(position.latitude));
    dispatch(setLon(position.longitude));

    navigation.navigate('Package Selection');
  };

  const handleViewHistoryClicked = () => {
    navigation.navigate("History");
  }

  const handleChangeScreenClicked = () => {
    navigation.navigate("Change");
  }

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <Text style={styles.bold}>Welcome, {nickname}!</Text>
        <Text style={styles.bold} onPress={handleChangeScreenClicked}> ✏️</Text>
      </View>
      <Text style={styles.caption}>Your MATIC balance is: {maticBalance === -1 ? "loading" : maticBalance}</Text>
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
          title='Yor are here'
          description='This is where you start.'
          coordinate={position} />
      </MapView>}
      <Text style={styles.caption}>Your location: {"\n"} {(position.latitude !== 10 && position.longitude !== 10) ? String(position.latitude).concat(",").concat(String(position.longitude)) : "loading"}</Text>
      <Pressable style={(position.latitude !== 10 && position.longitude !== 10) ? styles.bigButton : styles.bigDisabledButton} onPress={(position.latitude !== 10 && position.longitude !== 10) ? handleW2PButtonClicked : null}>
        <Text style={styles.buttonText}>Warehouse-to-Recipient Packages</Text>
      </Pressable>
      <Pressable style={(position.latitude !== 10 && position.longitude !== 10) ? styles.bigButton : styles.bigDisabledButton} onPress={(position.latitude !== 10 && position.longitude !== 10) ? handleP2PButtonClicked : null}>
        <Text style={styles.buttonText}>Recipient-to-Recipient Packages</Text>
      </Pressable>
      <Pressable style={styles.bigButton} onPress={handleViewHistoryClicked}>
        <Text style={styles.buttonText}>View Delivery History</Text>
      </Pressable>
      <Pressable style={styles.bigButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
      {/* Add other content for the main page */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  bold: {
    color: '#000000',
    fontSize: 18,
    lineHeight: 60,
    fontWeight: 'bold',
    letterSpacing: 0.25,
  },
  caption: {
    color: '#000000',
    fontSize: 18,
    width: '80%',
    textAlign: 'justify',
    lineHeight: 60,
    fontWeight: 'bold',
    letterSpacing: 0.25,
  },
  bigButton: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    marginVertical: 5,
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
  map: {
    width: "100%",
    height: "20%",
    marginVertical: '5%',
  },
});

export default MainScreen;