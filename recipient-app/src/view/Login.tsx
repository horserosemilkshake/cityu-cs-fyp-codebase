import React, { useState } from 'react';

// import "../assets/Login.css";
import { useNavigate } from 'react-router-dom';
import { setUsernameGlobal } from '../state/Profile/ProfileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { baseURL, payment, setUname } from '../global';
import { useCookies } from 'react-cookie';
import NavBar from '../components/NavBar';
import { Snackbar } from '../components/Snackbar';
// import axios, { AxiosResponse } from 'axios';

const Login = () => {

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [cookies, setCookie] = useCookies(['access_token', 'refresh_token']);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
            role: "RECIPIENT",
        };

        try {
            console.log("Calling login API.");
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
                        navigate('/main');
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

    const handleRegistrationRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400">
            <Snackbar
                message={snackbarMessage}
                isVisible={showSnackbar}
                onClose={handleSnackbarClose}
            />
            <NavBar name={"Not Logged In."}></NavBar>
            <div className="container">
                <div className='bg-gray-200 px-8 rounded-xl shadow-2xl'>
                    <div className='py-4'></div>
                    {/* <h1 className='normal-case text-center hover:animate-pulse'>Dandelion LMS (Recipient/Client App) Login Screen</h1> */}
                    <h1 className='normal-case text-center hover:animate-pulse duration-300 ease-in-out'>
                        <span className="inline-block animate-[typing_3s_steps(20)_1] whitespace-nowrap overflow-hidden normal-case text-center">
                            Dandelion LMS (Recipient/Client App) Login Screen<span className="absolute right-0 h-full border-r border-solid border-gray-400 animate-none"></span>
                        </span>
                    </h1>
                    <div className='py-4'></div>
                    <div className="transition form-group hover:scale-110 duration-300">
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="transition form-group hover:scale-110 duration-300">
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className='py-4'></div>
                    <div className='flex flex-row mt-4'>
                        <div className="form-group">
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out" onClick={handleLogin}>Login</button>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                            </span>
                        </div>
                        <div className="form-group">
                            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out" onClick={handleRegistrationRedirect}>Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;