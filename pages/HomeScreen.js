import React from 'react';
import { Platform, StyleSheet, Text, View, 
  TouchableHighlight, TextInput, Image, Alert,
  ScrollView, Dimensions, ActivityIndicator, Button, TouchableOpacity } from 'react-native';

import { getDatabase, ref, onValue, get, push, set } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';

import ProfileImage from '../api/ProfileImage'

export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    this.userRef = ref(getDatabase(), 'users/');
    this.state = {
      username: '',
      password: '',
      isLoggedIn: false,
      isLoading: true,
      isLoggingIn: false,
      isMenu: true,
      datetime: '',
      userInfo: {},
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('user').then((val) =>
      this.setState({ username: val })
    );
    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        this._readDB()
        this.setState({ isLoggedIn: true, isLoading: false })
      } else {
        this.setState({ isLoggedIn: false, isLoading: false })
      }
    });
    setInterval(() => {
      this.setState({
        datetime: moment().add(543, 'years')
      })
    }, 1000)
  }

  async _readDB() {
    await get(this.userRef).then((snapshot) => {
      if (snapshot.exists()) {
        const list = snapshot.val()
        const keys = Object.keys(list)
        keys.forEach((key) => {
          if (list[key].username == getAuth().currentUser.email.split('@')[0]) {
            this.setState({ userInfo: list[key] })
          }
        })
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  async doLogin() {
    const auth = getAuth();
    const username = this.state.username + "@perfectcompanion.com"
    this.setState({ isLoggingIn: true });
    await signInWithEmailAndPassword(auth, username, this.state.password)
    .then(() => {
      AsyncStorage.setItem('user', this.state.username);
      this._readDB()
      this.setState({ isLoggedIn: true, password: '' });
    })
    .catch(function(error) {
      alert(error.message);
    })
    this.setState({ isLoggingIn: false });
  }

  doLogout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      this.setState({ isMenu: true, isLoggedIn: false })
    })
    .catch(function(error) {
      alert(error.message);
    })
  }

  showLogin() {
    return (
      <View style={login.container}>
        <Spinner
          visible={this.state.isLoggingIn}
          color={'#19335A'}
        />
        <View style={login.group}>
          <Text style={login.header}>เข้าสู่ระบบ</Text>
        </View>
        <View style={login.group}>
          <Text style={login.title}>Username</Text>
          <TextInput
            style={login.input}
            value={this.state.username}
            onChangeText={(username) => this.setState({username})}
          />
        </View>
        <View style={login.group}>
          <Text style={login.title}>Password</Text>
          <TextInput
            style={login.input}
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={(password) => this.setState({password})}
          />
        </View>
        <View style={login.group}>
          <TouchableHighlight
            style={login.button}
            underlayColor='#3D4E69'
            onPress={() => this.doLogin()}
          >
            <Text style={login.buttonText}>Login</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  bottomButtons() {
    return (
      <View style={styles.group}>
        <TouchableHighlight
          style={[styles.button, {borderRightWidth: 1, borderRightColor: '#FFFFFF'}]}
          underlayColor='#3D4E69'
          onPress={() => this.setState({isMenu: true})}
        >
          <View style={styles.buttonContainer}>
            <Image style={styles.buttonImage} source={require('../icon/menu.png')} />
            <Text style={styles.buttonText}>Menu</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          style={[styles.button, {borderLeftWidth: 1, borderLeftColor: '#FFFFFF'}]}
          underlayColor='#3D4E69'
          onPress={() => this.setState({isMenu: false})}
        >
          <View style={styles.buttonContainer}>
            <Image style={styles.buttonImage} source={require('../icon/user.png')} />
            <Text style={styles.buttonText}>Profile</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }

  showMenu() {
    return (
      <>
        <View style={{flex: 1}}>
          <View style={home.group}>
            <Text style={home.datetime}>
              { moment(this.state.datetime).format('[Date:] DD/MM/YYYY [   Time:] HH:mm:ss') }
            </Text>
          </View>
          <View style={home.group}>
            <TouchableHighlight
              style={[home.button, {backgroundColor: '#00CAE3'}]}
              underlayColor='#8DD7E0'
              onPress={() => this.props.navigation.navigate('CheckIn')}
            >
              <View style={home.buttonContainer}>
                <Text style={home.buttonText}>เข้างาน</Text>
                <Image style={home.buttonImage} source={require('../icon/clock-in.png')} />
              </View>
            </TouchableHighlight>
          </View>
          <View style={home.group}>
            <TouchableHighlight
              style={[home.button, {backgroundColor: '#FF5252'}]}
              underlayColor='#FC9090'
              onPress={() => this.props.navigation.navigate('CheckOut')}
            >
              <View style={home.buttonContainer}>
                <Text style={home.buttonText}>ออกงาน</Text>
                <Image style={home.buttonImage} source={require('../icon/check-out.png')} />
              </View>
            </TouchableHighlight>
          </View>

          <View style={{flexDirection: 'row', marginTop: 20, marginHorizontal: 25}}>
            <Text style={{flex: 1, fontSize: 24, fontWeight: 'bold', textAlign: 'left'}}>History</Text>
            <View style={{flex: 3, height: 2, backgroundColor: 'black', marginVertical: 16}} />
          </View>

          <View style={home.group}>
            <TouchableHighlight
              style={[home.button, {backgroundColor: '#FB8C00'}]}
              underlayColor='#FAC889'
              onPress={() => this.props.navigation.navigate('History')}
            >
              <View style={home.buttonContainer}>
                <Text style={home.buttonText}>ประวัติ</Text>
                <Image style={home.buttonImage} source={require('../icon/history.png')} />
              </View>
            </TouchableHighlight>
          </View>
        </View>
        { this.bottomButtons() }
      </>
    );
  }

  showProfile() {
    return (
      <>
        <View style={[{flex: 1}, profile.container]}>
          <View style={profile.userContainer}>
            <Image
              style={profile.image}
              source={ProfileImage[this.state.userInfo.image]}
            />
            <View style={profile.userTextContainer}>
              <Text style={profile.name}>
                { this.state.userInfo.firstname } { this.state.userInfo.lastname }
              </Text>
              <Text style={profile.department}>
                { this.state.userInfo.department }
              </Text>
            </View>
          </View>

          <View style={profile.textContainer}>
            <Text style={profile.title}>Username</Text>
            <Text style={profile.text}>
              { this.state.userInfo.username }
            </Text>
            <View style={profile.divider} />
          </View>

          <View style={profile.textContainer}>
            <Text style={profile.title}>Email</Text>
            <Text style={profile.text}>
              { getAuth().currentUser.email }
            </Text>
            <View style={profile.divider} />
          </View>

          <View style={profile.group}>
            <TouchableHighlight
              style={profile.button}
              underlayColor='#FC9090'
              onPress={() => this.doLogout()}
            >
              <Text style={profile.buttonText}>Sign Out</Text>
            </TouchableHighlight>
          </View>
        </View>
        { this.bottomButtons() }
      </>
    );
  }

  showHome() {
    return (
      <>
        { this.state.isMenu ? this.showMenu() : this.showProfile() }
      </>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.isLoading ? 
          <Spinner
            visible={this.state.isLoading}
            color={'#19335A'}
          /> : 
          (this.state.isLoggedIn ? this.showHome() : this.showLogin())
        }
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
  // button
  group: {
    flexDirection: 'row',
  },
  button: {
    width: Dimensions.get("window").width / 2,
    height: 80,
    backgroundColor: '#19335A'
  },
  buttonContainer : {
    flex: 1,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonImage: {
    flex: 5,
    height: 40,
    width: 40,
    resizeMode: 'contain',
  },
  buttonText: {
    flex: 2,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
})

const login = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height - 120,
    marginHorizontal: 20,
    marginVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  group: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    margin: 10,
    color: '#19335A',
  },
  title: {
    fontSize: 20,
    marginHorizontal: 5,
    color: '#636363',
  },
  input: {
    height: 40,
    backgroundColor: '#EEF5F9',
    borderRadius: 10,
  },
  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 30,
    width: Dimensions.get("window").width - 60,
    backgroundColor: '#19335A',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
})

const home = StyleSheet.create({
  group: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  datetime: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1
  },
  button: {
    width: Dimensions.get("window").width - 40,
    height: 100,
    marginVertical: 5,
    borderRadius: 10,
  },
  buttonText: {
    flex: 5,
    marginVertical: 30,
    marginHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'white',
  },
  buttonImage: {
    flex: 3,
    height: 100,
    borderRadius: 10,
  },
})

const profile = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 40,
    height: Dimensions.get("window").height - 120,
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  userTextContainer: {
    marginVertical: 10,
    marginLeft: 20
  },
  image: {
    height: 75,
    width: 75,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#19335A'
  },
  department: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636363'
  },
  textContainer: {
    marginVertical: 15,
    marginHorizontal: 20
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#636363'
  },
  text: {
    fontSize: 16,
    color: '#000000'
  },
  divider: {
    borderWidth: 1,
    marginTop: 5,
    borderColor: '#B4B4B4',
  },
  group: {
    marginTop: 20,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 30,
    width: Dimensions.get("window").width - 80,
    backgroundColor: '#FF5252',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
})