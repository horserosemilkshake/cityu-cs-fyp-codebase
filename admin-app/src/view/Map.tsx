import React, { useEffect, useState } from 'react';

import "../assets/Login.css";
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import * as L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../state/Store';
import Location from '../components/Location';
import { Package } from './TrackPage';
// import axios, { AxiosResponse } from 'axios';
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import RoutingMachine from '../components/RoutingMachine';
import { baseURL, explainColors, haversineDistance } from '../global';
import { MarkerLayer, Marker as RLM } from "react-leaflet-marker";
import NavBar from '../components/NavBar';
import Table from '../components/Table';
import InfoIcon from '../components/InfoIcon';



const Map = () => {

    const navigate = useNavigate();

    const latGlobal = useSelector((state: RootState) => state.position.lat);
    const lonGlobal = useSelector((state: RootState) => state.position.lon);
    const dispatch = useDispatch();
    const packageData: Package = JSON.parse(localStorage.getItem("selected incoming package") || '{}');
    const [target, setTarget] = useState<Package>();
    const [correspondingDriver, setCorrespondingDriver] = useState("");
    const [correspondingDriverCoordinate, setCorrespondingDriverCoordinate] = useState("");
    const [correspondingDriverRoute, setCorrespondingDriverRoute] = useState("");
    const [speed, setSpeed] = useState(0.0);
    const [pickedUp, setPickedUp] = useState(false);
    const [pickupETA, setPickupETA] = useState(0.0);
    const [deliveredETA, setDeliveredETA] = useState(0.0);
    const [remainingDistance, setRemainingDistance] = useState(0.0);

    let DefaultIcon = L.icon({
        iconUrl: icon,
        iconSize: [35, 46],
        iconAnchor: [17, 46],
        shadowUrl: iconShadow
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    const [reloadCount, setReloadCount] = useState(0);
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);

    const fetchPackagesForMap = async () => {
        try {
            const url = baseURL + "/api/v1/client/package";
            const data = {
                username: usernameGlobal
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(data),
            });
            // console.log(await res.json());
            const clone = await res.clone();
            clone.json().then(
                (value: Array<Package>) => {
                    for (let i in value) {
                        if (value[i].package_id === packageData.package_id) {
                            console.log(value[i]);
                            setTarget(value[i]);
                            setCorrespondingDriver(value[i].responsible_driver_name!);
                            setPickedUp(value[i].picked_up);
                        }
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
    }

    async function calculateETA() {
        if (correspondingDriverRoute.length === 0 || correspondingDriverCoordinate === null || correspondingDriverCoordinate === "" || target === null) {
            return [100000000, 100000000];
        }

        let distanceToPickup = 0.0;
        let distanceToDrop = 0.0;
        let pickupReached = true;
        let dropReached = true;

        const coordsArray = correspondingDriverRoute.replace(/[\[\]]/g, '').split(/, |,/);
        const result = [];
        for (let i = 0; i < coordsArray.length; i += 2) {
            result.push(`${coordsArray[i]},${coordsArray[i + 1]}`);
        }

        for (let i = 0; i < result.length; i++) {

            if (result[i] === target?.package_pickup_coordinate.replace(" ", "")) {
                pickupReached = false;

            }

            if (result[i] === target?.package_destination_coordinate.replace(" ", "")) {
                dropReached = false;
            }
        }



        for (let i = 0; i < result.length - 1; i++) {
            let x0 = +result[i].split(",")[0];
            let y0 = +result[i].split(",")[1];
            let x1 = +result[i + 1].split(",")[0];
            let y1 = +result[i + 1].split(",")[1];

            let estKm = haversineDistance(x0, y0, x1, y1);  //estimate


            if (pickupReached === false) {
                distanceToPickup += estKm;
                pickupReached = (result[i + 1] === target?.package_pickup_coordinate.replace(" ", ""));
            }

            if (dropReached === false) {
                distanceToDrop += estKm;
                dropReached = (result[i + 1] === target?.package_destination_coordinate.replace(" ", ""));
            }

            if (pickupReached && dropReached) {
                break;
            }
        }

        return [(distanceToPickup / speed) * 60, (distanceToDrop / speed) * 60];
    }


    async function foo() {
        const url = baseURL + "/api/v1/client/get-all-responsible-drivers-info-by-recipient-username";
        const data = {
            username: usernameGlobal,
        };

        fetchPackagesForMap();

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any additional headers if required
            },
            body: JSON.stringify(data),
        })
            .then(
                function (response) {
                    if (response.status !== 200) {
                        console.log(
                            "Looks like there was a problem. Status Code: " + response.status
                        );
                        return;
                    }
                    response.json().then(function (data) {
                        const temp = data;
                        console.log(temp);
                        for (let i in temp) {
                            if (target != null && i === target.responsible_driver_name) {
                                setCorrespondingDriverCoordinate(temp[i]["coordinate"]);
                                setCorrespondingDriverRoute(temp[i]["route"]);
                                setSpeed(+temp[i]["speed"]);  // speed equation
                                setRemainingDistance(+temp[i]["distance"])
                                break;
                            }
                        }
                        setReloadCount((prevCount: number) => prevCount + 1);
                    })
                }
            )
            .catch(function (err) {
                console.log("Fetch Error :-S", err);
            });

        const etas: number[] | ((...values: number[]) => number)[] = await calculateETA();
        setPickupETA(etas[0]);
        setDeliveredETA(etas[1]);

        console.log(pickedUp);
    };

    useEffect(() => {
        // foo();
        const interval = setInterval(foo, 5000); //set your time here. repeat every x / 1000 seconds
        return () => { clearInterval(interval) };
    }, [correspondingDriver, correspondingDriverCoordinate, correspondingDriverRoute, speed, remainingDistance, reloadCount]);


    const handleGoBack = () => {
        navigate("/main");
    }

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400">
            <NavBar name={usernameGlobal}></NavBar>
            <Location />
            <div className="bg-gray-900 text-white w-full">
                <div className="">
                    <div className='flex flex-row items-center'>
                        <h1 className='mx-4 my-1 flex-1'>Package Details</h1>
                        <div className="relative inline-block mx-2">
                            <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleGoBack}>
                                <h1>Go Back</h1>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='container'>
                <h1 className='text-2xl font-bold flex flex-row mt-8 text-center tracking-wide leading-tight'>The page will be automatically refreshed every 5 seconds. Manual refresh is unnecessary. <InfoIcon info={explainColors} /></h1>
                <div className='flex flex-row items-center my-8 bg-gray-400 border-2 border-gray-900 opacity-90 p-4 rounded-xl w-full'>
                    <div className='flex-1 mx-4 w-full'>
                        {/* <h1 className='text-2xl font-bold mt-8 text-center tracking-wide leading-tight'>Your Package: {packageData.package_id}</h1>
                        <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>Your Location: {latGlobal}, {lonGlobal}</h2> */}
                        {/* {
                            (correspondingDriver === "" || correspondingDriver === null) ?
                                <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>It seems that no driver is responsible for your package. Keep loading driver route...</h2> :
                                <>
                                    <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>Responsible Driver: {correspondingDriver}</h2>
                                    <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>The driver is currently at {correspondingDriverCoordinate} with a speed of {Math.abs(speed) / 1000} km/h.</h2>
                                    <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>Time before the driver reaches the pickup point: {pickupETA.toFixed(2)} minutes.</h2>
                                    <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>Time before the driver reaches the delivery point: {deliveredETA.toFixed(2)} minutes.</h2>
                                    {
                                        (target!.finished) && <h2 className='font-bold mt-8 text-center tracking-wide leading-tight'>Finished. Please follow the red path to collect your package.</h2> 
                                    }
                                </>
                        } */}
                        {/* <h2 className='font-bold mt-8 mb-8 text-center tracking-wide leading-tight'>Reload Count: {reloadCount}</h2> */}
                        {(!target?.finished) ?
                            <Table data={[
                                {
                                    label: "Package",
                                    value: packageData.package_id,
                                },
                                {
                                    label: "Responsible Driver",
                                    value: correspondingDriver,
                                },
                                {
                                    label: "Driver's Position",
                                    value: correspondingDriverCoordinate,
                                },
                                {
                                    label: "Speed (km/h)",
                                    value: correspondingDriver ? String((Math.abs(speed) / 1000).toFixed(2)) : "Not Ready",
                                },
                                {
                                    label: "Est. Min Till Pickup",
                                    value: correspondingDriver ? ((!target?.picked_up) ? String(pickupETA.toFixed(2)).replace(".", ":") : "Completed") : "Not Ready",
                                },
                                {
                                    label: "Est. Min Till Delivery",
                                    value: correspondingDriver ? (String(deliveredETA.toFixed(2)).replace(".", ":")) : "Not Ready",
                                },
                                {
                                    label: "Reload Count",
                                    value: String(reloadCount),
                                },
                            ]} />
                            :
                            <Table data={[
                                {
                                    label: "Package",
                                    value: packageData.package_id,
                                },
                                {
                                    label: "Responsible Driver",
                                    value: correspondingDriver,
                                },
                                {
                                    label: "Finished",
                                    value: "Follow the red trail to collect the package",
                                },
                            ]} />}
                    </div>

                    {
                        (latGlobal === 0 || lonGlobal === 0) ?
                            <h1>Loading...</h1> :
                            <>
                                <div id="map" className='border border-gray-400 hover:scale-110 duration-300 ease-in-out'>
                                    <MapContainer center={[latGlobal, lonGlobal]} zoom={13} scrollWheelZoom={false}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <RoutingMachine color={"#FF0000"} source={[latGlobal, lonGlobal]} destination={[+packageData.package_destination_coordinate.split(",")[0], +packageData.package_destination_coordinate.split(",")[1]]} />
                                        {(!target?.finished) && <RoutingMachine color={"#6FA1EC"} source={[+packageData.package_pickup_coordinate.split(",")[0], +packageData.package_pickup_coordinate.split(",")[1]]} destination={[+packageData.package_destination_coordinate.split(",")[0], +packageData.package_destination_coordinate.split(",")[1]]} />}
                                        {(correspondingDriverRoute.length !== 0 && !target?.finished) ? <RoutingMachine color={"#FFFFFF"} sequence={correspondingDriverRoute} destination={[+packageData.package_destination_coordinate.split(",")[0], +packageData.package_destination_coordinate.split(",")[1]]} /> : <></>}
                                        <Marker position={[+packageData.package_pickup_coordinate.split(",")[0], +packageData.package_pickup_coordinate.split(",")[1]]} icon={DefaultIcon}>
                                            <Popup>
                                                Package Pickup Location.
                                            </Popup>
                                        </Marker>
                                        <Marker position={[+packageData.package_destination_coordinate.split(",")[0], +packageData.package_destination_coordinate.split(",")[1]]} icon={DefaultIcon}>
                                            <Popup>
                                                Package Delivery Destination.
                                            </Popup>
                                        </Marker>
                                        <MarkerLayer>
                                            <RLM
                                                position={[+packageData.package_pickup_coordinate.split(",")[0], +packageData.package_pickup_coordinate.split(",")[1]]}
                                                size={[80, 20]} // required for placement
                                                placement="center" // "top", "bottom"
                                                interactive // required for riseOnHover
                                                riseOnHover
                                            >
                                                <div style={{
                                                    background: 'blue',
                                                    textAlign: 'center'
                                                }}>
                                                    Package Pickup Location.
                                                </div>
                                            </RLM>
                                        </MarkerLayer>
                                        <MarkerLayer>
                                            <RLM
                                                position={[+packageData.package_destination_coordinate.split(",")[0], +packageData.package_destination_coordinate.split(",")[1]]}
                                                size={[80, 20]} // required for placement
                                                placement="center" // "top", "bottom"
                                                interactive // required for riseOnHover
                                                riseOnHover
                                            >
                                                <div style={{
                                                    background: 'blue',
                                                    textAlign: 'center'
                                                }}>
                                                    Package Delivery Destination.
                                                </div>
                                            </RLM>
                                        </MarkerLayer>
                                        <MarkerLayer>
                                            <RLM
                                                position={[latGlobal, lonGlobal]}
                                                size={[80, 20]} // required for placement
                                                placement="center" // "top", "bottom"
                                            >
                                                <div style={{
                                                    background: 'red',
                                                    textAlign: 'center'
                                                }}>
                                                    You are here.
                                                </div>
                                            </RLM>
                                        </MarkerLayer>
                                        {correspondingDriverCoordinate !== "" ?
                                            <MarkerLayer>
                                                <RLM
                                                    position={[+correspondingDriverCoordinate.split(",")[0], +correspondingDriverCoordinate.split(",")[1]]}
                                                    size={[80, 20]} // required for placement
                                                    placement="center" // "top", "bottom"
                                                >
                                                    <div style={{
                                                        background: 'red',
                                                        textAlign: 'center'
                                                    }}>
                                                        Driver is here.
                                                    </div>
                                                </RLM>
                                            </MarkerLayer>
                                            : <></>
                                        }
                                    </MapContainer>
                                </div>
                            </>
                    }
                </div>
                {/* <button onClick={handleGoBack}>Go Back</button> */}
            </div>
        </div>
    );
}

export default Map;