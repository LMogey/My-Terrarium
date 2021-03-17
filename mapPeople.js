import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Switch, Alert, AppState } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, Entypo, Octicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { ActivityIndicator, Colors } from 'react-native-paper';


export default class mapPeople extends Component {

  constructor(props) {
    super(props);
    this.state = {
      region: null,
      usersLatitude: '',
      usersLongitude: ',',
      loading: false,
      marker: [],
      onOff: false,
      trade: false,
      appState: AppState.currentState
    }
  }


  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      console.log('Permission to access location was denied.');
      return;
    }
    let location = await Location.getCurrentPositionAsync({ enabledHighAccuracy: true, timeout: 5000, maximumAge: 10000 });
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045
    }
    this.setState({ Position: region })

    const user = firebase.auth().currentUser;
    let data = {
      location: new firebase.firestore.GeoPoint(location.coords.latitude, location.coords.longitude)
    };
    firebase.firestore().collection('Locations').doc(user.uid).get().then(doc => {
      if (doc.exists) {

      } else {
        firebase.firestore().collection('Locations').doc(user.uid)
          .set({
            data,
            displayName: user.displayName,
            trade: this.state.trade
          })
      }
    })
    this.setState({ loading: false })
  }
  _handleMapRegionChange = Position => {
    this.setState({ Position });
  };

  onMarkerReceived = (marker) => {
    this.setState(prevState => ({
      marker: prevState.marker = marker
    }));
  }

  getOnOffState = () => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Locations').doc(user.uid)
      .get().then(doc => {
        const yes = doc.data().onOff;
        this.setState({ onOff: yes })
      })
   
    getMarker(this.onMarkerReceived);
  }

  updateOnOff = async (onOffState) => {
    this.setState({ onOff: !onOffState })
    const user = firebase.auth().currentUser;
    await firebase.firestore().collection('Locations').doc(user.uid)
      .update({
        onOff: !onOffState
      }).catch(
        console.log('na')
      )
    getMarker(this.onMarkerReceived);

  }

  gettradeState = () => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Locations').doc(user.uid)
      .get().then(doc => {
        const yes = doc.data().trade;
        this.setState({ trade: yes })
      })
   
    getMarker(this.onMarkerReceived);
  }

  updateOnOffTrading = async (tradeState) => {
    this.setState({ trade: !tradeState })
    const user = firebase.auth().currentUser;
    if (this.state.trade === false) {
      Alert.alert(
        'Alert',
        'Have you updated your trade message?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: 'Update',
            onPress: () => this.props.navigation.navigate('settings')
          },
          {
            text: 'Yes',
          },
        ],
        { cancelable: false }

      );
    } else {

    }
    await firebase.firestore().collection('Locations').doc(user.uid)
      .update({
        trade: !tradeState
      }).catch(
        console.log('na')
      )
    getMarker(this.onMarkerReceived);

  }

  componentDidMount() {
    this.setState({ loading: true })
    this._getLocationAsync();
    this.getOnOffState();
    this.gettradeState()
    getMarker(this.onMarkerReceived);
  }


  back = () => {
    this.props.navigation.goBack();
  }
  render() {

    return (

      <View style={styles.container}>

        <View style={styles.header}>
          <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
            onPress={() => this.back()}
          />
          <Text style={styles.headerText}>Explore Buds</Text>

        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', borderColor: 'green', borderWidth: 1 }}>

          <Text style={{ fontSize: 16, }}>Toggle location on and off with this icon</Text><AntDesign name="arrowright" size={24} color="black" />
          {this.state.onOff === false ? (
            <Octicons name="location" size={30} color="black" onPress={() => this.updateOnOff(this.state.onOff)} />
          ) : (<MaterialIcons name="location-on" size={30} color="#00cec9" onPress={() => this.updateOnOff(this.state.onOff)} />)}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', borderColor: 'green', borderWidth: 1 }}>
          {this.state.trade === false ? (
            <Octicons name="location" size={30} color="black" onPress={() => this.updateOnOffTrading(this.state.trade)} />
          ) : (<MaterialIcons name="location-on" size={30} color="#fdcb6e" onPress={() => this.updateOnOffTrading(this.state.trade)} />)}
          <AntDesign name="arrowleft" size={24} color="black" />
          <Text style={{ fontSize: 16, }}>Toggle location on and off with this icon</Text>
        </View>
       
    
          
          <MapView style={styles.map}
            initialRegion={this.state.Position}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            onRegionChange={this._handleMapRegionChange}
            provider={MapView.PROVIDER_GOOGLE}
          >

            {this.state.marker.map((item, index) => (
              <MapView.Marker
                coordinate={{
                  latitude: item.data.location.latitude,
                  longitude: item.data.location.longitude
                }}

                pinColor={item.trade ? '#fdcb6e' : '#00cec9'}
                key={index}
                tracksViewChanges={false}
              >
                <Callout tooltip={false} style={{ flexDirection: 'column', alignSelf: 'flex-start', flex: 1, position: 'relative' }} onPress={() => this.props.navigation.navigate('otherUserProfile', { user: item.id })}>
                  <View style={{ width: 100, alignItems: 'center' }}>
                    <Text style={styles.titleText}>{item.displayName}</Text>
                    <Text style={styles.titleTextAbout}>{item.trade === true ? item.tradeMessage : item.about}</Text>
                  </View>
                </Callout>
              </MapView.Marker>
            ))}
          </MapView>
        
      </View>

    );
  }
}

async function getMarker(markerRetreived) {
  var marker = [];

  await firebase.firestore()
    .collection('Locations').where('onOff', '==', true)
    .get().then(snapshot => {
      snapshot.forEach((doc) => {
        const markerItem = doc.data();
        markerItem.id = doc.id;
        marker.push(markerItem);
      });
    })

  markerRetreived(marker);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: 'white'
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  header: {
    backgroundColor: '#55efc4',
    paddingLeft: 10,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  headerText: {
    fontSize: 35,
    color: '#079992',
    fontFamily: 'notoserif',
    textShadowColor: 'white',
    textShadowRadius: 1,
    paddingRight: 100,
    paddingLeft: 80,

  },
  headerIcon: {
    color: "black",
    justifyContent: 'flex-start',

  },
  titleText: {
    fontSize: 15,
    fontWeight: '100',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    fontStyle: 'italic'
  },
  titleTextAbout: {
    fontSize: 10,
    fontWeight: '100',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    fontStyle: 'italic',
    alignSelf: 'center'
  },
});
