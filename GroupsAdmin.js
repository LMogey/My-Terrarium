import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, TouchableOpacity, Image, FlatList, ActivityIndicator, KeyboardAvoidingView, Alert, ImageBackground, Button, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Thumbnail } from 'native-base';
import Header from './header';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}


export default function GroupsAdmin({ navigation }) {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inMemoryGroups, setInMemoryGroups] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        groupDeets()
        return () => { }
    }, [])

    const groupDeets = () => {
        firebase.firestore()
            .collection('groups').orderBy('name', 'asc')
            .get()
            .then(querySnapshot => {
                const data = [];
                querySnapshot.forEach(doc => {
                    const { name, image } = doc.data();
                    data.push({
                        id: doc.id,
                        name,
                        image
                    });
                })
                setGroups(data)
                setInMemoryGroups(data)
                setIsLoading(false);
            })
    }

    searchGroups = value => {
        const filteredGroups = inMemoryGroups.filter(groups => {
            let groupLowercase = (
                groups.name
            ).toLowerCase();

            let searchTermLowercase = value.toLowerCase();

            return groupLowercase.indexOf(searchTermLowercase) > -1;
        });
        setGroups(filteredGroups);
    };

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            setRefreshing(false)
            getPosts();
            getImage();

        })
    }, [refreshing])


    return (
        <View style={styles.container}>
            <Header />
            <KeyboardAvoidingView>
                <View style={styles.mainContainer}>
                    <View style={{height:590}}>
                        <StatusBar
                            barStyle="light-content"
                        />
                        <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white' }}>
                            <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
                            <TextInput
                                placeholder="Search"
                                placeholderTextColor="#dddddd"
                                style={styles.searchText}
                                onChangeText={value => searchGroups(value)}
                            />
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white' , height:50}}>
                            {isLoading ? (
                                <View
                                    style={{
                                        ...StyleSheet.absoluteFill,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <ActivityIndicator size="large" color="black" />
                                </View>
                            ) : null}

                            <FlatList 
                                data={groups}
                                keyExtractor={(item) => (item.id)}
                                ListEmptyComponent={() => (
                                    <View
                                        style={styles.emptyText}
                                    >
                                        <Text style={{ color: 'black' }}>Nothing Found</Text>
                                    </View>
                                )}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => navigation.navigate('groupAdmin', { group: item.id})}>
                                        <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5, backgroundColor: 'white' }} key={item.id}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Thumbnail square size={70} source={{ uri: item.image }} />
                                                <Text style={styles.nameText}>
                                                    {item.name}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>)}>
                            </FlatList>

                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    header: {
        backgroundColor: '#55efc4',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 5,

    },
    headerText: {
        fontSize: 30,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        paddingLeft: 85

    },
    headerIcon: {
        color: "black",
        justifyContent: 'flex-start',

    },
    mainContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        width: 150,
        height: 40,
        backgroundColor: '#55efc4',
        paddingVertical: 10,
        borderRadius: 25,
        marginVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',

    },
    buttonText: {
        textAlign: 'center',
        color: 'black',
        fontWeight: '700'
    },
    image: {
        width: 500,
        height: 200,
        alignSelf: 'center',
       
    },
    searchText: {
        backgroundColor: 'white',
        height: 30,
        width: 360,
        fontSize: 20,
        padding: 0,
        margin: 2,
        color: 'black',
    },
    emptyText: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50
    },
    nameText: {
        color: '#00cec9',
        fontSize: 20,
        paddingTop: 10,
        paddingLeft: 50,
        fontStyle: 'italic',
        fontWeight: 'bold'
    },
})