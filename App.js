import React from 'react';
import { StyleSheet, Text, View, LogBox } from 'react-native';

LogBox.ignoreLogs(['Setting a timer']);
LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core and will be removed in a future release']); // https://github.com/firebase/firebase-js-sdk/issues/1847
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
LogBox.ignoreLogs(['Can\'t perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application'])

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { initializeApp } from 'firebase/app';

import moment from 'moment';

import { firebase_apiKey, firebase_authDomain, firebase_databaseURL,
  firebase_projectId, firebase_storageBucket, firebase_messagingSenderId,
  firebase_appId, firebase_measurementId } from "@env";

const firebaseConfig = {
  apiKey: firebase_apiKey,
  authDomain: firebase_authDomain,
  databaseURL: firebase_databaseURL,
  projectId: firebase_projectId,
  storageBucket: firebase_storageBucket,
  messagingSenderId: firebase_messagingSenderId,
  appId: firebase_appId,
  measurementId: firebase_measurementId
};

initializeApp(firebaseConfig);

const Stack = createStackNavigator();

import HomeScreen from './pages/HomeScreen'
import CheckInScreen from './pages/CheckInScreen'
import CheckOutScreen from './pages/CheckOutScreen'
import HistoryScreen from './pages/HistoryScreen'
import LocationScreen from './pages/LocationScreen'

export default class App extends React.Component {
  render() {
    console.log(firebase_databaseURL * 0)
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Check-In System',
              headerStyle: {
                backgroundColor: '#19335A',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="CheckIn"
            component={CheckInScreen}
            options={{
              title: 'Check In - เข้างาน',
              headerStyle: {
                backgroundColor: '#19335A',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="CheckOut"
            component={CheckOutScreen}
            options={{
              title: 'Check Out - ออกงาน',
              headerStyle: {
                backgroundColor: '#19335A',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{
              title: 'ประวัติการเข้า/ออกงาน',
              headerStyle: {
                backgroundColor: '#19335A',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="Location"
            component={LocationScreen}
            options={ ({ route }) => ({
              title: moment(route.params.res_data.checkIn.datetime).add(543, 'years')
                      .format('DD/MM/YYYY') + " - พิกัดเข้า/ออกงาน",
              headerStyle: {
                backgroundColor: '#19335A',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
