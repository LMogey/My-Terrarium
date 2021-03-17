import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, Text, RefreshControl, ScrollView, SafeAreaView} from 'react-native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { AntDesign, Octicons, MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import {  Card } from 'react-native-paper';

import Header from './header';
import reportedPeople from './reportedPeople';
import reportedComments from './reportedComments';
import reportedPosts from './reportedPosts';
import reportedQuestions from './reportedQuestions';
import reportedGroups from './reportedGroups'

function wait(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}


function homeAdmin({ navigation }) {

  const [sizePeople, setSizePeople] = useState('')
  const [sizePostI, setSizePostI] = useState('')
  const [sizePostS, setSizePostS] = useState('')
  const [sizeCommentI, setSizeCommentI] = useState('')
  const [sizeCommentS, setSizeCommentS] = useState('')
  const [sizeQuestionsS, setSizeQuestionsS] = useState('')
  const [sizeGroups, setSizeGroups] = useState('')

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {
      getPeopleNumber();
      getpostNumberI();
      getCommentNumber();
      getQuestionNumber();
      getGroupNumber()
      setRefreshing(false)

    })
  }, [refreshing])



  useEffect(() => { 
    getPeopleNumber();
    getpostNumberI();
    getCommentNumber();
    getQuestionNumber();
    getGroupNumber()
  }, [])


  const getPeopleNumber = () => {
    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('People').get().then(snap => {
      const size = snap.size;
      setSizePeople(size)
    })
  }

  const getpostNumberI = () => {
    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Posts').get().then(snap => {
      const size = snap.size;
      setSizePostI(size)
    })
    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Posts').get().then(snap => {
      const size = snap.size;
      setSizePostS(size)
    })
  }

  const getCommentNumber = () => {
    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Comments').get().then(snap => {
      const size = snap.size;
      setSizeCommentI(size)
    })
    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Comments').get().then(snap => {
      const size = snap.size;
      setSizeCommentS(size)
    })
  }

  const getQuestionNumber = () => {
    firebase.firestore().collection('Spam').doc('pCKi6n3LETLwWuoPcxuZ').collection('Questions').get().then(snap => {
      const size = snap.size;
      setSizeQuestionsS(size)
    })
  }

  const getGroupNumber = () => {
    firebase.firestore().collection('Inappropriate').doc('ZU2s662Qmg055Sc1Qwn5').collection('Groups').get().then(snap => {
      const size = snap.size;
      setSizeGroups(size)
    })
  }

  return (


    <View style={styles.container}>
      <Header />
      <View>
      <ScrollView  refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={{ height: 80, marginTop: 10, marginHorizontal: 10 }}>
          <Card style={[(sizePeople === 3) ? { backgroundColor: '#EA2027' } : ((sizePeople === 2) ? styles.orange : ((sizePeople === 1) ? styles.yellow : styles.green))]} onPress={() => navigation.navigate('reportedPeople')}>
            <Card.Content>
              <Text style={styles.Title}>People</Text>
              <Text style={styles.subtitle}>Reported Cases</Text>
            </Card.Content>
            <Card.Content>
              <Text style={styles.number}>Inappropriate: {sizePeople}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={{ height: 80, marginTop: 25, marginHorizontal: 10 }}>
          <Card style={[(sizePostS >= 3) || (sizePostI === 3) ? { backgroundColor: '#EA2027' } : ((sizePostS === 2) || (sizePostI === 2) ? styles.orange : ((sizePostS === 1) || (sizePostI === 1) ? styles.yellow : styles.green))]} onPress={() => navigation.navigate('reportedPosts')}>
            <Card.Content>
              <Text style={styles.Title}>Posts</Text>
              <Text style={styles.subtitle}>Reported Cases</Text>
            </Card.Content>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text style={styles.number}>Spam : {sizePostS}</Text>
              <Text style={styles.number}>Inappropriate: {sizePostI}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={{ height: 80, marginTop: 25, marginHorizontal: 10 }}>
          <Card style={[(sizeCommentS >= 3) || (sizeCommentI === 3) ? { backgroundColor: '#EA2027' } : ((sizeCommentS === 2) || (sizeCommentI === 2) ? styles.orange : ((sizeCommentS === 1) || (sizeCommentI === 1) ? styles.yellow : styles.green))]} onPress={() => navigation.navigate('reportedComments')}>
            <Card.Content>
              <Text style={styles.Title}>Comments</Text>
              <Text style={styles.subtitle}>Reported Cases</Text>
            </Card.Content>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text style={styles.number}>Spam : {sizeCommentS}</Text>
              <Text style={styles.number}>Inappropriate: {sizeCommentI}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={{ height: 80, marginTop: 25, marginHorizontal: 10 }}>
          <Card style={[(sizeGroups >= 3) ? { backgroundColor: '#EA2027' } : ((sizeGroups === 2) ? styles.orange : ((sizeGroups === 1) ? styles.yellow : styles.green))]} onPress={() => navigation.navigate('reportedGroups')}>
            <Card.Content>
              <Text style={styles.Title}>Groups</Text>
              <Text style={styles.subtitle}>Reported Cases</Text>
            </Card.Content>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text style={styles.number}>Spam : {sizeGroups}</Text>
            </Card.Content>
          </Card>
        </View>
        <View style={{ height: 80, marginTop: 25, marginHorizontal: 10 , marginBottom:30}}>
          <Card style={[(sizeQuestionsS >= 3) ? { backgroundColor: '#EA2027' } : ((sizeQuestionsS === 2) ? styles.orange : ((sizeQuestionsS === 1) ? styles.yellow : styles.green))]} onPress={() => navigation.navigate('reportedQuestions')}>
            <Card.Content>
              <Text style={styles.Title}>Questions</Text>
              <Text style={styles.subtitle}>Reported Cases</Text>
            </Card.Content>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text style={styles.number}>Spam : {sizeQuestionsS}</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      </View>
    </View >
  );

}


const Tab = createMaterialBottomTabNavigator();

export default function BottomNav({ route, navigation, props }) {

  return (


    <Tab.Navigator initialRouteName="homeAdmin"
      barStyle={{ backgroundColor: 'black' }}
    >

      <Tab.Screen name="homeAdmin" component={homeAdmin}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color='green' />
          )
        }}
      />
      <Tab.Screen name="reportedPeople" component={reportedPeople}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people-outline" size={24} color="green" />
          )
        }}
      />
      <Tab.Screen name="reportedPosts" component={reportedPosts}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-card-details-outline" size={24} color="green" />
          )
        }}
      />
      <Tab.Screen name="reportedComments" component={reportedComments}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="card-text-outline" size={24} color="green" />
          )
        }}
      />
      <Tab.Screen name="reportedGroups" component={reportedGroups}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group-outline" size={24} color="green" />
          )
        }}
      />
    <Tab.Screen name="reportedQuestions" component={reportedQuestions}
        options={{
          tabBarLabel: false,

          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="frequently-asked-questions" size={24} color="green" />
          )
        }}
      />
    </Tab.Navigator>

  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#636e72',
  },
  Title: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white'
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: 'white'
  },
  number: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 15,
    color: 'white'
  },
  red: {
    backgroundColor: '#EA2027'
  },
  orange: {
    backgroundColor: '#ff793f'
  },
  yellow: {
    backgroundColor: '#fbc531'
  },
  green: {
    backgroundColor: '#7bed9f'
  }
});