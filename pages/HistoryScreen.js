import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, 
  TouchableHighlight, TextInput, Image, Alert,
  ScrollView, Dimensions, ActivityIndicator, Button, TouchableOpacity } from 'react-native';

import { DataTable } from 'react-native-paper';

import { getDatabase, ref, onValue, get, push, set } from 'firebase/database';
import { getAuth } from "firebase/auth";

import moment from 'moment';

export default class HistoryScreen extends React.Component {
  constructor(props){
    super(props);
    this.checkInRef = ref(getDatabase(), 'checked/');
    this.state = {
      checkInList: {},
      keyList: [],
    };
  }

  async componentDidMount() {
    await this._readDB();
  }

  async _readDB() {
    await get(this.checkInRef).then((snapshot) => {
      if (snapshot.exists()) {
        this.setState({checkInList: snapshot.val()})
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.log(error);
    });
    var keys = this.state.checkInList ? Object.keys(this.state.checkInList) : [];
    keys = keys.filter((key) => this.state.checkInList[key].user
            == getAuth().currentUser.email.split('@')[0])
    this.setState({ keyList: keys })
  }

  render() {
    const data = this.state.checkInList
    const navigation = this.props.navigation
    return (
      <View style={styles.container}>
        <ScrollView style={styles.subContainer}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>วันที่</DataTable.Title>
              <DataTable.Title numeric>เข้างาน</DataTable.Title>
              <DataTable.Title numeric>ออกงาน</DataTable.Title>
            </DataTable.Header>

              { this.state.keyList.slice(0, 15).reverse().map(function(object, i) {
                const keys = Object.keys(data[object]);
                return (
                  <DataTable.Row key={i}>
                    <DataTable.Cell>
                      { keys.includes('checkIn') ? 
                        moment(data[object].checkIn.datetime).add(543, 'years')
                        .format('DD/MM/YYYY') : "" }
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      { keys.includes('checkIn') ? 
                        moment(data[object].checkIn.datetime).format('HH:mm')
                        : "" }
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      { keys.includes('checkOut') ? 
                        moment(data[object].checkOut.datetime).format('HH:mm')
                        : "" }
                    </DataTable.Cell>
                  </DataTable.Row>
                )
              })}
          </DataTable>
          <View style={{marginVertical: 30}} />
        </ScrollView>
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
  subContainer: {
    flex: 1,
    width: Dimensions.get("window").width - 20,
    height: Dimensions.get("window").height - 80,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
})