import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, Button, Alert, TouchableOpacity, } from 'react-native';
import { AntDesign, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail } from 'native-base';
import Header from './header';
import { Avatar, Badge, Overlay } from 'react-native-elements';

export default function postsPageAdmin({ navigation, route, props }) {
  const { postInfo } = route.params;

  const [loading, setLoading] = useState(false)
  const [plantName, setPlantName] = useState('');
  const [postUserID, setPostUserID] = useState('')
  const [postPage, setPostPage] = useState([])

  useEffect(() => {
    setLoading(true)
    getPost();

  }, [postInfo])

  const getPost = () => {
    const postID = postInfo;
    firebase.firestore().collection('posts').doc(postID).get().then(doc => {
      if (doc.exists) {
        const list = []
        const { localUri, avatar, displayName, name, PlantNameLabelID, timestamp, text, likes, userUid } = doc.data();
        list.push({
          id: doc.id,
          localUri,
          avatar,
          displayName,
          name,
          PlantNameLabelID,
          timestamp,
          text,
          likes,
          userUid,
       
        })
        setPostPage(list)
        setLoading(false)

      } else {

      }
    })
  }


  const askIfDelete = (itemID) => {
    Alert.alert('Delete this post for good?',
      'All the details will be deleted',
      [
        {
          text: 'Ok',
          onPress: () => deletePost(itemID)
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

  const deletePost = (ID) => {
    firebase.firestore().collection('posts').doc(ID).delete();
    navigation.navigate('reportedPosts');

  }



  return (
    <View style={styles.container}>
      <Header />
      <Button title='Go Back to reported Posts' onPress={() => navigation.navigate('reportedPosts')}></Button>
      <FlatList
        ListEmptyComponent={() => (
          <View
            style={styles.emptyText}
          >
            <Text style={{ color: 'black' }}>Nothing Found</Text>
          </View>
        )}
        data={postPage}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }} key={item.id}>
            <CardItem cardBody style={{ marginHorizontal: 5 }}>
              <Image source={item.localUri ?
                { uri: item.localUri }
                :
                require('../image/cutePlant.jpg')} style={styles.image} />
            </CardItem>
            <CardItem cardBody style={{ marginHorizontal: 5 }}>
              <Thumbnail square small source={item.avatar ?
                { uri: item.avatar }
                :
                require('../image/defaultUser.jpg')} style={styles.thumbNail} />
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
                <Text style={styles.titleText}>{item.displayName}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('plantInfo', { plant: item.PlantNameLabelID })}>
                  <Text style={styles.titleName} key={item.PlantNameLabelID}>{item.name}</Text>
                </TouchableOpacity>
                <Text style={styles.titleTime} numberOfLines={1}>{item.timestamp}</Text>
              </View>
            </CardItem>
            <CardItem cardBody style={{ marginHorizontal: 5 }}>
              <Text style={styles.bodyText} numberOfLines={3}>{item.text}</Text>
            </CardItem>
            <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
              <AntDesign name="delete" size={30} color="red" style={{ marginRight: 10 }} onPress={() => askIfDelete(postInfo)} />
              <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPageAdmin', { post: postInfo })} />
              <Badge width={30} status='success'
                value={<Text style={{ color: 'white', fontSize: 20 }}>{item.likes}</Text>} />
            </View>
          </Card>

        )}>

      </FlatList>

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
  comment: {
    color: 'black',
    fontSize: 15,
    paddingTop: 10,
    paddingLeft: 10,
    flexWrap: 'wrap'
  },
  name: {
    color: '#00cec9',
    fontSize: 20,
    paddingTop: 0,
    paddingLeft: 10,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  displayNameText: {
    color: '#00cec9',
    fontSize: 20,
    paddingTop: 10,
    paddingLeft: 10,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  title: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',

  },
  titleTime: {
    fontSize: 15,
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    marginLeft: 200
  },
  thumbNail: {
    margin: 5
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
    marginRight: 10

  },
  headerIcon: {
    color: "black",
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
    height: 350,
    alignContent: 'stretch'
  },
  imageNotLoaded: {
    height: 300,
    width: 300,
    marginHorizontal: 50
  },
  textIfNotLoaded: {
    fontSize: 15,
    fontFamily: 'sans-serif-light',
    fontStyle: 'italic'
  },
  textNotLoadedBox: {
    alignItems: 'center',
    marginTop: 0
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    maxWidth: 150
  },
  titleName: {
    marginLeft: 5,
    fontSize: 15,
    fontStyle: 'italic',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    marginVertical: 3,
    maxWidth: 150

  },
  titleTime: {
    fontSize: 15,
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    marginVertical: 3
  },
  thumbNail: {
    margin: 5
  },
  image: {
    width: 390,
    height: 350,
    alignContent: 'stretch'
  },
  imageNotLoaded: {
    height: 300,
    width: 300,
    marginHorizontal: 50
  },
  textIfNotLoaded: {
    fontSize: 15,
    fontFamily: 'sans-serif-light',
    fontStyle: 'italic'
  },
  textNotLoadedBox: {
    alignItems: 'center',
    marginTop: 0
  }
});