import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, TextInput, KeyboardAvoidingView, TouchableOpacity, StatusBar, Alert, AsyncStorage } from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore'

export default class Login extends Component {

    constructor(props) {
        super(props)

        this.state = ({
            email: '',
            password: '',

        })
    }
    updateInputVal = (val, prop) => {
        const state = this.state;
        state[prop] = val;
        this.setState(state);
    }
    //login button
    loginUser = async () => {
        if (this.state.email === '' && this.state.password === '') {
            Alert.alert('Enter details to signin!')
        } else {

        }
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then((res) => {
            this.setState({
                email: '',
                password: ''
            })

        }).then((res) => {
            firebase.firestore().collection('Users').doc(firebase.auth().currentUser.uid).get().then(doc => {
                if (doc.exists) {
                    this.props.navigation.navigate('home')
                } else {
                    firebase.firestore().collection('Admin').doc(firebase.auth().currentUser.uid).get().then(doc => {
                        if (doc.exists) {
                            this.props.navigation.navigate('homeAdmin')
                        } else {

                        }
                    })
                }

            })

        }).catch(function (error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/wrong-password') {
                    Alert.alert('Wrong password.');
                } else if (errorCode === 'auth/invalid-email') {
                    Alert.alert('Wrong email');
                } else {
                    Alert.alert(errorMessage);

                }
            })


        await AsyncStorage.setItem('MyName', this.state.email)
        await AsyncStorage.setItem('myPassword', this.state.password)


    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        try {
            let emails = await AsyncStorage.getItem('MyName');
            let passwords = await AsyncStorage.getItem('myPassword');
            if (emails !== null) {
                this.setState({ email: emails })
            }
            if (passwords !== null) {
                this.setState({ password: passwords })
            }
        } catch (err) {

        }
    }

    forgotPassword = (email) => {
        if (!email) {
            alert('Please enter an email first in the box provided...')
        } else {
            firebase.auth().sendPasswordResetEmail(email)
                .then(function (user) {
                    alert('Please check your email...')
                }).catch(function (e) {
                    console.log(e)
                })
        }
    }



    render() {
        return (

            <KeyboardAvoidingView behavior='padding' style={styles.container}>
                <View style={styles.container}>
                    <View style={styles.logoContainer}>
                        <Image
                            style={styles.logo}
                            source={require('../image/PlantAppLogo.png')} />

                        <Text style={styles.title}>Welcome to My Terrarium.</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <StatusBar
                            barStyle="light-content"
                        />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor='black'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={styles.input}
                            selectionColor="#fff"
                            value={this.state.email}
                            onChangeText={(val) => this.updateInputVal(val, 'email')}
                        />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor='black'
                            secureTextEntry={true}
                            style={styles.input}
                            value={this.state.password}
                            onChangeText={(val) => this.updateInputVal(val, 'password')}
                        />
                        <TouchableOpacity style={styles.buttonContainer}
                            onPress={() => this.loginUser()}>
                            <Text style={styles.buttonText}>
                                Login
                             </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonContainerReset}
                            onPress={() => this.forgotPassword(this.state.email)}>
                            <Text style={styles.buttonText}>
                                Reset Password
                         </Text>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.signupText}>
                        <Text style={styles.signupTextCont}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
                            <Text style={styles.signupButton}> Signup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

        );
    }
}



const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#00b894',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 100,
        justifyContent: 'flex-end',

    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        color: '#FFF',
        marginTop: 10,
        width: 300,
        textAlign: 'center',
        opacity: 0.9,
        marginVertical: 15,
        fontSize: 18
    },
    signupText: {
        flexGrow: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginVertical: 16,
        flexDirection: 'row',
        paddingVertical: 16,
    },
    signupTextCont: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
    },
    signupButton: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500'
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
    buttonContainer: {
        width: 300,
        backgroundColor: '#55efc4',
        paddingVertical: 10,
        borderRadius: 25,
        marginVertical: 10,

    },
    buttonContainerReset: {
        width: 200,
        backgroundColor: '#55efc4',
        paddingVertical: 10,
        borderRadius: 25,
        marginTop: 50,
        alignSelf: 'center'
    },
    buttonText: {
        textAlign: 'center',
        color: 'black',
        fontWeight: '700'
    }
});