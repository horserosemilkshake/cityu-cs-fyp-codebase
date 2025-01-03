import './App.css';

import { Routes, Route } from 'react-router-dom';
import Login from "./view/Login";
import Main from './view/Main';
import { Provider } from 'react-redux';
import { store } from './state/Store';
import AccountManagement from './view/AccountManagement';
import TrackPage from './view/TrackPage';
import PackageForm from './view/PackageForm';
import ImageUploader from './view/ImageUploader';
import Print from './view/Print';
import Map from './view/Map';
import Details from './view/Details';

function App() {
  return (
    <Provider store={store}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/main' element={<Main />} />
        <Route path='/details' element={<Details />} />
        <Route path='/account-management' element={<AccountManagement />} />
        <Route path='/track' element={<TrackPage />} />
        <Route path='/map' element={<Map />} />
        <Route path='/add' element={<PackageForm />} />
        <Route path='/size' element={<ImageUploader />} />
        <Route path='/print' element={<Print />} />
      </Routes>
    </Provider>
  );
}

export default App;
