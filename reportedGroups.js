import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, TouchableOpacity, Button, Alert } from 'react-native';
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

export default function reportedPeople({ navigation }) {
    const [getGroups, setGetGroups] = useState([])
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            getGroupsID()
            setRefreshing(false)

        })
    }, [refreshing])


    useEffect(() => {
        getGroupsID();
    }, [])

    const getGroupsID = () => {
        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups').onSnapshot(documentSnapshot => {
            const list = [];
            documentSnapshot.forEach(doc => {
                const { reporting, reportedTime, reporter } = doc.data();
                list.push({
                    id: doc.id,
                    reporting,
                    reportedTime,
                    reporter
                })
            })

            setGetGroups(list)
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
        firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups').doc(caseID).delete();
    }

    function ListIsEmpty() {
        return (
            <View style={styles.container}>
                <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                <View style={styles.textNotLoadedBox}>
                    <Text style={styles.textIfNotLoaded}>No people to view at this time</Text>
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
            data={getGroups.sort((a, b) => a.reportedTime > b.reportedTime ? 1 : -1)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
                return (true) ?
                    <TouchableOpacity style={{ height: 100, marginVertical: 10, marginHorizontal: 10 }} key={item.id} onPress={() => navigation.navigate('groupAdmin', { group: item.reporting })}>
                        <Card >
                            <CardItem style={{ justifyContent: 'space-between' }}>
                                <Text style={styles.Title}>Case File Group</Text>

                                <Button title='Accept' style={{ backgroundColor: 'black', width: 100, justifyContent: 'center', marginBottom: 5 }}
                                    onPress={() => onAccepting(item.id)}></Button>
                            </CardItem>
                            <CardItem>
                                <Text style={styles.Title}>Group ID: {item.reporting}</Text>
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