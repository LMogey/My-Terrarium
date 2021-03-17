import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, TouchableOpacity, Image, FlatList, ActivityIndicator, KeyboardAvoidingView, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Thumbnail } from 'native-base';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default function createMessage({ navigation }) {

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inMemoryUsers, setInMemoryUsers] = useState([]);
    const [image, setImage] = useState('')
    const [currentIDUser, setCurrentIDUser] = useState('')
    const [currentUserName, setCurrentUserName] = useState('');
    const [myArray, setMyArray] = useState([]);
    const [groups, setGroups] = useState([]);
    const [inMemoryGroups, setInMemoryGroups] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            userDeets();
            groupDeets()
            setRefreshing(false)
        })
    }, [refreshing])

    const currentImage = () => {
        const userDetails = firebase.auth().currentUser;
        setCurrentIDUser(userDetails.uid)
        firebase.firestore()
            .collection('Users')
            .doc(userDetails.uid)
            .onSnapshot(documentSnapshot => {
                const image = documentSnapshot.data().avatar;
                setImage(image)
                const name = documentSnapshot.data().displayName;
                setCurrentUserName(name);

            });
    }

    useEffect(() => {
        currentImage();
        setIsLoading(true);
        userDeets()
        groupDeets();
        return () => { }
    }, [])

    const userDeets = () => {
        const userDetails = firebase.auth().currentUser;
        firebase.firestore()
            .collection('friendships').doc(userDetails.uid)
            .collection('FRIENDS')
            .orderBy('name', 'asc')
            .get()
            .then(querySnapshot => {
                const data = [];
                querySnapshot.forEach(doc => {
                    const { name, image } = doc.data();
                    data.push({
                        id: doc.id,
                        name,
                        image
                    });
                })
                setUsers(data)
                setInMemoryUsers(data)
                setIsLoading(false);
            })
    }

    const groupDeets = () => {
        const userDetails = firebase.auth().currentUser;
        firebase.firestore()
            .collection('groups').where('members', 'array-contains', userDetails.uid)
            .get()
            .then(querySnapshot => {
                const data = [];
                querySnapshot.forEach(doc => {
                    const { name, image, members } = doc.data();
                    data.push({
                        id: doc.id,
                        name,
                        image,
                        members
                    });
                })
                setGroups(data)
                setInMemoryGroups(data)
                setIsLoading(false);
            })
    }

    searchUsers = value => {
        const filteredUsers = inMemoryUsers.filter(users => {
            let userLowercase = (
                users.name
            ).toLowerCase();

            let searchTermLowercase = value.toLowerCase();

            return userLowercase.indexOf(searchTermLowercase) > -1;
        });
        setUsers(filteredUsers);
    };

    searchGroups = value => {
        const filteredGroups = inMemoryGroups.filter(groups => {
            let groupLowercase = (
                groups.name
            ).toLowerCase();

            let searchTermLowercase = value.toLowerCase();

            return groupLowercase.indexOf(searchTermLowercase) > -1;
        });
        setGroups(filteredGroups);
    };


    const handleButtonPress = (item) => {
        const otherUserID = item.id;
        const docID = currentIDUser + otherUserID;
        const userRef = firebase.firestore().collection('Threads').doc(docID);
        userRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                userRef.onSnapshot((doc) => {
                    Alert.alert('Thread already exists!');
                })
            } else {
                nextTry(otherUserID, item)
            }
        }).catch(

        )

    }

    const nextTry = (otherID, otherDetails) => {
        const docID = otherID + currentIDUser;
        const userRef = firebase.firestore().collection('Threads').doc(docID)
        userRef.get().then((doc) => {
            if (doc.exists) {
                Alert.alert('Thread already exists!')
            } else {

                add(otherDetails);
            }
        }).catch(

        )
    }

    const handleButtonPressGroups = (item) => {
        const groupID = item.id;
        const groupRef = firebase.firestore().collection('Threads').doc(groupID);
        groupRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {

                groupRef.onSnapshot((doc) => {
                    Alert.alert('Thread already exists!');
                })
            } else {
                addGroup(item)
            }
        }).catch(

        )

    }

    const addGroup = (itemStuff) => {
        const ID = itemStuff.id
        firebase.firestore().collection('Threads').doc(ID).set({
            nameRoom: itemStuff.name,
            image1: itemStuff.image,
            latestMessage: {
                text: `You have started a conversation with ${itemStuff.name}.`,
                createdAt: new Date().getTime()
            },
            users: itemStuff.members,

        }).catch(
            console.log('no?')
        )
        firebase.firestore().collection('Threads').doc(ID)
            .collection('MESSAGES').add({
                text: `You have started a conversation with ${itemStuff.name}.`,
                createdAt: new Date().getTime(),
                system: true
            });
        onRefresh()
        navigation.navigate('messages');

    }


    const add = (details) => {
        console.log('step 4')
        const docID = currentIDUser + details.id;
        firebase.firestore().collection('Threads').doc(docID)
            .set({
                nameRoom: details.name,
                nameRoom1: currentUserName,
                image1: image,
                image2: details.image,
                latestMessage: {
                    text: `You have started a conversation with ${details.name}.`,
                    createdAt: new Date().getTime()
                },
                users: [
                    currentIDUser,
                    details.id
                ],
                [currentUserName]: {
                    id: currentIDUser
                },
                [details.name]: {
                    id: details.id
                }

            })
        firebase.firestore().collection('Threads').doc(docID)
            .collection('MESSAGES').add({
                text: `You have started a conversation with ${details.name}.`,
                createdAt: new Date().getTime(),
                system: true
            });

        navigation.navigate('messages');

    }


    return (

        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerText}>Create a Message</Text>
            </View>
            <KeyboardAvoidingView>
                <View style={styles.mainContainer}>

                    <Image source={require('../image/messageplants.png')} style={styles.image} />

                    <View style={styles.formContainer}>
                        <StatusBar
                            barStyle="light-content"
                        />
                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white' }}>
                            <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
                            <TextInput
                                placeholder="Search"
                                placeholderTextColor="#dddddd"
                                style={styles.searchText}
                                onChangeText={value => { searchUsers(value), searchGroups(value) }}
                            />
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white' }}>
                            {isLoading ? (
                                <View
                                    style={{
                                        ...StyleSheet.absoluteFill,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <ActivityIndicator size="large" color="black" />
                                </View>
                            ) : null}
                            <View style={{ backgroundColor: '#81ecec', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ marginLeft: 5, fontSize: 20, color: '#6c5ce7' }}>Users</Text>
                            </View>
                            <View style={{ maxHeight: 190 }}>
                                <FlatList
                                    data={users}
                                    keyExtractor={(item) => (item.id)}
                                    ListEmptyComponent={() => (
                                        <View
                                            style={styles.emptyText}
                                        >
                                            <Text style={{ color: 'black' }}>Nothing Found</Text>
                                        </View>
                                    )}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                        />
                                    }
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleButtonPress(item)}>
                                            <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5 }} key={item.id}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Thumbnail square size={70} source={{ uri: item.image }} />
                                                    <Text style={styles.nameText}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>)}>
                                </FlatList>
                            </View>
                            <View style={{ backgroundColor: '#81ecec', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ marginLeft: 5, fontSize: 20, color: '#6c5ce7' }}>Groups</Text>
                            </View>
                            <View style={{ maxHeight: 190 }}>
                                <FlatList
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                        />
                                    }
                                    data={groups}
                                    keyExtractor={(item) => (item.id)}
                                    ListEmptyComponent={() => (
                                        <View
                                            style={styles.emptyText}
                                        >
                                            <Text style={{ color: 'black' }}>Nothing Found</Text>
                                        </View>
                                    )}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity onPress={() => handleButtonPressGroups(item)}>
                                            <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5 }} key={item.id}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Thumbnail square size={70} source={{ uri: item.image }} />
                                                    <Text style={styles.nameText}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>)}>
                                </FlatList>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00b894',
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
    mainContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        width: 150,
        height: 40,
        backgroundColor: '#55efc4',
        paddingVertical: 10,
        borderRadius: 25,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',

    },
    buttonText: {
        textAlign: 'center',
        color: 'black',
        fontWeight: '700'
    },
    image: {
        width: '100%',
        height: 150,
        marginTop: 145
    },
    searchText: {
        backgroundColor: 'white',
        height: 30,
        width: 360,
        fontSize: 20,
        padding: 0,
        margin: 2,
        color: 'black',
    },
    emptyText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50
    },
    nameText: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 50,
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
})
