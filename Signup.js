import React, { Component } from 'react';
import {
  StyleSheet, View, Image, Text, KeyboardAvoidingView,
  TouchableOpacity, StatusBar, TextInput, Alert, ScrollView, FlatList
} from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { TextInputMask } from 'react-native-masked-text';
import MultiSelect from 'react-native-multiple-select';

export default class Signup extends Component {
  constructor() {
    super();
    this.state = {
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      password: '',
      dob: '',
      isLoading: false,
      checked: false,
      selectedItems: [],
      items: []
    }
  }
  updateInputVal = (val, prop) => {
    const state = this.state;
    state[prop] = val;
    this.setState(state);
  }

  componentDidMount() {
    this.getPrefernces();
  }

  checkUserName = () => {
    const userName = this.state.displayName;
    const lower = userName.toLowerCase();
    const name = firebase.firestore().collection('Users').where('displayName', '==', lower).get();
    name.then(snapshot => {
      if (snapshot.empty) {
        this.signUp(lower);
      } else {
        Alert.alert('UserName already exists!');
      }
    })
  }
  //signup
  signUp = (lower) => {
    if (this.state.email === '' || this.state.password < 7 || this.state.dob < 10 || this.state.displayName === '') {
      Alert.alert('Enter details to signup!')
      this.props.navigation.navigate('Signup')
    } else if (this.state.selectedItems.length === 0) {
      Alert.alert('Please choose some preferences')
      this.props.navigation.navigate('Signup')
    } else {
      this.setState({
        isLoading: true,
      }) 
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
            this.props.navigation.navigate('Signup')
          } else if (errorCode == 'auth/email-already-in-use') {
            alert('Email is already in use');
            this.props.navigation.navigate('Signup')
          } else if (errorCode == 'auth/invalid-email') {
            alert('Email is invalid');
            this.props.navigation.navigate('Signup')
          } else if (errorCode == 'auth/operation-not-allowed') {
            alert('Something has gone wrong!');
            this.props.navigation.navigate('Signup')
          } else {
            alert(errorMessage);
            this.props.navigation.navigate('Signup')
          }
          this.props.navigation.navigate('Signup')


        }).then((res) => {
          firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).set({
            uid:firebase.auth().currentUser.uid,
            displayName: lower,
            dob: this.state.dob,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            preferences: this.state.selectedItems,
            friends: 0,
            groups: 0,
            posts: 0,
            avatar:'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'
          }).then(() => {
            firebase.firestore().collection('friendships').doc(firebase.auth().currentUser.uid).set({
              userCreated: firebase.firestore.FieldValue.serverTimestamp(),
              friendsArray:[]
            })
          })
            res.user.updateProfile({
              displayName: lower
            }),

            console.log('User registered successfully!')

          this.setState({
            isLoading: false,
            firstName: '',
            lastName: '',
            displayName: '',
            email: '',
            password: '',
            dob: '',
            preferences: {}
          })

          Alert.alert('User registered successfully!')
          this.props.navigation.navigate('home')
        })
        .catch(error => this.setState({ errorMessage: error.message }))

    }
  }
  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
    //Set Selected Items
  };

  getPrefernces = () => {
    firebase.firestore().collection('preferences').get()
      .then(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { name } = doc.data();
          list.push({
            id: doc.id,
            name
          });
        })

        this.setState({ items: list });
      })
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View></View>
      )
    }
    const { selectedItems } = this.state;

    return (

      <KeyboardAvoidingView behavior='height' style={styles.container}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>Signup</Text>
          </View>
          <ScrollView>
            <View style={styles.formContainer}>
              <StatusBar
                barStyle="light-content"
              />
              <TextInput
                placeholder="First Name"
                placeholderTextColor='black'
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor="#fff"
                value={this.state.firstName}
                onChangeText={(val) => this.updateInputVal(val, 'firstName')} />
              <TextInput
                placeholder="Last Name"
                placeholderTextColor='black'
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor="#fff"
                value={this.state.lastName}
                onChangeText={(val) => this.updateInputVal(val, 'lastName')} />
              <TextInput
                placeholder="Username"
                placeholderTextColor='black'
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor="#fff"
                value={this.state.displayName}
                onChangeText={(val) => this.updateInputVal(val, 'displayName')} />
              <TextInputMask
                placeholder="Date of Birth"
                placeholderTextColor='black'
                keyboardType="number-pad"
                style={styles.input}
                value={this.state.dob}
                onChangeText={(dob) => this.setState({ dob })}
                type={'datetime'}
                options={{
                  format: 'DD-MM-YYYY'
                }}

              />
              <TextInput
                placeholder="Email"
                placeholderTextColor='black'
                returnKeyType="next"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                selectionColor="#fff"
                value={this.state.email}
                onChangeText={(val) => this.updateInputVal(val, 'email')} />
              <TextInput
                placeholder="Password"
                placeholderTextColor='black'
                returnKeyType="go"
                secureTextEntry={true}
                style={styles.input}
                value={this.state.password}
                onChangeText={(val) => this.updateInputVal(val, 'password')}
                maxLength={15}
              />
              <Text style={styles.signInCont}>Select some preferences to get you started!</Text>
              <View style={{ paddingVertical: 30 }}>
                <MultiSelect
                  hideTags
                  items={this.state.items}
                  uniqueKey="name"
                  ref={component => {
                    this.multiSelect = component;
                  }}
                  onSelectedItemsChange={this.onSelectedItemsChange}
                  selectedItems={selectedItems}
                  selectText="Pick Items"
                  searchInputPlaceholderText="Search Items..."
                  onChangeInput={text => console.log(text)}
                  tagRemoveIconColor="#CCC"
                  tagBorderColor="#CCC"
                  tagTextColor="#CCC"
                  selectedItemTextColor="#00b894"
                  selectedItemIconColor="#00b894"
                  itemTextColor="#000"
                  displayKey="name"
                  searchInputStyle={{ color: '#CCC', height: 50 }}
                  submitButtonColor="#6c5ce7"
                  submitButtonText="Submit"
                  
                />
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.buttonContainer}
            onPress={() => this.checkUserName()}>
            <Text style={styles.buttonText}>
              Confirm
                    </Text>
          </TouchableOpacity>
          <View style={styles.signInText}>
            <Text style={styles.signInCont}>Already have an account?</Text>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}><Text style={styles.signInButton}>Sign in</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00b894',
  },
  logoContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-end',

  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    color: '#FFF',
    marginTop: 10,
    width: 300,
    textAlign: 'center',
    opacity: 0.9,
    marginVertical: 15,
    fontSize: 40,
  },
  signInText: {
    flexGrow: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginVertical: 16,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  signInCont: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
  signInButton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  },
  input: {
    width: 300,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
    color: 'black',
    paddingHorizontal: 16,
    borderRadius: 25,
    fontSize: 16,
    marginVertical: 10,

  },
  buttonContainer: {
    width: 300,
    backgroundColor: '#55efc4',
    paddingVertical: 10,
    borderRadius: 25,
    marginVertical: 20,

  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: '700'
  }
});