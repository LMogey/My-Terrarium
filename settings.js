import React, { Component, useState, useEffect } from 'react';
import {
    ScrollView, StyleSheet, Text, View, TextInput,
    KeyboardAvoidingView, ImageBackground, StatusBar, Alert, TouchableOpacity, Dimensions
} from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons';
import MultiSelect from 'react-native-multiple-select';

export default class settings extends React.Component {

    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            aboutMe: '',
            tradeStuff: '',
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



    updateNames = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Users').doc(user.uid)
            .update({
                firstName: this.state.firstName,
                lastName: this.state.lastName
            }).catch(function (error) {
                console.log(error);
            })
        this.setState({ firstName: '' })
        this.setState({ lastName: '' })
        Alert.alert('Names updated!')
    }

    updateAboutMe = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Users').doc(user.uid)
            .update({
                AboutMe: this.state.aboutMe
            }).catch(function (error) {
                console.log(error);
            })
        firebase.firestore().collection('Locations').doc(user.uid).update({
            about: this.state.aboutMe
        })
        this.setState({ aboutMe: '' })
        Alert.alert('About me updated!')
    }

    TradeInfo = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Locations').doc(user.uid)
            .update({
                tradeMessage: this.state.tradeStuff
            }).catch(function (error) {
                console.log(error);
            })
        this.setState({ tradeStuff: '' })
        Alert.alert('Trading Information updated!')
    }

    forgotPassword = () => {
        const user = firebase.auth().currentUser;

        firebase.auth().sendPasswordResetEmail(user.email)
            .then(function (user) {
                Alert.alert('Please check your email and reset your password!')
            }).catch(function (e) {
                console.log(e)
            })

    }

    onSelectedItemsChange = selectedItems => {
        this.setState({ selectedItems })
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

                this.setState({ items: list })
            })
    }

    changePreferences = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Users').doc(user.uid).update({
            preferences: this.state.selectedItems
        }).then(
            Alert.alert('Updated Preferences!')
            
        )
        this.setState({selectedItems: []})
    }

    render() {
        const { selectedItems } = this.state;
        return (

            <View style={styles.container} >

                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Text style={styles.headerText}>Settings</Text>

                </View>
                <ScrollView>
                    <View style={styles.mainContainer}>

                        <View style={styles.form}>
                            <ImageBackground source={require('../image/backgroundPlants.jpg')} style={styles.image}>
                                <Text style={styles.title}>Trade Information</Text>
                            </ImageBackground>
                            <TextInput
                                placeholder='Trade message!'
                                style={styles.inputAboutMe}
                                placeholderTextColor="black"
                                multiline={true}
                                textAlignVertical='top'
                                selectionColor="black"
                                numberOfLines={3}
                                value={this.state.tradeStuff}
                                onChangeText={(val) => this.updateInputVal(val, 'tradeStuff')}
                            ></TextInput>
                            <Text>Maximum 3 lines</Text>
                            <TouchableOpacity style={styles.button}
                                onPress={() => this.TradeInfo(this.state.tradeStuff)}>
                                <Text style={styles.buttonText}>
                                    Update
                             </Text>
                            </TouchableOpacity>
                            <ImageBackground source={require('../image/backgroundPlants.jpg')} style={styles.image}>
                                <Text style={styles.title}>FirstName Update</Text>
                            </ImageBackground>
                            <TextInput
                                style={{ flex: 1 }}
                                placeholder='First Name'
                                style={styles.input}
                                placeholderTextColor="black"
                                value={this.state.firstName}
                                onChangeText={(val) => this.updateInputVal(val, 'firstName')}
                            ></TextInput>
                            <TextInput
                                style={{ flex: 1 }}
                                placeholder='Last Name'
                                style={styles.input}
                                placeholderTextColor="black"
                                value={this.state.lastName}
                                onChangeText={(val) => this.updateInputVal(val, 'lastName')}
                            ></TextInput>
                            <TouchableOpacity style={styles.button}
                                onPress={() => this.updateNames(this.state.firstName || this.state.lastName)}>
                                <Text style={styles.buttonText}>
                                    Update
                             </Text>
                            </TouchableOpacity>
                            <ImageBackground source={require('../image/backgroundPlants.jpg')} style={styles.image}>
                                <Text style={styles.title}>About Me Update</Text>
                            </ImageBackground>
                            <TextInput
                                placeholder='About Me'
                                style={styles.inputAboutMe}
                                placeholderTextColor="black"
                                multiline={true}
                                textAlignVertical='top'
                                selectionColor="black"
                                numberOfLines={3}
                                value={this.state.aboutMe}
                                onChangeText={(val) => this.updateInputVal(val, 'aboutMe')}
                            ></TextInput>
                            <Text>Maximum 3 lines</Text>
                            <TouchableOpacity style={styles.button}
                                onPress={() => this.updateAboutMe(this.state.aboutMe)}>
                                <Text style={styles.buttonText}>
                                    Update
                             </Text>
                            </TouchableOpacity>
                            <ImageBackground source={require('../image/backgroundPlants.jpg')} style={styles.image}>
                                <Text style={styles.title}>Reset Password</Text>
                            </ImageBackground>
                            <TouchableOpacity style={styles.button}
                                onPress={() => this.forgotPassword()}>
                                <Text style={styles.buttonText}>
                                    Reset
                             </Text>
                            </TouchableOpacity>
                            <ImageBackground source={require('../image/backgroundPlants.jpg')} style={styles.image}>
                                <Text style={styles.title}>Update Preferences</Text>
                            </ImageBackground>
                            
                            <View style={{ paddingVertical: 30 , width:300}}>
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
                                    hideSubmitButton={true}
                                />
                            </View>
                            <TouchableOpacity style={styles.button}
                                onPress={() => this.changePreferences()}>
                                <Text style={styles.buttonText}>
                                    Reset
                             </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </View >



        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',

    },
    mainContainer: {
        flexGrow: 1,
        alignContent: 'center',
        backgroundColor: 'white',
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
    image: {
        width: Dimensions.get('window').width,
        height: 50,
        resizeMode: "cover",
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: 'black',
        textAlign: 'center',
        opacity: 1,
        marginVertical: 2,
        fontSize: 20
    },

    form: {
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
    },
    input: {
        width: 300,
        height: 40,
        backgroundColor: '#78e08f',
        marginBottom: 10,
        color: 'black',
        paddingHorizontal: 16,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,
    },
    inputAboutMe: {
        width: 400,
        maxHeight: 90,
        backgroundColor: '#78e08f',
        marginBottom: 10,
        color: 'black',
        padding: 10,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,

    },
    button: {
        backgroundColor: '#55E6C1',
        width: 200,
        borderRadius: 25,
        fontSize: 16,
        padding: 10,
        marginVertical: 10,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});