import React, { useEffect, useState } from 'react';
// import "../assets/Main.css";
import { useNavigate } from 'react-router-dom';
import Location from '../components/Location';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import { baseURL, externalServiceURL, getUsername, getWalletBalance, iv, key, setTel, webRequest } from '../global';
import { setCryptoWalletAddress, setCryptoWalletPassword, setMaticBalance, setUsernameGlobal, setNickname } from '../state/Profile/ProfileSlice';
import NavBar from '../components/NavBar';
import polygon from "../assets/Polygon.png";
import Footer from '../components/Footer';
import { Base64 } from 'js-base64';
import { Infobar } from '../components/Infobar';
import { setDirection } from '../state/Direction/DirectionSlice';

type DriverProfile = {
  id: number,
  username: string,
  password: null,
  nickname: string,
  eight_digit_hk_phone_number: string,
  cryptowallet_address: string,
  cryptowallet_password: string,
};


const Main = () => {

  const navigate = useNavigate();

  const latGlobal = useSelector((state: RootState) => state.position.lat);
  const lonGlobal = useSelector((state: RootState) => state.position.lon);
  const usernameGlobal = useSelector((state: RootState) => state.profile.usernameGlobal);
  const cryptowalletAddress = useSelector((state: RootState) => state.profile.cryptowallet_address);
  const cryptowalletPassword = useSelector((state: RootState) => state.profile.cryptowallet_password);
  const nickname = useSelector((state: RootState) => state.profile.nickname);
  const maticBalance = useSelector((state: RootState) => state.profile.maticBalance);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const dispatch = useDispatch();

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
        setLoading(true);
        const url = baseURL + "/api/v1/client/user-info";
        const data = {
          username: usernameGlobal,
        }

        const parsedUserInfo = await webRequest(url, 'POST', JSON.stringify(data));
        console.log(parsedUserInfo);

        setTel(parsedUserInfo.eight_digit_hk_phone_number);
        dispatch(setCryptoWalletAddress(parsedUserInfo.cryptowallet_address));
        dispatch(setCryptoWalletPassword(Base64.decode(parsedUserInfo.cryptowallet_private_key)));
        dispatch(setNickname(parsedUserInfo.nickname));

        getWalletBalance(parsedUserInfo.cryptowallet_address, 2)
          .then(
            val => {
              dispatch(setMaticBalance(val));
            }
          ).catch(
            async failure => {
              console.log("Why getting wallet amount on chain using web3.js failed:" + failure.toString());
              console.log("Invoking backup...");

              const extUrl = externalServiceURL + '/balance';
              const balance: string = await webRequest(extUrl, 'POST', JSON.stringify({ "wallet_address": parsedUserInfo.cryptowallet_address }));
              dispatch(setMaticBalance(+balance));
            }
          )

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    if (loading) {
      fetchProfile();
    }
  }, []);

  const handleLogoutRedirect = () => {
    // handle logout details
    dispatch(setUsernameGlobal(""));
    dispatch(setCryptoWalletAddress(""));
    dispatch(setMaticBalance(-1));
    navigate('/');
  }

  const handleTrackRedirect = (direction: boolean) => {
    dispatch(setDirection(direction));
    navigate("/track");
  }

  const handleAddRedirect = () => {
    navigate("/add");
  }

  const handleChangeUserProfileRedirect = () => {
    navigate("/change");
  }

  return (
    <div className="flex flex-col items-center justify-center bg-hero-pattern bg-gray-400">
      <NavBar name={usernameGlobal + " (" + nickname + ")"}></NavBar>
      <div className="bg-gray-900 opacity-90 center text-white w-full bx-20 z-50">
        <div className="">
          <div className='flex flex-row items-center h-16'>
            <img src={polygon} className='w-8 h-8 mx-4'></img>
            <br></br>
            {/* <h1 className='mx-2 my-1 flex-1'>{maticBalance} MATIC</h1> */}
            <h1 className='mx-2 my-1 flex-1'>User Dashboard</h1>
            <div className="relative inline-block mx-2">
              <button
                className="bg-gray-900 text-white py-2 px-4 rounded mt-2  hover:bg-gray-900"
                onClick={handleChangeUserProfileRedirect}
              >
                <h1 className=''>Change Profile</h1>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <Location />
        {
          (latGlobal === 0 || lonGlobal === 0) ?
            <h1>Loading your location...</h1> :
            <div className='container my-48 bg-gray-200 px-8 rounded-xl shadow-2xl'>
              {/* <h1 className='text-3xl hover:animate-pulse duration-300 ease-in-out'>User Dashboard</h1> */}
              <div className='flex flex-row w-full justify-center'>
                <div className='flex flex-col justify-between items-center'>
                  <button
                    className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                    onClick={() => {handleTrackRedirect(false)}}
                  >
                    Track Income Package
                  </button>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                  </span>
                </div>
                <button
                  className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                  onClick={() => {handleTrackRedirect(true)}}
                >
                  Track Outgoing Package
                </button>
                <button
                  className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                  onClick={handleAddRedirect}
                >
                  Send Package
                </button>
                <button
                  className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                  onClick={handleLogoutRedirect}
                >
                  Logout
                </button>
              </div>
              <div className='flex flex-col w-5/12 my-16'>
                <div className='grid grid-rows-2 grid-flow-col gap-2 place-content-between'>
                  {/* <div className='flex flex-row items-center mx-2 my-1'>
                    <img src={polygon} className='w-8 h-8 mx-2'></img>
                    <h1 className='mx-2 my-1'>{maticBalance} MATIC</h1>
                  </div> */}
                  <Infobar imgsrc={polygon} message={maticBalance.toString() + " MATIC"}></Infobar>
                  <Infobar imgsrc={polygon} message={"" + cryptowalletAddress} masked={true}></Infobar>
                  <Infobar imgsrc={""} message={"💵 " + String(maticBalance * 0.9) + " USD"}></Infobar>
                  <Infobar imgsrc={""} message={"🚛 " + String(Math.floor(maticBalance * 0.9)) + " times at least"}></Infobar>                </div>
              </div>
              <div id='map' className='border border-gray-400 hover:scale-110 duration-300 ease-in-out'>
                <MapContainer center={[latGlobal, lonGlobal]} zoom={13} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[latGlobal, lonGlobal]} icon={DefaultIcon}>
                    <Popup>
                      You are here.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
        }
      </div>
      <Footer></Footer>
    </div>
  );
}

export default Main;
