import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image, Button, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Text } from 'native-base';
import { Ionicons, AntDesign } from '@expo/vector-icons';

export default function ArticlesAdmin({ navigation }) {

  const [articles, setArticles] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [inMemoryArticles, setInMemoryArticles] = useState([])

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {
      setRefreshing(false)
      getArticles()
    })
  }, [refreshing])

  function wait(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  useEffect(() => {
    getArticles();

  }, [])

  const getArticles = () => {
    firebase.firestore()
      .collection('Articles')
      .orderBy('Written', 'desc')
      .limit(10)
      .get()
      .then(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { Title, Information, image } = doc.data();
          list.push({
            id: doc.id,
            Title,
            Information,
            image,
          });
        })

        setArticles(list);
        setInMemoryArticles(list)

      });
  }

  const searchArticles = value => {
    const filteredArticles = inMemoryArticles.filter(articles => {
      let articlesLowercase = (
        articles.Title
      ).toLowerCase();

      let searchTermLowercase = value.toLowerCase();

      return articlesLowercase.indexOf(searchTermLowercase) > -1;
    });
    setArticles(filteredArticles)
  };

  
  const deleteThis = (ID) => {
    Alert.alert('Delete this Article?',
        'It will be gone for good',
        [
            {
                text: 'Ok',
                onPress: () => deleteForSure(ID)
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

const deleteForSure = (id) => {

    firebase.firestore().collection('Articles').doc(id).delete();
    
}


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Articles</Text>

      </View>
      <Button title='Add Article' onPress={() => navigation.navigate('addArticle')}></Button>
      <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white', marginTop:10 }}>
            <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
            <TextInput
              placeholder="Search Articles"
              placeholderTextColor="#dddddd"
              style={{width:'100%'}}
              onChangeText={value => {searchArticles(value)}}
            />
          </View>
      <View style={{ height: 500, marginTop:0 }}>
        <FlatList
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
          data={articles}
          keyExtractor={(item, index) => index.toString()}

          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('articlePageAdmin', { article: item })}>
              <Card style={{ marginRight: 5, marginLeft: 5, width: 400, marginTop:0 }}
                key={item.id}
                title={item.Title}>
                <CardItem header style={styles.title}>
                  <Text style={styles.titleText}>{item.Title}</Text>
                  <AntDesign name="delete" size={30} color="red"  onPress={() => deleteThis(item.id)} />
                </CardItem>
                <CardItem cardBody style={{ marginHorizontal: 5 }}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                </CardItem>
                <CardItem cardBody style={{ marginHorizontal: 5 }}>
                  <Text style={styles.bodyText} numberOfLines={3}>{item.Information}</Text>
                </CardItem>

              </Card>
            </TouchableOpacity>

          )}>
        </FlatList>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#636e72',
  },
  title: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#60a3bc',
    textTransform: 'uppercase'
  },
  header: {
    backgroundColor: 'black',
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
    paddingRight: 140,
    paddingLeft: 120,

  },
  headerIcon: {
    color: "green",
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
    height: 200,
    alignContent: 'stretch',
    
  },
  imageHorizontal: {
    width: 150,
    height: 150,
    alignContent: 'stretch',
    marginBottom:10
  }
});