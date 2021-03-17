import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Alert, FlatList } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem } from 'native-base';

export default function messageAdminScreen({ navigation, props, route }) {


    const { message } = route.params;
    const [messageInfo, setMessageInfo] = useState([])

    useEffect(() => {

        if (message === null) {
            navigation.navigate('messagesAdmin')
        } else {
            getMessage()
        }

    }, [message]);

    const getMessage = () => {
        firebase.firestore()
            .collection('reports')
            .doc(message).get().then(doc => {
                if (doc.exists) {
                    getStuff()
                } else {
                    console.log('nothing')
                }
            })
    }

    const getStuff = () => {
        firebase.firestore().collection('reports').doc(message).get().then(doc => {
            const list = []
            const { report, type, userID, image } = doc.data()
            list.push({
                id: doc.id,
                report,
                type,
                userID,
                image
            })
            setMessageInfo(list)
        })
    }

    const back = () => {

        navigation.goBack();
    }

    const askIfDelete = () => {
        Alert.alert('Delete this message for good?',
            'All the details will be deleted',
            [
                {
                    text: 'Ok',
                    onPress: () => deleteQuestion()
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

    const deleteQuestion = () => {
        firebase.firestore().collection('reports').doc(message).delete();
        navigation.navigate('messagesAdmin')
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => back()}
                />
                <Text style={styles.headerText}>Report Message</Text>
                <AntDesign name="delete" size={30} color="red" style={{ margin: 10 }} onPress={() => askIfDelete()} />
            </View>
            <FlatList style={{ height: 100, marginTop: 30, marginHorizontal: 10 }}
                data={messageInfo}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {

                    return (true) ?
                        <Card style={{ padding: 10 }}
                            key={item}>

                            <CardItem cardBody style={{ marginHorizontal: 5 }}>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'column', alignContent: 'space-between' }}>
                                    <Text style={styles.text}>ID:</Text>
                                    <Text style={styles.Title}>{item.userID ? item.userID : null}</Text>
                                </View>
                            </CardItem>
                            <CardItem cardBody style={{ marginHorizontal: 5, marginVertical: 10 }}>
                                <View style={{ height: 350, width: 350 }}>
                                    <Text style={styles.text}>Image:</Text>
                                    <Image source={item.image ? { uri: item.image } : null} style={styles.image} />
                                </View>

                            </CardItem>
                            <View style={{ flexDirection: 'column', marginVertical: 10 }}>
                                <Text style={styles.text}>Message:</Text>
                                <Text style={styles.TitleT} numberOfLines={3}>{item.report ? item.report : null}</Text>
                            </View>

                            <View style={{ flexDirection: 'column', marginVertical: 10 }}>
                                <Text style={styles.text}>Type:</Text>
                                <Text style={styles.TitleTT}>{item.type ? item.type : null}</Text>
                            </View>

                        </Card> : null
                }} >

            </FlatList>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    header: {
        backgroundColor: 'black',
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
        color: "green",
        justifyContent: 'flex-start',

    },
    Title: {
        fontSize: 18,
        textAlign: 'center',
        color: 'blue'
    },
    TitleT: {
        fontSize: 15,
        color: 'green',

    },
    TitleTT: {
        fontSize: 15,

        color: 'green',
        fontStyle: 'italic'
    },
    text: {
        color: '#636e72',
        fontSize: 12
    },
    image: {
        width: '100%',
        height: '100%',
        borderColor: 'black',
        borderWidth: 0.3
    }
});

