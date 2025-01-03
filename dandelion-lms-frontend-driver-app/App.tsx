/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './View/LoginScreen';
import RegistrationScreen from './View/RegistrationScreen';
import MainScreen from './View/MainScreen';
import { enableScreens } from 'react-native-screens';
import PackageSelection, { PackingSchemeBody } from './View/PackageSelection';
import PackageDetail from './View/PackageDetail';
import { RouteProp } from '@react-navigation/native';
import { Package } from './View/PackageSelection';
import { Provider } from 'react-redux';
import { store } from './State/Store';
import PackingScheme from './View/PackingScheme';
import Routing from './View/Routing';
import Scanner from './View/Scanner';
import Tasks from './View/Tasks';
import 'whatwg-fetch';


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DeliveryConfirmScreen from './View/DeliveryConfirm';
import HistoryScreen from './View/HistoryScreen';
import ChangeScreen from './View/ChangeScreen';

enableScreens();

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

// type Package = {
//   id: number;
//   name: string;
//   details: string;
// };

export type stackScreens = {
  Login: undefined,
  Registration: undefined,
  MainScreen: undefined,
  PackageSelection: undefined,
  PackageDetails: {
    data: Package,
    handler: ((packageItem: Package, add: boolean) => void) | null,
  },
  PackingScheme: {
    data: PackingSchemeBody,
  },
  Routing: {
    data: any;
  },
  Task: {
    data: any;
  }
  Scanner: {
    data: string[];
  }
  DeliveryConfirm: {
    data: string[];
  }
}

// function MainTabNavigator() {

//   return (
//     <Tab.Navigator>
//       <Tab.Screen name="Routing" component={Routing} />
//       <Tab.Screen name="Tasks" component={Tasks} />
//     </Tab.Navigator>
//   )
// }

//npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Change" component={ChangeScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Package Selection" component={PackageSelection} />
          <Stack.Screen
            name="Package Detail"
            component={PackageDetail}
          />
          <Stack.Screen name="Packing Scheme" component={PackingScheme} />
          <Stack.Screen name="Routing" component={Routing}/>
          <Stack.Screen name="Scanner" component={Scanner} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="DeliveryConfirm" component={DeliveryConfirmScreen} />
          {/* Add other screens as needed */}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;