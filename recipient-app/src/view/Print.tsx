import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { setUsernameGlobal } from '../state/Profile/ProfileSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { baseURL, encryptMD5, explainTRD, getCipher, getTel, setUname } from '../global';
import { useCookies } from 'react-cookie';
// import axios, { AxiosResponse } from 'axios';
import "../assets/Details.css";
import { Package } from './TrackPage';
import { PackageFormData } from './PackageForm';
import QRCode from 'qrcode.react';
import NavBar from '../components/NavBar';
import MaskedText from '../components/MaskedText';
import InfoIcon from '../components/InfoIcon';



const Print = () => {

    const formData: PackageFormData = JSON.parse(localStorage.getItem("submitted item") || '{}');
    const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
    const navigate = useNavigate();

    const [trd, setTRD] = useState<String>(localStorage.getItem("tid for " + formData.packageId) || "null");
    const [recipientPhone, setRecipientPhone] = useState<string>("");

    const fetchTRH = async () => {
        try {
            const res: Response = await fetch(baseURL + "/api/v1/client/transaction-reference-hash", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify(formData.packageId),
            });
            console.log(trd);
            setTRD(await res.text());
            if (trd === null || trd === "") {
                setTRD(localStorage.getItem("tid for " + formData.packageId) || "null");
            }

            const recipient: Response = await fetch(baseURL + "/api/v1/client/user-info", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any additional headers if required
                },
                body: JSON.stringify({ username: formData.recipientName }),
            });

            setRecipientPhone((await recipient.json()).eight_digit_hk_phone_number);
        } catch (error) {
            setTRD(localStorage.getItem("tid for " + formData.packageId) || "null")
            console.error(error);
        }
    }

    useEffect(() => {
        fetchTRH();
    }, []);

    const handleGoBackNavigation = () => {
        navigate("/main");
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col items-center bg-hero-pattern bg-gray-400">
            <NavBar className="print:hidden" name={usernameGlobal}></NavBar>
            <div className="container">
                <h1 className='print:hidden'>Package Details (Please print the page and stick it on the package. Deliver it to the pickup location promptly.)</h1>
                <h1 className='print:hidden flex flex-row'>Transaction hash: {trd} &nbsp; <InfoIcon info={explainTRD} /></h1>
                {/* e.g.: 0xcd390834b88b1915872c797eb1894ed7dc9a61afb699f4e68d3b657f4535ad59 */}
                <h1 className='print:hidden'>Click to check in <a className="italic underline hover:animate-pulse" href="https://polygonscan.com/" target="_blank">Polygonscan.</a></h1>
                {formData.packageId && <>
                    <div className='flex flex-row items-center border-2 border-black rounded-xl m-5'>
                        <QRCode className="ml-5" value={formData.packageId} />
                        <div className='flex flex-col m-5'>
                            <h5>{formData.packageId}</h5>
                            <h5>{formData.packageDescription}</h5>
                            <h5 className=''>From {formData.pickupLocation}</h5>
                            <h5>To {formData.destination}</h5>
                            <h5>Sender contact: {getTel()}</h5>
                            <h5>Recipient contact: {recipientPhone}</h5>
                            {/* <h5>Remark: {formData.packageDescription}</h5> */}
                            <div className='flex flex-row items-center'>
                                <h5 className='mr-2 print:hidden'>Signature Key (Won't Be Printed): {encryptMD5(formData.recipientName.concat(formData.packageId).concat(getCipher())).slice(0, 6)}</h5>
                            </div>
                        </div>
                    </div>
                </>}
                {/* <p>{localStorage.getItem("selected package")}</p> */}
                <button className="print:hidden" onClick={handlePrint}>Print</button>
                <button className="print:hidden" onClick={handleGoBackNavigation}>Go To Main Page</button>
            </div>
        </div>
    );
}

export default Print;