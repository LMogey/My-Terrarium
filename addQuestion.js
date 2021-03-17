import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import MultiSelect from 'react-native-multiple-select';
import { Button } from 'native-base';
import * as ImagePicker from 'expo-image-picker';

export default class addQuestion extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "",
            image: null,
            tags: [],
            selectedItems: [],
            userName: '',
            userAvatar: '',


        }

    }

    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }

    componentDidMount() {
        this.getPrefernces();
        this.getImage()
    }

    getImage = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Users').doc(user.uid).onSnapshot(querySnapshot => {
            const image = querySnapshot.data().avatar;
            this.setState({ userAvatar: image })
        })
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
        const path = 'questions/' + imageName + '/' + time;

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
        const user = firebase.auth().currentUser;

        if ((this.state.text && this.state.selectedItems) !== null) {
            firebase.firestore().collection('Questions').add({
                user: user.uid,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                image: this.state.image,
                question: this.state.text,
                tags: this.state.selectedItems,
                name: user.displayName,
                avatar: this.state.userAvatar,
                comments: 0
            }).catch(error => {
                Alert.alert(error);
            })
            this.getPrefernces();
            this.getImage()
            this.props.navigation.navigate('Questions')
            this.setState({
                text: "",
                textName: '',
                image: null,
                tags: [],
                selectedItems: [],
                userName: '',
                userAvatar: '',
                uid: ''
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
                    <Text style={styles.headerText}>Add a Question</Text>
                </View>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row' }}>

                        <Button medium rounded success onPress={this.handleCreation}>
                            <Text style={styles.postButton}>Add</Text>
                        </Button>
                        <Text style={{ flexWrap: 'wrap', width: 300, alignSelf: 'center', textAlign: 'center', color: '#b2bec3' }}>Add a text question or give it a photo too if needed!</Text>
                        <MaterialCommunityIcons name="camera-plus-outline" size={40} color="#b2bec3" style={styles.camera} onPress={() => this.onPressButton()} />
                    </View>
                    <ScrollView>
                        <View style={{ marginHorizontal: 22, marginTop: 0, height: 350 }}>
                            <Image source={{ uri: this.state.image }} style={styles.imagePost} />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                multiline={true}
                                numberOfLines={4}
                                style={{ flex: 1 }}
                                placeholder='Add the text for your question here!'
                                style={styles.input}
                                selectionColor="#fff"
                                onChangeText={(val) => this.updateInputVal(val, 'text')}
                                value={this.state.text}
                            ></TextInput>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: 350, marginVertical: 10, marginHorizontal: 20, borderColor: 'black', borderWidth: 0.3 }}>

                                <MultiSelect

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

                        </View>
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: '#55efc4',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,

    },
    headerText: {
        fontSize: 30,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        paddingLeft: 60

    },
    headerIcon: {
        color: "black",
        justifyContent: 'flex-start',

    },
    imagePost: {
        width: '100%',
        height: '100%',
        borderColor: 'black',
        borderWidth: 0.3
    },
    inputContainer: {
        marginLeft: 10,
        marginTop: 5,
        marginBottom: 5,
        flexDirection: 'row',
    },
    input: {
        width: 380,
        height: 100,
        color: 'black',
        paddingHorizontal: 10,
        borderRadius: 25,
        borderWidth: 0.5,
        fontSize: 16,

    },
    inputName: {
        width: 250,
        height: 50,
        color: 'black',
        paddingHorizontal: 10,
        borderRadius: 25,
        borderWidth: 0.5,
        fontSize: 16,
    },
    button: {
        margin: 5,
        alignItems: 'flex-end',
        flexDirection: 'row',
        width: 80,
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
        alignSelf: 'flex-end',
        marginLeft: 5,
        marginBottom: 5

    },
})