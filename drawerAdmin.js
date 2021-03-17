import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Title, Drawer }
    from 'react-native-paper';
import { Feather, MaterialCommunityIcons, FontAwesome, AntDesign, MaterialIcons, FontAwesome5 , SimpleLineIcons, Entypo} from '@expo/vector-icons';


export default function DrawersAdmin(props) {

    const onSignedOut = () => {
        firebase.auth().signOut().then(() => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    props.navigation.navigate('homeAdmin');
                } else {
                    props.navigation.navigate('Login')
                }
            });

        }
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.container}>
                    <View style={styles.userInfoSection}>
                        <View style={{ flexDirection: 'row', marginTop: 15 }}>
                            <View style={{ marginLeft: 15, flexDirection: 'column' }}>
                                <Title style={styles.title}>Admin</Title>

                            </View>
                        </View>

                    </View>
                    <Drawer.Section style={styles.drawerSection} {...props}>
                        <DrawerItem
                            icon={({ color, size }) => (
                                <AntDesign name="home" size={size} color="#079992" />

                            )
                            }
                            label="Home"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('homeAdmin') }} />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons name="cards-variant" size={size} color="#079992" />

                            )
                            }
                            label="All Posts"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('AllPostsAdmin') }} />
                        <DrawerItem
                            icon={({ color, size }) => (
                                <FontAwesome name="quora" size={size} color="#079992" />

                            )
                            }
                            label="All Questions"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('AllQuestions') }} />
                              <DrawerItem
                            icon={({ color, size }) => (
                                <SimpleLineIcons name="user" size={size} color="#079992" />

                            )
                            }
                            label="Users"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('UsersAdmin') }} />
                              <DrawerItem
                            icon={({ color, size }) => (
                                <FontAwesome5 name="users" size={size} color="#079992" />

                            )
                            }
                            label="Groups"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('GroupsAdmin') }} />
                             <DrawerItem
                            icon={({ color, size }) => (
                                <Entypo name="open-book" size={size} color="#079992"  />

                            )
                            }
                            label="Articles"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('ArticlesAdmin') }} />
                             <DrawerItem
                            icon={({ color, size }) => (
                                <MaterialCommunityIcons  name="flower-tulip-outline" size={size} color="#079992"/>

                            )
                            }
                            label="Plants"
                            labelStyle={{ color: '#079992', fontSize: 15 }}
                            onPress={() => { props.navigation.navigate('PlantsAdmin') }} />
                    </Drawer.Section>
                </View>

            </DrawerContentScrollView>
            <Drawer.Section style={styles.bottomDrawerSection} {...props}>
                <DrawerItem
                    icon={({ color, size }) => (

                        <Feather name="log-in" size={30} color="#079992" />
                    )
                    }
                    label="Sign Out"
                    labelStyle={{ color: '#079992', fontSize: 15 }}
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
        color: '#079992',
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