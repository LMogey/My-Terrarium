import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

export default class mapGroups extends Component {

  constructor(props) {
    super(props);
    this.state = {
      region: null,
      usersLatitude: '',
      usersLongitude: ',',
      loading: false,
      marker: [],
      onOff: false,
    }
   
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted'){
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

  componentDidMount() {
    this._getLocationAsync()
    getMarker(this.onMarkerReceived);
  }

 
  render() {
   

    return (

      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
            onPress={() => this.props.navigation.goBack()}
          />
          <Text style={styles.headerText}>Explore Blossoms</Text>

        </View>
        
        {this.state.loading === true ? null :
        <MapView style={styles.map}
          initialRegion={this.state.Position}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          onRegionChange={this._handleMapRegionChange}
          provider={MapView.PROVIDER_GOOGLE}
        >

          {this.state.marker.map((item) => (
            <MapView.Marker
              coordinate={{
                latitude: item.data.location.latitude,
                longitude: item.data.location.longitude
              }}
              pinColor='#00cec9'
              key={item.id}
              tracksViewChanges={false}
            >
              <Callout tooltip={false} style={{ flexDirection: 'column', alignSelf: 'flex-start', flex: 1, position: 'relative' }} onPress={() => this.props.navigation.navigate('groupPage', { groupID: item.id })}>
                <View style={{ width: 150 }}>

                  <Text style={styles.titleText}>{item.name}</Text>
                  <Text style={styles.titleTextAbout}>{item.About}</Text>

                </View>
              </Callout>

            </MapView.Marker>
          ))}
        </MapView>
  }
      </View>

    );
  }
}

async function getMarker(markerRetreived) {

  var marker = [];

  await firebase.firestore()
    .collection('groups').get().then(snapshot => {
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
    marginBottom: 5
  },
  headerText: {
    fontSize: 35,
    color: '#079992',
    fontFamily: 'notoserif',
    textShadowColor: 'white',
    textShadowRadius: 1,
    paddingRight: 40,
    paddingLeft: 40,

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
    fontStyle: 'italic',
    alignSelf: 'center'
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