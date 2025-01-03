import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { setUsernameGlobal } from '../state/Profile/ProfileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { baseURL, encryptMD5, getCipher, setUname } from '../global';
import { useCookies } from 'react-cookie';
// import axios, { AxiosResponse } from 'axios';
import "../assets/Details.css";
import { Package } from './TrackPage';
import NavBar from '../components/NavBar';
import { subtractHours } from '../components/Helper';
import Footer from '../components/Footer';
import MaskedText from '../components/MaskedText';



const Details = () => {

    const packageData: Package = JSON.parse(localStorage.getItem("selected incoming package") || '{}');
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const navigate = useNavigate();

    const handleGoBackNavigation = () => {
        navigate("/track");
    }
    const handleMapNavigation = () => {
        navigate("/map");
    }

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400 h-screen w-full">
            <NavBar name={usernameGlobal}></NavBar>
            <div className="bg-gray-900 text-white w-full">
                <div className="">
                    <div className='flex flex-row items-center h-16'>
                        <h1 className='mx-4 my-1 flex-1'>Package Details</h1>
                        {/* <div className="relative inline-block mx-2">
                            <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleMapNavigation}>
                                <h1>View Progress On Map</h1>
                            </button>
                            <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleGoBackNavigation}>
                                <h1>Go Back</h1>
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
            <div className='container bg-gray-200 my-16 rounded-xl shadow-2xl'>
                <h1 className='text-2xl'>Package Details</h1>
                <table className='bg-gray-300'>
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Package ID</td>
                            <td>{packageData.package_id}</td>
                        </tr>
                        <tr>
                            <td>Package Description</td>
                            <td>{packageData.package_description}</td>
                        </tr>
                        <tr>
                            <td>Package Weight (kg)</td>
                            <td>{packageData.package_weight_in_kg}</td>
                        </tr>
                        <tr>
                            <td>Package Height</td>
                            <td>{packageData.package_height}</td>
                        </tr>
                        <tr>
                            <td>Package Length</td>
                            <td>{packageData.package_length}</td>
                        </tr>
                        <tr>
                            <td>Package Width</td>
                            <td>{packageData.package_width}</td>
                        </tr>
                        <tr>
                            <td>Package Sender Name</td>
                            <td>{packageData.package_sender_name || "Not Applicable."}</td>
                        </tr>
                        <tr>
                            <td>Package Recipient Name</td>
                            <td>{packageData.package_recipient_name}</td>
                        </tr>
                        <tr>
                            <td>Package Pickup Location</td>
                            <td>{packageData.package_pickup_location}</td>
                        </tr>
                        <tr>
                            <td>Package Pickup Coordinate</td>
                            <td>{packageData.package_pickup_coordinate}</td>
                        </tr>
                        <tr>
                            <td>Package Destination</td>
                            <td>{packageData.package_destination}</td>
                        </tr>
                        <tr>
                            <td>Package Destination Coordinate</td>
                            <td>{packageData.package_destination_coordinate}</td>
                        </tr>
                        <tr>
                            <td>Finished</td>
                            <td>{packageData.finished.toString()}</td>
                        </tr>
                        <tr>
                            <td>Deadline</td>
                            <td>{packageData.deadline || "Not Applicable."}</td>
                        </tr>
                        <tr>
                            <td>Responsible Driver Name</td>
                            <td>{packageData.responsible_driver_name || "Not Applicable."}</td>
                        </tr>
                        <tr>
                            <td>Order Creation Time</td>
                            <td>{
                                new Date(packageData.time).toLocaleString()
                            }</td>
                        </tr>
                        <tr>
                            <td>Signature Key:</td>
                            <td>{
                                <MaskedText text={encryptMD5(packageData.package_recipient_name.concat(packageData.package_id).concat(getCipher())).slice(0, 6)}></MaskedText>
                            }</td>
                        </tr>
                    </tbody>
                </table>
                <div className='flex flex-row justify-between'>
                    <button
                        className="min-h-16 w-128 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                        onClick={handleMapNavigation}
                    >
                        View Delivery Progress On Map
                    </button>
                    <button
                        className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                        onClick={handleGoBackNavigation}
                    >
                        Go Back
                    </button>
                </div>
            </div>
            {/* <p>{localStorage.getItem("selected package")}</p> */}
            {/* <button onClick={handleMapNavigation}>View Progress On Map</button>
            <button onClick={handleGoBackNavigation}>Go Back</button> */}
        </div>
    );
}

export default Details;