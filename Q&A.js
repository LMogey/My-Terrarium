import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, Alert } from 'react-native';
import Header from '../elements/header';
import { Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem, Thumbnail, Container, Content, Tabs, Tab, Button } from 'native-base';
import MultiSelect from 'react-native-multiple-select';
import { RadioButton } from 'react-native-paper';

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export default class Questions extends React.Component {

  constructor() {
    super();
    this.state = {
      tags: [],
      selectedItems: [],
      uid: '',
      tabPage: null,
      userQuestions: [],
      AllQuestions: [],
      checked: 'on', 
    }

  }



  onChangeTab = (changeTabProps) => {
    const newTabIndex = changeTabProps.i;
    this.setState({ tabPage: newTabIndex })

  };

  componentDidMount() {
    this.setState({checked: 'on'})
    this.getPrefernces();
    this.getUserQuestions()
    this.getAllQuestionsWithAnswers()
  }

  componentDidUpdate() {
    this.state.userQuestions
    this.state.AllQuestions
  }


  getAllQuestionsWithAnswers = () => {
    
    firebase.firestore().collection('Questions').where("comments", ">", 0).get().then(documentSnapshot => {
      const list = []
      documentSnapshot.forEach(doc => {
        const { avatar, name, created, question, tags, image, user, comments } = doc.data()
        list.push({
          id: doc.id,
          avatar,
          name,
          created,
          question,
          tags,
          image,
          user,
          comments
        })
      })
      this.setState({ AllQuestions: list })
    })
  }

  getAllQuestionsNoAnswers = () => {
    firebase.firestore().collection('Questions').where("comments", "==", 0).get().then(documentSnapshot => {
      const list = []
      documentSnapshot.forEach(doc => {
        const { avatar, name, created, question, tags, image, user, comments } = doc.data()
        list.push({
          id: doc.id,
          avatar,
          name,
          created,
          question,
          tags,
          image,
          user,
          comments
        })
      })
      this.setState({ AllQuestions: list })
    })
  }
  
  getUserQuestions = () => {
    const user = firebase.auth().currentUser
    this.setState({uid: user.uid})
    firebase.firestore().collection('Questions').where('user', '==', user.uid).onSnapshot(documentSnapshot => {
      const list = []
      documentSnapshot.forEach(doc => {
        const { avatar, name, created, question, tags, image, user, comments } = doc.data()
        list.push({
          id: doc.id,
          avatar,
          name,
          created,
          question,
          tags,
          image,
          user,
          comments
        })
      })
      this.setState({ userQuestions: list })
    })
  }

  getPrefernces = () => {
    firebase.firestore().collection('preferences').get()
      .then(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { name } = doc.data();
          list.push({
            id: doc.id,
            name
          });
        })

        this.setState({ tags: list });
      })
  }

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
    if (selectedItems.length !== 0) {
      firebase.firestore().collection('Questions').where('tags', 'array-contains-any', selectedItems).get().then(documentSnapshot => {
        const list = []
        documentSnapshot.forEach(doc => {
          const { avatar, name, created, question, tags, image, user, comments } = doc.data()
          list.push({
            id: doc.id,
            avatar,
            name,
            created,
            question,
            tags,
            image,
            user,
            comments
          })
        })
        this.setState({ AllQuestions: list })
      })

    } else {
      firebase.firestore().collection('Questions').orderBy('created', 'asc').onSnapshot(documentSnapshot => {
        const list = []
        documentSnapshot.forEach(doc => {
          const { avatar, name, created, question, tags, image, user, comments } = doc.data()
          list.push({
            id: doc.id,
            avatar,
            name,
            created,
            question,
            tags,
            image,
            user,
            comments
          })
        })
        this.setState({ AllQuestions: list })
      })
    }
  };

  optionsButtonOthers = (ID) => {
    Alert.alert('What would you like to do?',
      'Would you like to report?',
      [
        {
          text: 'Report',
          onPress: () => this.reportSpam(ID)
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

  reportSpam = (ID) => {
    const user = firebase.auth().currentUser;
    const increment = firebase.firestore.FieldValue.increment(1);
    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions')
    .doc(ID).get()
    .then(docSnapshot => {
        if (docSnapshot.exists) {
          firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions')
          .where('reporting', '==', ID).where('reporter', 'array-contains-any', [user.uid]).get().then(doc => {
              if (doc.empty) {
                firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').doc(ID).update({
                    reporter: firebase.firestore.FieldValue.arrayUnion(user.uid),
                    number:increment
                })
              } else {
                Alert.alert('You have already reported this!')
              }
          })
        } else {
                firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').doc(ID).set({
                  reporting: ID,
                  reporter: [user.uid],
                  report: [user.uid, ID],
                  reportedTime: firebase.firestore.FieldValue.serverTimestamp(),
                  number:1,
  
              })
              Alert.alert('Thank you for reporting! We appreciate your feedback!')
        }
    })
  }

  optionsButton = (ID) => {
    Alert.alert('What would you like to do?',
      'Would you like to Delete?',
      [
        {
          text: 'Delete',
          onPress: () => this.deletePost(ID)
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

  deletePost = (QID) => {
    Alert.alert(
      "Alert",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => this.deleteComplete(QID) }
      ],
      { cancelable: false }
    );
  }

  deleteComplete = (QuestionID) => {
    const user = firebase.auth().currentUser;
    firebase.firestore().collection('Questions').doc(QuestionID)
      .delete().then(function () {
        Alert.alert('Post Deleted!')
      }).catch(function (error) {
        console.error("Error removing document: ", error);
      });
    firebase.firestore().collection('notifications').doc(user.uid).collection('COMMENTALERTS').where('postID', '==', QuestionID)
      .get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          doc.ref.delete();
        })
      })
      firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').doc(QuestionID).delete();

  }

  render() {
    const { selectedItems } = this.state;
    return (

      <View style={styles.container}>
        <Header />
        <View>
          <View style={{ flexDirection: 'row', marginBottom: 5 }}>
            <View style={{ width: '40%', marginVertical: 10, height: 20 }}>

              <MultiSelect
                styleListContainer={{ height: 180 }}
                hideTags
                items={this.state.tags}
                uniqueKey="name"
                ref={component => {
                  this.multiSelect = component;
                }}
                styleSelectorContainer={{ position: 'relative', zIndex: 1 }}
                fixedHeight={true}
                onSelectedItemsChange={this.onSelectedItemsChange}
                selectedItems={selectedItems}
                selectText="Filter Questions"
                onChangeInput={text => console.log(text)}
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#00b894"
                selectedItemIconColor="#00b894"
                itemTextColor="#000"
                displayKey="name"
                submitButtonColor="#6c5ce7"
                submitButtonText="Submit"
                searchInputStyle={{ color: '#CCC', height: 50 }}
              />

            </View>
            <View style={{flexDirection:'column', width: '20%', height:50, alignItems:'center'}}>
            <View style={{  flexDirection:'row'}}>
              <RadioButton
                value="on"
                status={this.state.checked === 'on' ? 'checked' : 'unchecked'}
                onPress={() => {this.setState({checked: 'on'}), this.getAllQuestionsWithAnswers()}}
              />
              <RadioButton
                value="off"
                status={this.state.checked === 'off' ? 'checked' : 'unchecked'}
                onPress={() => {this.setState({checked: 'off'}), this.getAllQuestionsNoAnswers()}}
              />
            </View>
            {this.state.checked === 'on' ?  <Text style={{color:'blue'}}>Answers</Text> : <Text style={{color:'red'}}>No Answers</Text>}
           
            </View>
            <Button style={{ width: '40%', backgroundColor: '#ffeaa7', justifyContent: 'center', borderWidth: 1, borderColor: '#fdcb6e', height: 50 }} onPress={() => this.props.navigation.navigate('addQuestion')}>
              <Text style={{ fontSize: 20 }}>Ask</Text>
            </Button>
          </View>
        </View>
        <Container>
          <Tabs page={this.state.tabPage}
            onChangeTab={this.onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }} tabContainerStyle={{ height: 40 }}>
            <Tab heading='All Questions' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
              <FlatList
                ListEmptyComponent={() => (
                  <View style={styles.container}>
                    <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                    <View style={styles.textNotLoadedBox}>
                      <Text style={styles.textIfNotLoaded}>No Questions! </Text>

                    </View>
                  </View>
                )}

                data={this.state.AllQuestions.sort((a, b) => a.created > b.created ? -1 : 1)}
                keyExtractor={(item) => (item.id)}
                renderItem={({ item }) => {
                  return (true) ?
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
                          <Text style={styles.titleText}>{item.name}</Text>
                          <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignContent: 'space-between' }}>
                            {item.tags.map((item, key) => (
                              <Text key={key} style={{
                                fontFamily: 'sans-serif-light',
                                fontWeight: 'normal',
                                color: '#6c5ce7', fontSize: 15, paddingRight: 5
                              }} numberOfLines={1}>|{item}|</Text>
                            ))
                            }
                          </View>
                        </View>
                      </CardItem>
                      <CardItem cardBody style={{ marginHorizontal: 5 }}>
                        <Text style={styles.bodyText} numberOfLines={3}>{item.question}</Text>
                      </CardItem>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>

                      </View>
                      <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
                        {this.state.uid === item.user ? <Entypo name="dots-three-horizontal" size={30} color="white" /> :
                          <Entypo name="dots-three-horizontal" size={30} color="green" onPress={() => this.optionsButtonOthers(item.id)} />
                        }
                        <View>
                          <Text>{item.comments}</Text>
                          <Entypo name="chat" size={30} color="green" onPress={() => this.props.navigation.navigate('commentPQuestion', { postCSection: item.id, postUsersID: item.user })} />
                        </View>
                      </View>
                    </Card>
                    : null
                }}>

              </FlatList>
            </Tab>
            <Tab heading='My Questions' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
              <FlatList
                ListEmptyComponent={() => (
                  <View style={styles.container}>
                    <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
                    <View style={styles.textNotLoadedBox}>
                      <Text style={styles.textIfNotLoaded}>No Questions! </Text>

                    </View>
                  </View>
                )}

                data={this.state.userQuestions.sort((a, b) => a.created > b.created ? 1 : -1)}
                keyExtractor={(item) => (item.id)}
                renderItem={({ item }) => {
                  return (true) ?
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
                          <Text style={styles.titleText}>{item.name}</Text>
                        </View>
                      </CardItem>
                      <CardItem cardBody style={{ marginHorizontal: 5 }}>
                        <Text style={styles.bodyText} numberOfLines={3}>{item.question}</Text>
                      </CardItem>
                      <View style={{ flexDirection: 'row', margin: 16, justifyContent: 'space-between' }}>
                        <Entypo name="dots-three-horizontal" size={30} color="green" onPress={() => this.optionsButton(item.id)} />
                        <View>
                          <Text>{item.comments}</Text>
                          <Entypo name="chat" size={30} color="green" onPress={() => this.props.navigation.navigate('commentPQuestion', { postCSection: item.id, postUsersID: item.user })} />
                        </View>
                      </View>
                    </Card>
                    : null
                }}>

              </FlatList>
            </Tab>
          </Tabs>
        </Container>
      </View>

    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'

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
    paddingRight: 145,
    paddingLeft: 110,

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
    paddingRight: 10,
    fontSize: 18
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