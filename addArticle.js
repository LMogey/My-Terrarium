import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image, Button, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Text } from 'native-base';
import { Ionicons, AntDesign, Entypo, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MultiSelect from 'react-native-multiple-select';
import { List } from 'react-native-paper';

export default class addArticle extends React.Component {

    constructor() {
        super();
        this.state = {
            text: "",
            textName: '',
            image: null,
            expanded: true,
            tags: [],
            selectedItems: [],
            info: ''
        }

    }

    handlePress = () => this.setState({ expanded: !expanded });

    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
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
    

    componentDidMount() {
        this.getPrefernces()
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

    uploadPhoto = async (url, imageName) => {
        const time = this.timeAccurate;
        const path = 'articles/' + imageName + '/' + time;

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

                this.setState({ tags: list });
            })
    }

    onSelectedItemsChange = selectedItems => {
        this.setState({ selectedItems });
        //Set Selected Items
    };

    handleCreation = () => {
        if ((this.state.text !==null) && (this.state.image !== null) && (this.state.selectedItems !== null) && (this.state.textName !== null) && (this.state.info !==null)) {
            firebase.firestore().collection('Articles').add({
                Body: this.state.text,
                Title: this.state.textName,
                image: this.state.image,
                Written: firebase.firestore.FieldValue.serverTimestamp(),
                tags: this.state.selectedItems,
                Information: this.state.info
            }).catch(error => {
                Alert.alert(error);
            })

            this.props.navigation.navigate('ArticlesAdmin')
            this.setState({
                text: "",
                textName: '',
                image: null,
                expanded: true,
                tags: [],
                selectedItems: [],
                info: ''
            })


        } else {
            Alert.alert('Make sure all fields are filled!')
        }

    }
    render() {
        const { selectedItems } = this.state;

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Text style={styles.headerText}>Adding Article</Text>

                </View>
                <Button title='Add' onPress={this.handleCreation} />
                <ScrollView>
                    <List.Section style={{ backgroundColor: '#636e72' }}>
                        <List.Accordion
                            title="Add a Title"
                            titleStyle={{ color: 'white' }}
                            left={props => <FontAwesome name="text-width" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    numberOfLines={1}
                                    style={styles.input}
                                    placeholder='Name of Article'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    onChangeText={(val) => this.updateInputVal(val, 'textName')}
                                    value={this.state.textName}
                                ></TextInput>
                            </View>

                        </List.Accordion>
                        <List.Accordion
                            title="Add Image"
                            titleStyle={{ color: 'white' }}
                            left={props => <Entypo name="image" size={24} color="white" />}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={40} color="#b2bec3" style={styles.camera} onPress={() => this.onPressButton()} />
                            <View style={{ marginHorizontal: 22, marginTop: 0, height: 350 }}>
                                <Image source={{ uri: this.state.image }} style={styles.imagePost} />
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Add Short Blurb"
                            titleStyle={{ color: 'white' }}
                            left={props => <Ionicons name="ios-information-circle-outline" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    numberOfLines={2}
                                    style={styles.inputInfo}
                                    placeholder='Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    onChangeText={(val) => this.updateInputVal(val, 'info')}
                                    value={this.state.info}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Add Body Text"
                            titleStyle={{ color: 'white' }}
                            left={props => <Ionicons name="ios-information-circle-outline" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputMain}
                                    placeholder='Main of Article'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    onChangeText={(val) => this.updateInputVal(val, 'text')}
                                    value={this.state.text}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Select Tags"
                            titleStyle={{ color: 'white' }}
                            left={props => <AntDesign name="tago" size={24} color="white" />}>
                            <View style={{ width: 350, marginVertical: 10, marginHorizontal: 20 }}>

                                <MultiSelect
                                    styleListContainer={{ height: 250 }}
                                    hideTags
                                    items={this.state.tags}
                                    uniqueKey="name"
                                    ref={component => {
                                        this.multiSelect = component;
                                    }}
                                    onSelectedItemsChange={this.onSelectedItemsChange}
                                    selectedItems={selectedItems}
                                    selectText="Pick Items"
                                    onChangeInput={text => console.log(text)}
                                    tagRemoveIconColor="#CCC"
                                    tagBorderColor="#CCC"
                                    tagTextColor="#CCC"
                                    selectedItemTextColor="#00b894"
                                    selectedItemIconColor="#00b894"
                                    itemTextColor="#000"
                                    displayKey="name"
                                    submitButtonColor="#6c5ce7"
                                    submitButtonText="Submit"
                                />

                            </View>
                        </List.Accordion>
                    </List.Section>
                </ScrollView>
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    title: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        textTransform: 'uppercase'
    },
    header: {
        backgroundColor: 'black',
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
        paddingRight: 70,
        paddingLeft: 100,

    },
    headerIcon: {
        color: "green",
        justifyContent: 'flex-start',

    },
    bodyText: {
        fontFamily: 'sans-serif-light',
        fontWeight: 'normal',
        color: '#60a3bc',
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    image: {
        width: 390,
        height: 200,
        alignContent: 'stretch',

    },
    imageHorizontal: {
        width: 150,
        height: 150,
        alignContent: 'stretch',
        marginBottom: 10
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
    inputMain: {
        width: 300,
        maxHeight: 600,
        minHeight: 200,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
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
    inputInfo:{
        width: 300,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
    }
});

