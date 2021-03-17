import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView, ImageBackground } from 'react-native';
import { Avatar } from 'react-native-elements';
import Header from '../elements/header';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as firebase from 'firebase';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';



  export default class ImagePicker extends Component () {
    state = {
        image: null,
      };
      render(){
        let { image } = this.state;
          return(
              <View></View>
          );
      }
      componentDidMount() {
        this.getPermissionAsync();
      }
    
      getPermissionAsync = async () => {
        if (Constants.platform.ios) {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
        }
      };

      _pickImage = async () => {
        try {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });
          if (!result.cancelled) {
            this.setState({ image: result.uri });
          }
    
          console.log(result);
        } catch (E) {
          console.log(E);
        }
      };
  }