import React, { useState } from 'react';
import "../assets/Registration.css";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { baseURL, checkWhetherAddressIsValid, encryptAES, iv, key } from '../global';
import { Snackbar } from '../components/Snackbar';

const Registration = () => {

    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [walletPrivateKey, setWalletPrivateKey] = useState('');

    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');


    const handleRegistrationRedirect = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handles form submission
        if (phoneNumber.length !== 8) {
            // alert("Invalid HK phone number.");
            setSnackbarMessage("Invalid HK phone number.");
            setShowSnackbar(true);
            return;
        }

        if (nickname.toLowerCase().includes("fuck") || nickname.toLowerCase().includes("shit") || nickname.toLowerCase().includes("damn")) {
            setSnackbarMessage("Inappropriate nickname.");
            setShowSnackbar(true);
            return;
        }

        // const wallet_address_validity = await checkWhetherAddressIsValid(walletAddress);
        // if (wallet_address_validity) {
        //     alert("Invalid wallet address.");
        //     return;
        // }

        const url = baseURL + "/api/v1/client/register";
        const data = {
            username: username,  // replace this by your data key and value
            password: password,  // replace this by your data key and value
            nickname: nickname,
            eight_digit_hk_phone_number: phoneNumber,
            cryptowallet_address: walletAddress,
            cryptowallet_private_key: walletPrivateKey,
        };

        try {
            console.log("Key: " + data.cryptowallet_private_key);
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
                        navigate('/');
                    }
                })
        } catch (error) {
            console.error(error); // Handle any errors
            navigate('/');
        }
        navigate('/');
    };

    const handleGoBackRedirect = () => {
        console.log("back");
        navigate('/');
    }

    function handleSnackbarClose(): void {
        setShowSnackbar(false);
    }

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400">
            <NavBar name={""}></NavBar>
            <Snackbar
                message={snackbarMessage}
                isVisible={showSnackbar}
                onClose={handleSnackbarClose}
            />
            <div className='container'>
                <div className='bg-gray-200 px-8 rounded-xl shadow-2xl'>
                    <div className='py-4'></div>
                    <h1 className='pt-16 normal-case text-center hover:animate-pulse duration-300 ease-in-ou'>Open an account here.</h1>
                    <div className='py-4'></div>
                    <form onSubmit={handleRegistrationRedirect}>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="text"
                                placeholder="Nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="text"
                                placeholder="Eight Digit HK Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="text"
                                placeholder="Crypto Wallet Address"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                className='transition hover:scale-110 duration-300'
                                type="text"
                                placeholder="Crypto Wallet Private Key (We won't leak)"
                                value={walletPrivateKey}
                                onChange={(e) => setWalletPrivateKey(e.target.value)}
                            />
                        </div>
                        <div className='py-4'></div>
                        <button className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out' onClick={() => handleRegistrationRedirect}>
                            Submit
                        </button>
                        <button className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out' onClick={handleGoBackRedirect}>Back</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Registration;