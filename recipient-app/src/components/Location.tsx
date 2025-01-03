import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { setLat, setLon } from '../state/Position/PositionSlice';

function Location() {
    // const [latitude, setLatitude] = useState<number | null>(null);
    // const [longitude, setLongitude] = useState<number | null>(null);

    const latGlobal = useSelector((state: RootState) => state.position.lat);
    const lonGlobal = useSelector((state: RootState) => state.position.lon);
    const dispatch = useDispatch();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // setLatitude(position.coords.latitude);
                    // setLongitude(position.coords.longitude);
                    console.log(position.coords.latitude);
                    console.log(position.coords.longitude);
                    dispatch(setLat(position.coords.latitude));
                    dispatch(setLon(position.coords.longitude));
                },
                (error) => {
                    console.log(error.message);
                }
            );
        } else {
            console.log('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        <div>
            {/* {latitude && longitude ? (
                <div>
                    Latitude: {latitude}<br />
                    Longitude: {longitude}
                </div>
            ) : (
                <div>Loading location...</div>
            )} */}
        </div>
    );
}

export default Location;