import React, { useState, Component, useEffect } from 'react';
import { StyleSheet, View, Text, ImageBackground, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-elements';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, Entypo, Feather, AntDesign } from '@expo/vector-icons';

export default function groupAdmin({ navigation, route, props }) {

    const { group } = route.params;

    const [about, setAbout] = useState('');
    const [members, setMembers] = useState([]);
    const [groupInfo, setGroupInfo] = useState([])

    useEffect(() => {
        firebase.firestore()
            .collection('groups')
            .doc(group)
            .get().then(doc => {
                if (doc.exists) {
                    const list = []
                    const { About, name, image, tags, maker, members } = doc.data();
                    list.push({
                        id: doc.id,
                        About,
                        name,
                        image,
                        tags,
                        maker,
                        members
                    })
                    setGroupInfo(list)

                } else {

                }
            })
        getGroupInfo()
    }, [group])

    function getGroupInfo() {
        firebase.firestore().collection('groups').doc(group).collection('MEMBERS').get().then(function (doc) {
            if (!doc.empty) {

                getMembers();
            } else {
                console.log('no')
            }
        })
    }

    const getMembers = async () => {

        firebase.firestore().collection('groups').doc(group).collection('MEMBERS')
            .get().then(doc => {
                const list = []
                doc.forEach(document => {
                    const { name, avatar } = document.data();
                    list.push({
                        id: document.id,
                        name,
                        avatar
                    })

                    setMembers(list)

                    return members;
                })
            })
    }

    const back = () => {

        navigation.goBack();
    }

    const deleteThis = (ID) => {
        Alert.alert('Delete this whole group?',
            'It will be gone for good',
            [
                {
                    text: 'Ok',
                    onPress: () => deleteForSure(ID)
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

    const deleteForSure = (id) => {

        firebase.firestore().collection('groups').doc(id).delete();
        navigation.navigate('reportedGroups')
    }


    return (
        <View style={styles.container}>
            <View>
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => back()}
                    />
                    <Text numberOfLines={1} style={styles.headerText}>Group</Text>
                    <AntDesign name="delete" size={30} color="red" style={{ margin: 10 }} onPress={() => deleteThis(group)} />
                </View>
            </View>
            <View>
                <FlatList

                    ListEmptyComponent={() => (
                        <View
                            style={styles.emptyText}
                        >
                            <Text style={{ color: 'black' }}>Nothing Found</Text>
                        </View>
                    )}
                    data={groupInfo}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (

                        <View style={{ height: 140, borderWidth: 0.5, margin: 5, borderColor: 'blue', backgroundColor: 'white' }} key={item.id}>
                            <ImageBackground source={require('../image/profileBackground.jpg')} style={{ alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image style={{ height: 100, width: 100 }} source={{ uri: item.image }} />
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.nameText}>
                                            {item.name}
                                        </Text>
                                        <Text style={styles.aboutMeTitle}>About Us</Text>
                                        <Text style={styles.aboutMeText}>
                                            {item.About}
                                        </Text>
                                        <Text style={styles.aboutMeText}>
                                            {item.members.length}/6
                                </Text>
                                    </View>

                                </View>
                            

                            <View style={{ flexDirection: 'row', backgroundColor: 'white', justifyContent: 'center' , marginBottom:10}}>
                                {item.tags.map((item, key) => {
                                    return (
                                        <Text key={key}
                                            style={styles.aboutMeTextTags}>|{item}|</Text>
                                    )
                                })}

                            </View>
                            </ImageBackground>
                        </View>


                    )}>

                </FlatList>
            </View>
            <FlatList
                style={{ maxHeight: 450 }}
                data={members}
                keyExtractor={(item) => (item.id)}
                ListEmptyComponent={() => (
                    <View
                        style={styles.emptyText}
                    >
                        <Text style={{ color: 'black' }}>Nothing Found</Text>
                    </View>
                )}

                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('userProfileAdmin', { user: item.id })}>
                        <View style={{ height: 100, borderWidth: 0.5, margin: 5, borderColor: 'blue', backgroundColor: 'white' }} key={item.id}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image style={{ height: 100, width: 100 }} source={{ uri: item.avatar }} />
                                <Text style={styles.nameText}>
                                    {item.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>)}>
            </FlatList>
        </View >
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72'
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

    AboutMe: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0,
        backgroundColor: 'white',
        marginTop: 10
    },
    aboutMeTitleAndIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    aboutMeTitle: {
        marginTop: 5,
        marginLeft: 5,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#33d9b2',
        fontFamily: 'sans-serif-condensed',
    },
    aboutMeText: {
        color: '#079992',
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
        width: 240,
        marginLeft: 5,
    },
    aboutMeTextTags: {
        color: '#079992',
        fontSize: 15,
        fontWeight: "500",
        marginTop: 4,
        marginHorizontal: 10
    },
    nameText: {
        color: '#00cec9',
        fontSize: 18,
        paddingTop: 2,
        paddingLeft: 10,
        fontStyle: 'italic',
        fontWeight: 'bold',
        marginTop: 10
    },
    IconLocation: {
        justifyContent: 'flex-end',

    }
});