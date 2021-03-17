import React, {Component} from 'react';
import {StyleSheet, View, Text } from 'react-native';
  import { MaterialCommunityIcons} from '@expo/vector-icons';
  import { useNavigation } from '@react-navigation/native';
  import { Ionicons } from '@expo/vector-icons';


export default function Header() {
  const navigation = useNavigation();
  
    return (
    
        <View style={styles.header}>
        <Ionicons name="ios-menu" size={35} color="green" onPress={() => navigation.openDrawer()}/>
         <Text style={styles.headerText}>My Terrarium</Text>
         <MaterialCommunityIcons name="email-outline" size={30} style={styles.headerIcon} color="green" onPress={() => navigation.navigate('messagesAdmin')}/>
     
         </View>
     
   );
 }
 

const styles = StyleSheet.create({

header:{
    backgroundColor:'black',
    paddingLeft:10,
    height:60,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginBottom:1,
    
  },
  headerText:{
    fontSize:35,
    color:'#079992',
    fontFamily: 'notoserif',
    textShadowColor:'white',
    textShadowRadius:1,
   paddingRight:55,
   paddingLeft:65
  },
  headerIcon:{
    alignItems: 'flex-end',
    
  }
})

 