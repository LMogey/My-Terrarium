import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View,  FlatList, Image } from 'react-native';
import { Container, Text } from 'native-base';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Button, Card, Title, Paragraph, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Header from '../elements/header';


export default function articlePageAdmin({ props, navigation, route }) {


    const { article } = route.params;
    const [articleStuff, setArticleStuff] = useState([])


    useEffect(() => {
        firebase.firestore()
            .collection('Articles')
            .doc(article.id).get().then(doc => {
                if (doc.exists) {
                    const list = []
                    const { Title, Body, image, tags } = doc.data();
                    list.push({
                        id: doc.id,
                        Title,
                        Body,
                        image,
                        tags
                    })
                    setArticleStuff(list)
                } else {

                }
            })

    })

    return (

        <Container style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.headerText}>Article</Text>

            </View>
            <FlatList style={{ height: 100, marginTop: 30, marginHorizontal: 10 }}
                data={articleStuff}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {

                    return (true) ?
                        <Card key={item.id}>
                            <Card.Content style={styles.title}>
                                <Title style={styles.titleText}>{item.Title}</Title>
                            </Card.Content>
                            <Card.Cover source={{ uri: item.image }} />
                            <Card.Content>
                                <Paragraph style={styles.bodyText}>{item.Body}</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <View style={{ flexWrap: 'wrap', marginHorizontal: 10, justifyContent: 'space-around', flexDirection: 'row' }}>
                                    {item.tags.map((tags, index) => (
                                        <Chip mode="outlined" style={{ backgroundColor: '#ffeaa7', marginVertical: 10 }} height={30} key={index}>{tags}</Chip>
                                    ))
                                    }
                                </View>
                            </Card.Actions>
                            <Card.Content style={styles.title}>
                                <Title style={styles.titleText}>Select the tags and find people or groups with similar interests</Title>
                            </Card.Content>
                        </Card> : null
                }} >
            </FlatList>
        </Container>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: '#636e72',
        marginBottom: 10
    },
    cards: {
        marginVertical: 10,
        marginHorizontal: 10,
        height: 200,

    },
    title: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    titleText: {
        fontSize: 18,
        fontFamily: 'sans-serif-medium',
        color: '#60a3bc',
        fontStyle: 'italic',
        textAlign: 'center'
    },
    bodyText: {
        fontFamily: 'sans-serif-light',
        fontWeight: 'normal',
        color: '#60a3bc',
        marginTop: 10,
        alignSelf: 'center',
        fontSize: 15
    },
    header: {
        backgroundColor: 'black',
        paddingLeft: 10,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
    headerText: {
        fontSize: 35,
        color: '#079992',
        fontFamily: 'notoserif',
        textShadowColor: 'white',
        textShadowRadius: 1,
        paddingRight: 145,
        paddingLeft: 110,

    },
    headerIcon: {
        color: "green",
        justifyContent: 'flex-start',

    },

});