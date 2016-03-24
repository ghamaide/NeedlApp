'use strict';

import React, {ActivityIndicatorIOS, Component, Dimensions, Image, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Branch from 'react-native-branch';
import Icon from 'react-native-vector-icons/FontAwesome';

import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import Overlay from '../elements/Overlay';

import LoginActions from '../../actions/LoginActions';
import ProfilActions from '../../actions/ProfilActions';

import MeStore from '../../stores/Me';

class Login extends Component {
  
  getLoginState() {
    return {
      me: MeStore.getState().me,
      error: MeStore.error(),
      loading: MeStore.loading()
    };
  };

  constructor() {
    super();

    this.state = this.getLoginState();
    this.state.index = 1;
    this.state.email = '';
    this.state.recovery_email = '';
    this.state.name = '';
    this.state.password = '';
    this.state.passwordRecovered = false;

    // Remove to add password confirmation
    //this.state.password_confirmation = '';
  };

  componentWillMount() {
    Branch.getInitSessionResultPatiently(({params, error}) => {
      if (!_.isEmpty(params) && params.from === 'invitation' && params['+is_first_session']) {
        // do something because he arrived from friend invitation
        this.setState({
          invitation_user_name: params.user_name,
          invitation_user_picture: params['$og_image_url'],
          friendInvitation: true
        });
      }
    });
  }

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
    if (!this.state.loading) {
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
    // Remove to add password confirmation
    // } else if (this.state.password != this.state.password_confirmation) {
    //   var error = {error_message: 'different_passwords'};
    //   this.setState({error: error});
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

  onPasswordRecovery = () => {
    if (!this.validateEmail(this.state.recovery_email)) {
      var error = {error_message: 'incorrect_mail_recovery'};
      this.setState({error: error});
    } else {
      LoginActions.recoverPassword(this.state.recovery_email, () => {
        this.setState({passwordRecovered: true})
      });
    }
  };

  render() {
    if (!_.isEmpty(this.state.error)) {
      var showSignInError = false;
      var showSignUpError = false;
      var showPasswordForgottenError = false;
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
        case 'password_too_short':
          message = 'Le mot de passe doit compter au minimum 6 caractères';
          showSignUpError = true;
          break;
        case 'incorrect_mail_recovery':
          message = 'L\'adresse mail entrée n\'est pas valide';
          showPasswordForgottenError = true;
          break;
        default:
          // Show message if it's not a Cancel from the Facebook Login
          if (this.state.error !== 'Cancel' && this.state.error.type !== 'cancel') {
            message = 'Erreur lors de l\'authentification';
            if (this.state.index == 1) {
              showSignInError = true;
            } else if (this.state.index == 2) {
              showSignUpError = true;
            } else if (this.state.index == 3) {
              showPasswordForgottenError = true;
            }
          }
          break;
      }
    }

    return (
      <View>
        <ScrollView keyboardShouldPersistTaps={true} scrollEnabled={false} style={styles.loginContainer}>
          <View style={styles.logoImageWrapper}>
            <Image source={require('../../assets/img/other/icons/needllogo.png')} style={styles.logoImage} resizeMode='contain' />
            <Text style={styles.sublineText}>Improvisez une bonne soirée</Text>
          </View>

          {this.state.friendInvitation ? [
            <View key='invitation' style={{alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
              <Image style={{width: 60, height: 60, borderRadius: 30}} source={{uri: this.state.invitation_user_picture}} />
              <Text style={{color: '#FFFFFF', fontSize: 13, marginTop: 10}}>Retrouve {this.state.invitation_user_name} sur Needl</Text>
            </View>
          ] : null}

          {this.state.index == 1 ? [
            <View key='sign_in' style={styles.loginWrapper}>
              {showSignInError ? [
                <View key='sign_in_error' style={styles.error}>
                  <Text style={styles.errorText}>{message}</Text>
                </View>
              ] : null}
              <TextInput
                ref='sign_in_email'
                keyboardType='email-address'
                returnKeyType='next'
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
                returnKeyType='go'
                autoCapitalize='none'
                placeholder='Mot de passe'
                placeholderTextColor='#FFFFFF'
                style={styles.input}
                maxLength={20}
                multiline={false}
                secureTextEntry={true}
                onSubmitEditing={this.onMailLogin}
                onChangeText={(password) => {
                  this.setState({password: password});
                }} />

              <TouchableHighlight style={styles.submitButton} onPress={this.onMailLogin} underlayColor='rgba(0, 0, 0, 0)'>
                <Text style={styles.submitText}>Connexion</Text>
              </TouchableHighlight>

              <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({index: 2})} underlayColor='rgba(0, 0, 0, 0)'>
                <Text style={styles.switchMethodText}>Tu n'as pas encore de compte ?</Text>
              </TouchableHighlight>

              <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({index: 3})} underlayColor='rgba(0, 0, 0, 0)'>
                <Text style={styles.switchMethodText}>Tu as oublié ton mot de passe ?</Text>
              </TouchableHighlight>
            </View>
          ] : [
            this.state.index == 2 ? [
              <View key='sign_up' style={styles.loginWrapper}>
                {showSignUpError ? [
                  <View key='sign_in_error' style={styles.error}>
                    <Text style={styles.errorText}>{message}</Text>
                  </View>
                ] : null}
                <TextInput
                  ref='sign_up_name'
                  returnKeyType='next'
                  autoCorrect={false}
                  autoCapitalize='words'
                  placeholder="Nom"
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
                  returnKeyType='next'
                  keyboardType='email-address'
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
                  returnKeyType='go'
                  autoCorrect={false}
                  autoCapitalize='none'
                  placeholder='Mot de passe'
                  placeholderTextColor='#FFFFFF'
                  style={styles.input}
                  maxLength={20}
                  multiline={false}
                  secureTextEntry={true}
                  onSubmitEditing={this.onMailCreation}
                  onChangeText={(password) => {
                    this.setState({password: password});
                  }} />

                {/* Remove to add password confirmation */}
                {/*
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
                */}

                <TouchableHighlight style={styles.submitButton} onPress={this.onMailCreation} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.submitText}>Créer mon compte</Text>
                </TouchableHighlight>

                <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({index: 1})} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.switchMethodText}>Tu as déja un compte ?</Text>
                </TouchableHighlight>
              </View>
            ] : [
              <View key='password_Forgotten' style={styles.loginWrapper}>
                {showPasswordForgottenError ? [
                  <View key='sign_in_error' style={styles.error}>
                    <Text style={styles.errorText}>{message}</Text>
                  </View>
                ] : null}
                {!this.state.passwordRecovered ? [
                  <View key='recoveryEmailInput' style={{width: Dimensions.get('window').width, alignItems: 'center', justifyContent: 'center'}}>
                    <TextInput
                      ref='recoveryEmail'
                      returnKeyType='go'
                      keyboardType='email-address'
                      autoCorrect={false}
                      autoCapitalize='none'
                      placeholder="Email"
                      placeholderTextColor='#FFFFFF'
                      selectionColor='#00000'
                      style={styles.input}
                      maxLength={40}
                      multiline={false}
                      onChangeText={(email) => {
                        this.setState({recovery_email: email});
                      }} />

                      <TouchableHighlight style={styles.submitButton} onPress={this.onPasswordRecovery} underlayColor='rgba(0, 0, 0, 0)'>
                        <Text style={styles.submitText}>Valider</Text>
                      </TouchableHighlight>
                    </View>
                  ] : [
                  <View key='recoveryEmailSent' style={{marginLeft: 20, marginRight: 20, padding: 5, backgroundColor: '#9CE62A', borderRadius: 5}}>
                    <Text style={{textAlign: 'center', color: '#3A325D', fontSize: 12}}>Un mail avec un lien de réinitialisation de ton mot de passe vient de t'être envoyé</Text>
                  </View>
                ]}

                <TouchableHighlight style={styles.switchMethodButton} onPress={() => this.setState({index: 1})} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.switchMethodText}>Tu as déja un compte ?</Text>
                </TouchableHighlight>
              </View>
            ]
          ]}
        </ScrollView>

        <TouchableHighlight onPress={this.onLogin} style={styles.loginBtn} activeOpacity={1} underlayColor='rgba(0, 0, 0, 0)'>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Icon
              name='facebook'
              size={25}
              color='#FFFFFF' 
              style={{marginRight: 15}} />
            <Text style={styles.loginBtnText}>
              {this.state.loading ? 'Connexion...' : 'Se connecter avec Facebook'}
            </Text>
          </View>
        </TouchableHighlight>

        {/* Loading overlay */}
        {this.state.loading ? [
          <Overlay key='loading_overlay'>
            <ScrollView
              style={{flex: 1, height: Dimensions.get('window').height, backgroundColor: 'rgba(255, 255, 255, 0.5)'}}
              contentInset={{top: 0}}
              alignItems='center'
              justifyContent='center'
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.container}>
              {Platform.OS === 'ios' ? [
                <ActivityIndicatorIOS
                  key='loading_ios'
                  animating={true}
                  color='#FE3139'
                  style={[{height: 80}]}
                  size='large' />
              ] : [
                <ProgressBarAndroid key='loading_android' indeterminate />
              ]}
            </ScrollView>
          </Overlay>
        ] : null}
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
    tintColor: '#FFFFFF'
  },
  sublineText: {
    backgroundColor: 'transparent',
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '400'
  },
  loginWrapper: {
    alignItems: 'center',
    marginTop: 20
  },
  input: {
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    fontSize: 12,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    height: 30,
    paddingBottom: Platform.OS === 'ios' ? 0 : 5,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  switchMethodButton: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: .5,
    borderColor: '#FFFFFF'
  },
  switchMethodText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    paddingTop: 5,
  },
  submitButton: {
    width: 150,
    marginTop: 15,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center'
  },
  loginBtn: {
    height: 60,
    backgroundColor: '#3B5998',
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
    fontSize: 14
  },
  error: {
    width: Dimensions.get('window').width - 40,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 0, 0, 1)',
    padding: 10
  },
  errorText : {
    fontSize: 12,
    color: '#FFFFFF'
  }
});

export default Login;
