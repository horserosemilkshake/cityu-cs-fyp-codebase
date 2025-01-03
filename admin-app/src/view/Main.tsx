import React, { useEffect, useState } from 'react';
import "../assets/Main.css";
import { useNavigate, useNavigation } from 'react-router-dom';
import Location from '../components/Location';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/Store';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import { COLORS, Package, baseURL, externalServiceURL, getUsername, getWalletBalance } from '../global';
import { setCryptoWalletAddress, setCryptoWalletPassword, setMaticBalance, setUsernameGlobal } from '../state/Profile/ProfileSlice';
import NavBar from '../components/NavBar';
import polygon from "../assets/Polygon.png";
import Footer from '../components/Footer';
import { PieChart } from '@mui/x-charts/PieChart';
import { PieValueType } from '@mui/x-charts';
import { MakeOptional } from '@mui/x-charts/models/helpers';
import { Infobar } from '../components/Infobar';

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
  const maticBalance = useSelector((state: RootState) => state.profile.maticBalance);
  const [isOpen, setIsOpen] = useState(false);

  const [p2pInfo, setP2PInfo] = useState<Array<Package>>([]);
  const [w2pInfo, setW2PInfo] = useState<Array<Package>>([]);
  const [applicationsStatus, setApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);
  const [p2pApplicationsStatus, setP2pApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);
  const [w2pApplicationsStatus, setW2pApplicationsStatus] = useState<MakeOptional<PieValueType, "id">[]>([]);

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
        dispatch(setCryptoWalletPassword(parsedUserInfo.cryptowallet_password));

        const p2pUrl = baseURL + "/api/v1/admin/get-all-p2p";
        const p2pRes = await fetch(p2pUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
          },
        });
        const p2pJson: Package[] = await p2pRes.json();

        const w2pUrl = baseURL + "/api/v1/admin/get-all-w2p";
        const w2pRes = await fetch(w2pUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
          },
        });
        const w2pJson: Package[] = await w2pRes.json();

        setP2PInfo(p2pJson);
        setW2PInfo(w2pJson);

        const app = [
          {
            id: 0,
            label: "Finished",
            value: 0,
          },
          {
            id: 1,
            label: "Delivering",
            value: 0,
          },
          {
            id: 2,
            label: "Pending",
            value: 0,
          },
        ];

        const p2p = [
          {
            id: 0,
            label: "Finished",
            value: 0,
          },
          {
            id: 1,
            label: "Delivering",
            value: 0,
          },
          {
            id: 2,
            label: "Pending",
            value: 0,
          },
        ];

        const w2p = [
          {
            id: 0,
            label: "Finished",
            value: 0,
          },
          {
            id: 1,
            label: "Delivering",
            value: 0,
          },
          {
            id: 2,
            label: "Pending",
            value: 0,
          },
        ];


        p2pJson.forEach(x => {
          if (x.finished === true) {
            app[0].value += 1;
            p2p[0].value += 1;
          } else if (x.responsible_driver_name != null) {
            app[1].value += 1;
            p2p[1].value += 1;
          } else {
            app[2].value += 1;
            p2p[2].value += 1;
          }
        });

        w2pJson.forEach(x => {
          if (x.finished === true) {
            app[0].value += 1;
            w2p[0].value += 1;
          } else if (x.responsible_driver_name != null) {
            app[1].value += 1;
            w2p[1].value += 1;
          } else {
            app[2].value += 1;
            w2p[2].value += 1;
          }
        });

        setApplicationsStatus(app);
        setP2pApplicationsStatus(p2p);
        setW2pApplicationsStatus(w2p);

        getWalletBalance(parsedUserInfo.cryptowallet_address, 2)
          .then(
            balance => {
              dispatch(setMaticBalance(balance));
            }
          ).catch(
            async failure => {
              console.log("Why fetch balance failed: " + failure);
              console.log("Invoking backup...");

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
            }
          )
      } catch (error) {
        console.error(error);
      } finally {

      }
    }

    if (loading) {
      fetchProfile();
      setLoading(false);
    }
  }, [w2pApplicationsStatus, p2pApplicationsStatus, applicationsStatus]);

  const handleLogoutRedirect = () => {
    // handle logout details
    dispatch(setUsernameGlobal(""));
    dispatch(setCryptoWalletAddress(""));
    dispatch(setMaticBalance(-1));
    navigate('/');
  }

  const handleAccountManagement = () => {
    navigate("/account-management")
  }

  const handleTMRedirect = () => {
    navigate("/track")
  }

  const handleAddRedirect = () => {
    navigate("/add")
  }

  if (loading) {
    <div className="flex flex-col items-center w-full bg-gray-400">
      <h1>Loading...</h1>
    </div>
  }

  return (
    <div className="flex flex-col items-center w-full bg-gray-400">
      <NavBar name={usernameGlobal}></NavBar>
      <div className="bg-gray-900 opacity-90 center text-white w-full bx-20 z-50">
        <div className="">
          <div className='flex flex-row items-center h-16'>
            <img src={polygon} className='w-8 h-8 mx-4'></img>
            <br></br>
            <h1 className='mx-2 my-1 flex-1'>User Dashboard</h1>
          </div>
        </div>
      </div>
      <div className="container">
        <Location />
        {
          (latGlobal === 0 || lonGlobal === 0) ?
            <h1>Loading your location...</h1> :
            <div className='container my-48 bg-gray-200 px-8 rounded-xl shadow-2xl overflow-auto'>
              {/* <h1 className='text-3xl hover:animate-pulse duration-300 ease-in-out'>User Dashboard</h1> */}
              <div className='flex flex-row w-full justify-center'>
                <div className='flex flex-col justify-between items-center'>
                  <button
                    className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                    onClick={handleAccountManagement}
                  >
                    Account Management
                  </button>
                </div>
                <div className='flex flex-col justify-between items-center'>
                  <button
                    className="min-h-16 bg-gray-200 text-2xl hover:bg-gray-300 text-gray-800 m-2 font-normal border border-gray-400 duration-300 ease-in-out"
                    onClick={handleTMRedirect}
                  >
                    Transaction Management
                  </button>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                  </span>
                </div>
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
              {p2pInfo.length == 0 && w2pInfo.length == 0 ?
                <div className='flex flex-row items-center'>
                  <h1>Loading stuff... Nothing yet</h1>
                </div>
                :
                <div className='flex flex-row items-center space-x-4 mb-4'>
                  <div className='flex flex-col items-center'>
                    <h1>Package (P2P and W2P) Status</h1>
                    {applicationsStatus.length != 0 && <PieChart
                      series={[
                        {
                          data: applicationsStatus,
                        },
                      ]}
                      width={400}
                      height={200}
                    >
                    </PieChart>}
                  </div>
                  <div className='flex flex-col items-center'>
                    <h1>Package (P2P) Status</h1>
                    {p2pApplicationsStatus.length != 0 && <PieChart
                      series={[
                        {
                          data: p2pApplicationsStatus,
                        },
                      ]}
                      width={400}
                      height={200}
                    >
                    </PieChart>}
                  </div>
                  <div className='flex flex-col items-center'>
                    <h1>Package (W2P) Status</h1>
                    {w2pApplicationsStatus.length != 0 && <PieChart
                      series={[
                        {
                          data: w2pApplicationsStatus,
                        },
                      ]}
                      width={400}
                      height={200}
                    >
                    </PieChart>}
                  </div>
                </div>}
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
        {/* <h1 className='mx-10 my-1 font-bold'>Dashboard</h1>
        {
          p2pInfo.length == 0 && w2pInfo.length == 0 ?
            <div className='flex flex-row items-center'>
              <h1>Loading stuff... Nothing yet</h1>
            </div>
            :
            <div className='flex flex-row items-center space-x-4'>
              <div className='flex flex-col items-center'>
                <h1>Package (P2P and W2P) Status</h1>
                {applicationsStatus.length != 0 && <PieChart
                  series={[
                    {
                      data: applicationsStatus,
                    },
                  ]}
                  width={400}
                  height={200}
                >
                </PieChart>}
              </div>
              <div className='flex flex-col items-center'>
                <h1>Package (P2P) Status</h1>
                {p2pApplicationsStatus.length != 0 && <PieChart
                  series={[
                    {
                      data: p2pApplicationsStatus,
                    },
                  ]}
                  width={400}
                  height={200}
                >
                </PieChart>}
              </div>
              <div className='flex flex-col items-center'>
                <h1>Package (W2P) Status</h1>
                {w2pApplicationsStatus.length != 0 && <PieChart
                  series={[
                    {
                      data: w2pApplicationsStatus,
                    },
                  ]}
                  width={400}
                  height={200}
                >
                </PieChart>}
              </div>
            </div>
        } */}
      </div>
    </div>
  );
}

export default Main;
