import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, RefreshControl, ActivityIndicator, Alert, TouchableOpacity, Button } from 'react-native';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Card, CardItem,  Container, Tabs, Tab} from 'native-base';
import Header from './header';


export default class reportedComments extends Component {

  constructor() {
    super();
    this.state = {
      refreshing: false,
      commentI: [],
      commentS: [],
      tabPage: null,
    }
  }

  componentDidMount() {
    this.getCommentsSpam();
    this.getCommentInappropriate();
  }


  getCommentsSpam = () => {
    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').get().then(documentSnapshot => {
      const list = [];
      documentSnapshot.forEach(doc => {
        const { reporting, reportedTime, reporter, number , postQID} = doc.data();
        list.push({
          id: doc.id,
          reporting,
          reportedTime,
          reporter,
          number,
          postQID
        })
      })
      this.setState({ commentS: list })
    })
  }

  getCommentInappropriate = () => {
    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').get().then(documentSnapshot => {
      const list = [];
      documentSnapshot.forEach(doc => {
        const { reporting, reportedTime, reporter, number , postQID} = doc.data();
        list.push({
          id: doc.id,
          reporting,
          reportedTime,
          reporter,
          number,
          postQID
        })
      })
      this.setState({ commentI: list })
    })
  }


  onChangeTab = (changeTabProps) => {
    const newTabIndex = changeTabProps.i;
    this.setState({ tabPage: newTabIndex })

  };

   onAccepting = (ID) => {
    Alert.alert('Have you completed your task?',
        'This case will now be deleted for good',
        [
            {
                text: 'Ok',
                onPress: () => this.deleteTask(ID)
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

 deleteTask = (caseID) => {
  firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').doc(caseID).delete();
  firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').doc(caseID).delete();
  this.getCommentsSpam();
  this.getCommentInappropriate();
}


  ListIsEmpty() {
    return (
      <View style={styles.container}>
        <Image source={require('../image/cartoonPlant.jpg')} style={styles.imageNotLoaded} />
        <View style={styles.textNotLoadedBox}>
          <Text style={styles.textIfNotLoaded}>No Comments to view at this time</Text>
        </View>
      </View>
    )
  }

  render() {
    return (


      <View style={styles.container}>
        <Header />
        <Container>
          <Tabs page={this.state.tabPage}
            onChangeTab={this.onChangeTab} tabBarUnderlineStyle={{ borderBottomWidth: 1 }} tabContainerStyle={{ height: 40 }}>
            <Tab heading='Spam' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
           
            <FlatList
              style={styles.container}
              data={this.state.commentS.sort((a, b) => a.number > b.number ? -1 : 1)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                return (true) ?
                  <TouchableOpacity style={{ maxHeight: 200, marginVertical: 5, marginHorizontal: 10 }} key={item.id} onPress={() => this.props.navigation.navigate('commentPageAdmin', { commentInfo: item.reporting, post: item.postQID })}>
                    <Card >
                      <CardItem style={{ justifyContent: 'space-between' }}>
                        <Text style={styles.Title}>Case File Comment</Text>
                        <Button title='Accept' style={{width: 100, justifyContent: 'center', marginBottom: 5 }}
                          onPress={() => this.onAccepting(item.id)}></Button>
                      </CardItem>
                      <CardItem>
                        <Text style={styles.Title}>Number of reports: {item.number}</Text>
                      </CardItem>
                      <CardItem>
                        <Text style={styles.Title}>Comment ID: {item.reporting}</Text>
                      </CardItem>
                    </Card>
                  </TouchableOpacity>
                  : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
              }}

              ListEmptyComponent={this.ListIsEmpty()}
            >
            </FlatList>
            </Tab>
            <Tab heading='Inappropriate' tabStyle={{ backgroundColor: 'white' }} textStyle={{ color: '#00b894' }} activeTabStyle={{ backgroundColor: '#55efc4' }} activeTextStyle={{ color: 'white' }}>
              <FlatList
                style={styles.container}
                data={this.state.commentI.sort((a, b) => a.number > b.number ? -1 : 1)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  return (true) ?
                    <TouchableOpacity style={{ height: 200, marginVertical: 10, marginHorizontal: 10 }} key={item.id} onPress={() => this.props.navigation.navigate('commentPageAdmin', { commentInfo: item.reporting, post: item.postQID })}>
                      <Card >
                        <CardItem style={{ justifyContent: 'space-between' }}>
                          <Text style={styles.Title}>Case File Comment</Text>
                          <Button title='Accept' style={{ backgroundColor: 'black', width: 100, justifyContent: 'center', marginBottom: 5 }}
                            onPress={() => this.onAccepting(item.id)}></Button>
                        </CardItem>
                        <CardItem>
                          <Text style={styles.Title}>Number of reports: {item.number}</Text>
                        </CardItem>
                        <CardItem>
                          <Text style={styles.Title}>Comment ID: {item.reporting}</Text>
                        </CardItem>
                      </Card>
                    </TouchableOpacity>
                    : <Image source={require('../image/cartoonPlant.jpg')} style={styles.container} />
                }}

                ListEmptyComponent={this.ListIsEmpty()}
              >
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
    backgroundColor: '#636e72',
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
    width: '100%',
    marginTop:100
  },
  textIfNotLoaded: {
    fontSize: 20,
    fontFamily: 'sans-serif-light',
    fontStyle: 'italic',
    color:'white'
  },
  textNotLoadedBox: {
    alignItems: 'center',
    marginTop: 0
  },
});