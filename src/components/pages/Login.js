'use strict';

import React, {ActivityIndicatorIOS, Component, Dimensions, Image, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import LoginActions from '../../actions/LoginActions';

import MeStore from '../../stores/Me';

class Login extends Component {
  
  getLoginState() {
    return {
      status: MeStore.getState().status,
      me: MeStore.getState().me,
      error: MeStore.error(),
      laoding: MeStore.loading()
    };
  };

  constructor() {
    super();

    this.state = this.getLoginState();
    this.state.email = '';
    this.state.name = '';
    this.state.password = '';
    this.state.password_confirmation = '';
    this.state.viewSignIn = true;
  };

  componentDidMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  onMeChange = () => {
    this.setState(this.getLoginState());
  };

  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  onLogin = () => {
    if (!this.state.status.loading) {
      LoginActions.loginFacebook();
    }
  };

  onMailLogin = () => {
    var user = {
      email: this.state.email,
      password: this.state.password
    };
    LoginActions.loginEmail(user);
  };

  onMailCreation = () => {
    if (!this.validateEmail(this.state.email)) {
      var error = {error_message: 'incorrect_mail'};
      this.setState({error: error});
    } else if (this.state.password != this.state.password_confirmation) {
      var error = {error_message: 'different_passwords'};
      this.setState({error: error});
    } else if (this.state.password.length < 6) {
      var error = {error_message: 'password_too_short'};
      this.setState({error: error});
    } else {
      var user = {
        name: this.state.name,
        password: this.state.password,
        email: this.state.email
      };
      LoginActions.createAccount(user);
    }
  };

  render() {
    if (!_.isEmpty(this.state.error)) {
      var showSignInError = false;
      var showSignUpError = false;
      var message = '';

      switch (this.state.error.error_message) {
        case 'wrong_password': 
          message = 'Mot de passe invalide';
          showSignInError = true;
          break;
        case 'wrong_email':
          message = 'Aucun compte avec cette adresse mail';
          showSignInError = true;
          break;
        case 'facebook_account':
          message = 'La connexion avec cette adresse se fait par Facebook';
          showSignInError = true;
          break;
        case 'incorrect_mail':
          message = 'L\'adresse mail entrée n\'est pas valide';
          showSignUpError = true;
          break;
        case 'different_passwords':
          message = 'Les mots de passe ne correspondent pas';
          showSignUpError = true;
          break;
        case 'account_already_exists':
          message = 'Un compte avec cette adresse mail existe déja';
          showSignUpError = true;
          break;
        case'password_too_short':
          message = 'Le mot de passe doit compter au minimum 6 caractères';
          showSignUpError = true;
          break;
        default:
          message = 'Erreur lors de l\'authentification';
          if (this.state.viewSignIn) {
            showSignInError = true;
          } else {
            showSignUpError = true;  
          }
          break;
      }
    }

    return (
      <View>
        <ScrollView keyboardShouldPersistTaps={true} scrollEnabled={false} style={styles.loginContainer}>
          <View style={styles.logoImageWrapper}>
            <Image source={require('../../assets/img/other/icons/needllogo.png')} style={styles.logoImage} resizeMode='contain' />
            <Text style={styles.sublineText}>Les restos préférés de vos amis</Text>
          </View>

          {this.state.viewSignIn ? [
            this.state.loading ? [
              <View key='loading' style={styles.loginWrapper}>
                {Platform.OS === 'ios' ? [<ActivityIndicatorIOS animating={true} style={[{height: 80}]} size='large' />] : [<ProgressBarAndroid indeterminate />]}
              </View>
            ] : [
              <View key='sign_in' style={styles.loginWrapper}>
                {showSignInError ? [
                  <View key='sign_in_error' style={styles.error}>
                    <Text style={{color: '#FFFFFF'}}>{message}</Text>
                  </View>
                ] : null}
                <TextInput
                  ref='sign_in_email'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Adresse email'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={40}
                  multiline={false}
                  onChangeText={(email) => {
                    this.setState({email: email});
                  }} />
                <TextInput
                  ref='sign_in_password'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Mot de passe'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={20}
                  multiline={false}
                  secureTextEntry={true}
                  onChangeText={(password) => {
                    this.setState({password: password});
                  }} />

                <TouchableHighlight style={styles.submitButton} onPress={this.onMailLogin} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.submitText}>Connexion</Text>
                </TouchableHighlight>

                <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({viewSignIn: false})} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.switchMethodText}>Vous n'avez pas encore de compte ?</Text>
                </TouchableHighlight>
              </View>
            ]
          ] : [
            this.state.loading ? [
              <View key='loading' style={styles.loginWrapper}>
                Platform.OS === 'ios' ? <ActivityIndicatorIOS animating={true} style={[{height: 80}]} size='large' /> : <ProgressBarAndroid indeterminate />
              </View>
            ] : [
              <View key='sign_up'style={styles.loginWrapper}>
                {showSignUpError ? [
                  <View key='sign_in_error' style={styles.error}>
                    <Text style={{color: '#FFFFFF'}}>{message}</Text>
                  </View>
                ] : null}
                <TextInput
                  ref='sign_up_name'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor='#FFFFFF'
                  selectionColor='#00000'
                  style={styles.input}
                  maxLength={40}
                  multiline={false}
                  onChangeText={(name) => {
                    this.setState({name: name});
                  }} />
                <TextInput
                  ref='sign_up_email'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Adresse mail'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={40}
                  multiline={false}
                  onChangeText={(email) => {
                    this.setState({email: email});
                  }} />
                <TextInput
                  ref='sign_up_password'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Mot de passe'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={20}
                  multiline={false}
                  secureTextEntry={true}
                  onChangeText={(password) => {
                    this.setState({password: password});
                  }} />
                <TextInput
                  ref='sign_up_password_confirmation'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Confirmation du mot de passe'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={20}
                  multiline={false}
                  secureTextEntry={true}
                  onChangeText={(password_confirmation) => {
                    this.setState({password_confirmation: password_confirmation});
                  }} />

                <TouchableHighlight style={styles.submitButton} onPress={this.onMailCreation} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.submitText}>Créer mon compte</Text>
                </TouchableHighlight>

                <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({viewSignIn: true})} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.switchMethodText}>Vous avez déja un compte ?</Text>
                </TouchableHighlight>
              </View>
            ]
          ]}

        </ScrollView>

        <TouchableHighlight onPress={this.onLogin} style={styles.loginBtn} activeOpacity={1} underlayColor='#308edc'>
          <Text style={styles.loginBtnText}>
            {this.state.status.loading ? 'Connexion...' : 'Se connecter avec Facebook'}
          </Text>
        </TouchableHighlight>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  loginContainer: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    backgroundColor: 'transparent'
  },
  logoImageWrapper: {
    backgroundColor: 'transparent',
  },
  logoImage: {
    backgroundColor: 'transparent',
    marginLeft: 40,
    marginTop: 40,
    marginRight: 40,
    marginBottom: 10,
    height: (Dimensions.get('window').width - 80) / 3,
    width: Dimensions.get('window').width - 80,
  },
  sublineText: {
    backgroundColor: 'transparent',
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400'
  },
  loginWrapper: {
    alignItems: 'center',
    marginTop: 20
  },
  input: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    fontSize: 14,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    height: 40,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  switchMethodButton: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  switchMethodText: {
    textAlign: 'center',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontSize: 15 
  },
  submitButton: {
    marginLeft: 100,
    marginRight: 100,
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center'
  },
  loginBtn: {
    height: 60,
    backgroundColor: '#469AE0',
    borderTopWidth: 1,
    borderTopColor: '#308edc',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    position: 'absolute',
    top: Platform.OS === 'ios' ? Dimensions.get('window').height - 60 : Dimensions.get('window').height - 85,
    left: 0,
    right: 0
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16
  },
  error: {
    width: Dimensions.get('window').width - 40,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    padding: 10
  }
});

export default Login;
