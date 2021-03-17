import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Title, Drawer }
    from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Feather, MaterialCommunityIcons, FontAwesome5, AntDesign, MaterialIcons } from '@expo/vector-icons';


export default function Drawers(props) {

    const onSignedOut = () => {
        firebase.auth().signOut().then(() => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    props.navigation.navigate('home');
                } else {
                    props.navigation.navigate('Login')
                }
            });

        }
        )
    }

    useEffect(() => {
        getDetails();
    }, []);

    const [userName, setUserName] = useState('');
    const getDetails = () => {
        const userDetails = firebase.auth().currentUser;
        firebase.firestore().collection('Users').doc(userDetails.uid).onSnapshot(documentSnapshot => {
            const name = documentSnapshot.data().displayName;
            setUserName(name);
        })
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#33d9b2' }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.container}>
                    <View style={styles.userInfoSection}>
                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                                <Title style={styles.title}>{userName ? userName : 'Unknown'}</Title>

                            </View>
                        </View>

                    </View>
                    <Drawer.Section style={styles.drawerSection} {...props}>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <AntDesign name="home" size={size} color="black" />

                            )
                            }
                            label="home"
                            onPress={() => { props.navigation.navigate('home') }} />
                        <DrawerItem
                            icon={({ color, size }) => (

                                <Icon name="account-outline"
                                    color={color}
                                    size={size} />
                            )
                            }
                            label="Profile"
                            onPress={() => { props.navigation.navigate('Profile') }} />
                        <DrawerItem
                            icon={({ color, size }) => (

                                <MaterialIcons name="people-outline" size={size} color={color} />
                            )
                            }
                            label="Buds"
                            onPress={() => { props.navigation.navigate('friendsList') }} />
                                <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons name="account-group" size={size} color={color}/>
                               
                            )
                            }
                            label="Blossoms"
                            onPress={() => { props.navigation.navigate('groupsList') }} />
                        <DrawerItem
                            icon={({ color, size }) => (

                                <MaterialCommunityIcons name="read" size={size} color="black" />
                            )
                            }
                            label="Knowledge"
                            onPress={() => { props.navigation.navigate('Articles') }} />
                        <DrawerItem
                            icon={({ color, size }) => (

                                <Icon name="settings-outline"
                                    color={color}
                                    size={size} />
                            )
                            }
                            label="settings"
                            onPress={() => { props.navigation.navigate('settings') }} />
                        <DrawerItem
                            icon={({ color, size }) => (

                                <FontAwesome5 name="hands-helping" color={color}
                                    size={size} />
                            )
                            }
                            label="Support"
                            onPress={() => { props.navigation.navigate('Support') }} />
                    </Drawer.Section>
                </View>

            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection} {...props}>
                <DrawerItem
                    icon={({ color, size }) => (

                        <Feather name="log-in" size={30} color="black" />
                    )
                    }
                    label="Sign Out"
                    onPress={() => onSignedOut()} />
            </Drawer.Section>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    userInfoSection: {
        paddingLeft: 20,
    },
    title: {
        fontSize: 20,
        marginTop: 3,
        color: 'white',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
    },
    row: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    paragraph: {
        fontWeight: 'bold',
        marginRight: 3,
    },
    drawerSection: {
        marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 10,
        borderTopColor: '#218c74',
        borderTopWidth: 1,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});