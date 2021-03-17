import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header'


function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function AllPostsAdmin({ navigation }) {

    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getPosts();
            setRefreshing(false)

        })
    }, [refreshing])


    useEffect(() => {
        getPosts()

    }, [])

    const getPosts = () => {

        firebase.firestore().collection('posts').limit(30).get().then(querySnapshot => {
            const list = [];
            querySnapshot.forEach(doc => {
                const { text, localUri, timestamp, displayName, avatar, name, likes, PlantNameLabelID, time, userUid } = doc.data();
                list.push({
                    id: doc.id,
                    text,
                    localUri,
                    displayName,
                    timestamp,
                    avatar,
                    name,
                    likes,
                    PlantNameLabelID,
                    time,
                    userUid
                });
            })
            setPosts(list);

        })

    }

    const askIfDelete = (itemID) => {
        Alert.alert('Delete this post for good?',
            'All the details will be deleted',
            [
                {
                    text: 'Ok',
                    onPress: () => deletePost(itemID)
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

    const deletePost = (ID) => {
        firebase.firestore().collection('posts').doc(ID).delete();
        onRefresh()

    }

    function ListIsEmpty() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                <View style={styles.textNotLoadedBox}>
                    <Text style={styles.textIfNotLoaded}>Welcome! Time to get exploring! </Text>
                    <Text style={styles.textIfNotLoaded}> Why not add some friends? </Text>
                    <Text style={styles.textIfNotLoaded}>Or create your first post! </Text>
                </View>
            </View>
        )
    }


    return (
        <FlatList style={styles.container}
            ListHeaderComponent={

                <Header />

            }
            stickyHeaderIndices={[0]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            data={posts.sort((a, b) => a.time > b.time ? -1 : 1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {

                return (true) ?
                    <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
                        key={item.id}>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            <Image source={item.localUri ?
                                { uri: item.localUri }
                                :
                                require('../image/cutePlant.jpg')} style={styles.image} />
                        </CardItem>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            <Thumbnail square small source={item.avatar ?
                                { uri: item.avatar }
                                :
                                require('../image/defaultUser.jpg')} style={styles.thumbNail} />
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
                                <Text style={styles.titleText}>{item.displayName}</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('plantInfo', { plant: item.PlantNameLabelID })}>
                                    <Text style={styles.titleName} key={item.PlantNameLabelID}>{item.name}</Text>
                                </TouchableOpacity>
                                <Text style={styles.titleTime} numberOfLines={1}>{item.timestamp}</Text>
                            </View>
                        </CardItem>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            <Text style={styles.bodyText} numberOfLines={3}>{item.text}</Text>
                        </CardItem>
                        <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
                        <AntDesign name="delete" size={30} color="red" style={{ marginRight: 10 }} onPress={() => askIfDelete(postInfo)} />
                            <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPageAdmin', { post: item.id })} />
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ marginHorizontal: 3 }}>{item.likes}</Text>
                                <Ionicons name="ios-heart-empty" size={30} color="green" style={{ marginRight: 10 }}/>
                            </View>
                        </View>
                    </Card>
                    : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
            }}
            ListEmptyComponent={ListIsEmpty()}
        >
        </FlatList>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    displayNameText: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 10,
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
    title: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',

    },
    titleTime: {
        fontSize: 15,
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        marginLeft: 200
    },
    thumbNail: {
        margin: 5
    },
    header: {
        backgroundColor: '#55efc4',
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
        paddingRight: 145,
        paddingLeft: 110,

    },
    headerIcon: {
        color: "black",
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
        maxWidth: 150
    },
    titleName: {
        marginLeft: 5,
        fontSize: 15,
        fontStyle: 'italic',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        marginVertical: 3,
        maxWidth: 150

    },
    titleTime: {
        fontSize: 15,
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        marginVertical: 3
    },
    thumbNail: {
        margin: 5
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
    }
});