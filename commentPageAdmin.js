import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, Button, Alert, TouchableOpacity, } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header';


export default function commentPageAdmin({ navigation, route, props }) {
    const { commentInfo } = route.params;
    const { post } = route.params;

    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [postBool, setPostBool] = useState(false);
    const [otherComments, setOtherComments] = useState([])
    const [comment, setComment] = useState([])

    useEffect(() => {
        setLoading(true)
        if(commentInfo !== null){
            getComment();
        }else{

        }
        getOtherComments();

    }, [commentInfo, post])

    const getComment = () => {
        const postID = post;
        firebase.firestore().collection('posts').doc(postID).collection('COMMENTS').doc(commentInfo).get().then(doc => {
            if (doc.exists) {
                const list = []
                const { name, likes, created, uid, comment, avatar } = doc.data()
                list.push({
                    id: doc.id,
                    name,
                    likes,
                    created,
                    uid,
                    comment,
                    avatar
                })
                setComment(list)
                setPostBool(true)

            } else {

                firebase.firestore().collection('Questions').doc(postID).collection('COMMENTS').doc(commentInfo).get().then(doc => {
                    if (doc.exists) {
                        const list = []
                        const { name, likes, created, uid, comment, avatar } = doc.data()
                        list.push({
                            id: doc.id,
                            name,
                            likes,
                            created,
                            uid,
                            comment,
                            avatar
                        })
                        setComment(list)
                    } else {

                    }
                })
            }
        })
    }

    const getOtherComments = () => {
        const postID = post;
        firebase.firestore().collection('posts').doc(postID).get().then(doc => {
            if (doc.exists) {
                doc.ref.collection('COMMENTS').onSnapshot(documentSnapshot => {
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
                    setOtherComments(list)
                    setLoading(false)
                })
            } else {
                firebase.firestore().collection('Questions').doc(postID).get().then(doc => {
                    if (doc.exists) {
                        doc.ref.collection('COMMENTS').onSnapshot(documentSnapshot => {
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
                            setOtherComments(list)
                            setLoading(false)
                        })
                    } else {

                    }
                })
            }
        })

    }

    const askIfDelete = (itemID) => {
        Alert.alert('Delete this comment for good?',
            'All the details will be deleted',
            [
                {
                    text: 'Ok',
                    onPress: () => deleteComment(itemID)
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

    const deleteComment = (ID) => {

        const increment = firebase.firestore.FieldValue.increment(-1);
        firebase.firestore().collection('posts').doc(post).collection('COMMENTS').doc(ID).get().then(doc => {
            if (doc.exists) {
                doc.ref.delete()
                navigation.navigate('reportedComments')
            } else {


            }
        })
        firebase.firestore().collection('Questions').doc(post).collection('COMMENTS').doc(ID).get().then(doc => {
            if (doc.exists) {
                firebase.firestore().collection('Questions').doc(post).update({
                    comments: increment
                })
                doc.ref.delete()
                navigation.navigate('reportedComments')
            } else {


            }
        })

    }


    const back = () => {
        navigation.goBack();
    }

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => back()}
                    />
                    <Text style={styles.headerText}>Comment Page View</Text>
                </View>
            </View>
            {postBool === true ?
                <Button title='Go to Post' onPress={() => navigation.navigate('postsPageAdmin', { postInfo: post })}></Button>
                : <Button title='Go to Question' onPress={() => navigation.navigate('questionPage', { question: post })}></Button>}
            <FlatList
               
                data={comment}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {

                    return (true) ? <Card style={{ flexDirection: 'row', margin: 5 }}>
                        <Image
                            style={{ width: 80, height: 80, margin: 5 }}
                            resizeMode="cover"
                            source={{ uri: item.avatar }}
                        />
                        <View style={{ flexDirection: 'column', width: 280, height: 80 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text numberOfLines={2} style={styles.comment}>{item.comment}</Text>
                        </View>

                        <View style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <AntDesign name="delete" size={30} color="red" style={{ marginRight: 10 }} onPress={() => askIfDelete(commentInfo)} />
                            <View style={{ flexDirection: 'row', marginTop: 30 }}>
                                <Text style={{ marginHorizontal: 3 }}>{item.likes}</Text>
                                <Ionicons name="ios-heart-empty" size={27} color="green" style={{ marginRight: 15 }} />
                            </View>
                        </View>
                    </Card> : null
                }}>
            </FlatList>
            <Text style={{ marginTop: 10, backgroundColor: '#079992', height: 30, fontSize: 15, color: 'white', textAlign: 'center' }}>Other Comments</Text>
            {loading === false ?
                <FlatList
                    style={{ marginTop: 0, maxHeight: 400 }}
                    data={otherComments.sort((a, b) => a.created > b.created ? -1 : 1)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (true) ?
                            <Card key={item.id} style={{ flexDirection: 'row', margin: 5 }}>
                                <Image
                                    style={{ width: 80, height: 80, margin: 5 }}
                                    resizeMode="cover"
                                    source={{ uri: item.avatar }}
                                />
                                <View style={{ flexDirection: 'column', width: 280, height: 80 }}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text numberOfLines={2} style={styles.comment}>{item.comment}</Text>
                                </View>

                                <View style={{ flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <AntDesign name="delete" size={30} color="red" style={{ marginRight: 10 }} onPress={() => askIfDelete(item.id)} />
                                    <View style={{ flexDirection: 'row', marginTop: 30 }}>
                                        <Text style={{ marginHorizontal: 3 }}>{item.likes}</Text>
                                        <Ionicons name="ios-heart-empty" size={27} color="green" style={{ marginRight: 15 }} />
                                    </View>
                                </View>
                            </Card>
                            : null
                    }}
                >
                </FlatList>
                : null}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    Title: {
        fontSize: 15,
        textAlign: 'center',
        color: 'green'
    },
    imageNotLoaded: {
        height: 300,
        width: '100%',
        marginTop: 100
    },
    textIfNotLoaded: {
        fontSize: 20,
        fontFamily: 'sans-serif-light',
        fontStyle: 'italic',
        color: 'white'
    },
    textNotLoadedBox: {
        alignItems: 'center',
        marginTop: 0
    },
    comment: {
        color: 'black',
        fontSize: 15,
        paddingTop: 10,
        paddingLeft: 10,
        flexWrap: 'wrap'
    },
    name: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 0,
        paddingLeft: 10,
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
    header: {
        backgroundColor: '#55efc4',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    headerText: {
        fontSize: 35,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        marginRight: 5
    },
    headerIcon: {
        color: "black",
        justifyContent: 'flex-start',
    }
});