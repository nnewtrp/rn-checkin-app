import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, 
  TouchableHighlight, TextInput, Image, Alert,
  ScrollView, Dimensions, ActivityIndicator, Button, TouchableOpacity } from 'react-native';

import MapView from 'react-native-maps';

export default class LocationScreen extends React.Component {
  constructor(props){
    super(props);
    const { res_data } = this.props.route.params;
    this.state = {
      region: {
        latitude: res_data.checkIn.location.latitude,
        longitude: res_data.checkIn.location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      marker: [],
      callout: "ตำแหน่งที่เข้างาน",
    };
    this.onRegionChangeComplete = this.onRegionChangeComplete.bind(this);

    if (Object.keys(res_data).includes('checkIn')) {
      this.state.marker.push({
        latlng: {
          latitude: res_data.checkIn.location.latitude,
          longitude: res_data.checkIn.location.longitude
        },
        title: "ตำแหน่งที่เข้างาน",
        color: '#00CAE3',
        description: "[" + res_data.checkIn.location.latitude + ", "
                      + res_data.checkIn.location.longitude + "]",
      })
    }
    if (Object.keys(res_data).includes('checkOut')) {
      this.state.marker.push({
        latlng: {
          latitude: res_data.checkOut.location.latitude,
          longitude: res_data.checkOut.location.longitude
        },
        title: "ตำแหน่งที่ออกงาน",
        color: '#FF5252',
        description: "[" + res_data.checkOut.location.latitude + ", "
                      + res_data.checkOut.location.longitude + "]",
      })
    }
  }

  goToMarker(button) {
    const { res_data } = this.props.route.params;
    var region = {
      latitude: res_data[button].location.latitude,
      longitude: res_data[button].location.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    }
    const callout = button == 'checkIn' ? "ตำแหน่งที่เข้างาน" : "ตำแหน่งที่ออกงาน"
    this.setState({
      region: region,
      callout: callout,
    })
  }

  onRegionChangeComplete(region) {
    this.setState({region});
    this.refs[this.state.callout].showCallout();
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          {this.state.marker.map((marker,i) => {
            return( 
            <MapView.Marker
              key={i}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              ref={marker.title}
              pinColor={marker.color}
            >
              <MapView.Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>
                    {marker.title}
                  </Text>
                  <Text style={{textAlign: 'center'}}>
                    {marker.description}
                  </Text>
                </View>
              </MapView.Callout>
            </MapView.Marker>
            )})
          }
        </MapView>

        <View style={styles.group}>
          <TouchableHighlight
            style={[styles.button, { backgroundColor: '#00CAE3' }]}
            underlayColor='#8DD7E0'
            onPress={() => this.goToMarker('checkIn')}
          >
            <Text style={styles.buttonText}>เข้างาน</Text>
          </TouchableHighlight>
          { this.state.marker.length > 1 ? (
              <TouchableHighlight
                style={[styles.button, { backgroundColor: '#FF5252' }]}
                underlayColor='#FC9090'
                onPress={() => this.goToMarker('checkOut')}
              >
                <Text style={styles.buttonText}>ออกงาน</Text>
              </TouchableHighlight>
            ) : (<></>)
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5F9',
    alignItems: 'center',
  },
  // Map
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 2/3,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 35,
    borderRadius: 10,
    width: (Dimensions.get("window").width / 2) - 20,
    margin: 5
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
})