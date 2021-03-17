
import React, { useState, Component, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ImageBackground, FlatList, RefreshControl, Image, TouchableOpacity, TextInput } from 'react-native';
import { Avatar, Badge, Button, Overlay } from 'react-native-elements';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Card, CardItem, Thumbnail, Container, Content, Tabs, Tab } from 'native-base';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default function Profile({ navigation }) {

  const [tabPage, setTabPage] = useState(0);
  const onChangeTab = (changeTabProps) => {
    const newTabIndex = changeTabProps.i;
    setTabPage(newTabIndex);
  };


  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {
      setRefreshing(false)
      getPosts();
      getImage();

    })
  }, [refreshing])

  const [posts, setPosts] = React.useState([]);
  const getPosts = async () => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore()
      .collection('posts')
      .where('uid', 'array-contains', currentUser.uid)
      .limit(20)
      .get()
      .then(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { text, localUri, uid, timestamp, displayName, avatar, name, likes, PlantNameLabelID } = doc.data();
          list.push({
            id: doc.id,
            text,
            localUri,
            uid,
            displayName,
            timestamp,
            avatar,
            name,
            likes,
            PlantNameLabelID
          });
        })

        setPosts(list);
      });
  }

  const [aboutMe, setAboutMe] = useState('');
  const [friends, setFriends] = useState('');
  const [groups, setGroups] = useState('');
  const [myPosts, setMyPosts] = useState('');
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [plantName, setPlantName] = useState('')
  const [myPlants, setMyPlants] = useState([])

  useEffect(() => {

    getPosts();
    subscriber();
    getPlants();
    getImage();

    // Stop listening for updates when no longer required

  }, [myPosts]);

  const subscriber = () => {
    const currentUser = firebase.auth().currentUser;
    firebase.firestore().collection('friendships').doc(currentUser.uid).get().then(doc => {
      const length = doc.data().friendsArray;
      setFriends(length)
    })
    firebase.firestore().collection('groups').where('members', 'array-contains', currentUser.uid).get().then(doc=>{
      const size = doc.size;
      setGroups(size)
    })
    firebase.firestore().collection('posts').where('userUid', '==', currentUser.uid).get().then(doc=>{
      const size = doc.size;
      setMyPosts(size)
    })
    firebase.firestore()
      .collection('Users')
      .doc(currentUser.uid)
      .onSnapshot(documentSnapshot => {
        const aboutMe = documentSnapshot.data().AboutMe;
        setAboutMe(aboutMe);
        const name = documentSnapshot.data().displayName;
        setName(name);
      });
  }

  const getImage = async () => {
    const user = firebase.auth().currentUser;
    await firebase.storage().ref("avatars/" + user.uid).getDownloadURL().then((download) => {
      setImage(download)
    }).catch((error) => {
      console.log('error' + error)
    })
  }

  const onPressButton = () => {
    Alert.alert(
      'Choose an option',
      'Camera or Gallery',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        },
        {
          text: 'Camera',
          onPress: openCamera
        },
        {
          text: 'Gallery',
          onPress: openImage
        },
      ],
      { cancelable: false }

    );
  }

  const openCamera = async () => {
    const user = firebase.auth().currentUser;
    let permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted === false) {
      return;
    }
    let picker = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1]
    })

    if (picker.cancelled === true) {
      return;
    } else if (picker.cancelled === false) {
      uploadImage(picker.uri, user.uid)
      setImage(picker.uri)
        .then(() => {
          console.log('Success');

        })
        .catch((error) => {
          console.log(error);
        })


    }

  }

  const openImage = async () => {
    const user = firebase.auth().currentUser;
    let permission = await ImagePicker.requestCameraRollPermissionsAsync();

    if (permission.granted === false) {
      return;
    }
    let picker = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [1, 1]
    })

    if (picker.cancelled === true) {
      return;
    } else if (picker.cancelled === false) {
      uploadImage(picker.uri, user.uid)
      setImage(picker.uri)
        .catch((error) => {
          console.log(error);
        })


    }
  }


  const uploadImage = async (uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    firebase.storage().ref("avatars/" + imageName).put(blob).then(
      console.log('blob uploaded')
    )
    firebase.storage().ref("avatars/" + imageName).getDownloadURL().then((download) => {
      setProfileImage(download)
    }).catch((error) => {
      console.log('error' + error)
    })


  }

  const setProfileImage = (url) => {

    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Users')
      .doc(user.uid).update({
        avatar: url
      });

    firebase.firestore().collection('posts').where('uid', 'array-contains', user.uid).get().then((doc) => {
      if (doc.empty) {

      } else {
        firebase.firestore().collection('posts').where('uid', 'array-contains', user.uid).get()
          .update({
            avatar: url
          })
      }
    })
  }



  const optionsButton = (post, ID) => {
    Alert.alert('What would you like to do?',
      'Edit or Delete',
      [
        {
          text: 'Delete',
          onPress: () => deletePost(post)
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
    firebase.firestore().collection('posts').doc(postInfo.id)
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

      firebase.firestore().collection('notifications').doc(user.uid).collection('COMMENTALERTS').where('postID', '==', postInfo.id)
      .get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          doc.ref.delete();
        })
      })
  }

  const addPlant = () => {
    const user = firebase.auth().currentUser;
    if (plantName.length === 0) {

    } else {
      firebase.firestore().collection('myPlants').doc(user.uid).collection('PLANTS').add({
        name: plantName
      })
      setPlantName('');

    }
  }

  const getPlants = () => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('myPlants').doc(user.uid).collection('PLANTS').onSnapshot(documentSnapshot => {
      const list = [];
      documentSnapshot.forEach(doc => {
        const { name } = doc.data();
        list.push({
          id: doc.id,
          name
        })
      })
      setMyPlants(list)
    })
  }

  const deletePlant = (ID) => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('myPlants').doc(user.uid).collection('PLANTS').doc(ID).delete();
  }

  function ListIsEmpty() {
    return (
      <View style={styles.container}>
        <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
        <View style={styles.textNotLoadedBox}>
          <Text style={styles.textIfNotLoaded}>Welcome! Time to get exploring! </Text>
          <Text style={styles.textIfNotLoaded}> Why not add some friends? </Text>
          <Text style={styles.textIfNotLoaded}>Or create your first post! </Text>
        </View>
      </View>
    )
  }

  const back = () => {
    onRefresh();

    navigation.goBack();
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
          onPress={() => back()}
        />
        <Text style={styles.headerText}>Profile</Text>

      </View>
      <View>
        <ImageBackground source={require('../image/profileBackground.jpg')} style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
          <View style={styles.avatarContainer}>
            <Avatar style={styles.Avatar}
              source={image ?
                { uri: image } : require('../image/defaultUser.jpg')}
            />

            <View style={styles.add}>
              <Ionicons name="ios-add" size={40} color="black" onPress={onPressButton} />
            </View>

          </View>
          <View style={{ width: '60%', marginLeft: 5 }}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{myPosts}</Text>
                <Text style={styles.statTitle}>Posts</Text>
              </View>

              <View style={styles.stat}>
                <TouchableOpacity onPress={() => navigation.navigate('friendsList')}>
                  <Text style={styles.statNumber}>{friends.length}</Text>
                  <Text style={styles.statTitle}>Buds</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stat}>
                <TouchableOpacity onPress={() => navigation.navigate('groupsList')}>
                  <Text style={styles.statNumber}>{groups}</Text>
                  <Text style={styles.statTitle}>Blossoms</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View style={styles.AboutMe}>
          <View style={styles.aboutMeTitleAndIcon}>
            <Text style={styles.aboutMeTitle}>About Me</Text>
          </View>
          <Text style={styles.aboutMeText} numberOfLines={3}>{aboutMe}</Text>
        </View>
      </View>

      <Container>
        <Tabs page={tabPage}
          onChangeTab={onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }} tabContainerStyle={{ height: 40 }}>
          <Tab heading='Posts' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              data={posts.sort((a, b) => a.time > b.time ? 1 : -1)}
              renderItem={({ item }) => {
                return (true) ?
                  <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5 }}
                    key={item.id}>
                    <CardItem cardBody style={{ marginHorizontal: 5 }}>
                      <Image source={{ uri: item.localUri }} style={styles.image} />
                    </CardItem>
                    <CardItem cardBody style={{ marginHorizontal: 5 }}>
                      <Thumbnail square small source={image ? { uri: image } : require('../image/defaultUser.jpg')} style={styles.thumbNail} />
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
                      <Ionicons name="ios-more" size={30} color="green" onPress={() => optionsButton(item, item.id)} />
                      <Entypo name="chat" size={30} color="green" />
                      <Badge width={30} status='success'
                        value={<Text style={{ color: 'white', fontSize: 20 }}>{item.likes}</Text>} />
                    </View>
                  </Card>
                  : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
              }}
              ListEmptyComponent={ListIsEmpty()}>
            </FlatList>
          </Tab>
          <Tab heading='Plants' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
            <FlatList
              style={{ position: 'relative', flex: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              data={myPlants.sort((a, b) => a.name > b.name ? 1 : -1)}
              keyExtractor={(item) => (item.id)}
              renderItem={({ item }) => {
                return (true) ?
                <Card key={item.id} style={{ borderColor: 'black', borderWidth: 1 , flexDirection:'row', justifyContent:'space-between'}}>
                  <CardItem>
                    <Text style={{ fontSize: 20, color:'green', marginLeft:30 }}>{item.name}</Text>
                  </CardItem>
                  <CardItem>
                  <AntDesign name="delete" size={24} color="red" onPress={() => deletePlant(item.id)}/>
                  </CardItem>
                </Card>
                :null
              }}
              ListEmptyComponent={ListIsEmpty()}
            >
            </FlatList>
            <View style={styles.footer}>
              <TextInput
                style={styles.textInput}
                placeholder='Name of Plant'
                placeholderTextColor='white'
                underlineColorAndroid='transparent'
                value={plantName}
                onChangeText={(plantName) => setPlantName(plantName)}
              >

              </TextInput>
            </View>
            <Ionicons name="md-add-circle" size={50} color="#55efc4" style={styles.addButton} onPress={() => addPlant()} />
          </Tab>

        </Tabs>

      </Container>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  addButton: {
    position: 'absolute',
    zIndex: 11,
    right: 0,
    bottom: 50,
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',

  },
  Tabs: {
    paddingTop: 5,
    flexDirection: 'row',

  },
  backgroundProfile: {
    width: '100%',
    height: 150,


  },
  header: {
    backgroundColor: '#55efc4',
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
    paddingLeft: 60,
    marginRight: 20
  },
  headerIcon: {
    color: "black",
    justifyContent: 'flex-start',
    marginLeft: 5
  },
  colum: {

    flexDirection: 'column'
  },
  friendsAndGroupsBox: {

    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: '10%',

  },
  profileBox: {
    flexDirection: 'row',

  },
  statusSub: {
    flexDirection: 'row',
    fontSize: 12,
    color: '#38ada9',
    alignSelf: 'center',
    textTransform: 'uppercase',
    marginLeft: 5

  },
  statusSub2: {
    flexDirection: 'row',
    fontSize: 15,
    color: '#38ada9',
    alignSelf: 'center',
    marginLeft: 10,

  },
  Avatar: {
    width: 120,
    height: 120,
    borderColor: '#00b894',
    borderWidth: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'space-around',
    resizeMode: 'contain'
  },
  profiletitle: {

    flexWrap: 'wrap',
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'space-around',
    alignItems: 'center'

  },
  profileBoxText: {

    fontSize: 20,
    fontFamily: 'sans-serif-medium',
    color: '#218c74',
    fontWeight: 'bold',
    marginLeft: 20,

  },
  profileBoxText2: {

    fontSize: 20,
    fontFamily: 'sans-serif-medium',
    color: '#218c74',
    fontWeight: 'bold',
    marginLeft: 10
  },
  add: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    marginBottom: 0,

    marginTop: 6,
    marginLeft: 2,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    backgroundColor: '#00b894'
  },
  avatarContainer: {
    shadowColor: '#151734',
    shadowRadius: 15,
    shadowOpacity: 0.4,
  },
  name: {
    margin: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#079992',
    fontFamily: 'sans-serif-condensed',

  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderTopColor: 'green',
    borderTopWidth: 1,
    borderBottomColor: 'green',
    borderBottomWidth: 1,
    backgroundColor: 'white'
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#218c74',
    fontSize: 16,
    fontWeight: '300',
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center'
  },
  statTitle: {
    color: '#33d9b2',
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center'
  },
  AboutMe: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    paddingTop: 0,
    backgroundColor: 'white'
  },
  aboutMeTitleAndIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutMeTitle: {
    marginTop: 5,

    fontSize: 20,
    fontWeight: 'bold',
    color: '#33d9b2',
    fontFamily: 'sans-serif-condensed',
  },
  aboutMeText: {
    color: '#079992',
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 50

  },
  textInput: {
    alignSelf: 'stretch',
    color: 'white',
    padding: 10,
    backgroundColor: '#079992',
    borderTopWidth: 2,
    borderTopColor: 'white',
    fontSize: 15
  }
});
