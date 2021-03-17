import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image, Button, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Text } from 'native-base';
import { Ionicons, AntDesign } from '@expo/vector-icons';

export default function PlantsAdmin({ navigation }) {

    const [plants, setPlants] = useState([])
    const [refreshing, setRefreshing] = React.useState(false);
    const [inMemoryPlants, setInMemoryPlants] = useState([])

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {
            setRefreshing(false)
            getPlants()
        })
    }, [refreshing])

    function wait(timeout) {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    useEffect(() => {
        getPlants()

    }, [])


    const getPlants = () => {
        firebase.firestore()
            .collection('plants')
            .orderBy('englishName', 'asc')
            .limit(10)
            .get()
            .then(querySnapshot => {
                const list = [];
                querySnapshot.forEach(doc => {
                    const { englishName, image } = doc.data();
                    list.push({
                        id: doc.id,
                        englishName,
                        image,
                    });
                })

                setPlants(list);
                setInMemoryPlants(list)
            });
    }

    const searchPlants = value => {
        const filteredPlants = inMemoryPlants.filter(plants => {
            let plantLowercase = (
                plants.englishName
            ).toLowerCase();

            let searchTermLowercase = value.toLowerCase();

            return plantLowercase.indexOf(searchTermLowercase) > -1;
        });
        setPlants(filteredPlants)
    };


    const deleteThis = (ID) => {
        Alert.alert('Delete this Plant?',
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

        firebase.firestore().collection('plants').doc(id).delete();

    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerText}>Plants</Text>

            </View>
            <View style={{ marginTop: 100, marginBottom: 50, marginHorizontal: 50 }}>
                <Button title='Add Plant' onPress={() => navigation.navigate('addPlants')}></Button>
            </View>
            <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white', marginTop: 10 }}>
                <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
                <TextInput
                    placeholder="Search Plants"
                    placeholderTextColor="#dddddd"
                    style={{ width: '100%' }}
                    onChangeText={value => { searchPlants(value) }}
                />
            </View>
            <View style={{ height: 500, marginTop: 0 }}>
                <FlatList
                    horizontal={true}
                    ListEmptyComponent={() => (
                        <View style={styles.container}>
                            <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                            <View style={styles.textNotLoadedBox}>
                                <Text style={styles.textIfNotLoaded}>No notifications at the moment! </Text>

                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    data={plants}
                    keyExtractor={(item, index) => index.toString()}

                    renderItem={({ item }) => (
                        <View style={{backgroundColor:'white', height: 250, alignItems:'center'}}>
                            <TouchableOpacity onPress={() => navigation.navigate('plantsPageAdmin', { plant: item.id })}>
                                <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5, height: 200 }}
                                    key={item.id}
                                    title={item.englishName}>
                                    <CardItem header style={styles.title}>
                                        <Text style={styles.titleText}>{item.englishName}</Text>

                                    </CardItem>
                                    <CardItem cardBody style={{ marginHorizontal: 5, justifyContent: 'center' }}>
                                        <Image source={{ uri: item.image }} style={styles.imageHorizontal} />
                                    </CardItem>
                                </Card>
                            </TouchableOpacity>
                            <AntDesign name="delete" size={30} color="red" onPress={() => deleteThis(item.id)} />
                        </View>
                    )}>
                </FlatList>
            </View>
        </View>

    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#636e72',
    },
    title: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        textTransform: 'uppercase',
    },
    header: {
        backgroundColor: 'black',
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
        paddingRight: 150,
        paddingLeft: 130,

    },
    headerIcon: {
        color: "green",
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
        height: 200,
        alignContent: 'stretch',

    },
    imageHorizontal: {
        width: 150,
        height: 150,
        alignContent: 'stretch',
        marginBottom: 10
    }
});