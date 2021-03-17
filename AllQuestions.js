import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, Alert } from 'react-native';
import { Entypo, AntDesign } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail, Container, Content, Tabs, Tab, Button } from 'native-base';
import MultiSelect from 'react-native-multiple-select';
import { RadioButton } from 'react-native-paper';
import Header from './header'

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function AllQuestions({ navigation }) {

    const [refreshing, setRefreshing] = React.useState(false);
    const [questions, setQuestions] = useState([])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getQuestions()
            setRefreshing(false)

        })
    }, [refreshing])


    useEffect(() => {
        getQuestions()

    }, [])

    const getQuestions = () => {

        firebase.firestore().collection('Questions').get().then(documentSnapshot => {
            const list = []
            documentSnapshot.forEach(doc => {
                const { avatar, name, created, question, tags, image, user, comments } = doc.data()
                list.push({
                    id: doc.id,
                    avatar,
                    name,
                    created,
                    question,
                    tags,
                    image,
                    user,
                    comments
                })
            })
            setQuestions(list)
        })
    }

    const askIfDelete = () => {
        Alert.alert('Delete this question for good?',
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
        firebase.firestore().collection('Questions').doc(question).delete();
        onRefresh()
    }



    return (
        <FlatList
            ListHeaderComponent={
                <Header />
            }
            ListEmptyComponent={() => (
                <View style={styles.container}>
                    <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                    <View style={styles.textNotLoadedBox}>
                        <Text style={styles.textIfNotLoaded}>No Questions! </Text>

                    </View>
                </View>
            )}

            data={questions.sort((a, b) => a.created > b.created ? -1 : 1)}
            keyExtractor={(item) => (item.id)}
            renderItem={({ item }) => {
                return (true) ?
                    <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
                        key={item.id}>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            {item.image !== null ?
                                <Image source={{ uri: item.image }} style={styles.image} />
                                : null}
                        </CardItem>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            <Thumbnail square small source={item.avatar ?
                                { uri: item.avatar }
                                :
                                require('../image/defaultUser.jpg')} style={styles.thumbNail} />
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
                                <Text style={styles.titleText}>{item.name}</Text>
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between' }}>
                                    {item.tags.map((item, key) => (
                                        <Text key={key} style={{
                                            fontFamily: 'sans-serif-light',
                                            fontWeight: 'normal',
                                            color: '#6c5ce7', fontSize: 15, paddingRight: 5
                                        }} numberOfLines={1}>|{item}|</Text>
                                    ))
                                    }
                                </View>
                            </View>
                        </CardItem>
                        <CardItem cardBody style={{ marginHorizontal: 5 }}>
                            <Text style={styles.bodyText} numberOfLines={3}>{item.question}</Text>
                        </CardItem>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

                        </View>
                        <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>

                            <AntDesign name="delete" size={30} color="red" style={{ margin: 10 }} onPress={() => askIfDelete()} />
                            <View>
                                <Text>{item.comments}</Text>
                                <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPageAdmin', { post: item.id })} />
                            </View>
                        </View>
                    </Card>
                    : null
            }}>

        </FlatList>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'

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
        paddingRight: 10,
        fontSize: 18
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