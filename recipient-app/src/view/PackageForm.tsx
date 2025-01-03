import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode.react';
import "../assets/Main.css";
import "../assets/Form.css";

import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router';
import { url } from 'inspector';
import { baseURL, payment, webRequest } from '../global';
import { useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import NavBar from '../components/NavBar';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import * as L from 'leaflet';
import { error } from 'console';

export interface PackageFormData {
    time: string,
    packageId: string;
    packageDescription: string;
    packageWeight: number;
    packageHeight: number;
    packageLength: number;
    packageWidth: number;
    senderName: string;
    recipientName: string;
    pickupLocation: string;
    pickupCoordinate: string;
    destination: string;
    destinationCoordinate: string;
    deadline: string;
    packageFrontview: string;
    warehousePresent: number;
}


const PackageForm: React.FC = () => {
    const navigate = useNavigate();
    const maticBalance = useSelector((state: RootState) => state.profile.maticBalance);
    const wallet_address = useSelector((state: RootState) => state.profile.cryptowallet_address);
    const wallet_key = useSelector((state: RootState) => state.profile.cryptowallet_password);
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const [usernameList, setUsernameList] = useState([""]);

    useEffect(() => {
        async function getAllUserName() {
            const url = baseURL + "/api/v1/admin/get-all-client";
            const response = await fetch(url, {
                method: 'POST',
                mode: "cors",
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
            });
            const clientList = await response.json();
            let res: string[] = [];
            for (let i = 0; i < clientList.length; i++) {
                if (clientList[i].username !== usernameGlobal) {
                    res.push(clientList[i].username);
                }
            }
            console.log(res);
            setUsernameList(res);
        }

        getAllUserName();
    }, [usernameGlobal]);

    const latGlobal = useSelector((state: RootState) => state.position.lat);
    const lonGlobal = useSelector((state: RootState) => state.position.lon);

    let DefaultIcon = L.icon({
        iconUrl: icon,
        iconSize: [35, 46],
        iconAnchor: [17, 46],
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    const [pickupPos, setPickupPos] = useState([latGlobal, lonGlobal * 1.001]);
    const [deliveryPos, setDeliveryPos] = useState([latGlobal, lonGlobal * 1.002]);

    const [formData, setFormData] = useState<PackageFormData>({
        time: new Date(Date.now()).toLocaleString('sv'),
        packageId: uuidv4(),
        packageDescription: '',
        packageWeight: 0,
        packageHeight: localStorage.getItem("h") === null ? 0 : +localStorage.getItem("h")!,
        packageLength: localStorage.getItem("l") === null ? 0 : +localStorage.getItem("l")!,
        packageWidth: localStorage.getItem("w") === null ? 0 : +localStorage.getItem("w")!,
        senderName: usernameGlobal,
        recipientName: '',
        pickupLocation: '',
        pickupCoordinate: '',
        destination: '',
        destinationCoordinate: '',
        deadline: '',
        packageFrontview: '',
        warehousePresent: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(formData);
    };

    function computeMatic(package_length: number, package_width: number, package_height: number): number {
        const s: number = (package_length * package_width * package_height) / 100;
        const k: number = 10;
        return 1 - Math.pow(Math.E, -s / k);
    }

    const handleFormSubmission = async () => {
        const url = baseURL + "/api/v1/client/package";

        try {
            // Check balance before submitting
            formData.deadline = formData.deadline.toString().replace("T", " ").slice(0, 19);

            if (formData.deadline === "" || formData.deadline === null) {
                alert("No deadline!");
                return;
            }

            if (maticBalance < 0.1) {
                alert("Insufficient MATIC balance!");
                return;
            }

            if (formData.packageLength <= 0 || formData.packageWidth <= 0 || formData.packageHeight <= 0) {
                alert("Invalid Dimensions!");
                return;
            }

            if (formData.recipientName === '') {
                alert("Invalid Recipient!");
                return;
            }

            if (formData.pickupLocation === '' || formData.destination === '') {
                alert("Invalid Location!");
                return;
            }

            if (formData.pickupCoordinate === '' || formData.destinationCoordinate === '') {
                // TODO: Filter out non-HK coords
                alert("Invalid Coordinate!");
                return;
            }

            // const timePattern: RegExp = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
            // if (!timePattern.test(formData.deadline)) {
            //     formData.deadline = "23:59";
            // }

            if (formData.packageWeight <= 0) {
                formData.packageWeight = formData.packageLength * formData.packageWidth * formData.packageHeight;
            }

            if (localStorage.getItem("processedFrontImageDataURL") !== null) {
                formData.packageFrontview = localStorage.getItem("processedFrontImageDataURL") || "";
            }

            formData.time = new Date(Date.now()).toISOString();

            formData.pickupCoordinate = formData.pickupCoordinate.replace(",", ", ");
            formData.destinationCoordinate = formData.destinationCoordinate.replace(",", ", ");

            let data = "";
            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    mode: "cors",
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any additional headers if required
                    },
                    body: JSON.stringify(formData),
                });
                data = await response.json();
                console.log(JSON.stringify(data));
            } catch (Error) {
                console.log(Error);
            }

            if (data === "ACCEPTED") {
                // TODO: Payment
                payment(wallet_address, wallet_key, "root", "ADMIN", computeMatic(formData.packageLength, formData.packageWidth, formData.packageHeight).toString())
                    .then(
                        h => {
                            console.log("Returned transactional hash = " + h);
                            localStorage.setItem("tid for " + formData.packageId, h);
                            webRequest(baseURL + "/api/v1/client/pid", "POST", JSON.stringify({ packageId: formData.packageId, hash: h }));
                        }
                    )
                    .catch(
                        async failure => {
                            console.log("Why transaction on chain using web3.js failed:" + failure.toString());
                            console.log("Invoking backup...");

                            const response = await fetch(baseURL + "/api/v1/auth/transfer", {
                                method: 'POST',
                                mode: "cors",
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    // Add any additional headers if required
                                },
                                body: JSON.stringify({
                                    packageID: formData.packageId,
                                    payerName: usernameGlobal,
                                    receiverName: "root",
                                    payerRole: "CLIENT",
                                    receiverRole: "ADMIN",
                                    amount: computeMatic(formData.packageLength, formData.packageWidth, formData.packageHeight)
                                }),
                            });
                        }
                    ).finally(
                        () => {
                            localStorage.setItem("submitted item", JSON.stringify(formData));
                            navigate("/print");
                        }
                    )
            } else {
                alert("Form submission error.");
            }
        } catch (error) {
            console.error('Error uploading form. ', error);
        }
    }

    const handleGoBackNavigation = () => {
        navigate("/main");
    }

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400">
            <NavBar name={usernameGlobal}></NavBar>
            <div className="bg-gray-900 text-white w-full">
                <div className="">
                    <div className='flex flex-row items-center'>
                        <h1 className='mx-4 my-1 flex-1'>Package Details</h1>
                        <div className="relative inline-block mx-2">
                            <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleGoBackNavigation}>
                                <h1>Go Back</h1>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container bg-gray-200 px-4 shadow-2xl">
                {formData.packageId && <>
                    <QRCode className='my-10' value={formData.packageId} />
                    {/* <h5>Please print the QR code and stick it on the package.</h5> */}
                </>}
                {
                    (formData.packageLength * formData.packageWidth * formData.packageHeight > 0) &&
                    <div className='border border-dotted border-gray-500 p-2 mb-2'>
                        <text>You'd have to pay {computeMatic(formData.packageLength, formData.packageWidth, formData.packageHeight) * 1.01} MATIC for this order.</text>
                        <br></br>
                        <text>1% surcharge included for transaction fees.</text>
                    </div>
                }
                <div id="map">
                    <MapContainer center={[latGlobal, lonGlobal]} zoom={13} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[pickupPos[0], pickupPos[1]]} icon={DefaultIcon} draggable autoPan eventHandlers={{
                            moveend: (event) => {
                                setPickupPos([event.target.getLatLng().lat, event.target.getLatLng().lng]);
                                setFormData((prevData) => ({
                                    ...prevData,
                                    pickupCoordinate: (+pickupPos[0].toPrecision(8) + "," + +pickupPos[1].toPrecision(8)).toString(),
                                }));
                            }
                        }}>
                            <Popup>
                                Package Pickup Location. Drag to adjust.
                            </Popup>
                        </Marker>
                        <Marker position={[deliveryPos[0], deliveryPos[1]]} icon={DefaultIcon} draggable autoPan eventHandlers={{
                            moveend: (event) => {
                                setDeliveryPos([event.target.getLatLng().lat, event.target.getLatLng().lng]);
                                setFormData((prevData) => ({
                                    ...prevData,
                                    destinationCoordinate: (+deliveryPos[0].toPrecision(8) + "," + +deliveryPos[1].toPrecision(8)).toString(),
                                }));
                            }
                        }}>
                            <Popup>
                                Package Delivery Destination. Drag to adjust.
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col justify-center place-items-center ">
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="time"
                        placeholder="time"
                        disabled={true}
                        value={new Date(Date.now()).toLocaleString('sv')}
                    />
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="packageId"
                        placeholder="Package ID"
                        disabled={true}
                        value={formData.packageId}
                        onChange={handleChange}
                    />
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="packageDescription"
                        placeholder="Package Description"
                        value={formData.packageDescription}
                        onChange={handleChange}
                    />
                    {/* <div className='flex flex-row'>
                        <h5>Package Weight (kg):</h5>
                        <input
                            className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500'
                            type="number"
                            name="packageWeight"
                            placeholder="Package Weight (kg)"
                            value={formData.packageWeight}
                            onChange={handleChange}
                        />
                    </div> */}
                    <h5 className='border border-dotted border-gray-500 p-2 my-2'>Click <text onClick={() => {
                        localStorage.removeItem("l");
                        localStorage.removeItem("w");
                        localStorage.removeItem("h");
                        navigate("/size");
                    }} className='text-blue-700 underline'>here</text> to upload images and detect sizes.</h5>
                    <div className='flex flex-row'>
                        <h5>Package Length (cm):</h5>
                        <input
                            className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                            type="number"
                            name="packageLength"
                            placeholder="Package Length"
                            value={formData.packageLength}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='flex flex-row'>
                        <h5>Package Width (cm):</h5>
                        <input
                            className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                            type="number"
                            name="packageWidth"
                            placeholder="Package Width"
                            value={formData.packageWidth}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='flex flex-row'>
                        <h5>Package Height (cm):</h5>
                        <input
                            className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                            type="number"
                            name="packageHeight"
                            placeholder="Package Height"
                            value={formData.packageHeight}
                            onChange={handleChange}
                        />
                    </div>
                    <select
                        className='block w-full mb-2 px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        value={formData.recipientName}
                        onChange={e => {
                            setFormData((prevData) => ({
                                ...prevData,
                                recipientName: e.target.value,
                            }));
                        }}
                    >
                        <option value="" disabled selected>Select a recipient</option>
                        {usernameList.map((val) => <option value={val}>{val}</option>)}
                    </select>
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="pickupLocation"
                        placeholder="Pickup Location"
                        value={formData.pickupLocation}
                        onChange={handleChange}
                    />
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="pickupCoordinate"
                        placeholder="Pickup Coordinate (Choose On The Map)"
                        
                        value={formData.pickupCoordinate}
                        onChange={handleChange}
                    />
                    <h5 className='border border-dotted border-gray-500 p-2 my-2'>Click <text onClick={() => {
                        setPickupPos([latGlobal, lonGlobal]);
                        setFormData((prevData) => ({
                            ...prevData,
                            pickupCoordinate: (+pickupPos[0].toPrecision(8) + "," + +pickupPos[1].toPrecision(8)).toString(),
                        }));
                    }} className='text-blue-700 underline'>here</text> to use device coordinate as pickup location.</h5>
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="destination"
                        placeholder="Destination"
                        value={formData.destination}
                        onChange={handleChange}
                    />
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="destinationCoordinate"
                        placeholder="Destination Coordinate  (Choose On The Map)"
                        value={formData.destinationCoordinate}
                        onChange={handleChange}
                    />
                    {/* <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="text"
                        name="deadline"
                        placeholder="Deadline (HH:MM)"
                        value={formData.deadline}
                        onChange={handleChange}
                    /> */}
                    <h5>Deadline:</h5>
                    <input
                        className='block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:border-blue-500 transition hover:scale-110 duration-300'
                        type="datetime-local"
                        min={(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, -1)}
                        name="deadline"
                        placeholder="Deadline (HH:MM)"
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out" type="submit" onClick={handleFormSubmission}>Submit</button>
                </form>
                <button className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out' onClick={handleGoBackNavigation}>Back</button>
            </div>
        </div>
    );
};

export default PackageForm;