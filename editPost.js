import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert, TextInput, Image, ScrollView } from 'react-native';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'

export default function editPost({ navigation, route, props }) {

    const { postStuff } = route.params;
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');


    useEffect(() => {

        firebase.firestore().collection('posts').doc(postStuff).onSnapshot((documentSnapshot) => {
            const oldText = documentSnapshot.data().text;
            setOldText(oldText)
        })

    }, [postStuff])

    const saveUpdate = () => {
        const user = firebase.auth().currentUser;
        firebase.firestore().collection('posts').doc(postStuff)
            .update({
                text: newText
            }).catch(function (error) {
                console.log(error);
            })

        setNewText('')
        Alert.alert('Edit complete!')
        back();
    }


    const back = () => {

        navigation.goBack();
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => back()}
                />
                <Text style={styles.headerText}>Edit Post Text</Text>
            </View>

            <View style={{ justifyContent: 'center' }}>
                <ScrollView>
                    <View style={{ backgroundColor: '#81ecec', flexDirection: 'row', justifyContent: 'center', }}>
                        <Text style={styles.title}>Old Text:</Text>
                    </View>
                    <Text numberOfLines={3} style={styles.inputAboutMe}>{oldText}</Text>
                    <View style={{ backgroundColor: '#81ecec', flexDirection: 'row', justifyContent: 'center', }}>
                        <Text style={styles.title}>New Text:</Text>
                    </View>
                    <TextInput
                        placeholder='Change your text'
                        style={styles.inputAboutMe}
                        placeholderTextColor="black"
                        multiline={true}
                        textAlignVertical='top'
                        selectionColor="black"
                        numberOfLines={3}
                        onChangeText={newText => setNewText(newText)}
                    />
                    <Button title='Save' onPress={() => saveUpdate()} color='#6c5ce7'></Button>
                    <Image source={require('../image/profileBackground.jpg')} style={{ height: 400 }} />
                </ScrollView>
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
    inputAboutMe: {
        width: 400,
        maxHeight: 90,
        backgroundColor: '#78e08f',
        marginBottom: 10,
        color: 'black',
        padding: 10,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,

    },
    title: {
        marginLeft: 5,
        fontSize: 25,
        color: '#6c5ce7',
        justifyContent: 'center',
    }
})
