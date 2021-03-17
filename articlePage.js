import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, LogBox, ScrollView, TouchableOpacity, } from 'react-native';
import { Container, Text } from 'native-base';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Button, Card, Title, Paragraph, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Header from '../elements/header';


export default function articlePage({ props, navigation, route }) {


  const { article } = route.params;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState();
  const [tags, setTags] = useState([]);


  useEffect(() => {
    firebase.firestore()
      .collection('Articles')
      .doc(article.id)
      .onSnapshot(documentSnapshot => {
        const title = documentSnapshot.data().Title;
        setTitle(title);
        const body = documentSnapshot.data().Body;
        setBody(body);
        const image = documentSnapshot.data().image;
        setImage(image);
        const tags = documentSnapshot.data().tags;
        setTags(tags);
      })
  })

  return (

    <Container style={styles.container}>
      <Header />
      <ScrollView >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', margin: 5, borderWidth: 0.2 }}>
          <Card>
            <Card.Content style={styles.title}>
              <Title style={styles.titleText}>{title}</Title>
            </Card.Content>
            <Card.Cover source={{ uri: image }} />
            <Card.Content>
              <Paragraph style={styles.bodyText}>{body}</Paragraph>
            </Card.Content>
            <TouchableOpacity onPress={() => navigation.navigate('articleSearchBar', {preferences: tags, otherParam:'nothing'})}>
              <Card.Actions>
                <View style={{ flexWrap: 'wrap', marginHorizontal: 10, justifyContent: 'space-around', flexDirection: 'row' }}>
                  {tags.map((tags, index) => (
                    <Chip mode="outlined" style={{ backgroundColor: '#ffeaa7', marginVertical: 10 }} height={30} key={index}>{tags}</Chip>
                  ))
                  }
                </View>
              </Card.Actions>
              <Card.Content style={styles.title}>
                <Title style={styles.titleText}>Select the tags and find people or groups with similar interests</Title>
              </Card.Content>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </Container>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: 'white',
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
    backgroundColor: '#55efc4',
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
    color: "black",
    justifyContent: 'flex-start',

  },

});