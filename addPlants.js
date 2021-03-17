import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Image, Button, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as firebase from 'firebase/app';
import 'firebase/firestore'
import { Content, Card, CardItem, Text } from 'native-base';
import { Ionicons, AntDesign, Entypo, FontAwesome, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import MultiSelect from 'react-native-multiple-select';
import { List } from 'react-native-paper';

export default class addArticle extends React.Component {

    constructor() {
        super();
        this.state = {
            eName: '',
            lName: '',
            image: null,
            expanded: true,
            info: '',
            description: '',
            growth: '',
            plantingArray:[],
            howToArray:[],
            careArray:[],
            diseaseArray:[],
            planting1:'',
            planting2:'',
            planting3:'',
            planting4:'',
            planting5:'',
            planting6:'',
            howToPlant1:'',
            howToPlant2:'',
            howToPlant3:'',
            howToPlant4:'',
            howToPlant5:'',
            howToPlant6:'',
            care1:'',
            care2:'',
            care3:'',
            care4:'',
            care5:'',
            care6:'',
            disease1:'',
            disease2:'',
            disease3:'',
            disease4:'',
            disease5:'',
            disease6:'',
        }

    }

    handlePress = () => this.setState({ expanded: !expanded });

    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }

    onPressButton = () => {
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
                    onPress: this.openCamera
                },
                {
                    text: 'Gallery',
                    onPress: this.openImage
                },
            ],
            { cancelable: false }

        );
    }

    openCamera = async () => {
        const user = firebase.auth().currentUser;
        let permission = await ImagePicker.requestCameraPermissionsAsync();

        if (permission.granted === false) {
            return;
        }
        let picker = await ImagePicker.launchCameraAsync({
            base64: true,
            allowsEditing: true,
            aspect: [1, 1]
        })

        if (picker.cancelled === true) {
            return;
        } else if (picker.cancelled === false) {
            this.uploadPhoto(picker.uri, user.uid)
        }

    }

    openImage = async () => {
        const user = firebase.auth().currentUser;
        let permission = await ImagePicker.requestCameraRollPermissionsAsync();

        if (permission.granted === false) {
            return;
        }
        let picker = await ImagePicker.launchImageLibraryAsync({
            base64: true,
            allowsEditing: true,
            aspect: [1, 1]
        })

        if (picker.cancelled === true) {
            return;
        } else if (picker.cancelled === false) {
            this.uploadPhoto(picker.uri, user.uid)

        }
    }

    uploadPhoto = async (url, imageName) => {
        const time = this.timeAccurate;
        const path = 'plants/' + imageName + '/' + time;

        return new Promise(async (res, rej) => {
            const response = await fetch(url)
            const file = await response.blob()

            let upload = firebase.storage().ref(path).put(file)

            upload.on("state_changed", snapshot => { }, err => {
                rej(err)
            },
                async () => {
                    const url = await upload.snapshot.ref.getDownloadURL();
                    res(url);
                    this.setState({ image: url })
                }
            );
        });
    };

    handleInputs = () => {
        if(this.state.planting1.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting1)})
        }else{

        }
        if(this.state.planting2.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting2)})
        }else{
            
        }
        if(this.state.planting3.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting3)})
        }else{
            
        }
        if(this.state.planting4.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting4)})
        }else{
            
        }
        if(this.state.planting5.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting5)})
        }else{
            
        }
        if(this.state.planting6.length > 0){
            this.setState({plantingArray: this.state.plantingArray.push(this.state.planting6)})
        }else{
            
        }
        if(this.state.howToPlant1.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant1)})
        }else{
            
        }
        if(this.state.howToPlant2.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant2)})
        }else{
            
        }
        if(this.state.howToPlant3.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant3)})
        }else{
            
        }
        if(this.state.howToPlant4.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant4)})
        }else{
            
        }
        if(this.state.howToPlant5.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant5)})
        }else{
            
        }
        if(this.state.howToPlant6.length > 0){
            this.setState({howToArray: this.state.howToArray.push(this.state.howToPlant6)})
        }else{
            
        }
        if(this.state.care1.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care1)})
        }else{
            
        }
        if(this.state.care2.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care2)})
        }else{
            
        }
        if(this.state.care3.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care3)})
        }else{
            
        }
        if(this.state.care4.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care4)})
        }else{
            
        }
        if(this.state.care5.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care5)})
        }else{
            
        }
        if(this.state.care6.length > 0){
            this.setState({careArray: this.state.careArray.push(this.state.care6)})
        }else{
            
        }
        if(this.state.disease1.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease1)})
        }else{
            
        }
        if(this.state.disease2.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease2)})
        }else{
            
        }
        if(this.state.disease3.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease3)})
        }else{
            
        }
        if(this.state.disease4.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease4)})
        }else{
            
        }
        if(this.state.disease5.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease5)})
        }else{
            
        }
        if(this.state.disease6.length > 0){
            this.setState({diseaseArray: this.state.diseaseArray.push(this.state.disease6)})
        }else{
            
        }

        this.handleCreation()
    }

    handleCreation = () => {
        if ((this.state.eName !== null) && (this.state.lName !== null) && (this.state.image !== null) && (this.state.growth !== null) && (this.state.description !== null) && (this.state.info !== null) && (this.state.diseaseArray !== null) && (this.state.howToArray !== null) && (this.state.careArray !== null) && (this.state.plantingArray !== null)) {
            firebase.firestore().collection('plants').add({
                Description: this.state.description,
                Growth: this.state.growth,
                englishName: this.state.eName,
                latinName: this.state.lName,
                info: this.state.info,
                image: this.state.image,
                plantingTime:this.state.plantingArray,
                howToPlant:this.state.howToArray,
                diseases:this.state.diseaseArray,
                care:this.state.careArray
            }).catch(error => {
                Alert.alert(error);
            })

            this.props.navigation.navigate('PlantsAdmin')
            this.setState({
                eName: '',
                lName: '',
                image: null,
                expanded: true,
                info: '',
                description: '',
                growth: '',
                plantingArray:[],
                howToArray:[],
                careArray:[],
                diseaseArray:[],
                planting1:'',
                planting2:'',
                planting3:'',
                planting4:'',
                planting5:'',
                planting6:'',
                howToPlant1:'',
                howToPlant2:'',
                howToPlant3:'',
                howToPlant4:'',
                howToPlant5:'',
                howToPlant6:'',
                care1:'',
                care2:'',
                care3:'',
                care4:'',
                care5:'',
                care6:'',
                disease1:'',
                disease2:'',
                disease3:'',
                disease4:'',
                disease5:'',
                disease6:'',
            })


        } else {
            Alert.alert('Make sure all fields are filled!')
        }

    }
    render() {

        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="md-arrow-back" size={30} style={styles.headerIcon}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <Text style={styles.headerText}>Adding Plant</Text>

                </View>
                <Button title='Add' onPress={this.handleInputs} />
                <ScrollView>
                    <List.Section style={{ backgroundColor: '#636e72' }}>
                        <List.Accordion
                            title="Add Name"
                            titleStyle={{ color: 'white' }}
                            left={props => <FontAwesome name="text-width" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    numberOfLines={1}
                                    style={styles.input}
                                    placeholder='English Name'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    onChangeText={(val) => this.updateInputVal(val, 'eName')}
                                    value={this.state.eName}
                                ></TextInput>
                                <TextInput
                                    numberOfLines={1}
                                    style={styles.input}
                                    placeholder='Latin Name'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    onChangeText={(val) => this.updateInputVal(val, 'lName')}
                                    value={this.state.lName}
                                ></TextInput>
                            </View>

                        </List.Accordion>
                        <List.Accordion
                            title="Add Image"
                            titleStyle={{ color: 'white' }}
                            left={props => <Entypo name="image" size={24} color="white" />}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={40} color="#b2bec3" style={styles.camera} onPress={() => this.onPressButton()} />
                            <View style={{ marginHorizontal: 22, marginTop: 0, height: 350 }}>
                                <Image source={{ uri: this.state.image }} style={styles.imagePost} />
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Add Growth"
                            titleStyle={{ color: 'white' }}
                            left={props => <Ionicons name="ios-information-circle-outline" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputGrowth}
                                    placeholder='Growth'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'growth')}
                                    value={this.state.growth}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Add Description"
                            titleStyle={{ color: 'white' }}
                            left={props => <Ionicons name="ios-information-circle-outline" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputdesciption}
                                    placeholder='Description'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    onChangeText={(val) => this.updateInputVal(val, 'description')}
                                    value={this.state.description}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Add Information"
                            titleStyle={{ color: 'white' }}
                            left={props => <Ionicons name="ios-information-circle-outline" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputMain}
                                    placeholder='Information'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    onChangeText={(val) => this.updateInputVal(val, 'info')}
                                    value={this.state.info}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Planting Environment"
                            titleStyle={{ color: 'white' }}
                            left={props => <FontAwesome name="sun-o" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting1')}
                                    value={this.state.planting1}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting2')}
                                    value={this.state.planting2}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting3')}
                                    value={this.state.planting3}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting4')}
                                    value={this.state.planting4}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting5')}
                                    value={this.state.planting5}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='planting Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'planting6')}
                                    value={this.state.planting6}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="How to Plant"
                            titleStyle={{ color: 'white' }}
                            left={props => <FontAwesome5 name="seedling" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant1')}
                                    value={this.state.howToPlant1}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant2')}
                                    value={this.state.howToPlant2}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant3')}
                                    value={this.state.howToPlant3}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant4')}
                                    value={this.state.howToPlant4}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant5')}
                                    value={this.state.howToPlant5}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='howToPlant Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'howToPlant6')}
                                    value={this.state.howToPlant6}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Plant Care"
                            titleStyle={{ color: 'white' }}
                            left={props => <Feather name="heart" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care1')}
                                    value={this.state.care1}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care2')}
                                    value={this.state.care2}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care3')}
                                    value={this.state.care3}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care4')}
                                    value={this.state.care4}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care5')}
                                    value={this.state.care5}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='care Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'care6')}
                                    value={this.state.care6}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            title="Diseases"
                            titleStyle={{ color: 'white' }}
                            left={props => <MaterialCommunityIcons name="bandage" size={24} color="white" />}>
                            <View >
                                <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease1')}
                                    value={this.state.disease1}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease2')}
                                    value={this.state.disease2}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease3')}
                                    value={this.state.disease3}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease4')}
                                    value={this.state.disease4}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease5')}
                                    value={this.state.disease5}
                                ></TextInput>
                                 <TextInput
                                    style={styles.inputPlantingTime}
                                    placeholder='disease Info'
                                    placeholderTextColor='black'
                                    selectionColor="#fff"
                                    textAlignVertical='top'
                                    multiline={true}
                                    numberOfLines={2}
                                    onChangeText={(val) => this.updateInputVal(val, 'disease6')}
                                    value={this.state.disease6}
                                ></TextInput>
                            </View>
                        </List.Accordion>
                    </List.Section>
                </ScrollView>
            </View>
        );

    }
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
        paddingRight: 70,
        paddingLeft: 100,

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
        marginBottom: 10
    },
    input: {
        width: 300,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.7)',
        marginBottom: 10,
        color: 'black',
        paddingHorizontal: 16,
        borderRadius: 25,
        fontSize: 16,
        marginVertical: 10,
    },
    inputMain: {
        width: 300,
        maxHeight: 600,
        minHeight: 200,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
    },
    imagePost: {
        width: '100%',
        height: '100%',
        borderColor: 'black',
        borderWidth: 0.3
    },
    camera: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 5

    },
    inputdesciption: {
        width: 300,
        minHeight: 100,
        maxHeight: 400,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
    },
    inputGrowth: {
        width: 300,
        minHeight: 100,
        maxHeight: 300,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
    },
    inputPlantingTime:{
        width: 300,
        minHeight: 50,
        maxHeight: 200,
        backgroundColor: 'rgba(255,255,255,0.7)',
        color: 'black',
        padding: 10,
        fontSize: 16,
        marginVertical: 10,
    }
});