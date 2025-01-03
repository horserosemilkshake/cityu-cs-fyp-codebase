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
import { baseURL, externalServiceURL, getUsername } from '../global';
import { setCryptoWalletAddress, setMaticBalance, setUsernameGlobal } from '../state/Profile/ProfileSlice';
import "../assets/TrackPage.css";
import { setSelectedPackage } from '../state/Selected/SelectedSlice';
import { Hash } from 'crypto';
import NavBar from '../components/NavBar';
import { PackageAvatar } from '../components/PackageAvatar';

export type Package = {
    id: string,
    package_id: string,
    package_description: string,
    package_weight_in_kg: number,
    package_height: number,
    package_length: number,
    package_width: number,
    package_sender_name: string | null,
    package_recipient_name: string,
    package_pickup_location: string,
    package_pickup_coordinate: string,
    package_destination: string,
    package_destination_coordinate: string,
    finished: boolean,
    responsible_driver_name: string | null,
    deadline: string | number[],
    time: Date,
    picked_up: boolean,
};

type DriverProfile = {
    id: number,
    username: string,
    password: null,
    nickname: string,
    eight_digit_hk_phone_number: string,
    cryptowallet_address: string,
    cryptowallet_password: string,
};


const TrackPage = () => {

    const navigate = useNavigate();

    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const direction = useSelector((state: RootState) => state.direction.value);
    const [loading, setLoading] = useState<boolean>(false);
    const [packages, setPackages] = useState<Package[]>([]);
    const [packagesFiltered, setPackagesFiltered] = useState<Package[]>([]);
    const dispatch = useDispatch();

    const [packageIDFilter, setPackageIDFilter] = useState<string | number | readonly string[] | undefined>("");
    const [packageSenderName, setPackageSenderName] = useState<string>("");
    const [packageDimensionsFilter, setPackageDimensionsFilter] = useState<number>(0);
    const [onlyShowFinished, setOnlyShowFinished] = useState<boolean>(false);
    const [packagesBackup, setPackagesBackup] = useState<Package[]>([]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const url = (direction === false) ? baseURL + "/api/v1/client/package" : baseURL + "/api/v1/client/outgoing-package";
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
            setPackages(await res.json());
            setLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setPackagesFiltered(packages);
            setLoading(false);
        }
    }

    const handleGoBankNavigation = () => {
        navigate("/main");
    }

    // const HandlePackageClickedNavigation = (package_id: string) => {
    //     let p: Package | undefined = packages.find(obj => obj.package_id === package_id);
    //     if (p === undefined) {
    //         throw new TypeError('The value was promised to always be there!');
    //     }
    //     localStorage.setItem("selected incoming package", JSON.stringify(p));
    //     navigate("/details");
    // }

    const HandlePackageClickedNavigation = (jsonified_String: string) => {
        localStorage.setItem("selected incoming package", jsonified_String);
        navigate("/details");
    }

    useEffect(() => {
        console.log("Tracking income packages.");
        fetchPackages();
    }, []);

    // if (loading) {
    //     return (
    //         <div className="container">
    //             <h1>Loading...</h1>
    //         </div>
    //     )
    // }

    const filterByID = (value: React.SetStateAction<string | number | readonly string[] | undefined>) => {
        setPackageIDFilter(value);
        setPackagesFiltered(packagesFiltered.filter(x => x.package_id.includes(value ? value?.toString() : "") === true));
        console.log("Filtered using ID filter " + value + ": ");
        for (let i in packagesFiltered) {
            console.log(packagesFiltered[i].package_id);
        }
    }

    const filterBySenderName = (value: string) => {
        setPackageSenderName(value);
        setPackagesFiltered(packagesFiltered.filter(x => x.package_sender_name?.includes(packageSenderName!.toString())));
    }

    const filterByDimension = (value: string) => {
        setPackageDimensionsFilter(+value);
        setPackagesFiltered(packagesFiltered.filter(x => x.package_length * x.package_height * x.package_width > packageDimensionsFilter));
    }

    const filterByFinished = () => {
        setOnlyShowFinished(!onlyShowFinished);
        if (onlyShowFinished) {
            setPackagesBackup(packagesFiltered);
            setPackagesFiltered(packagesFiltered.filter(x => x.finished === true));
        } else {
            setPackagesFiltered(packagesBackup);
        }
    }

    const reset = () => {
        setPackageIDFilter("");
        setPackageDimensionsFilter(0);
        setPackagesFiltered(packages);
        setOnlyShowFinished(false);
    }

    return (
        <div className="flex flex-col items-center bg-hero-pattern">
            <NavBar name={usernameGlobal}></NavBar>
            <div className="w-full bg-gray-400 h-screen">
                <div className="bg-gray-900 text-white">
                    <div className="">
                        <div className='flex flex-row items-center h-16'>
                            <h1 className='mx-4 my-1 flex-1'>Select Package For More Info</h1>
                            {/* <div className="relative inline-block mx-2">
                                <button className="bg-gray-900 hover:bg-gray-900 mt-6" onClick={handleGoBankNavigation}><h1>Go Back</h1></button>
                            </div> */}
                        </div>
                    </div>
                </div>
                {/* <h1>Select Package For More Info:</h1> */}
                <div className=''>
                    <div className='flex flex-col m-8 flex-wrap bg-gray-200 p-8 rounded-xl shadow-xl overflow-auto'>
                        <h1>Filter</h1>
                        <div className='flex flex-row justify-between'>
                            <div className='grid grid-cols-2 gap-2'>
                                <div className="transition form-group hover:scale-110 duration-300">
                                    <input type="text" placeholder="Filter By Package ID" value={packageIDFilter} onChange={(e) => filterByID(e.target.value)} />
                                </div>

                                <div className="transition form-group hover:scale-110 duration-300">
                                    <input type="text" placeholder="Filter By Package Sender Name" value={packageSenderName} onChange={(e) => filterBySenderName(e.target.value)} />
                                </div>

                                <div className="transition form-group hover:scale-110 duration-300">
                                    <input className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-sm" type="number" placeholder="Filter By Dimension Value (Only Packages With L * W * H Larger Than The Given Value Will Show)" value={packageDimensionsFilter} onChange={(e) => filterByDimension(e.target.value)} />
                                </div>

                                <div className="flex items-center">
                                    <div
                                        className={`relative mx-6 inline-block w-10 h-5 rounded-full transition-colors duration-300 ${onlyShowFinished
                                            ? 'bg-blue-500 hover:bg-blue-600'
                                            : 'bg-gray-400 hover:bg-gray-500'
                                            }`}
                                        onClick={filterByFinished}
                                    >
                                        <div
                                            className={`absolute left-0 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 transform ${onlyShowFinished ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        ></div>
                                    </div>
                                    <label className="ml-2">Only Show Finished Record(s)</label>
                                </div>
                            </div>

                            <div className='flex flex-col'>
                                <div className="transition form-group hover:scale-110 duration-300">
                                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out" onClick={reset}>Reset</button>
                                </div>

                                <div className="transition form-group hover:scale-110 duration-300">
                                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 duration-300 ease-in-out" onClick={handleGoBankNavigation}>Go Back</button>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="scrollable-list"> {/* scrollable-list */}
                        <ul className='list-none space-y-2'>
                            {packageIDFilter === "" && packageSenderName === "" && packageDimensionsFilter === 0 && onlyShowFinished === false ? packages.map(
                                packageItem => {
                                    // return <li className="flex items-center" key={packageItem.package_id + Math.random().toString()} onClick={() => HandlePackageClickedNavigation(packageItem.package_id)}>
                                    //     {packageItem.package_id}
                                    // </li>
                                    return <li className="hover:scale-105 transition duration-300 ease-in-out" key={packageItem.package_id + Math.random().toString()}>
                                        <PackageAvatar id={packageItem.package_id + ": " + packageItem.package_description} description={packageItem.package_sender_name ? "From " + packageItem.package_sender_name : "From warehouse"} jsonified={JSON.stringify(packageItem)} handler={HandlePackageClickedNavigation}></PackageAvatar>
                                    </li>
                                }
                            ) : packagesFiltered.map(
                                packageItem => {
                                    // return <li className="flex items-center" key={packageItem.package_id + Math.random().toString()} onClick={() => HandlePackageClickedNavigation(packageItem.package_id)}>
                                    //     {packageItem.package_id}
                                    // </li>
                                    return <li className="hover:scale-105 transition duration-300 ease-in-out" key={packageItem.package_id + Math.random().toString()}>
                                        <PackageAvatar id={packageItem.package_id + ": " + packageItem.package_description} description={packageItem.package_sender_name ? "From " + packageItem.package_sender_name : "From warehouse"} jsonified={JSON.stringify(packageItem)} handler={HandlePackageClickedNavigation}></PackageAvatar>
                                    </li>
                                }
                            )
                            }
                        </ul>
                    </div>
                </div>

                {/* <button onClick={handleGoBankNavigation}>Go Back</button> */}
            </div>
        </div>
    );
}

export default TrackPage;
