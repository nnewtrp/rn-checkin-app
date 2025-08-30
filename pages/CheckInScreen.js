import React from 'react';
import { Platform, StyleSheet, Text, View, 
  TouchableHighlight, TextInput, Image, Alert,
  ScrollView, Dimensions, ActivityIndicator, Button, TouchableOpacity } from 'react-native';

import MapView from 'react-native-maps';

import Constants from 'expo-constants';
import * as Location from 'expo-location';

import { getDatabase, ref, onValue, get, push, set } from 'firebase/database';
import { getAuth } from "firebase/auth";

import moment from 'moment';

import openMap from 'react-native-open-maps';

import LineNotify from '../api/LineNotify'

export default class CheckInScreen extends React.Component {
  constructor(props){
    super(props);
    this.checkInRef = ref(getDatabase(), 'checked/');
    this.state = {
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      marker: {
        latlng: {
          latitude: 0,
          longitude: 0
        },
        title: "ตำแหน่งของคุณ",
        description: "Waiting...",
      },
      showButton: false,
      checkInList: {},
      checkedKey: '',
    };
  }

  async componentDidMount() {
    await this._readDB();
    if (!this.state.checkedKey) {
      if (Platform.OS === 'android' && !Constants.isDevice) {
        this.setState({
          errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
        });
      } else {
        this._getLocationAsync();
      }
    } else {
      this.setState({
        region: {
          latitude: this.state.checkInList[this.state.checkedKey].checkIn.location.latitude,
          longitude: this.state.checkInList[this.state.checkedKey].checkIn.location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        marker: {
          latlng: {
            latitude: this.state.checkInList[this.state.checkedKey].checkIn.location.latitude,
            longitude: this.state.checkInList[this.state.checkedKey].checkIn.location.longitude
          },
          title: "ตำแหน่งที่เข้างาน",
          description: "[" + this.state.checkInList[this.state.checkedKey].checkIn.location.latitude
                      + ", " + this.state.checkInList[this.state.checkedKey].checkIn.location.longitude
                      + "]",
        },
      });
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({
      region: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      marker: {
        latlng: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        title: "ตำแหน่งของคุณ",
        description: "[" + location.coords.latitude + ", " + location.coords.longitude + "]",
      },
      showButton: true,
    });

    if (this.state.errorMessage) { console.log(this.state.errorMessage) }
  }

  async _readDB() {
    await get(this.checkInRef).then((snapshot) => {
      if (snapshot.exists()) {
        this.setState({checkInList: snapshot.val()})
        // console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.log(error);
    });
    const keys = this.state.checkInList ? Object.keys(this.state.checkInList) : [];
    const checkedIn = keys.filter((key) =>
                        moment(this.state.checkInList[key].checkIn.datetime).format('DDMMYYYY')
                        == moment().format('DDMMYYYY')
                        && this.state.checkInList[key].user
                        == getAuth().currentUser.email.split('@')[0])
    if (checkedIn.length > 0) { this.setState({ checkedKey: checkedIn }) }
    // console.log(this.state.checkedKey)
  }

  async _writeDB(time) {
    push(ref(getDatabase(), 'checked/'), {
      user: getAuth().currentUser.email.split('@')[0],
      checkIn: {
        datetime: time,
        location: {
          latitude: this.state.marker.latlng.latitude,
          longitude: this.state.marker.latlng.longitude,
        },
      },
    })
    .then(() => {
      console.log("Store data success")
    })
    .catch((error) => {
      console.log("Store Error")
    });
  }
  
  async checkInPressed(time) {
    await this._writeDB(time)
    await this._readDB()
    LineNotify("เข้า", getAuth().currentUser.email.split('@')[0],
                moment(time).format('HH:mm'),
                this.state.marker.latlng
              )
  }

  checkInButton() {
    if (this.state.checkedKey) {
      return (
        <>
          <TouchableHighlight onPress={() => openMap(this.state.marker.latlng)}>
            <Image
              style={styles.map}
              source={require('../icon/map_button.png')}
            />
          </TouchableHighlight>
          <View style={styles.group}>
            <Text style={styles.checkedText}>
              เข้างานแล้ว
            </Text>
            <Text style={styles.checkedText}>
              { moment(this.state.checkInList[this.state.checkedKey].checkIn.datetime)
                .format('HH:mm:ss') }
            </Text>
          </View>
        </>
      )
    } else if (this.state.showButton) {
      return (
        <>
          <TouchableHighlight onPress={() => openMap(this.state.marker.latlng)}>
            <Image
              style={styles.map}
              source={require('../icon/map_button.png')}
            />
          </TouchableHighlight>
          <View style={styles.group}>
            <TouchableHighlight
              style={styles.button}
              underlayColor='#8DD7E0'
              onPress={() => this.checkInPressed(moment().format())}
            >
              <Text style={styles.buttonText}>เข้างาน</Text>
            </TouchableHighlight>
          </View>
        </>
      )
    } else {
      return (
        <View style={styles.group}>
          <Text style={[styles.buttonText, {color: '#19335A'}]}>
            Waiting...
          </Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>        
        { this.checkInButton() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#EEF5F9',
  },
  // Map
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 2/3,
    resizeMode: 'contain',
  },
  callout:{
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 5,
    width: 200
  },
  calloutTitle:{
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Button
  group: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 30,
    borderRadius: 90,
    width: Dimensions.get("window").width - 80,
    backgroundColor: '#00CAE3',
  },
  buttonText: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  checkedText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#19335A',
  },
})