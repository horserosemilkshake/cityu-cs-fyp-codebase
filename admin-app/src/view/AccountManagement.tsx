import React, { useEffect, useState } from 'react';
import "../assets/Main.css";
import { useNavigate } from 'react-router-dom';
import Location from '../components/Location';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import { COLORS, Package, baseURL, externalServiceURL, getUsername } from '../global';
import { setCryptoWalletAddress, setMaticBalance, setUsernameGlobal } from '../state/Profile/ProfileSlice';
import NavBar from '../components/NavBar';
import polygon from "../assets/Polygon.png";
import Footer from '../components/Footer';
import { PieChart } from '@mui/x-charts/PieChart';
import { PieValueType } from '@mui/x-charts';
import { MakeOptional } from '@mui/x-charts/models/helpers';
import { isStringLiteral } from 'typescript';
import { setLat, setLon } from '../state/Position/PositionSlice';
import MaskedText from '../components/MaskedText';
import DeletePopup from '../components/DeletePopUp';
import ReactDOM from 'react-dom';

type DriverProfile = {
    id: number,
    username: string,
    password: null,
    nickname: string,
    eight_digit_hk_phone_number: string,
    cryptowallet_address: string,
    cryptowallet_password: string,
};


const AccountManagement = () => {

    const navigate = useNavigate();

    const latGlobal = useSelector((state: RootState) => state.position.lat);
    const lonGlobal = useSelector((state: RootState) => state.position.lon);
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const cryptowalletAddress = useSelector((state: RootState) => state.profile.cryptowallet_address);
    const maticBalance = useSelector((state: RootState) => state.profile.maticBalance);
    const [isOpen, setIsOpen] = useState(false);

    const [driverInfo, setDriverInfo] = useState<Array<DriverProfile>>([]);
    const [clientInfo, setClientInfo] = useState<Array<DriverProfile>>([]);

    const [driverInfoApplicationsStatus, setDriverInfoApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);
    const [clientInfoApplicationsStatus, setClientInfoApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);
    const [totalApplicationsStatus, setTotalApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    const dispatch = useDispatch();

    const [isDriverExpanded, setIsDriverExpanded] = useState(false);

    const handleDriverClick = () => {
        setIsDriverExpanded(!isDriverExpanded);
    };

    const [isClientExpanded, setIsClientExpanded] = useState(false);

    const handleClientClick = () => {
        setIsClientExpanded(!isClientExpanded);
    };

    let DefaultIcon = L.icon({
        iconUrl: icon,
        iconSize: [35, 46],
        iconAnchor: [17, 46],
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const url = baseURL + "/api/v1/admin/admin-info";
                const data = {
                    username: usernameGlobal,
                }

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                    body: JSON.stringify(data),
                });
                const parsedUserInfo: DriverProfile = await res.json();
                console.log(parsedUserInfo);
                dispatch(setCryptoWalletAddress(parsedUserInfo.cryptowallet_address));

                const allDriversUrl = baseURL + "/api/v1/admin/get-all-driver";
                const allDriversRes = await fetch(allDriversUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                });
                setDriverInfo(await allDriversRes.json());

                const allClientsUrl = baseURL + "/api/v1/admin/get-all-client";
                const allClientsRes = await fetch(allClientsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                });
                setClientInfo(await allClientsRes.json());

                console.log(driverInfo);

                const extUrl = externalServiceURL + '/balance';
                const extRes = await fetch(extUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "wallet_address": parsedUserInfo.cryptowallet_address }),
                });

                const balance: string = await extRes.json();
                dispatch(setMaticBalance(+balance));
            } catch (error) {
                console.error(error);
            }
        }

        fetchProfile();
    }, []);

    const handleLogoutRedirect = () => {
        // handle logout details
        dispatch(setUsernameGlobal(""));
        dispatch(setCryptoWalletAddress(""));
        dispatch(setMaticBalance(-1));
        navigate('/');
    }

    const getAll = async () => {
        const allDriversUrl = baseURL + "/api/v1/admin/get-all-driver";
        const allDriversRes = await fetch(allDriversUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
        });
        setDriverInfo(await allDriversRes.json());

        const allClientsUrl = baseURL + "/api/v1/admin/get-all-client";
        const allClientsRes = await fetch(allClientsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
        });
        setClientInfo(await allClientsRes.json());
    }

    const handleTrackRedirect = () => {
        navigate("/main")
    }

    const handleDeleteDriver = async (username: string) => {
        const deleteDriverUrl = baseURL + "/api/v1/admin/delete-account";
        const body = {
            username: username,
            role: "DRIVER",
        }
        const deleteRes = await fetch(deleteDriverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
            body: JSON.stringify(body),
        });
        if (deleteRes.status === 200) {
            window.alert("Successful. Refresh to see the results.");
        } else {
            window.alert("Request failed.");
        }
    }

    function handleTrackDriver(value: string | number | null): void {
        let valueStr = new String(value);
        dispatch(setLat(+valueStr.split(",")[0]));
        dispatch(setLon(+valueStr.split(",")[1]));
    }

    return (
        <div className="flex flex-col items-center w-screen h-full max-h-fit bg-gray-400 overflow-y-scroll">
            <NavBar name={usernameGlobal}></NavBar>
            <div className="w-full h-screen">
                <Location />
                <div className="bg-gray-900 opacity-90 center text-white w-full bx-20 z-50">
                    <div className="">
                        <div className='flex flex-row items-center h-16'>
                            <img src={polygon} className='w-8 h-8 mx-4'></img>
                            <br></br>
                            <h1 className='mx-2 my-1 flex-1'>Account Management Dashboard</h1>
                        </div>
                    </div>
                </div>
                <div className='bg-gray-200 mx-16 my-8 py-2 rounded-xl shadow-2xl'>
                    <h1 className='mx-10 my-4 font-bold'>Dashboard</h1>
                    {
                        driverInfo.length === 0 && clientInfo.length === 0 ?
                            <div className='flex flex-row items-center'>
                                <h1>Loading stuff... Nothing yet</h1>
                            </div> :
                            <div className='flex flex-row items-center space-x-4'>
                                <div className='flex flex-col items-center mx-16'>
                                    <h1>Driver/Client Count</h1>
                                    <PieChart
                                        series={[
                                            {
                                                data: [
                                                    {
                                                        id: 0,
                                                        label: "Driver",
                                                        value: driverInfo.length,
                                                    },
                                                    {
                                                        id: 1,
                                                        label: "Client",
                                                        value: clientInfo.length,
                                                    },
                                                ],
                                            },
                                        ]}
                                        width={400}
                                        height={200}
                                    >
                                    </PieChart>
                                </div>
                                <div id="map" className='hover: transition hover:scale-110 duration-300 ease-in-out'>
                                    <MapContainer center={[latGlobal, lonGlobal]} zoom={10} scrollWheelZoom={false}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[latGlobal, lonGlobal]} icon={DefaultIcon}>
                                            <Popup>
                                                Click coordinate to track a driver based on the latest positions on map.
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                                <div className='flex flex-col'>
                                    <button
                                        className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                                        onClick={handleTrackRedirect}
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                                        onClick={handleLogoutRedirect}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                    }
                </div>
                <div className='mx-10 my-4 font-bold'>
                    {
                        driverInfo.length === 0 ?
                            <div className='flex flex-row items-center'>
                                <h1>Loading stuff... Nothing yet</h1>
                            </div> :
                            <div
                                className={`border bg-gray-200 rounded-xl shadow-2xl p-4 m-6 ${isDriverExpanded ? 'h-auto' : 'h-16'} 
                                transition duration-500 ease-in-out hover:scale-105`}
                            >
                                <div
                                    className=" cursor-pointer flex justify-between items-center"
                                    onClick={handleDriverClick}
                                >
                                    <span className="font-bold text-gray-800"><h1 className="text-2xl font-bold">Driver Profiles</h1></span>
                                    <svg
                                        className={`h-6 w-6 transition-transform ${isDriverExpanded ? 'transform rotate-0' : 'transform rotate-180'
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                                {isDriverExpanded && (
                                    <div className="overflow-auto">
                                        <div className='flex flex-row items-center'>
                                            <h1 className="text-2xl font-bold mb-4" onClick={handleDriverClick}>Driver Profiles (Container parameters in meters)</h1>
                                            <h1 className='mx-16 text-blue-700 hover:animate-pulse hover:scale-150 transition duration-300 ease-in-out' onClick={getAll}>🗘</h1>
                                        </div>
                                        <table className="table-auto border-collapse border mx-4 overflow-auto">
                                            <thead>
                                                <tr>
                                                    {Object.keys(driverInfo[0]).map((key) => (
                                                        <th className="border px-4 py-2 bg-gray-700" key={key}>
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {driverInfo.map((profile, index) => (
                                                    <tr key={index}>
                                                        {Object.values(profile).map((value, index) => (
                                                            <td className="border px-4 py-2 bg-neutral-400" key={index}>
                                                                {(index != 1 && index != 2 && index != 13) && (index != 9 && index != 10 ? value?.toString() : <p className='text-blue-700' onClick={() => handleTrackDriver(value)}>{value}</p>)}
                                                                {(index === 2 || index === 13) && <MaskedText text={value}></MaskedText>}
                                                                {index === 1 && <DeletePopup onConfirm={() => { handleDeleteDriver(value!.toString()) }} table={"driver"} name={value} onCancel={() => { }}></DeletePopup>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                    }
                </div>
                <div className='mx-10 my-4 font-bold'>
                    {
                        clientInfo.length === 0 ?
                            <div className='flex flex-row items-center'>
                                <h1>Loading stuff... Nothing yet</h1>
                            </div> :
                            <div
                                className={`border bg-gray-200 rounded-xl shadow-2xl p-4 m-6 ${isClientExpanded ? 'h-auto' : 'h-16'} 
                            transition duration-500 ease-in-out hover:scale-105`}
                            >
                                <div
                                    className=" cursor-pointer flex justify-between items-center"
                                    onClick={handleClientClick}
                                >
                                    <span className="font-bold text-gray-800"><h1 className="text-2xl font-bold">Client Profiles</h1></span>
                                    <svg
                                        className={`h-6 w-6 transition-transform ${isClientExpanded ? 'transform rotate-0' : 'transform rotate-180'
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                                {isClientExpanded ? (
                                    <div className="overflow-auto">
                                        <div className='flex flex-row items-center'>
                                            <h1 className="text-2xl font-bold mb-4" onClick={handleClientClick}>Client Profiles</h1>
                                            <h1 className='mx-16 text-blue-700 hover:animate-pulse hover:scale-150 transition duration-300 ease-in-out' onClick={getAll}>🗘</h1>
                                        </div>
                                        <table className="table-auto border-collapse border">
                                            <thead>
                                                <tr>
                                                    {Object.keys(clientInfo[0]).map((key) => (
                                                        <th className="border px-4 py-2 bg-gray-700" key={key}>
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {clientInfo.map((profile, index) => (
                                                    <tr key={index}>
                                                        {Object.values(profile).map((value, index) => (
                                                            <td className="border px-4 py-2 bg-neutral-400" key={index}>
                                                                {(index != 1 && index != 2 && index != 6) && value}
                                                                {(index === 2 || index === 6) && <MaskedText text={value}></MaskedText>}
                                                                {index === 1 && <DeletePopup onConfirm={() => { }} table={"client"} name={value} onCancel={() => { }}></DeletePopup>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default AccountManagement;
