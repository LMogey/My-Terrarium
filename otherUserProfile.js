import React, { useState, Component, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, FlatList, RefreshControl, Image, Alert, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-elements';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, Entypo, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardItem, Thumbnail, Button, Container, Content, Tabs, Tab } from 'native-base';


function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default function otherUserProfile({ navigation, route, props }) {

    const [tabPage, setTabPage] = useState(0);
    const onChangeTab = (changeTabProps) => {
        const newTabIndex = changeTabProps.i;
        setTabPage(newTabIndex);
    };

    const { user } = route.params;

    const [refreshing, setRefreshing] = React.useState(false);
    const [aboutMe, setAboutMe] = useState('');
    const [friends, setFriends] = useState('');
    const [groups, setGroups] = useState('');
    const [myPosts, setMyPosts] = useState('');
    const [avatar, setAvatar] = useState('');
    const [name, setName] = useState('');
    const [following, setFollowing] = useState(false);
    const [posts, setPosts] = React.useState([]);
    const [userPlants, setUserPlants] = useState([])
    const [currentUserID, setCurrentUserID] = useState('')
    

    useEffect(() => {
        const currentUser = firebase.auth().currentUser;
        setCurrentUserID(currentUser.uid)
        getPosts()
        getUserDetails()
      
        viewPlants();

    }, [user, following]);

    const getFolowingNotFollowing = () => {
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('friendships').doc(currentUser.uid).collection('FRIENDS')
            .doc(user).get().then((doc) => {
                if (doc.exists) {
                    setFollowing(true)
                }else{
                    setFollowing(false)
                }
            })
    }

    const getUserDetails = () => {
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('friendships').doc(user).get().then(doc => {
            const length = doc.data().friendsArray
            setFriends(length)
        })
        firebase.firestore().collection('groups').where('members', 'array-contains', user).get().then(doc => {
            const size = doc.size;
            setGroups(size)
        })
        firebase.firestore().collection('posts').where('userUid', '==', user).get().then(doc => {
            const size = doc.size;
            setMyPosts(size)
        }).then(
           
        firebase.firestore().collection('friendships').doc(currentUser.uid).collection('FRIENDS')
            .doc(user).get().then((doc) => {
                if (doc.exists) {
                    setFollowing(true)
                }else{
                    setFollowing(false)
                }
            })
        )
        const subscriber = firebase.firestore()
            .collection('Users')
            .doc(user)
            .onSnapshot(documentSnapshot => {
                const aboutMe = documentSnapshot.data().AboutMe;
                setAboutMe(aboutMe);
                const name = documentSnapshot.data().displayName;
                setName(name);
            });
        firebase.storage().ref("avatars/" + user).getDownloadURL().then((download) => {
            setAvatar(download)
        }).catch((error) => {
            console.log('error' + error)
        })
    }

    const getPosts = () => {
        firebase.firestore()
            .collection('posts')
            .where('uid', 'array-contains', user).limit(10)
            .get()
            .then(documentSnapshot => {
                const list = [];
                documentSnapshot.forEach(doc => {
                    const { text, localUri, uid, timestamp, displayName, avatar, name, PlantNameLabelID, time, likes, userUid } = doc.data();
                    list.push({
                        id: doc.id,
                        text,
                        localUri,
                        uid,
                        displayName,
                        timestamp,
                        avatar,
                        name,
                        PlantNameLabelID,
                        time,
                        likes,
                        userUid
                    });
                })
                setPosts(list);
            })
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getUserDetails()
           
            setRefreshing(false)
        })
    }, [refreshing])

    const follow = () => {
        const increment = firebase.firestore.FieldValue.increment(1);
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('friendships').doc(currentUser.uid).collection('FRIENDS').doc(user).set({
            name: name,
            image: avatar
        })

        firebase.firestore().collection('friendships').doc(currentUser.uid).update({
            friendsArray: firebase.firestore.FieldValue.arrayUnion(user)
        })

        firebase.firestore().collection('Users').doc(currentUser.uid).update({
            friends: increment
        })
        setFollowing(true);
    }


    const askFirst = (userID) => {
        Alert.alert('Are your sure you want to unfollow?',
            'You will no longer see their posts!',
            [
                {
                    text: 'Ok',
                    onPress: () => unfollow(userID)
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
            ],
            { cancelable: false }
        )

    }

    const unfollow = (userR) => {
        const increment = firebase.firestore.FieldValue.increment(-1);
        const currentUser = firebase.auth().currentUser;
        firebase.firestore().collection('friendships').doc(currentUser.uid).collection('FRIENDS')
            .doc(userR)
            .delete().then(
                console.log('delete successful')
            ).catch(
                console.log('error deleting')
            )

        firebase.firestore().collection('friendships').doc(currentUser.uid).update({
            friendsArray: firebase.firestore.FieldValue.arrayRemove(userR)
        })

        firebase.firestore().collection('Users').doc(currentUser.uid).update({
            friends: increment
        })
        setFollowing(false)
    }

    const back = () => {
      
        onRefresh();
        navigation.goBack();
    }

    const liked = (doc, UserUId, localImage) => {
        const user = firebase.auth().currentUser;
        const DocID = doc;
        const UID = UserUId;
        const image = localImage
        firebase.firestore().collection('posts').where('docRef', '==', DocID).where('LikedBy', 'array-contains', user.uid).get().then((snapshot) => {
            if (snapshot.empty) {
                addLike(DocID, UID, image)
            } else {
                Alert.alert('You have already supported this post')
            }
        })

    }

    const addLike = (docIDForGood, otherUID, postImage) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);

        firebase.firestore().collection('posts').doc(docIDForGood).update({
            likes: increment
        })
        firebase.firestore().collection('posts').doc(docIDForGood).update({
            LikedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
        })
        firebase.firestore().collection('notifications').doc(otherUID).collection('POSTLIKES').doc(docIDForGood).get().then((doc) => {
            if (doc.exists) {

                firebase.firestore().collection('notifications').doc(otherUID).collection('POSTLIKES').doc(docIDForGood).update({
                    likes: increment,
                    created: firebase.firestore.FieldValue.serverTimestamp()
                })
            } else {

                firebase.firestore().collection('notifications').doc(otherUID).collection('POSTLIKES').doc(docIDForGood).set({
                    likes: 1,
                    created: firebase.firestore.FieldValue.serverTimestamp(),
                    postID: docIDForGood,
                    postImage: postImage
                })
            }
        })
        Alert.alert('Thank you for the support!')
    }

    const reportUser = (ID) => {
        Alert.alert('Do you want to report this person?',
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

        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('People')
            .where('reporting', '==', ID).get()
            .then(docSnapshot => {
                if (docSnapshot.empty) {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('People').add({
                        reporting: ID,
                        reporter: [user.uid],
                        report: [user.uid, ID],
                        reportedTime: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    Alert.alert('Thank you for reporting! We appreciate your feedback!')
                } else {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('People')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', user.uid).get()
                        .then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('People').doc(ID).update({
                                    reporter: [user.uid]
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })
                }
            })
    }


    const reportThis = (ID) => {
        Alert.alert('What are you Flagging this for?',
            'Spam or Inappropriate',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'Spam',
                    onPress: () => reportSpam(ID)
                },
                {
                    text: 'Inappropriate',
                    onPress: () => reportInappropriate(ID)
                },
            ],
            { cancelable: false }

        );
    };

    const [array, setArray] = useState([]);
    const reportSpam = (ID) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);
        firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Posts')
            .doc(ID).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Posts')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', [user.uid]).get().then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Posts').doc(ID).update({
                                    reporter: firebase.firestore.FieldValue.arrayUnion(user.uid),
                                    number: increment
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })
                } else {
                    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Posts').doc(ID).set({
                        reporting: ID,
                        reporter: [user.uid],
                        report: [user.uid, ID],
                        reportedTime: firebase.firestore.FieldValue.serverTimestamp(),
                        number: 1
                    })
                    Alert.alert('Thank you for reporting! We appreciate your feedback!')
                }
            })
    }

    const reportInappropriate = (ID) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);
        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Posts')
            .doc(ID).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Posts')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', [user.uid]).get().then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Posts').doc(ID).update({
                                    reporter: firebase.firestore.FieldValue.arrayUnion(user.uid),
                                    number: increment
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })
                } else {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Posts').doc(ID).set({
                        reporting: ID,
                        reporter: [user.uid],
                        report: [user.uid, ID],
                        reportedTime: firebase.firestore.FieldValue.serverTimestamp(),
                        number: 1
                    })
                    Alert.alert('Thank you for reporting! We appreciate your feedback!')
                }
            })
    }

    const viewPlants = () => {

        firebase.firestore().collection('myPlants').doc(user).collection('PLANTS').onSnapshot(documentSnapshot => {
            const list = [];
            documentSnapshot.forEach(doc => {
                const { name } = doc.data();
                list.push({
                    id: doc.id,
                    name
                })
            })
            setUserPlants(list)
        })

    }


    function ListIsEmpty() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                <View style={styles.textNotLoadedBox}>
                    <Text style={styles.textIfNotLoaded}>Sorry this user doesnt have any posts yet! </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => back()}
                />
                <Text style={styles.headerText}>{name}</Text>
                {currentUserID === user ? null
                    : (following === false ?
                        <Button style={{ marginRight: 10, marginTop: 10, paddingHorizontal: 5, backgroundColor: '#a29bfe' }} onPress={() => follow()}>
                            <Text>Follow</Text>
                        </Button>
                        :
                        <Button bordered style={{ marginRight: 10, marginTop: 10, paddingHorizontal: 5 }} onPress={() => askFirst(user)}>
                            <Text>Unfollow</Text>
                        </Button>
                    )}
            </View>
            <View>
                <ImageBackground source={require('../image/profileBackground.jpg')} style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
                    <View style={styles.avatarContainer}>
                        <Avatar style={styles.Avatar}
                            source={avatar ?
                                { uri: avatar } : require('../image/defaultUser.jpg')}
                        />

                    </View>
                    <View style={{ width: '60%', marginLeft: 5 }}>
                        <Text style={styles.name}>{name}</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.stat}>
                                <Text style={styles.statNumber}>{myPosts}</Text>
                                <Text style={styles.statTitle}>Posts</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statNumber}>{friends.length}</Text>
                                <Text style={styles.statTitle}>Buds</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statNumber}>{groups}</Text>
                                <Text style={styles.statTitle}>Blossoms</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
                <View style={styles.AboutMe}>
                    <View style={styles.aboutMeTitleAndIcon}>
                        <Text style={styles.aboutMeTitle}>About Me</Text>
                        <Entypo name="dots-three-horizontal" size={30} color="green" onPress={() => reportUser(user)} />
                    </View>
                    <Text style={styles.aboutMeText} numberOfLines={3}>{aboutMe}</Text>
                </View>
            </View>
            <Container>
                <Tabs page={tabPage}
                    onChangeTab={onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }} tabContainerStyle={{ height: 40 }}>
                    <Tab heading='Posts' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                        <FlatList style={styles.container}

                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                            data={posts.sort((a, b) => a.time > b.time ? 1 : -1)}
                            renderItem={({ item }) => {
                                return (true) ?

                                    <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
                                        key={item.id}>
                                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                                            <Image source={{ uri: item.localUri }} style={styles.image} />
                                        </CardItem>
                                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                                            <Thumbnail square small source={avatar ?
                                                { uri: avatar } : require('../image/defaultUser.jpg')} style={styles.thumbNail} />
                                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
                                                <Text style={styles.titleText}>{item.displayName}</Text>
                                                <TouchableOpacity onPress={() => navigation.navigate('plantInfo', { plant: item.PlantNameLabelID })}>
                                                    <Text style={styles.titleName}>{item.name}</Text>
                                                </TouchableOpacity>
                                                <Text style={styles.titleTime} numberOfLines={1}>{item.timestamp}</Text>
                                            </View>
                                        </CardItem>
                                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                                            <Text style={styles.bodyText} numberOfLines={3}>{item.text}</Text>
                                        </CardItem>
                                        <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
                                            <Entypo name="dots-three-horizontal" size={30} color="green" onPress={() => reportThis(item.id)} />
                                            <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPage', { postCSection: item.id, postUsersID: item.userUid })} />
                                            <View style={{ flexDirection: 'row' }}>
                                                <Text style={{ marginHorizontal: 3 }}>{item.likes}</Text>
                                                <Ionicons name="ios-heart-empty" size={30} color="green" style={{ marginRight: 10 }} onPress={() => liked(item.id, item.userUid, item.localUri)} />
                                            </View>
                                        </View>
                                    </Card>
                                    : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
                            }}
                            ListEmptyComponent={ListIsEmpty()}>
                        </FlatList>
                    </Tab>
                    <Tab heading='Plants' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                        <FlatList
                            style={{ position: 'relative', flex: 1 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                            data={userPlants.sort((a, b) => a.name > b.name ? 1 : -1)}
                            keyExtractor={(item) => (item.id)}
                            renderItem={({ item }) => {
                                return (true) ?
                                    <Card key={item.id} style={{ borderColor: 'black', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <CardItem>
                                            <Text style={{ fontSize: 20, color: 'green', marginLeft: 30 }}>{item.name}</Text>
                                        </CardItem>
                                    </Card>
                                    : null
                            }}
                            ListEmptyComponent={ListIsEmpty()}
                        >
                        </FlatList>
                    </Tab>

                </Tabs>
            </Container>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,

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
    name: {
        margin: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#079992',
        fontFamily: 'sans-serif-condensed',

    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderTopColor: 'green',
        borderTopWidth: 1,
        borderBottomColor: 'green',
        borderBottomWidth: 1,
        backgroundColor: 'white'
    },
    stat: {
        alignItems: 'center',
        flex: 1
    },
    statNumber: {
        color: '#218c74',
        fontSize: 16,
        fontWeight: '300'
    },
    statTitle: {
        color: '#33d9b2',
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4
    },
    AboutMe: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0,
        backgroundColor: 'white'
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
        marginTop: 4
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
        height: 350,
        alignContent: 'stretch'
    },
    imageNotLoaded: {
        height: 300,
        width: 300,
        marginHorizontal: 50
    },
    textIfNotLoaded: {
        fontSize: 15,
        fontFamily: 'sans-serif-light',
        fontStyle: 'italic'
    },
    textNotLoadedBox: {
        alignItems: 'center',
        marginTop: 0
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',

    },
    titleName: {
        marginLeft: 5,
        fontSize: 15,
        fontStyle: 'italic',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        marginVertical: 3

    },
    titleTime: {
        fontSize: 15,
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        marginVertical: 3
    },
    thumbNail: {
        margin: 5
    }
});
