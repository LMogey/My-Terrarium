import React, { useState, Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import MultiSelect from 'react-native-multiple-select';
import { useNavigation } from '@react-navigation/native';
import Header from '../elements/header';
import { Avatar } from 'react-native-elements';

export default class Search extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      users: [],
      checked: false,
      selectedItems: [],
      items: [],
      groups:[]
    };
  }

  loadUsers = async () => {
    firebase.firestore()
      .collection('Users')
      .orderBy('displayName', 'asc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { displayName, preferences , avatar} = doc.data();
          data.push({
            id: doc.id,
            displayName,
            preferences,
            avatar
          });
        })

        this.setState({ users: data, inMemoryUsers: data, isLoading: false });
      })

  };

  loadGroups = async () => {
    firebase.firestore()
      .collection('groups')
      .orderBy('created', 'asc')
      .get()
      .then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const { name, image, tags } = doc.data();
          data.push({
            id: doc.id,
            name,
            image,
            tags
          });
        })

        this.setState({ groups: data, inMemoryGroups: data, isLoading: false });
      })

  };

  componentDidMount() {
    this.setState({ isLoading: true });
    this.loadUsers();
    this.loadGroups();
    this.getPrefernces();
    this.checkForArticlePrefs();
  }

  renderItem = ({ item }) => (

    <TouchableOpacity onPress={() => this.props.navigation.navigate('otherUserProfile', { user: item.id })}>
      <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.avatarContainer, { flexDirection: 'column' }}>
            <Avatar style={styles.Avatar}
              source={item.avatar ?
                { uri: item.avatar } : require('../image/defaultUser.jpg')}
            />
          </View>
          <View style={{ flexDirection: 'column' }}>
            <View style={{ justifyContent: 'space-between' }}>
              <Text style={styles.displayNameText}>
                {item.displayName}
              </Text>
            </View>
            <View style={{ flexDirection:'row' ,justifyContent: 'space-evenly'}}>
              {item.preferences.map((item, key) => (
                <Text key={key} style={styles.itemNameText} numberOfLines={1}>|{item}|</Text>
              ))
              }
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  renderItemGroups = ({ item }) => (

    <TouchableOpacity onPress={() => this.props.navigation.navigate('groupPage', { groupID: item.id })}>
      <View style={{ minHeight: 50, borderWidth: 0.5, margin: 5 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.avatarContainer, { flexDirection: 'column' }}>
            <Avatar style={styles.Avatar}
              source={item.image ?
                { uri: item.image } : require('../image/defaultUser.jpg')}
            />
          </View>
          <View style={{ flexDirection: 'column' }}>
            <View style={{ justifyContent: 'space-between' }}>
              <Text style={styles.displayNameText}>
                {item.name}
              </Text>
            </View>
            <View style={{ flexDirection:'row' ,justifyContent: 'space-evenly'}}>
              {item.tags.map((item, key) => (
                <Text key={key} style={styles.itemNameText} numberOfLines={1}>|{item}|</Text>
              ))
              }
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  searchUsers = value => {
    const filteredUsers = this.state.inMemoryUsers.filter(users => {
      let userLowercase = (
        users.displayName
      ).toLowerCase();

      let searchTermLowercase = value.toLowerCase();

      return userLowercase.indexOf(searchTermLowercase) > -1;
    });
    this.setState({ users: filteredUsers });
  };

  
  searchGroups = value => {
    const filteredGroups = this.state.inMemoryGroups.filter(groups => {
      let groupLowercase = (
        groups.name
      ).toLowerCase();

      let searchTermLowercase = value.toLowerCase();

      return groupLowercase.indexOf(searchTermLowercase) > -1;
    });
    this.setState({ groups: filteredGroups });
  };

  onSelectedItemsChange = selectedItems => {
    this.setState({ selectedItems });
    if (selectedItems.length !== 0) {
      firebase.firestore().collection('Users').where('preferences', 'array-contains-any', selectedItems)
        .get().then(
          querySnapshot => {
            const data = [];
            querySnapshot.forEach(doc => {
              const { displayName, preferences, avatar } = doc.data();
              data.push({
                id: doc.id,
                displayName,
                preferences,
                avatar
              });
            })

            this.setState({ users: data, inMemoryUsers: data, isLoading: false });

          })
          firebase.firestore().collection('groups').where('tags', 'array-contains-any', selectedItems).get().then(
            querySnapshot => {
              const data =[];
              querySnapshot.forEach(doc => {
                const {name, tags, image} =doc.data();
                data.push({
                  id: doc.id,
                  name,
                  tags,
                  image
                });
              })
              
              this.setState({ groups: data, inMemoryGroups: data, isLoading: false });
            }
          )
    } else {
      firebase.firestore()
        .collection('Users')
        .orderBy('displayName', 'asc')
        .get()
        .then(querySnapshot => {
          const data = [];
          querySnapshot.forEach(doc => {
            const { displayName, preferences , avatar} = doc.data();
            data.push({
              id: doc.id,
              displayName,
              preferences,
              avatar
            });
          })

          this.setState({ users: data, inMemoryUsers: data, isLoading: false });
        })
        firebase.firestore().collection('groups').orderBy('created', 'asc').get().then(
          querySnapshot => {
            const data =[];
            querySnapshot.forEach(doc => {
              const {name, tags, image} =doc.data();
              data.push({
                id: doc.id,
                name,
                tags,
                image
              });
            })
            
            this.setState({ groups: data, inMemoryGroups: data, isLoading: false });
          }
        )
    
    }
  };

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

        this.setState({ items: list });
      })
  }

  checkForArticlePrefs = () => {
    const { route } = this.props;
    const { preferences } = route.params;
    
    if (preferences == null) {
      console.log('no article ref')
    } else {
      this.onSelectedItemsChange(preferences);
    }
  }

  render() {
    const { navigation } = this.props;
    const { selectedItems } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={{ backgroundColor: '#2f363' }} />
        <Header />
        <View >
          <View style={{ flexDirection: 'row', borderWidth: 0.5, borderColor: '#7d90a0', margin: 2, backgroundColor: 'white' }}>
            <AntDesign name="search1" size={25} color="black" style={{ marginTop: 12, marginLeft: 2 }} />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#dddddd"
              style={styles.searchText}
              onChangeText={value => this.searchUsers(value)}
            />
          </View>
          <View style={{ marginTop: 7, marginHorizontal: 5 }}>
            <MultiSelect
              hideTags
              items={this.state.items}
              uniqueKey="name"
              ref={component => {
                this.multiSelect = component;
              }}
              fixedHeight={true}
              onSelectedItemsChange={this.onSelectedItemsChange}
              selectedItems={selectedItems}
              selectText="Filter"
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
        </View>
        <View style={{ flex: 1, backgroundColor: 'white' }}>
          {this.state.isLoading ? (
            <View
              style={{
                ...StyleSheet.absoluteFill,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ActivityIndicator size="large" color="black" />
            </View>
          ) : null}
         <View style={{ backgroundColor: '#81ecec', flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ marginLeft: 5, fontSize: 20, color: '#6c5ce7' }}>Users</Text>
            <Feather name="map-pin" size={24} color="black" style={{ alignSelf: 'baseline', alignItems: 'baseline', marginRight:3 }} onPress={() => navigation.navigate('mapPeople')} />
          </View>
          <View style={{ height: 200 }}>
            <FlatList
              data={this.state.users}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => index.toString()}

              ListEmptyComponent={() => (
                <View
                  style={styles.emptyText}
                >
                  <Text style={{ color: 'black' }}>Nothing Found</Text>
                </View>
              )}
            />
          </View>
          <View style={{ backgroundColor: '#ffeaa7' }}>
            <Text style={{ marginLeft: 5, fontSize: 20, color: '#6c5ce7' }}>Groups</Text>
          </View>
          <FlatList
              data={this.state.groups}
              renderItem={this.renderItemGroups}
              keyExtractor={(item, index) => index.toString()}

              ListEmptyComponent={() => (
                <View
                  style={styles.emptyText}
                >
                  <Text style={{ color: 'black' }}>Nothing Found</Text>
                </View>
              )}
            />
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  displayNameText: {
    color: '#00cec9',
    fontSize: 20,
    paddingTop: 10,
    paddingLeft: 10,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  itemNameText: {
    color: '#00b894',
    fontSize: 14,
    margin: 2,
    padding: 1,
    flexWrap: 'wrap',
  },
  searchText: {
    backgroundColor: 'white',
    height: 40,
    width: 360,
    fontSize: 30,
    padding: 0,
    margin: 2,
    color: 'black',
  },
  emptyText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  Avatar: {
    width: 80,
    height: 80,
    borderColor: '#00b894',
    borderWidth: 1,
    margin:5

  },
  avatarContainer: {
    shadowColor: '#151734',
    shadowRadius: 15,
    shadowOpacity: 0.4,
  },
});