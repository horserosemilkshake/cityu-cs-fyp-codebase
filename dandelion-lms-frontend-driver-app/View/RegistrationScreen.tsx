import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Pressable, Text } from 'react-native';
import { baseURL } from '../global';

interface RegistrationScreenProps {
  navigation: any;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [eightDigitHKPhoneNumber, setEightDigitHKPhoneNumber] = useState('');
  const [vehicleCapacityInKg, setVehicleCapacityInKg] = useState('');
  const [containerHeight, setContainerHeight] = useState('');
  const [containerLength, setContainerLength] = useState('');
  const [containerWidth, setContainerWidth] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');

  const handleInputChange = (value: any, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }) => {
    setter(value);
  };
  
  const handleRegister = async () => {
    const url = baseURL + "/api/v1/driver/register";
    const data = {
        username: username,  // replace this by your data key and value
        password: password,  // replace this by your data key and value
        nickname: nickname,
        eight_digit_hk_phone_number: eightDigitHKPhoneNumber,
        vehicle_capacity_in_kg: parseFloat(containerHeight) * parseFloat(containerLength) * parseFloat(containerWidth),
        container_height: parseFloat(containerHeight),
        container_length: parseFloat(containerLength),
        container_width: parseFloat(containerWidth),
        current_coordinate: '',
        last_coordinate: '',
        speed: '',
        ready: false,
        cryptowallet_address: cryptoWalletAddress,
    };
    try {
        console.log("Calling registration API.");
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
                }
            })
    } catch (error) {
        console.error(error); // Handle any errors
    }
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={(value) => handleInputChange(value, setUsername)}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={(value) => handleInputChange(value, setPassword)}
      />
      <TextInput
        placeholder="Nickname"
        style={styles.input}
        value={nickname}
        onChangeText={(value) => handleInputChange(value, setNickname)}
      />
      <TextInput
        placeholder="Eight Digit HK Phone Number"
        style={styles.input}
        keyboardType="numeric"
        value={eightDigitHKPhoneNumber}
        onChangeText={(value) => handleInputChange(value, setEightDigitHKPhoneNumber)}
      />
      {/* <TextInput
        placeholder="Vehicle Capacity (kg)"
        style={styles.input}
        keyboardType="numeric"
        value={vehicleCapacityInKg}
        onChangeText={(value) => handleInputChange(value, setVehicleCapacityInKg)}
      /> */}
      <TextInput
        placeholder="Container Height (nearest cm)"
        style={styles.input}
        keyboardType="numeric"
        value={containerHeight}
        onChangeText={(value) => handleInputChange(value, setContainerHeight)}
      />
      <TextInput
        placeholder="Container Length (nearest cm)"
        style={styles.input}
        keyboardType="numeric"
        value={containerLength}
        onChangeText={(value) => handleInputChange(value, setContainerLength)}
      />
      <TextInput
        placeholder="Container Width (nearest cm)"
        style={styles.input}
        keyboardType="numeric"
        value={containerWidth}
        onChangeText={(value) => handleInputChange(value, setContainerWidth)}
      />
      <TextInput
        placeholder="Crypto Wallet Address"
        style={styles.input}
        secureTextEntry
        value={cryptoWalletAddress}
        onChangeText={(value) => handleInputChange(value, setCryptoWalletAddress)}
      />
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

export default RegistrationScreen;