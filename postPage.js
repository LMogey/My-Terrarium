import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, Button, Alert, TouchableOpacity, TextInput } from 'react-native';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Thumbnail } from 'native-base';
import { Avatar, Badge, Overlay } from 'react-native-elements';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}


export default function commentPage({ navigation, route, props }) {

  const { postpageID } = route.params;
  const [image, setImage] = useState('');
  const [avatar, setAvatar] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [plantName, setPlantName] = useState('');
  const [plantNameID, setPlantNameID] = useState('');
  const [time, setTime] = useState('');
  const [text, setText] = useState('');
  const [likes, setLikes] = useState('');
  const [postUserID, setPostUserID] = useState('')

  useEffect(() => {
    firebase.firestore().collection('posts').doc(postpageID).onSnapshot(documentSnapshot => {
      const image = documentSnapshot.data().localUri;
      setImage(image);
      const avatar = documentSnapshot.data().avatar;
      setAvatar(avatar);
      const displayName = documentSnapshot.data().displayName;
      setDisplayName(displayName)
      const plantName = documentSnapshot.data().name;
      setPlantName(plantName)
      const plantNameID = documentSnapshot.data().PlantNameLabelID
      setPlantNameID(plantNameID);
      const time = documentSnapshot.data().timestamp;
      setTime(time)
      const text = documentSnapshot.data().text;
      setText(text);
      const likes = documentSnapshot.data().likes;
      setLikes(likes)
      const postUserID = documentSnapshot.data().userUid
      setPostUserID(postUserID)
    })
  }, [postpageID])

  const optionsButton = (ID) => {
    Alert.alert('What would you like to do?',
      'Edit or Delete',
      [
        {
          text: 'Delete',
          onPress: () => deletePost(ID)
        },
        {
          text: 'Edit',
          onPress: () => editPost(ID)
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
      ],
      { cancelable: false }

    );
  };

  const editPost = (iD) => {
    navigation.navigate('editPost', { postStuff: iD })
  }

  const deletePost = (postInfo) => {
    Alert.alert(
      "Alert",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteComplete(postInfo) }
      ],
      { cancelable: false }
    );
  }

  const deleteComplete = (postInfo) => {
    firebase.firestore().collection('posts').doc(postInfo)
      .delete().then(function () {
        Alert.alert('Post Deleted!')
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
    const user = firebase.auth().currentUser;
    const increment = firebase.firestore.FieldValue.increment(-1);
    firebase.firestore().collection('Users').doc(user.uid)
      .update({
        posts: increment
      })
  }

  const back = () => {
    onRefresh();

    navigation.goBack();
  }

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {

      getPosts();
      setRefreshing(false)
    })
  }, [refreshing])


  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
          onPress={() => back()}
        />
        <Text style={styles.headerText}>Post Page</Text>
      </View>

      <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
        key={postpageID}>
        <CardItem cardBody style={{ marginHorizontal: 5 }}>
          <Image source={image ?
            { uri: image }
            :
            require('../image/cutePlant.jpg')} style={styles.image} />
        </CardItem>
        <CardItem cardBody style={{ marginHorizontal: 5 }}>
          <Thumbnail square small source={avatar ?
            { uri: avatar }
            :
            require('../image/defaultUser.jpg')} style={styles.thumbNail} />
          <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between', width: 345 }}>
            <Text style={styles.titleText}>{displayName}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('plantInfo', { plant: plantNameID })}>
              <Text style={styles.titleName} key={plantNameID}>{plantName}</Text>
            </TouchableOpacity>
            <Text style={styles.titleTime} numberOfLines={1}>{time}</Text>
          </View>
        </CardItem>
        <CardItem cardBody style={{ marginHorizontal: 5 }}>
          <Text style={styles.bodyText} numberOfLines={3}>{text}</Text>
        </CardItem>
        <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
          <Ionicons name="ios-more" size={30} color="green" onPress={() => optionsButton(postpageID)} />
          <Entypo name="chat" size={30} color="green" onPress={() => navigation.navigate('commentPage', { postCSection: postpageID, postUsersID: postUserID })} />
          <Badge width={30} status='success'
            value={<Text style={{ color: 'white', fontSize: 20 }}>{likes}</Text>} />
        </View>
      </Card>
    </View>
  )



}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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