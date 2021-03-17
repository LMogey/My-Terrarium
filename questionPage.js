import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Alert , FlatList} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header';


export default function questionPage({ navigation, route, props }) {
  const { question } = route.params;
  const [questionStuff, setQuestionStuff] = useState([])
  const [questionDetails, setQuestionDetails] = useState('')


  useEffect(() => {
    getQuestion()
  }, [question])

  const getQuestion = async () => {
    firebase.firestore().collection('Questions').doc(question).get().then(doc => {
      if (doc.exists) {
        const list = []
        const { avatar, name, question, tags, image, user, comments } = doc.data();
        list.push({
          id: doc.id,
          avatar,
          name,
          question,
          tags,
          image,
          user,
          comments
        })
        setQuestionStuff(list)
      } else {

      }
    }).catch(
      console.log('na')
    )
  }

  const askIfDelete = () => {
    Alert.alert('Delete this question for good?',
      'All the details will be deleted',
      [
        {
          text: 'Ok',
          onPress: () => deleteQuestion()
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

  const deleteQuestion = () => {
    firebase.firestore().collection('Questions').doc(question).delete();
    navigation.navigate('reportedQuestions')
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ height: 300, marginTop: 30, marginHorizontal: 10 }}>
        <FlatList

          ListEmptyComponent={() => (
            <View
              style={styles.emptyText}
            >
              <Text style={{ color: 'black' }}>Nothing Found</Text>
            </View>
          )}
          data={questionStuff}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
              key={item.id}>
              <CardItem cardBody style={{ marginHorizontal: 5 }}>
                {item.image !== null ?
                  <Image source={{ uri: item.image }} style={styles.image} />
                  : null}
              </CardItem>
              <CardItem cardBody style={{ marginHorizontal: 5 }}>
                <Thumbnail square small source={item.avatar ?
                  { uri: item.avatar }
                  :
                  require('../image/defaultUser.jpg')} style={styles.thumbNail} />
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
                  <Text style={styles.titleText}>{item.name ? item.name : null}</Text>
                  <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between' }}>
                    {item.tags ? item.tags.map((item, key) => (
                      <Text key={key} style={{
                        fontFamily: 'sans-serif-light',
                        fontWeight: 'normal',
                        color: '#6c5ce7', fontSize: 18, paddingRight: 10
                      }} numberOfLines={1}>|{item}|</Text>
                    ))
                      : null}
                  </View>
                </View>
              </CardItem>
              <CardItem cardBody style={{ marginHorizontal: 5 }}>
                <Text style={{fontSize:15}} numberOfLines={3}>{item.question ? item.question : null}</Text>
              </CardItem>
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

              </View>
              <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>

                <AntDesign name="delete" size={30} color="red" style={{ margin: 10 }} onPress={() => askIfDelete()} />

                <View>
                  <Text>{item.comments ? item.comments : null}</Text>
                  <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPageAdmin', { post: question, commentInfo: null })} />
                </View>
              </View>
            </Card>
          )}></FlatList>

      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#636e72',
  },
  Title: {
    fontSize: 15,
    textAlign: 'center',
    color: 'green'
  },
  imageNotLoaded: {
    height: 300,
    width: '100%',
    marginTop: 100
  },
  textIfNotLoaded: {
    fontSize: 20,
    fontFamily: 'sans-serif-light',
    fontStyle: 'italic',
    color: 'white'
  },
  textNotLoadedBox: {
    alignItems: 'center',
    marginTop: 0
  },
  titleText: {
    fontFamily: 'sans-serif-light',
    fontWeight: 'normal',
    color: 'green',
    fontSize:15
  }
});