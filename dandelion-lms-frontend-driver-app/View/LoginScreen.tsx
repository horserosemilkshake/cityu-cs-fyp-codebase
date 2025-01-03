import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Pressable, Alert } from 'react-native';
import axios, { AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import request from 'superagent';
import "../Utils/Constant";
import CookieManager from '@react-native-cookies/cookies';
import { setUname, serverDomain, baseURL } from '../global.ts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store.ts';
import { setUsernameGlobal } from '../State/Profile/ProfileSlice.ts';
import { Snackbar } from '../Utils/Snackbar.tsx';

interface LoginScreenProps {
  navigation: any;
}

function parseCookieString(cookieString: string): { [key: string]: string } {
  const pairs = cookieString.split(';');

  const result: { [key: string]: string } = {};

  pairs.forEach(pair => {
    const [key, value] = pair.trim().split('=');
    result[key] = value;
  });

  return result;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
  const dispatch = useDispatch();

  interface ApiResponse {
    data: any;
    headers: any;
  }

  // navigation.replace('Main');

  const handleInputChange = (value: any, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }) => {
    setter(value);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  const handleLogin = async () => {
    console.log("Login function invoked.");
    const url = baseURL + "/api/v1/auth/login";
    const resolvedUsername = username.toString();
    const resolvedPassword = password.toString();
    const data = {
      username: resolvedUsername,  // replace this by your data key and value
      password: resolvedPassword,  // replace this by your data key and value
      role: "DRIVER",
    };

    try {
      console.log("Calling login API with link " + url + " and body " + JSON.stringify(data));
      const response = await fetch(url, {
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
            dispatch(setUsernameGlobal(username));
            navigation.navigate('Main');
          } else {
            if (responseData["code"] === 500) {
              setSnackbarMessage('Check login credentials sent to the server.');
              setShowSnackbar(true);
            } else {
              setSnackbarMessage('Check connection to the server.');
              setShowSnackbar(true);
            }
          }
        })
    } catch (error) {
      setSnackbarMessage('Check connection to the server.');
      setShowSnackbar(true);
      console.error(error); // Handle any errors
    }
  };

  const handleRegister = () => {
    navigation.navigate('Registration');
  };

  return (
    <View style={styles.container}>
      {/* <Snackbar
                message={snackbarMessage}
                isVisible={showSnackbar}
                onClose={handleSnackbarClose}
            /> */}
      <Text style={styles.title}>Dandelion LMS (Driver App) Login Screen</Text>
      <TextInput placeholder="Username" style={styles.input} value={username}
        onChangeText={(value) => handleInputChange(value, setUsername)} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input}
        value={password}
        onChangeText={(value) => handleInputChange(value, setPassword)} />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
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
    width: '40%',
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

export default LoginScreen;

function navigate(arg0: string) {
  throw new Error('Function not implemented.');
}
