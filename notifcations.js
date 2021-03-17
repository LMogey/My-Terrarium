import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, View, Text, ImageBackground, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import Header from '../elements/header';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Container, Content, Tabs, Tab, List, ListItem, Button } from 'native-base';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default function Notifications({ navigation }) {

  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false)
  const [commentAlerts, setCommentAlerts] = useState([]);
  const [likesAlerts, setLikesAlerts] =useState([]);

  useEffect(() => {
    getNotifications();
    getCommentAlert();
    getLikeAlert();
  }, [])

  const getNotifications = () => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('REQUESTS').orderBy('requested', 'desc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { name, image, accepted, message, groupid, rejected, requested } = doc.data();
          data.push({
            id: doc.id,
            name,
            image,
            accepted,
            message,
            groupid,
            rejected,
            requested
          });
        })
        setRequests(data)
      })
  }

  const getCommentAlert = () => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('COMMENTALERTS').orderBy('created', 'desc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { message, postID, usersImage, usersName, created , questionAlert} = doc.data();
          data.push({
            id: doc.id,
            message,
            postID,
            usersImage,
            usersName,
            created,
            questionAlert
          });
        })
        setCommentAlerts(data)
      })
  }

  const getLikeAlert = () => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('POSTLIKES').orderBy('created', 'desc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { postID, postImage, likes, created } = doc.data();
          data.push({
            id: doc.id,
            postID,
            postImage,
            likes,
            created
          });
        })
        setLikesAlerts(data)
      })
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {

      getNotifications()
      setRefreshing(false)
    })
  }, [refreshing])

  const onAccepting = (ID, groupID, name, image, message) => {
    const increment = firebase.firestore.FieldValue.increment(1);
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('REQUESTS').doc(ID).update({
      accepted: true
    })
    firebase.firestore().collection('groups').doc(groupID).update({
      members: [ID]
    })

    firebase.firestore().collection('groups').doc(groupID).collection('MEMBERS').doc(ID).set({
      avatar: image,
      name: name
    })

    firebase.firestore().collection('groups').doc(groupID).update({
      pending: firebase.firestore.FieldValue.arrayRemove(ID)
    })

    firebase.firestore().collection('groups').doc(groupID).update({
      number: increment
    })

    firebase.firestore().collection('Users').doc(ID).update({
      groups: increment
    })

    firebase.firestore().collection('notifications').doc(ID).collection('REQUESTS').add({
      requested: firebase.firestore.FieldValue.serverTimestamp(),
      accepted: true,
      name: name,
      message: message,
      image: image,
      groupid: groupID,
      rejected: false
    })

    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('REQUESTS').doc(ID).delete(
    ).then(
      console.log('delete of notification successful')
    )
    onRefresh()
  }

  const onDeclining = (ID, groupID, name, image, message) => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('REQUESTS').doc(ID).update({
      accepted: false,
      rejected: true
    })

    firebase.firestore().collection('groups').doc(groupID).update({
      pending: firebase.firestore.FieldValue.arrayRemove(ID)
    })

    firebase.firestore().collection('notifications').doc(ID).collection('REQUESTS').add({
      requested: firebase.firestore.FieldValue.serverTimestamp(),
      accepted: false,
      name: name,
      message: message,
      image: image,
      groupid: groupID,
      rejected: true
    })

    firebase.firestore().collection('notifications').doc(currentUser.uid).collection('REQUESTS').doc(ID).delete(
    ).then(
      console.log('delete of notification successful')
    )
    onRefresh()
  }

  const [tabPage, setTabPage] = useState(0);
  const onChangeTab = (changeTabProps) => {
    const newTabIndex = changeTabProps.i;
    setTabPage(newTabIndex);
  };


  return (

    <View style={styles.container}>
      <View>
        <Header />
      </View>
      <Container>
      
          <Tabs page={tabPage}
            onChangeTab={onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }}>
            <Tab heading='Comments/Likes' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
              <FlatList
                style={{ height: 230 }}
                data={commentAlerts.sort((a, b) => a.created > b.created ? 1 : -1)}
                keyExtractor={(item) => (item.id)}
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
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <View style={{ height: 100, borderWidth: 0.5, margin: 5, borderColor: 'blue' }} key={item.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Image style={{ height: 100, width: 100 }} source={{ uri: item.usersImage }} />
                        <View style={{ flexDirection: 'column' }}>
                          <Text style={styles.nameText}>
                            {item.usersName}
                          </Text>
                          <Text style={styles.nameTextMessageColour}>
                            {item.message}
                          </Text>
                        </View>
                        {item.questionAlert === true ?
                        <Button onPress={() => navigation.navigate('commentPQuestion', { postCSection: item.postID })}
                          style={{ width: 50, backgroundColor: '#ffeaa7', marginTop: 20, marginRight: 10 }}
                        ><Text style={{ marginLeft: 10 }}>View</Text></Button>
                         : 
                         <Button onPress={() => navigation.navigate('commentPage', { postCSection: item.postID })}
                          style={{ width: 50, backgroundColor: '#ffeaa7', marginTop: 20, marginRight: 10 }}
                        ><Text style={{ marginLeft: 10 }}>View</Text></Button>}
                        
                      </View>
                    </View>
                  </TouchableOpacity>
                )}>
              </FlatList>
              <View style={{
                backgroundColor: '#ffeaa7',
                flexDirection: 'row', justifyContent: 'space-between'
              }}>
                <Text style={{ marginLeft: 5, fontSize: 20, color: '#6c5ce7' }}>Likes</Text>
              </View>
              <FlatList
                style={{ height: 235 }}
                data={likesAlerts.sort((a, b) => a.created > b.created ? 1 : -1)}
                keyExtractor={(item) => (item.id)}
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
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <View style={{ height: 100, borderWidth: 0.5, margin: 5, borderColor: 'blue' }} key={item.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Image style={{ height: 100, width: 100 }} source={{ uri: item.postImage }} />
                        <View style={{ flexDirection: 'column' }}>
                          <Text style={styles.nameText}>
                           This post has:
                          </Text>
                          <Text style={styles.nameTextMessageColour}>
                            {item.likes}
                          </Text>
                          <Text style={styles.nameTextLikes}>
                           likes!
                          </Text>
                        </View>
                        <Button onPress={() => navigation.navigate('postPage', { postpageID: item.postID })}
                          style={{ width: 50, backgroundColor: '#ffeaa7', marginTop: 20, marginRight: 10 }}
                        ><Text style={{ marginLeft: 10 }}>View</Text></Button>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}>
              </FlatList>
            </Tab>
            <Tab heading='Requests' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
              <FlatList
                data={requests.sort((a, b) => a.requested > b.requested ? -1 : 1)}
                keyExtractor={(item) => (item.id)}
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
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => navigation.navigate('groupPage', { groupID: item.groupid })}>
                    <View style={{ height: 100, borderWidth: 0.5, margin: 5, borderColor: 'blue' }} key={item.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Image style={{ height: 100, width: 100 }} source={{ uri: item.image }} />
                        <View style={{ flexDirection: 'column' }}>
                          <Text style={styles.nameText}>
                            {item.name}
                          </Text>
                          {item.accepted === true && item.rejected === false ?
                            <Text style={styles.nameTextMessage}>
                              Have joined
                  </Text> : (item.accepted === false && item.rejected === true ? <Text style={styles.nameTextMessage}>
                              Im sorry you have been rejected from
                  </Text> : <Text style={styles.nameTextMessage}>
                                Wants to join
                  </Text>)

                          }
                          <Text style={styles.nameTextMessageColour}>
                            {item.message}
                          </Text>
                        </View>
                        {item.accepted === true ?
                          <View>
                            <MaterialCommunityIcons name="emoticon-excited-outline" size={30} color="black" />
                          </View>
                          : (item.rejected === true ? <View>
                            <Entypo name="emoji-sad" size={24} color="black" />
                          </View> : <View style={{ flexDirection: 'column' }}>
                              <Button style={{ backgroundColor: '#74b9ff', width: 100, justifyContent: 'center', marginBottom: 5 }}
                                onPress={() => onAccepting(item.id, item.groupid, item.name, item.image, item.message)}><Text>Accept</Text></Button>
                              <Button style={{ backgroundColor: '#ff7675', width: 100, justifyContent: 'center', marginTop: 5 }}
                                onPress={() => onDeclining(item.id, item.groupid, item.name, item.image, item.message)}><Text>Decline</Text></Button>
                            </View>)
                        }
                      </View>
                    </View>
                  </TouchableOpacity>
                )}>
              </FlatList>
            </Tab>

          </Tabs>
  
      </Container>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  nameText: {
    color: '#00cec9',
    fontSize: 20,
    paddingTop: 10,
    paddingLeft: 10,
    fontStyle: 'italic',
    alignSelf: 'center'
  },
  nameTextLikes: {
    color: '#00cec9',
    fontSize: 20,
    paddingTop: 5,
    paddingLeft: 10,
    fontStyle: 'italic',
    alignSelf: 'center'
  },
  nameTextMessage: {
    color: '#00cec9',
    fontSize: 15,
    alignSelf: 'center',
    paddingLeft: 10,
    fontStyle: 'italic',
  },
  nameTextMessageColour: {
    color: '#6c5ce7',
    fontSize: 20,
    alignSelf: 'center',
    paddingLeft: 10,

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
});