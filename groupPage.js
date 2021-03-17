import React, { useState, Component, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, FlatList, RefreshControl, Image, TouchableOpacity, Alert } from 'react-native';
import { Avatar } from 'react-native-elements';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { Thumbnail, Button } from 'native-base';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default function groupPage({ navigation, route, props }) {

    const { groupID } = route.params;
    const [about, setAbout] = useState('');
    const [members, setMembers] = useState([]);
    const [image, setImage] = useState('');
    const [name, setName] = useState('');
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [maker, setMaker] = useState('')
    const [refreshing, setRefreshing] = useState(false)
    const [partOf, setPartOf] = useState(false);
    const [number, setNumber] = useState([]);
    const [pending, setPending] = useState(false);
    const [ifSure, setIfSure] = useState(false)

    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserImage, setCurrentUserImage] = useState('');
    const [currentUserID, setCurrentUserID] = useState('')

    const getStuff = () => {
        firebase.firestore()
            .collection('groups')
            .doc(groupID)
            .onSnapshot(documentSnapshot => {
                const about = documentSnapshot.data().About;
                setAbout(about);
                const name = documentSnapshot.data().name;
                setName(name);
                const image = documentSnapshot.data().image;
                setImage(image);
                const tags = documentSnapshot.data().tags;
                setTags(tags)
                const maker = documentSnapshot.data().maker;
                setMaker(maker)
                const number = documentSnapshot.data().members;
                setNumber(number)

            })

        getGroupInfo()
    }

    useEffect(() => {
        const currentUser = firebase.auth().currentUser;
        setIsLoading(true)
        getStuff()
        sortPendingAndJoin()
        setCurrentUserID(currentUser.uid)
        const currentUserDetails = firebase.firestore().collection('Users').doc(currentUser.uid).onSnapshot(documentSnapshot => {
            const currentUserName = documentSnapshot.data().displayName;
            setCurrentUserName(currentUserName);
            const currentUserImage = documentSnapshot.data().avatar;
            setCurrentUserImage(currentUserImage);

        })

    }, [groupID, partOf, pending])

    function getGroupInfo() {
        firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS').get().then(function (doc) {
            if (!doc.empty) {

                getMembers();
            } else {
                console.log('no')
            }
        })
    }

    const sortPendingAndJoin = () => {
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS')
            .doc(currentUser.uid).get().then((doc) => {
                if (doc.exists) {
                    setPartOf(true)
                }else{
                    setPartOf(false)
                }
            });
         firebase.firestore().collection('groups').where(firebase.firestore.FieldPath.documentId(), '==', groupID).where('pending', 'array-contains', currentUser.uid).get().then((doc) => {
            if (!doc.empty) {
                setPending(true)
            } else {
                setPending(false)
            }
        })
    }

    const getMembers = async () => {

        firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS')
            .get().then(doc => {
                const list = []
                doc.forEach(document => {
                    const { name, avatar } = document.data();
                    list.push({
                        id: document.id,
                        name,
                        avatar
                    })

                    setMembers(list)

                    return members;
                })
            })
    }

    const joinRequest = () => {
        const currentUser = firebase.auth().currentUser;
        if (number.length < 6) {
            firebase.firestore().collection('notifications').doc(maker).collection('REQUESTS').doc(currentUser.uid).set({
                name: currentUserName,
                image: currentUserImage,
                requested: firebase.firestore.FieldValue.serverTimestamp(),
                accepted: false,
                message: "'" + name + "'",
                groupid: groupID,
                rejected: false
            })

            firebase.firestore().collection('groups').doc(groupID).update({
                pending: [currentUser.uid]
            })
            setPending(true)
        } else {
            Alert.alert('Im sorry they are at maximum capacity!')
        }
    }

    const cancelPending = () => {
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('notifications').doc(maker).collection('REQUESTS').doc(currentUser.uid).delete().then(
            console.log('Cancel successful')
        )

        firebase.firestore().collection('groups').doc(groupID).update({
            pending: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        })
        setPending(false)
    }

    const leave = () => {
        const increment = firebase.firestore.FieldValue.increment(-1);
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS')
            .doc(currentUser.uid)
            .delete().then(
                console.log('delete successful')
            ).catch(
                console.log('error deleting')
            )

        firebase.firestore().collection('groups').doc(groupID).update({
            number: increment
        })

        firebase.firestore().collection('groups').doc(groupID).update({
            members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        })

        firebase.firestore().collection('Threads').doc(groupID).update({
            users: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        })

        firebase.firestore().collection('Users').doc(currentUser.uid).update({
            groups: increment
        })
        setPartOf(false)
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            sortPendingAndJoin()
            getMembers()
            setRefreshing(false)
        })
    }, [refreshing])

    const back = () => {
        onRefresh()
        navigation.goBack();
    }

    const reportGroup = (ID) => {
        Alert.alert('Do you want to report this Group?',
            'report or cancel',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Report',
                    onPress: () => report(ID)
                },
            ],
            { cancelable: false }

        );
    };
    const report = (ID) => {
        const user = firebase.auth().currentUser;

        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups')
            .where('reporting', '==', ID).get()
            .then(docSnapshot => {
                if (docSnapshot.empty) {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups').add({
                        reporting: ID,
                        reporter: [user.uid],
                        report: [user.uid, ID],
                        reportedTime: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    Alert.alert('Thank you for reporting! We appreciate your feedback!')
                } else {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', user.uid).get()
                        .then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups').doc(ID).update({
                                    reporter: [user.uid]
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })
                }
            })
    }

    const removeFromGroup = (IDOfUser) => {
        Alert.alert('Do you want to remove this member from group?',
            'yes or cancel',
            [
                {
                    text: 'yes',
                    onPress: () => setIfSure(true)
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },

            ],
            { cancelable: false }

        );

        if (ifSure === true) {
            firebase.firestore().collection('groups').doc(groupID).update({
                members: firebase.firestore.FieldValue.arrayRemove(IDOfUser)
            })
            firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS').doc(IDOfUser).delete();
            Alert.alert('Delete Complete!')
            onRefresh()
        } else {

        }
        setIfSure(false)
    }

    const deleteGroup = (ID) => {
        Alert.alert('Do you want to delete this group?',
            'yes or cancel',
            [
                {
                    text: 'yes',
                    onPress: () => setIfSure(true)
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },

            ],
            { cancelable: false }

        );
        if (ifSure === true) {
            firebase.firestore().collection('groups').doc(ID).delete()

            Alert.alert('Group deleted!')
            navigation.navigate('home')
        } else {

        }
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => back()}
                />
                <Text numberOfLines={1} style={styles.headerText}>{name}</Text>
                {partOf === false && pending === false ?

                    <Button style={{ marginRight: 10, marginTop: 10, paddingHorizontal: 5, backgroundColor: '#a29bfe', minWidth: 50 }} onPress={() => joinRequest()}>
                        <Text style={{ justifyContent: 'center', color: 'white' }}>Join</Text>
                    </Button> : (partOf === false && pending === true ? <Button bordered style={{ marginRight: 10, marginTop: 10, paddingHorizontal: 5, minWidth: 50 }} onPress={() => cancelPending()}>
                        <Text stlye={{ alignItems: 'center', color: 'white' }}>pending</Text>
                    </Button> : (maker === currentUserID ? null :
                        <Button bordered style={{ marginRight: 10, marginTop: 10, paddingHorizontal: 5, minWidth: 50 }} onPress={() => leave()}>
                            <Text stlye={{ alignItems: 'center', color: 'white' }}>Leave</Text>

                        </Button>)
                    )}
            </View>
            <View>
                <ImageBackground source={require('../image/profileBackground.jpg')} style={{ alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
                    <View style={styles.avatarContainer}>
                        <Avatar style={styles.Avatar}
                            source={image ?
                                { uri: image } : require('../image/defaultUser.jpg')}
                        />

                    </View>
                    <View style={styles.AboutMe}>
                        <View style={styles.aboutMeTitleAndIcon}>
                            <Text style={styles.aboutMeTitle}>About Us</Text>

                        </View>
                        <Text style={styles.aboutMeText} numberOfLines={3}>{about}</Text>
                        <Text style={styles.aboutMeText}>Members: {number.length}/6</Text>
                        {maker === currentUserID ? <Entypo name="dots-three-horizontal" size={30} color="green" style={{ justifyContent: 'flex-end' }} onPress={() => deleteGroup(groupID)} /> :
                            <Entypo name="dots-three-horizontal" size={30} color="green" style={{ justifyContent: 'flex-end' }} onPress={() => reportGroup(groupID)} />
                        }
                    </View>
                </ImageBackground>
                <View style={{ flexDirection: 'row', backgroundColor: 'white', justifyContent: 'center' }}>
                    {tags.map((item, key) => {
                        return (
                            <Text key={key}
                                style={styles.aboutMeTextTags}>|{item}|</Text>
                        )
                    })}

                </View>
            </View>

            <FlatList
                style={{ maxHeight: 450 }}
                data={members}
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
                    <TouchableOpacity onPress={() => navigation.navigate('otherUserProfile', { user: item.id })}>
                        <View style={{ height: 100, borderWidth: 0.5, margin: 5, borderColor: 'blue' }} key={item.id}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Image style={{ height: 100, width: 100 }} source={{ uri: item.avatar }} />
                                <Text style={styles.nameText}>
                                    {item.name}
                                </Text>
                                <View style={{ flexDirection: 'column' }}>
                                    <View style={{ marginTop: 25, marginRight: 10 }}>
                                        {maker === item.id ?
                                            <MaterialCommunityIcons name="flower-tulip-outline" size={40} color="green" />
                                            :
                                            <FontAwesome5 name="seedling" size={20} color="green" />}
                                    </View>
                                    <View style={{ marginTop: 25, marginRight: 10 }}>
                                        {currentUserID !== maker ? null : ( currentUserID === item.id ?
                                            null
                                            :
                                            <Entypo name="dots-three-horizontal" size={30} color="green" style={{ justifyContent: 'flex-end' }} onPress={() => removeFromGroup(item.id)} />)}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>)}>
            </FlatList>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        backgroundColor: '#55efc4',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    headerText: {
        fontSize: 35,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        marginRight: 10

    },
    headerIcon: {
        color: "black",
        justifyContent: 'flex-start',

    },
    Avatar: {
        width: 120,
        height: 120,
        borderColor: '#00b894',
        borderWidth: 1,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'space-around',
        resizeMode: 'contain'
    },
    avatarContainer: {
        shadowColor: '#151734',
        shadowRadius: 15,
        shadowOpacity: 0.4,
    },

    AboutMe: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0,
        backgroundColor: 'white',
        marginTop: 10
    },
    aboutMeTitleAndIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    aboutMeTitle: {
        marginTop: 5,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#33d9b2',
        fontFamily: 'sans-serif-condensed',
    },
    aboutMeText: {
        color: '#079992',
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
        width: 240
    },
    aboutMeTextTags: {
        color: '#079992',
        fontSize: 15,
        fontWeight: "500",
        marginTop: 4,
        marginHorizontal: 10
    },
    nameText: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 10,
        fontStyle: 'italic',
        fontWeight: 'bold',
        marginTop: 20
    },
    IconLocation: {
        justifyContent: 'flex-end',

    }
});