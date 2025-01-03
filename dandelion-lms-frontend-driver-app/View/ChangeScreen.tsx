import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Pressable, Text } from 'react-native';
import { baseURL, getUsername } from '../global';
import { useSelector } from 'react-redux';
import { RootState } from '../State/Store';

interface ChangeScreenProps {
  navigation: any;
}

const ChangeScreen: React.FC<ChangeScreenProps> = ({ navigation }) => {
  const pw = useSelector((state: RootState) => state.profile.password);
  const nn = useSelector((state: RootState) => state.profile.nickname);
  const trunkLength = useSelector((state: RootState) => state.profile.trunkLength);
  const trunkWidth = useSelector((state: RootState) => state.profile.trunkWidth);
  const trunkHeight = useSelector((state: RootState) => state.profile.trunkHeight);
  const wallet = useSelector((state: RootState) => state.profile.cryptowallet_address);
  const p = useSelector((state: RootState) => state.profile.phone);

  const [username, setUsername] = useState(getUsername());
  const [password, setPassword] = useState(pw);
  const [nickname, setNickname] = useState(nn);
  const [eightDigitHKPhoneNumber, setEightDigitHKPhoneNumber] = useState(p);
  const [vehicleCapacityInKg, setVehicleCapacityInKg] = useState((trunkHeight * trunkLength * trunkWidth).toString());
  const [containerHeight, setContainerHeight] = useState(trunkHeight.toString());
  const [containerLength, setContainerLength] = useState(trunkLength.toString());
  const [containerWidth, setContainerWidth] = useState(trunkWidth.toString());
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState(wallet);

  const handleInputChange = (value: any, setter: { (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (value: React.SetStateAction<string>): void; (arg0: any): void; }) => {
    setter(value);
  };
  
  const handleRegister = async () => {
    const url = baseURL + "/api/v1/driver/change-driver-profile";
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
                  navigation.navigate("Main");
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
        <Text style={styles.buttonText}>Change</Text>
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

export default ChangeScreen;