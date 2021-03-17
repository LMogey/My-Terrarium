import React, { useState, Component, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Button } from 'native-base';
import Header from './header';
import * as ImagePicker from 'expo-image-picker';
import MultiSelect from 'react-native-multiple-select';


export default class createGroup extends React.Component {
    constructor() {
        super();
        this.state = {
            text: "",
            textName: '',
            image: null,
            tags: [],
            selectedItems: [],
            userName: '',
            userAvatar: '',
            uid: '',
            location:[]

        }

    }

    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }

    componentDidMount() {
        this.getPrefernces();
        this.getLocation();
        const user = firebase.auth().currentUser;
        Alert.alert('When creating a group your location will be used as its base.')
        firebase.firestore().collection('Users').doc(user.uid).onSnapshot(querySnapshot => {
            const image = querySnapshot.data().avatar;
            this.setState({userAvatar:image})
        })
    }

    getLocation = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('Locations').doc(user.uid).onSnapshot(doc => {
            const location = doc.data().data.location
            this.setState({location: location})
        }
        )
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
        const path = 'groups/' + imageName + '/' + time;

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

        const groupName = this.state.textName;
        const lower = groupName.toLowerCase();
        const name = firebase.firestore().collection('groups').where('name', '==', lower).get();
        name.then(snapshot => {
            if (snapshot.empty) {
                this.makeGroup(lower)
            } else {
                Alert.alert('Group Name already exists!');
            }
        })

    }

    makeGroup = (lowerName) => {
        const user = firebase.auth().currentUser;
      
        console.log(this.state.location)
        user.updateProfile({
            photoURL: this.state.userAvatar
        })
        if ((this.state.text && this.state.image && this.state.selectedItems) !== null) {
            const increment = firebase.firestore.FieldValue.increment(1);
            firebase.firestore().collection('groups').add({
                About: this.state.text,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                image: this.state.image,
                maker: user.uid,
                members: [user.uid],
                name: lowerName,
                number: 1,
                pending: [],
                tags: this.state.selectedItems,
                data:{
                    location: this.state.location
                }
            }).then(function (doc) {
                const user = firebase.auth().currentUser;
                firebase.firestore().collection('groups').doc(doc.id).collection('MEMBERS').doc(user.uid).set({
                    name: user.displayName,
                    avatar: user.photoURL
                })
           
            }).catch(error => {
                Alert.alert(error);
            })

            firebase.firestore().collection('Users').doc(user.uid).update({
                groups: increment
            })

            this.props.navigation.navigate('groupsList')
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
                <Header />
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row' }}>

                        <Button medium rounded success onPress={this.handleCreation}>
                            <Text style={styles.postButton}>Create</Text>
                        </Button>

                        <View style={styles.inputContainer}>
                            <TextInput
                                numberOfLines={1}
                                style={{ flex: 1 }}
                                placeholder='Name of group'
                                style={styles.inputName}
                                selectionColor="#fff"
                                onChangeText={(val) => this.updateInputVal(val, 'textName')}
                                value={this.state.textName}
                            ></TextInput>
                        </View>
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
                                placeholder='Group bio so people know what yous are about'
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