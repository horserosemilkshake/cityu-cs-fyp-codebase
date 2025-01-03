import React, { useContext, useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, Pressable, TouchableOpacity, ScrollView, SafeAreaView, ImageURISource } from 'react-native';
import CookieManager, { Cookie } from '@react-native-cookies/cookies';
import { Double } from 'react-native/Libraries/Types/CodegenTypes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../State/Store.ts';
import { baseURL, externalServiceURL, routingURL } from '../global.ts';
import { PackingSchemeBody } from './PackageSelection.tsx';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { stackScreens } from '../App.tsx';
import { Image } from 'react-native';
import { add, clear } from '../State/List/ListSlice.ts';

interface PackingSchemeProps {
    navigation: any;
}

type RootStackParamList = {
    Screen1: undefined;
    Screen2: { data: PackingSchemeBody };
};

type propsType = NativeStackScreenProps<stackScreens, "PackingScheme">

const PackingScheme = (props: propsType) => {
    const gList = useSelector((state: RootState) => state.list.value); //selectedList
    const [loading, setLoading] = useState<boolean>(true);
    // const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    // const trunkLength = useSelector((state: RootState) => state.profile.trunkLength);
    // const trunkWidth = useSelector((state: RootState) => state.profile.trunkWidth); 
    // const trunkHeight = useSelector((state: RootState) => state.profile.trunkHeight);
    const { navigation, route } = props;
    const { data } = route.params;
    const [error, setError] = useState<boolean>(false);
    const [listData, setListData] = useState<string[]>([]);
    const [imageSource, setImageSource] = useState<string>('');

    const dispatch = useDispatch();

    useEffect(() => {

        const controller = new AbortController();
        const { signal } = controller;

        const timeout = setTimeout(() => {
            controller.abort();
            console.log('Request timed out');
        }, 60000); // Set the desired timeout duration in milliseconds

        try {
            const url = externalServiceURL + "/pack";
            console.log(JSON.stringify(data));

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(data),
                signal: signal,
            };

            // fetch(url, requestOptions) 
            //     .then((response) => 
            //         response.blob()
            //     ) 
            //     .then((blob) => {
            //         clearTimeout(timeout); 

            //         console.log(blob);

            //         const reader = new FileReader();
            //         reader.onloadend = () => {
            //             const base64Data = reader.result as string;
            //             setImageData(base64Data);
            //             // console.log(base64Data);
            //         };
            //         reader.readAsDataURL(blob);
            //     })
            //     .catch((error) => {
            //         setError(true);
            //         clearTimeout(timeout);
            //         console.log('Error fetching image:', error);
            //     });

            const response = fetch(url, requestOptions)
                .then((response) => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((responseBody) => {
                    setListData(responseBody["list_data"]);
                    setImageSource(responseBody["image"]);
                })
                .catch((error) => {
                    console.error('Error: ', error);
                });

        } catch (error) {
            setError(true);
            clearTimeout(timeout);
            console.error(error);
        } finally {
            setLoading(false);
        }

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    const changeList = () => {
        dispatch(clear());
        listData.map((item, index) => (
            dispatch(add(item.split("-")[0]))
        ));
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.caption}>Please wait for the computation to complete. This could take up to a minute.</Text>
            </View>
        )
    }

    if (error && imageSource === null) {
        return (
            <View style={styles.container}>
                <Text style={styles.caption}>Something went wrong. Please return to the previous page and try again.</Text>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.caption}>How you may load the packages into your delivery vehicle trunk:</Text>
            <Text>List Data:</Text>
            <ScrollView style={styles.scrollView}>
                {listData.map((item, index) => (
                    <Text key={index}>{item}</Text>
                ))}
            </ScrollView>
            <ScrollView style={styles.scrollView}>
                <ScrollView horizontal={true}>
                    {imageSource ? (
                        <Image source={{ uri: `data:image/jpeg;base64,${imageSource}` }} style={
                            {
                                width: 400,
                                height: 400,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }
                        } />
                    ) : null}
                </ScrollView>
            </ScrollView>

            {listData.length !== 0 && (listData.length === gList.length ?
                <Text style={styles.caption}>
                    All the packages you chose fit into the vehicle trunk. Please go to the previous page and start delivering.
                </Text>
                :
                <>
                    <Text style={styles.caption}>
                        Computation shows that some packages cannot fit into the vehicle trunk. Please decide if you want to follow the recommendation.
                    </Text>
                    <Pressable style={styles.button} onPress={changeList}>
                        <Text style={styles.buttonText}>Follow Advice</Text>
                    </Pressable>
                    <Text style={styles.caption}>
                        Or fit all the packages with your own way.
                    </Text>
                </>)
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 400,
        height: 400,
    },
    caption: {
        color: '#000000',
        fontSize: 12,
        width: '90%',
        fontWeight: 'bold',
        marginTop: '5%',
        marginLeft: '5%',
        marginBottom: '5%',
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
    scrollView: {
        borderWidth: 1,
        borderColor: 'black',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '40%',
        marginVertical: '5%',
    }
});

export default PackingScheme;