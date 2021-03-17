import React, { Component, useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat, Bubble, Send, SystemMessage } from 'react-native-gifted-chat';
import { IconButton } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'

export default function messageScreen({ props, navigation, route }) {

  const { thread } = route.params;
  const [messages, setMessages] = useState([]);
  const [time, setTime] = useState('');
  const [id, setID] = useState('')
  const [userName, setUserNAme] = useState('')
  // helper method that is sends a message
  const handleSend = async (messages) => {
    const text = messages[0].text;
    const user = firebase.auth().currentUser;
    setID(user.uid)
    setUserNAme(user.displayName)
    firebase.firestore()
      .collection('Threads')
      .doc(thread._id)
      .collection('MESSAGES')
      .add({
        text,
        createdAt: new Date().getTime(),
        user: {
          _id: id,
          displayName: userName
        }
      });

    await firebase.firestore()
      .collection('Threads')
      .doc(thread._id)
      .set(
        {
          latestMessage: {
            text,
            createdAt: new Date().getTime()
          }
        },
        { merge: true }
      );
  }


  useEffect(() => {
    messagesListener();

   
  }, [ thread]);


  const messagesListener = () => {
    const user = firebase.auth().currentUser;
    setID(user.uid)
    firebase.firestore()
      .collection('Threads')
      .doc(thread._id)
      .collection('MESSAGES')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const messages = querySnapshot.docs.map(doc => {
          const firebaseData = doc.data();

          const data = {
            _id: doc.id,
            text: '',
            createdAt: new Date().getTime(),
            ...firebaseData
          };

          if (!firebaseData.system) {
            data.user = {
              ...firebaseData.user,
              name: firebaseData.user.displayName
            };
          }

          return data;
        });

        setMessages(messages);
      });
  }

  function renderBubble(props) {
    return (
      // Step 3: return the component
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            // Here is the color change
            backgroundColor: '#10ac84'
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          }
        }}
      />
    );
  }

  function renderSend(props) {
    return (
      <Send {...props}>
        <View style={styles.sendingContainer}>
          <IconButton icon='send-circle' size={32} color='green' />
        </View>
      </Send>
    );
  }

  function scrollToBottomComponent() {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton icon='chevron-double-down' size={36} color='#6646ee' />
      </View>
    );
  }

  function renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#6646ee' />
      </View>
    );
  }

  function renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        wrapperStyle={styles.systemMessageWrapper}
        textStyle={styles.systemMessageText}
      />
    );
  }

  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Chat</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: id }}
        renderBubble={renderBubble}
        showUserAvatar
        alwaysShowSend
        renderUsernameOnMessage
        renderSend={renderSend}
        scrollToBottomComponent={scrollToBottomComponent}
        renderLoading={renderLoading}
        renderSystemMessage={renderSystemMessage}
      />
    </View>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#55efc4',
    paddingLeft: 10,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,

  },
  headerText: {
    fontSize: 30,
    color: '#079992',
    fontFamily: 'notoserif',
    textShadowColor: 'white',
    textShadowRadius: 1,
    paddingLeft: 60

  },
  headerIcon: {
    color: "black",
    justifyContent: 'flex-start',

  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomComponentContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  systemMessageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  }
});
