import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, TouchableOpacity, Button, Alert } from 'react-native';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header'

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function messagesAdmin({ navigation }) {

    const [Messages, setMessages] = useState([])
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getMessages()
            setRefreshing(false)

        })
    }, [refreshing])


    useEffect(() => {
        getMessages()
    }, [])

    const getMessages = () => {
        firebase.firestore().collection('reports').onSnapshot(documentSnapshot => {
            const list = [];
            documentSnapshot.forEach(doc => {
                const { image, report, type, userID, time } = doc.data();
                list.push({
                    id: doc.id,
                    image,
                    report,
                    type,
                    userID,
                    time
                })
            })

            setMessages(list)
        })
    }

    const onAccepting = (ID) => {
        Alert.alert('Have you completed your task?',
            'This case will now be deleted for good',
            [
                {
                    text: 'Ok',
                    onPress: () => deleteTask(ID)
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

    const deleteTask = (caseID) => {
        firebase.firestore().collection('reports').doc(caseID).delete();
        navigation.navigate('messagesAdmin')
    }

    function ListIsEmpty() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                <View style={styles.textNotLoadedBox}>
                    <Text style={styles.textIfNotLoaded}>No messages to view at this time</Text>
                </View>
            </View>
        )
    }



    return (
        <FlatList
            style={styles.container}
            ListHeaderComponent={
                <View>
                    <Header />
                    <Text style={styles.Title}>Messages</Text>
                </View>
            }
            stickyHeaderIndices={[0]}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
            data={Messages.sort((a, b) => a.time > b.time ? 1 : -1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                return (true) ?
                    <TouchableOpacity style={{ height: 100, marginVertical: 10, marginHorizontal: 10 }} key={item.id} onPress={() => navigation.navigate('messageAdminScreen', { message: item.id })}>
                        <Card >
                            <CardItem style={{ justifyContent: 'space-between' }}>
                                <Text style={styles.TitleT}>Message File: {item.id}</Text>

                                <Button title='Accept' style={{ backgroundColor: 'black', width: 100, justifyContent: 'center', marginBottom: 5 }}
                                    onPress={() => onAccepting(item.id)}></Button>
                            </CardItem>
                            <CardItem>
                                <Text style={styles.TitleT}>Type: {item.type}</Text>
                            </CardItem>
                        </Card>
                    </TouchableOpacity>
                    : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
            }}

            ListEmptyComponent={ListIsEmpty()}
        >
        </FlatList>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    Title: {
        fontSize: 20,
        textAlign: 'center',
        color: 'white'
    },
    TitleT:{
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
});

