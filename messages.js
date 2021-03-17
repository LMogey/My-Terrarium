import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image , RefreshControl, Alert} from 'react-native';
import { Ionicons, MaterialCommunityIcons , Entypo} from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import * as firebase from 'firebase/app';
import 'firebase/firestore'

function wait(timeout) {
  return new Promise(resolve => {
      setTimeout(resolve, timeout);
  });
}

export default function messsages({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const [image, setImage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('')

  const onRefresh = React.useCallback(() => {
      setRefreshing(true);

      wait(2000).then(() => {
          threads
          setRefreshing(false)
      })
  }, [refreshing])


  useEffect(() => {
    setLoading(true);
    getImage();
    const user = firebase.auth().currentUser;
    const unsubscribe = firebase.firestore()
      .collection('Threads').where('users', 'array-contains', user.uid)
      .onSnapshot((querySnapshot) => {
        const threads = querySnapshot.docs.map((documentSnapshot) => {
          return {
            _id: documentSnapshot.id,
            // give defaults
            name: '',
            latestMessage: {
              text: '',
              createdAt:''
            },
            ...documentSnapshot.data(),

          };

        });

        setThreads(threads);


        setLoading(false);

      });

    /**
     * unsubscribe listener
     */
    return () => unsubscribe();
  }, []);

  const getImage = () => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Users').doc(user.uid)
      .onSnapshot(documentSnapshot => {
        const image = documentSnapshot.data().avatar;
        setImage(image);
        const name = documentSnapshot.data().displayName;
        setCurrentUserName(name)
      })
     
  }

  const back = () => {

    onRefresh()
    navigation.goBack();
}

const deleteThis = (postID) => {
  Alert.alert(
    "Alert",
    "Are you sure you want to delete?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: "OK", onPress: () => deleteComplete(postID) }
    ],
    { cancelable: false }
  );
}

const deleteComplete = (messageID) => {

  firebase.firestore().collection('Threads').doc(messageID)
    .delete().then(function () {
      Alert.alert('Message Deleted!')
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });

   
}

  return (
    <FlatList
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
              onPress={() => back()}
            />
            <Text style={styles.headerText}>Inbox</Text>
            <MaterialCommunityIcons name="message-plus" size={30} style={styles.headerIcon2}
              onPress={() => navigation.navigate('createMessage')} />
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />
    }
      data={threads.sort((a,b) => a.latestMessage.createdAt > b.latestMessage.createdAt ? -1: 1)}
      keyExtractor={(item) => item._id}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate('messageScreen', { thread: item })}
        >
          <View style={styles.itemBox}>
            <View style={{ flexDirection: 'row' }}>

              <View style={{ flexDirection: 'column' }, styles.avatarContainer}>
                {image === item.image1 ? (
                  <Image style={styles.Avatar} source={{ uri: item.image2 }} />
                ) : (
                    <Image style={styles.Avatar} source={{ uri: item.image1 }} />
                  )}
              </View>
              <View style={{ flexDirection: 'column', width: 250 , marginLeft:5}}>
                {currentUserName === item.nameRoom ?
                  <Text style={styles.Title}>{item.nameRoom1}</Text>
                  :
                  <Text style={styles.Title}>{item.nameRoom}</Text>
                }
                <Text style={styles.Description} numberOfLines={1}>{item.latestMessage.text}</Text>
               
              </View>
              <Entypo name="dots-three-horizontal" size={30} color="green" onPress={() => deleteThis(item._id)} />
            </View>
          </View>
        </TouchableOpacity>
      )}

    />

  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#55efc4',
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
    paddingRight: 120,
    paddingLeft: 130,

  },
  headerIcon: {
    color: "black",
    justifyContent: 'flex-start',

  },
  headerIcon2: {
    color: "black",
    justifyContent: 'flex-end',
  },
  itemBox: {
    margin: 4,
    paddingVertical: 10,
    paddingLeft: 10,
    borderColor: 'blue',
    borderWidth: 0.8,
    paddingRight: 15
  },
  Title: {
    fontSize: 20,
    color: '#00b894'
  },
  Description: {
    fontSize: 15,
    flexWrap: 'wrap',
    fontStyle: 'italic',
    color: '#00cec9'
  },
  Avatar: {
    width: 80,
    height: 80,
    borderColor: '#00b894',
    borderWidth: 1,
  },
  avatarContainer: {
    shadowColor: '#151734',
    shadowRadius: 15,
    shadowOpacity: 0.4,
  },


});