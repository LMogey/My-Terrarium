import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, TouchableOpacity, Image, FlatList, ActivityIndicator, KeyboardAvoidingView, Alert, RefreshControl } from 'react-native';
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


export default function UsersAdmin({ navigation }) {

    const [users, setUsers] = useState([]);
    const [inMemoryUsers, setInMemoryUsers] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            setRefreshing(false)

        })
    }, [refreshing])

    useEffect(() => {
        setIsLoading(true);
        userDeets()
        return () => { }
    }, [])

    const userDeets = () => {
        firebase.firestore().collection('Users')
            .orderBy('displayName', 'asc')
            .get()
            .then(querySnapshot => {
                const data = [];
                querySnapshot.forEach(doc => {
                    const { displayName, avatar } = doc.data();
                    data.push({
                        id: doc.id,
                        displayName,
                        avatar
                    });
                })
                setUsers(data)
                setInMemoryUsers(data)
                setIsLoading(false);
            })
    }

    const searchUsers = value => {
        const filteredUsers = inMemoryUsers.filter(users => {
            let userLowercase = (
                users.displayName
            ).toLowerCase();

            let searchTermLowercase = value.toLowerCase();

            return userLowercase.indexOf(searchTermLowercase) > -1;
        });
        setUsers(filteredUsers);
    };


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
                                onChangeText={value => searchUsers(value)}
                            />
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'white' }}>
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
                            <FlatList style={{height:500, backgroundColor: '#636e72' }}
                                data={users}
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
                                    <TouchableOpacity onPress={() => navigation.navigate('userProfileAdmin', { user: item.id })}>
                                        <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5, backgroundColor:'white' }} key={item.id}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <Thumbnail square size={70} source={{ uri: item.avatar }} />
                                                <Text style={styles.nameText}>
                                                    {item.displayName}
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
        paddingLeft: 100

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
        marginTop: 190
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
