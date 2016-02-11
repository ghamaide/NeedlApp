'use strict';

import React, {StyleSheet, TouchableHighlight, Component, View, Image} from 'react-native';
import _ from 'lodash';

import Text from '../ui/Text';

import LoginActions from '../../actions/LoginActions';

import MeStore from '../../stores/Me';

class Login extends Component {
  
  getLoginState() {
    return {
      status: MeStore.getState().status,
      me: MeStore.getState().me,
    };
  };

  constructor() {
    super();

    this.state = this.getLoginState();
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

  onLogin = () => {
    if (!this.state.status.loading) {
      LoginActions.login();
    }
  };

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
            {this.state.status.loading ? 'Connexion...' : 'Se connecter avec Facebook'}
          </Text>
        </TouchableHighlight>
      </View>
    );
  };
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
