import React from 'react';
import { StackNavigator } from 'react-navigation';

import HomePage from './app/screens/Home';
import MapPage from './app/screens/Map';


const RootStack = StackNavigator(
  {
    Home: {
      screen: HomePage
    },
    Map: {
      screen: MapPage
    }
  },
  {
    initialRouteName: 'Home',
    
  }
);

export default RootStack;