import React, { Component, useState } from 'react';
import {
    ScrollView, StyleSheet, Text, View, TextInput,
    Button, Image, Alert, TouchableOpacity, Dimensions
} from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, FontAwesome, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper';
import { List } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

export default class Support extends React.Component {

    constructor() {
        super();
        this.state = {
            text: '',
            checked: 'one',
            image: ''
        }
    }

    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
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
        const user = firebase.auth().currentUser;
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
            this.uploadPhoto(picker.uri, user.uid)
        }

    }

    openImage = async () => {
        const user = firebase.auth().currentUser;
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
            this.uploadPhoto(picker.uri, user.uid)

        }
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


    uploadPhoto = async (url, imageName) => {
        const time = this.timeAccurate;
        const path = 'reports/' + imageName + '/' + time;

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

    handleSubmit = () => {
        const user = firebase.auth().currentUser;
        if ((this.state.text.length > 0) && (this.state.checked === 'one')) {
            firebase.firestore().collection('reports').add({
                report: this.state.text,
                image: this.state.image,
                userID: user.uid,
                type: 'report',
                time:  firebase.firestore.FieldValue.serverTimestamp(),
            })
            this.setState({
                text: '',
                checked: 'one',
                image: ''
            })
            Alert.alert('Form submitted! Thank you!')
            this.props.navigation.navigate('home')
        } else if ((this.state.text.length > 0) && (this.state.checked === 'two')) {
            firebase.firestore().collection('reports').add({
                report: this.state.text,
                image: this.state.image,
                userID: user.uid,
                type: 'feedback',
                time:  firebase.firestore.FieldValue.serverTimestamp(),
            })
            this.setState({
                text: '',
                checked: 'one',
                image: ''
            })
            Alert.alert('Form submitted! Thank you!')
            this.props.navigation.navigate('home')
        } else if ((this.state.text.length > 0) && (this.state.checked === 'three')) {
            firebase.firestore().collection('reports').add({
                report: this.state.text,
                image: this.state.image,
                userID: user.uid,
                type: 'spam/abuse',
                time:  firebase.firestore.FieldValue.serverTimestamp(),
            })
            this.setState({
                text: '',
                checked: 'one',
                image: ''
            })
            Alert.alert('Form submitted! Thank you!')
            this.props.navigation.navigate('home')
        } else {
            Alert.alert('You need to enter text!')
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Text style={styles.headerText}>Support</Text>

                </View>
                <View style={styles.mainContainer}>
                    <Text style={styles.title}>What is the issue you would like to report?</Text>
                    <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                        <RadioButton
                            value="one"
                            status={this.state.checked === 'one' ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ checked: 'one' }) }}
                        />
                        <Text style={styles.text}>Report a problem</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                        <RadioButton
                            value="two"
                            status={this.state.checked === 'two' ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ checked: ('two') }) }}
                        />
                        <Text style={styles.text}>Give Feedback</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 30 }}>
                        <RadioButton
                            value="three"
                            status={this.state.checked === 'three' ? 'checked' : 'unchecked'}
                            onPress={() => { this.setState({ checked: 'three' }) }}
                        />
                        <Text style={styles.text}>Reprt Spam or Abuse</Text>
                    </View>
                </View>
                <View style={{ height: 425 }}>
                    <ScrollView>
                        <List.Section style={{ backgroundColor: 'white' }}>
                            <List.Accordion
                                title="Add a Title"
                                titleStyle={{ color: 'black' }}
                                left={props => <FontAwesome name="text-width" size={24} color="black" />}>
                                <View >
                                    <TextInput
                                        numberOfLines={3}
                                        style={styles.input}
                                        placeholder='text of report'
                                        placeholderTextColor='black'
                                        selectionColor="#fff"
                                        textAlignVertical='top'
                                        multiline={true}
                                        onChangeText={(val) => this.updateInputVal(val, 'text')}
                                        value={this.state.text}
                                    ></TextInput>
                                </View>
                            </List.Accordion>
                            <Text style={styles.text}>Add an image if needed</Text>
                            <List.Accordion
                                title="Add Image"
                                titleStyle={{ color: 'black' }}
                                left={props => <Entypo name="image" size={24} color="black" />}>
                                <MaterialCommunityIcons name="camera-plus-outline" size={40} color="black" style={styles.camera} onPress={() => this.onPressButton()} />
                                <View style={{ marginHorizontal: 22, marginTop: 0, height: 350, marginBottom: 20 }}>
                                    <Image source={{ uri: this.state.image }} style={styles.imagePost} />
                                </View>
                            </List.Accordion>
                        </List.Section>
                    </ScrollView>
                </View>
                <Button title='Submit' color='#55efc4' onPress={() => this.handleSubmit()}></Button>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#079992',

    },
    mainContainer: {

        alignContent: 'center',
        backgroundColor: 'white',
        justifyContent: 'center',

    },
    header: {
        backgroundColor: '#55efc4',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,

    },
    headerText: {
        fontSize: 35,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        paddingRight: 140,
        paddingLeft: 110,

    },
    headerIcon: {
        color: "black",
        justifyContent: 'flex-start',

    },
    title: {
        color: 'purple',
        textAlign: 'center',
        opacity: 1,
        marginVertical: 2,
        fontSize: 20,
        fontStyle: 'italic'
    },

    form: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
    },
    text: {
        color: 'green',
        textAlign: 'center',
        opacity: 1,
        marginTop: 5,
        fontSize: 15,
        fontStyle: 'italic'
    },
    input: {
        width: 300,
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
        color: 'black',
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,
        borderColor: 'green',
        borderWidth: 0.5
    },
    imagePost: {
        width: '100%',
        height: '100%',
        borderColor: 'black',
        borderWidth: 0.3
    },
    camera: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 5

    },
});