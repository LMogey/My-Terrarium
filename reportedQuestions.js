import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header';


function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function reportedComments({ navigation }) {

    const [getQuestion, setGetQuestion] = useState([])
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getQuestionsID()
            setRefreshing(false)

        })
    }, [refreshing])


    useEffect(() => {
        getQuestionsID();
    }, [])

    const getQuestionsID = () => {
        firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').onSnapshot(documentSnapshot => {
            const list = [];
            documentSnapshot.forEach(doc => {
                const { reporting, reportedTime, reporter, number } = doc.data();
                list.push({
                    id: doc.id,
                    reporting,
                    reportedTime,
                    reporter,
                    number
                })
            })

            setGetQuestion(list)
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
        firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').doc(caseID).delete();
        getQuestionsID()
    }

    function ListIsEmpty() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                <View style={styles.textNotLoadedBox}>
                    <Text style={styles.textIfNotLoaded}>No Questions to view at this time</Text>
                </View>
            </View>
        )
    }


    return (

        <FlatList
            style={styles.container}
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
            data={getQuestion.sort((a, b) => a.number > b.number ? -1 : 1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                return (true) ?
                    <TouchableOpacity style={{ height: 200, marginVertical: 10, marginHorizontal: 10 }} key={item.id} onPress={() => navigation.navigate('questionPage', { question: item.reporting })}>
                        <Card >
                            <CardItem style={{ justifyContent: 'space-between' }}>
                                <Text style={styles.Title}>Case File Question</Text>
                                <Button title='Accept' style={{ backgroundColor: 'black', width: 100, justifyContent: 'center', marginBottom: 5 }}
                                    onPress={() => onAccepting(item.id)}></Button>
                            </CardItem>
                            <CardItem>
                            <Text style={styles.Title}>Number of reports: {item.number}</Text>
                            </CardItem>
                            <CardItem>
                                <Text style={styles.Title}>Question ID: {item.reporting}</Text>
                            </CardItem>
                        </Card>
                    </TouchableOpacity>
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
        marginTop:100
      },
      textIfNotLoaded: {
        fontSize: 20,
        fontFamily: 'sans-serif-light',
        fontStyle: 'italic',
        color:'white'
      },
      textNotLoadedBox: {
        alignItems: 'center',
        marginTop: 0
      },
});