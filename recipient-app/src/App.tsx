import React from 'react';
import logo from './logo.svg';
import './App.css';

import { Routes, Route } from 'react-router-dom';
import Login from "./view/Login";
import Registration from "./view/Registration";
import Main from './view/Main';
import { Provider } from 'react-redux';
import { store } from './state/Store';
import TrackPage from './view/TrackPage';
import Details from './view/Details';
import Map from './view/Map';
import PackageForm from './view/PackageForm';
import ImageUploader from './view/ImageUploader';
import Print from './view/Print';
import NavBar from './components/NavBar';
import ChangeUserProfile from './view/Change';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/main' element={<Main />} />
        <Route path='/register' element={<Registration />} />
        <Route path='/track' element={<TrackPage />} />
        <Route path='/details' element={<Details />} />
        <Route path='/map' element={<Map />} />
        <Route path='/add' element={<PackageForm />} />
        <Route path='/size' element={<ImageUploader />} />
        <Route path='/print' element={<Print />} />
        <Route path='/change' element={<ChangeUserProfile />} />
      </Routes>
    </Provider>
  );
}

export default App;
