import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Dimensions, Alert, TouchableHighlight, ScrollView } from 'react-native';
import { Button } from 'native-base';
import Header from '../elements/header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';

export default class post extends Component {
  state = {
    text: "",
    image: null,
    time: '',
    pickerDisplayed: false,
    plants: [],
    pickerSelection: null,
    postsNum: null,
    avatarImage: '',
    docReference: '',
    plantLabelID:null
  }

  get uid() {
    return (firebase.auth().currentUser || {}).uid
  }

  get displayName() {
    return (firebase.auth().currentUser || {}).displayName
  }

  setAvatar = () => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Users').doc(user.uid).onSnapshot(
      documentSnapshot => {
        const image = documentSnapshot.data().avatar;
        this.setState({ avatarImage: image })
      }
    )
  }


  get timestamp() {
    var dateDetails = new Date();
    var date = dateDetails.getDate();
    var month = dateDetails.getMonth(); //Be careful! January is 0 not 1
    var year = dateDetails.getFullYear();
    var dateString = date + "-" + (month + 1) + "-" + year;
    return dateString;
  }
  get timeAccurate() {
    var dateDetails = new Date();
    var date = dateDetails.getDate();
    var month = dateDetails.getMonth(); //Be careful! January is 0 not 1
    var year = dateDetails.getFullYear();
    var time = dateDetails.getTime();
    var dateString = date + "-" + (month + 1) + "-" + year + "-" + time;
    return dateString;
  }

  onPressButton = () => {
    Alert.alert(
      'Choose an option',
      'Camera or Gallery',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Camera',
          onPress: this.openCamera
        },
        {
          text: 'Gallery',
          onPress: this.openImage
        },
      ],
      { cancelable: false }

    );
  }

  openCamera = async () => {
    let permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted === false) {
      return;
    }
    let picker = await ImagePicker.launchCameraAsync({
      base64: true,
      allowsEditing: true,
      aspect: [1, 1]
    })

    if (picker.cancelled === true) {
      return;
    } else if (picker.cancelled === false) {
      this.uploadPhoto(picker.uri, this.uid)
    }

  }

  openImage = async () => {
    let permission = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permission.granted === false) {
      return;
    }
    let picker = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true,
      aspect: [1, 1]
    })

    if (picker.cancelled === true) {
      return;
    } else if (picker.cancelled === false) {
      this.uploadPhoto(picker.uri, this.uid)

    }
  }

  uploadPhoto = async (url, imageName) => {
    const time = this.timeAccurate;
    const path = 'posts/' + imageName + '/' + time;

    return new Promise(async (res, rej) => {
      const response = await fetch(url)
      const file = await response.blob()

      let upload = firebase.storage().ref(path).put(file)

      upload.on("state_changed", snapshot => { }, err => {
        rej(err)
      },
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
          this.setState({ image: url })
        }
      );
    });
  };

  
  handlePost = () => {
    this.setAvatar();
    var postsBoi = firebase.firestore().collection('posts').doc();
    postsBoi.set({
      docRef: postsBoi.id,
      name: this.state.pickerSelection,
      PlantNameLabelID: this.state.plantLabelID,
      text: this.state.text.trim(),
      localUri: this.state.image,
      avatar: this.state.avatarImage,
      uid: [
        this.uid
      ],
      displayName: this.displayName,
      timestamp: this.timestamp,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      likes: 0,
      userUid: this.uid
    }).then(ref => {
        this.setState({ text: "", image: null });
        console.log('Success')
      }).catch(error => {
        Alert.alert(error);
      })

    this.updatePostAmount(this.uid);
  }

  updatePostAmount = (id) => {
    const increment = firebase.firestore.FieldValue.increment(1);
    firebase.firestore().collection('Users').doc(id).update({
      posts: increment
    })

  }


  loadPlants = async () => {
    firebase.firestore()
      .collection('plants')
      .orderBy('englishName', 'asc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { englishName, latinName } = doc.data();
          data.push({
            id: doc.id,
            englishName,
            latinName
          });
        })

        this.setState({ plants: data });
      })

  };
  componentDidMount() {
    this.setState({ isLoading: true });
    this.setAvatar();
    this.loadPlants();

  }

  setPickerValue(newValue, othervalue, key) {
    this.setState({
      plantLabelID: key,
      pickerSelection: newValue + " (" + othervalue + ")"
    })

    this.togglePicker();
  }

  togglePicker() {
    this.setState({
      pickerDisplayed: !this.state.pickerDisplayed
    })
  }

  render() {
    return (

      <View style={{ backgroundColor: '#ffffff', width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
        <Header />
        <View style={styles.container}>

          <TouchableOpacity style={styles.button}>
            <Button medium rounded success onPress={this.handlePost} >
              <Text style={styles.postButton}>Post</Text>
            </Button>
            <Button bordered success onPress={() => this.togglePicker()}>
              <MaterialCommunityIcons name="menu-down-outline" size={30} color="green" />
              <Text style={{ padding: 10, color: '#00b894' }}>Insert Plant Name</Text>
            </Button>
            <MaterialCommunityIcons name="camera-plus-outline" size={40} color="#b2bec3" style={styles.camera} onPress={this.onPressButton} />
          </TouchableOpacity>
          <Text style={{ alignSelf: 'center', fontSize: 20, fontStyle: 'italic', color: '#00b894' }}>{this.state.pickerSelection}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              autoFocus={true}
              multiline={true}
              numberOfLines={4}
              style={{ flex: 1 }}
              placeholder='Want to share something?'
              style={styles.input}
              selectionColor="#fff"
              onChangeText={text => this.setState({ text })}
              value={this.state.text}
            ></TextInput>
          </View>

          <Modal visible={this.state.pickerDisplayed} animationType={"slide"} transparent={true} propagateSwipe>
            <View >
              <ScrollView style={styles.modalScroll}>
                {this.state.plants.map((value, index) => {
                  return <TouchableHighlight key={index} onPress={() => this.setPickerValue(value.englishName, value.latinName, value.id)} style={{ paddingTop: 4, paddingBottom: 4, alignItems: 'center' }}>
                    <View >
                      <Text style={{ fontSize: 20, color: 'white' }}>{value.englishName}</Text>
                    </View>
                  </TouchableHighlight>

                })}
              </ScrollView>
              <TouchableHighlight onPress={() => this.togglePicker()} >
                <Text style={{ color: 'black', paddingLeft: 160, fontSize: 18, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </Modal>

          <View style={{ marginHorizontal: 22, marginTop: 0, height: 350 }}>
            <Image source={{ uri: this.state.image }} style={styles.imagePost} />
          </View>
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#ffffff'
  },
  inputContainer: {
    margin: 5,
    flexDirection: 'row',
  },
  input: {
    width: 400,
    height: 100,
    color: 'black',
    paddingHorizontal: 10,
    borderRadius: 25,
    borderWidth: 0.5,
    fontSize: 16,

  },
  button: {
    marginRight: 20,
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginLeft: 5,
    justifyContent: 'space-between'
  },
  postButton: {
    color: 'white',
    fontSize: 20,
    padding: 10,
  },
  camera: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    alignSelf: 'flex-end'
  },
  modalScroll: {
    marginHorizontal: 50,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#00b894',
    height: 300,

  },
  imagePost: {
    width: '100%',
    height: '100%',
    borderColor: 'black',
    borderWidth: 0.3
  }
});