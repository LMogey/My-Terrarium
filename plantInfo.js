import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, SafeAreaView, ScrollView } from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Container, Content, Tabs, Tab, List, ListItem } from 'native-base';

function wait(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default function plantInfo({ navigation, route, props }) {

    const { plant } = route.params;


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        wait(2000).then(() => {

            getPlant()
            setRefreshing(false)
        })
    }, [refreshing])

    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        getPlant();
    }, [plant])

    const [eName, setEName] = useState('')
    const [lName, setLName] = useState('')
    const [description, setDescription] = useState('')
    const [info, setInfo] = useState('');
    const [growth, setGrowth] = useState('')
    const [plantingTime, setPlantingTime] = useState([]);
    const [image, setImage] = useState('');
    const [howToPlant, setHowToPlant] = useState([])
    const [care, setCare] = useState([]);
    const [diseases, setDiseases] = useState([]);

    const getPlant = () => {
        firebase.firestore()
            .collection('plants')
            .doc(plant)
            .onSnapshot(documentSnapshot => {
                const eName = documentSnapshot.data().englishName;
                setEName(eName);
                const lName = documentSnapshot.data().latinName;
                setLName(lName);
                const description = documentSnapshot.data().Description;
                setDescription(description)
                const info = documentSnapshot.data().info;
                setInfo(info);
                const growth = documentSnapshot.data().Growth;
                setGrowth(growth);
                const plantingTime = documentSnapshot.data().plantingTime;
                setPlantingTime(plantingTime);
                const image = documentSnapshot.data().image;
                setImage(image)
                const howToPlant = documentSnapshot.data().howToPlant;
                setHowToPlant(howToPlant)
                const care = documentSnapshot.data().care;
                setCare(care);
                const diseases = documentSnapshot.data().diseases;
                setDiseases(diseases)
            });
    }

    const [tabPage, setTabPage] = useState(0);

    const onChangeTab = (changeTabProps) => {
        const newTabIndex = changeTabProps.i;
        setTabPage(newTabIndex);
    };

    const back = () => {
        onRefresh();
        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => back()}
                />
                <Text style={styles.headerText} numberOfLines={1}>{eName}({lName})</Text>
            </View>
            <Container>
    
                    <Tabs page={tabPage}
                        onChangeTab={onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }}>

                        <Tab heading='Read' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                            <ScrollView>
                                <View style={{ marginBottom: 10 }}>
                                    {image ?
                                        <Image source={{ uri: image }} style={styles.image} />
                                        : null}

                                    <Text style={styles.aboutMeTitle}>Description</Text>
                                    <View style={{ marginHorizontal: 10 }}>
                                        <Text style={styles.aboutMeText}>{description}</Text>
                                    </View>
                                    <Text style={styles.aboutMeTitle}>Information</Text>
                                    <View style={{ marginHorizontal: 5 }}>
                                        <Text style={styles.aboutMeText}>{info}</Text>
                                    </View>
                                    <Text style={styles.aboutMeTitle}>Growth</Text>
                                    <View style={{ marginHorizontal: 5 }}>
                                        <Text style={styles.aboutMeText}>{growth}</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </Tab>
                        <Tab heading='Condition' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                            <ScrollView>
                                {plantingTime.map((item, key) => {
                                    return (

                                        <ListItem key={key}>
                                            <Entypo name="cup" size={24}  color='red' style={{ marginRight: 3 }}/>
                                            <Text style={styles.listText}>{item}</Text>
                                        </ListItem>
                                        
                                    )
                                }
                                )}
                                 <Image source={require('../image/condition.png')} style={styles.imageS} />
                            </ScrollView>
                        </Tab>
                        <Tab heading='Planting' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                            <ScrollView>
                                {howToPlant.map((item, key) => {
                                    return (

                                        <ListItem key={key}>
                                            <MaterialCommunityIcons name="seed" size={24} color='brown' style={{ marginRight: 3 }} />
                                            <Text style={styles.listText}>{item}</Text>
                                        </ListItem>
                                    )
                                }
                                )}
                                      <Image source={require('../image/seeds.jpg')} style={styles.imageS} />
                            </ScrollView>
                        </Tab>
                        <Tab heading='Care' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                            <ScrollView>
                                {care.map((item, key) => {
                                    return (

                                        <ListItem key={key}>
                                            <Ionicons name="md-flower" size={24} color='#fdcb6e' style={{ marginRight: 3 }} />
                                            <Text style={styles.listText}>{item}</Text>
                                        </ListItem>
                                    )
                                }
                                )}
                                 <Image source={require('../image/care.jpg')} style={styles.imageS} />
                            </ScrollView>
                        </Tab>
                        <Tab heading='Diseases' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
                            <ScrollView>
                            {diseases.map((item, key) => {
                                    return (

                                        <ListItem key={key}>
                                            <MaterialIcons name="healing" size={24} color="black" style={{ marginRight: 3 }}/>
                                            <Text style={styles.listText}>{item}</Text>
                                        </ListItem>
                                    )
                                }
                                )}
                            </ScrollView>
                        </Tab>
                    </Tabs>

            </Container>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

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
        marginRight: 10,
        maxWidth:300
    },
    image: {
        width: '100%',
        height: 200
    },
    imageS: {
        width: '100%',
        height: 300
    },
    aboutMeTitle: {
        marginTop: 5,
        fontSize: 20,
        color: 'white',
        fontFamily: 'sans-serif-condensed',
        backgroundColor: '#33d9b2',
        paddingLeft: 3
    },
    aboutMeText: {
        color: '#079992',
        fontSize: 16,
        fontWeight: "500",
        marginTop: 4,
        marginRight: 3
    },
    listText: {
        color: '#079992',
        fontSize: 15,
        fontWeight: "200",
        marginRight: 10
    }
})