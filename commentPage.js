import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem } from 'native-base';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function commentPage({ navigation, route, props }) {

    const { postCSection } = route.params;
    const { postUsersID } = route.params
    const [comments, setComments] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [commentAdd, setCommentAdd] = useState('')
  

    useEffect(() => {

        firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').onSnapshot(documentSnapshot => {
            const list = [];
            documentSnapshot.forEach(doc => {
                const { name, likes, created, uid, comment, avatar } = doc.data();
                list.push({
                    id: doc.id,
                    name,
                    likes,
                    created,
                    uid,
                    comment,
                    avatar
                })
            })
            setComments(list);
        })


    }, [postCSection])


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {

            getPosts();
            setRefreshing(false)
        })
    }, [refreshing])

    const liked = (doc) => {
        const user = firebase.auth().currentUser;
        const DocID = doc;
        firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').where('docRef', '==', DocID).where('LikedBy', 'array-contains', user.uid).get().then((snapshot) => {
            if (snapshot.empty) {
                addLike(DocID)
            } else {
                Alert.alert('You have already supported this post')
            }
        })

    }

    const addLike = (docIDForGood) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);
        firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').doc(docIDForGood).update({
            likes: increment
        })
        firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').doc(docIDForGood).update({
            LikedBy: firebase.firestore.FieldValue.arrayUnion(user.uid)
        })

        Alert.alert('Thank you for the support!')
    }

    const editOrReport = (ID, UID, COMMENT) => {
        const user = firebase.auth().currentUser;
        if (UID === user.uid) {
            Alert.alert('What would you like to do?',
                'Edit or Delete',
                [
                    {
                        text: 'Delete',
                        onPress: () => deleteComment(COMMENT)
                    },
                    {
                        text: 'Edit',
                        onPress: () => editComment(COMMENT)
                    },
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                    },
                ],
                { cancelable: false }

            );

        } else {
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
        }
    };

    const editComment = (commentInfo) => {
        navigation.navigate('editPost', { commentStuff: commentInfo })
    }

    const deleteComment = (commentInfo) => {
        Alert.alert(
            "Alert",
            "Are you sure you want to delete?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "OK", onPress: () => deleteComplete(commentInfo) }
            ],
            { cancelable: false }
        );
    }

    const deleteComplete = (commentInfo) => {
        firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').doc(commentInfo.id)
            .delete().then(function () {
                Alert.alert('Post Deleted!')
            }).catch(function (error) {
                console.error("Error removing document: ", error);
            });
            firebase.firestore().collection('notifications').doc(user.uid).collection('COMMENTALERTS').where('postID', '==', commentInfo.id)
            .get().then(function (querySnapshot) {
              querySnapshot.forEach(function (doc) {
                doc.ref.delete();
              })
            })
            firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').doc(commentInfo.id).delete();
            firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').doc(commentInfo.id).delete();
      

    }


    const [array, setArray] = useState([]);
    const reportSpam = (ID) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);
        firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments')
            .doc(ID).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', [user.uid]).get().then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').doc(ID).update({
                                    reporter: firebase.firestore.FieldValue.arrayUnion(user.uid),
                                    number: increment
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })

                } else {
                    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').doc(ID).set({
                        reporting: ID,
                        reporter: [user.uid],
                        report: [user.uid, ID],
                        reportedTime: firebase.firestore.FieldValue.serverTimestamp(),
                        number: 1,
                        postQID: postCSection
                    })
                    Alert.alert('Thank you for reporting! We appreciate your feedback!')
                }
            })
    }

    const reportInappropriate = (ID) => {
        const user = firebase.auth().currentUser;
        const increment = firebase.firestore.FieldValue.increment(1);
        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments')
            .doc(ID).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments')
                        .where('reporting', '==', ID).where('reporter', 'array-contains-any', [user.uid]).get().then(doc => {
                            if (doc.empty) {
                                firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').doc(ID).update({
                                    reporter: firebase.firestore.FieldValue.arrayUnion(user.uid),
                                    number: increment
                                })
                            } else {
                                Alert.alert('You have already reported this!')
                            }
                        })
                } else {
                    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').doc(ID).set({
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

    const addComment = () => {
        const user = firebase.auth().currentUser;
        var docRef = firebase.firestore().collection('posts').doc(postCSection).collection('COMMENTS').doc();
        docRef.set({
            LikedBy: [],
            avatar: user.photoURL,
            comment: commentAdd,
            commentRef: docRef.id,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            name: user.displayName,
            uid: user.uid
        })
        var commentRef = firebase.firestore().collection('notifications').doc(postUsersID).collection('COMMENTALERTS').doc();
        commentRef.set({
            message: 'commented on a post',
            usersName: user.displayName,
            usersImage: user.photoURL,
            postID: postCSection,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            questionAlert: false
        })

        setCommentAdd('');
        console.log('adding done')
    }


    const back = () => {
        onRefresh();

        navigation.goBack();
    }


    return (
        <View style={styles.container}>
            <View >
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => back()}
                    />
                    <Text style={styles.headerText}>Comments</Text>
                </View>
            </View>
            <FlatList
                style={{ marginTop: 0, backgroundColor: '#c7ecee' }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                data={comments.sort((a, b) => a.created > b.created ? -1 : 1)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    return (true) ?
                        <Card key={item.id} style={{ flexDirection: 'row', margin: 5 }}>
                            <Image
                                style={{ width: 80, height: 80, marin: 1 }}
                                resizeMode="cover"
                                source={{ uri: item.avatar }}
                            />
                            <View style={{ flexDirection: 'column', width: 280, height: 80 }}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text numberOfLines={2} style={styles.comment}>{item.comment}</Text>
                            </View>

                            <View style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <Entypo name="dots-three-horizontal" size={25} color="green" onPress={() => editOrReport(item.id, item.uid, item)} />
                                <View style={{ flexDirection: 'row', marginTop: 30 }}>
                                    <Text style={{ marginHorizontal: 3 }}>{item.likes}</Text>
                                    <Ionicons name="ios-heart-empty" size={27} color="green" style={{ marginRight: 15 }} onPress={() => liked(item.id)} />
                                </View>
                            </View>
                        </Card>
                        : null
                }}
            >
            </FlatList>
            <View style={{ backgroundColor: 'white', margin: 5 }}>
                <TextInput
                    style={styles.inputBox}
                    placeholder='Add a Comment'
                    placeholderTextColor="black"
                    multiline={true}
                    textAlignVertical='top'
                    selectionColor="black"
                    numberOfLines={2}
                    value={commentAdd}
                    onChangeText={commentAdd => setCommentAdd(commentAdd)}
                >
                </TextInput>
                <Button title='Add' onPress={() => addComment()}></Button>
            </View>
        </View>
    )
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
    name: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 0,
        paddingLeft: 10,
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
    comment: {
        color: 'black',
        fontSize: 15,
        paddingTop: 10,
        paddingLeft: 10,
        flexWrap: 'wrap'
    },
    inputBox: {
        height: 50,
        margin: 10,
        borderColor: 'black',
        borderWidth: 0.3,
        fontSize: 16,
        borderRadius: 25,
        padding: 10
    }
})


