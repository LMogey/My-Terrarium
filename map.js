import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as firebase from 'firebase';
import { Ionicons, Entypo } from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';

export default class map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      region: null
    }
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted')
      console.log('Permission to access location was denied.');

    let location = await Location.getCurrentPositionAsync({ enabledHighAccuracy: true , timeout: 1000, maximumAge:1000});
    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.045,
      longitudeDelta: 0.045
    }
    this.setState({ Position: region})
    
  }

  render() {

    const user = firebase.auth().currentUser;

    return (

      <View>
        <View style={styles.header}>
          <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
            onPress={() => this.props.navigation.goBack()}
          />
          <Text style={styles.headerText}>Explore</Text>

        </View>
        <MapView style={styles.map}
          initialRegion={this.state.Position}
          showsUserLocation={true}
          showsCompass={true}
        > 
        </MapView>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    paddingRight: 150,
    paddingLeft: 125,

  },
  headerIcon: {
    color: "black",
    justifyContent: 'flex-start',

  },

});
