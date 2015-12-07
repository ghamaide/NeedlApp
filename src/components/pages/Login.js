'use strict';

import React, {StyleSheet, TouchableHighlight, Component, Text, View, Image} from 'react-native';
import _ from 'lodash';

import MeStore from '../../stores/Me';
import LoginActions from '../../actions/LoginActions';
import ErrorToast from '../ui/ErrorToast';

import FBSDKLogin, {FBSDKLoginButton} from 'react-native-fbsdklogin';
import FBSDKCore, {FBSDKAccessToken} from 'react-native-fbsdkcore';


class Login extends Component {
  getLoginState() {
    var err = MeStore.getState().status.loginFailedError;

    if (err && !_.contains(this.state.errors, err) && err !== 'cancelled') {
      this.state.errors.push(err);
    }

    return {
      status: MeStore.getState().status,
      me: MeStore.getState().me,
      errors: this.state.errors
    };
  }

  constructor() {
    super();

    this.state = {
      errors: []
    };
    this.state = this.getLoginState();
  }

  componentDidMount() {
    MeStore.listen(this.onMeChange);
  }

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  }

  onMeChange = () => {
    this.setState(this.getLoginState());
  }

  onLogin = () => {
    if (!this.state.status.loggingIn) {
      LoginActions.login();
    }
  }

  render() {
    return (
      <View style={styles.loginWrapper}>
        <View style={styles.logoImageWrapper}>
          <View style={styles.logoImageInnerWrapper}>
            <Image source={require('../../assets/img/other/icons/needllogo.png')} style={styles.logoImage} resizeMode={Image.resizeMode.contain}>
              <View style={styles.sublineSpacer} />
              <View style={styles.subline}>
                <Text style={styles.sublineText}>Les restos préférés</Text>
                <Text style={styles.sublineText}>de vos amis</Text>
              </View>
            </Image>
          </View>
        </View>

        <TouchableHighlight onPress={this.onLogin} style={styles.loginBtn} activeOpacity={1} underlayColor="#308edc">
          <Text style={styles.loginBtnText}>
            {this.state.status.loggingIn ? 'Connexion...' : 'Se connecter avec Facebook'}
          </Text>
        </TouchableHighlight>

        {_.map(this.state.errors, (err) => {
          return <ErrorToast forceTrueValue value={JSON.stringify(err)} />;
        })}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  loginWrapper: {
    flex: 1,
    backgroundColor: 'transparent'
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
    bottom: 0,
    left: 0,
    right: 0
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16
  },
  backgroundImage: {
  },
  logoImageWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    // text size * 2 + interline,
    justifyContent: 'center',
    marginBottom: 120
  },
  logoImageInnerWrapper: {
    marginLeft: 40,
    marginRight: 40,
    flexDirection: 'row'
  },
  logoImage: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    flex: 1
  },
  sublineSpacer: {
    flex: 2
  },
  subline: {
    flex: 1,
    alignItems: 'center'
  },
  sublineText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '400'
  }
});

export default Login;
