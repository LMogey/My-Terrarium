import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, LogBox, Image, Dimensions, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Text } from 'native-base';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import MultiSelect from 'react-native-multiple-select';

export default function Articles({ navigation }) {

  const [articles, setArticles] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [plants, setPlants] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [items, setItems] = useState([])
  const [inMemoryPlants, setInMemoryPlants] = useState([])
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => {
      setRefreshing(false)
      setPosts(posts)
    })
  }, [refreshing])

  function wait(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  useEffect(() => {
    getArticles();
    getPlants();
    getPrefernces();

  }, [])

  const getPlants = () => {
    firebase.firestore()
      .collection('plants')
      .orderBy('englishName', 'asc')
      .limit(10)
      .get()
      .then(querySnapshot => {
        const list = [];
        querySnapshot.forEach(doc => {
          const { englishName, image } = doc.data();
          list.push({
            id: doc.id,
            englishName,
            image,
          });
        })

        setPlants(list);
        setInMemoryPlants(list)
      });
  }

  const getArticles = () => {
    firebase.firestore()
      .collection('Articles')
      .orderBy('Written')
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

  const onSelectedItemsChange = selectedItems => {
    setSelectedItems(selectedItems)
    if (selectedItems.length !== 0) {
      firebase.firestore()
        .collection('Articles')
        .where('tags', 'array-contains-any', selectedItems)
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

        })

    } else {
      firebase.firestore()
        .collection('Articles')
        .orderBy('Written')
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

        })

    }
  };

  const getPrefernces = () => {
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

        setItems(list)
      })
  }


 const searchPlants = value => {
    const filteredPlants = inMemoryPlants.filter(plants => {
      let plantLowercase = (
        plants.englishName
      ).toLowerCase();

      let searchTermLowercase = value.toLowerCase();

      return plantLowercase.indexOf(searchTermLowercase) > -1;
    });
    setPlants(filteredPlants)
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Knowledge</Text>

      </View>
      <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white' }}>
            <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
            <TextInput
              placeholder="Search Plants"
              placeholderTextColor="#dddddd"
              style={styles.searchText}
              onChangeText={value => {searchPlants(value)}}
            />
          </View>
      <View style={{ height: 200 }}>
        <FlatList
          horizontal={true}
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
          data={plants}
          keyExtractor={(item, index) => index.toString()}

          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('plantInfo', { plant: item.id })}>
              <Card style={{ marginTop: 10, marginRight: 5, marginLeft: 5, paddingTop: 5, height:200 }}
                key={item.id}
                title={item.englishName}>
                <CardItem header style={styles.title}>
                  <Text style={styles.titleText}>{item.englishName}</Text>
                </CardItem>
                <CardItem cardBody style={{ marginHorizontal: 5, justifyContent: 'center' }}>
                  <Image source={{ uri: item.image }} style={styles.imageHorizontal} />
                </CardItem>
              </Card>
            </TouchableOpacity>

          )}
        >

        </FlatList>
      </View>
      <View style={{ marginTop: 10, marginHorizontal: 3 }}>
        <MultiSelect
          hideTags
          items={items}
          uniqueKey="name"
        
          fixedHeight={true}
          onSelectedItemsChange={onSelectedItemsChange}
          selectedItems={selectedItems}
          selectText="Filter Articles"
          searchInputPlaceholderText="Search Items..."
          onChangeInput={text => console.log(text)}
          tagRemoveIconColor="#CCC"
          tagBorderColor="#CCC"
          tagTextColor="#CCC"
          selectedItemTextColor="#00b894"
          selectedItemIconColor="#00b894"
          itemTextColor="#000"
          displayKey="name"
          searchInputStyle={{ color: '#CCC', height: 50 }}
          hideSubmitButton={true}
        />
      </View>
      <View style={{ height: 500, marginTop:0 }}>
        <FlatList
          horizontal={true}
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
            <TouchableOpacity onPress={() => navigation.navigate('articlePage', { article: item })}>
              <Card style={{ marginRight: 5, marginLeft: 5, width: 400, marginTop:0 }}
                key={item.id}
                title={item.Title}>
                <CardItem header style={styles.title}>
                  <Text style={styles.titleText}>{item.Title}</Text>
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
    backgroundColor:'#55E6C1'
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
    textTransform: 'uppercase'
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
    paddingLeft: 90,

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