'use strict';

import React, {Component} from 'react';
import {StyleSheet, View, WebView} from 'react-native';

import Mixpanel from 'react-native-mixpanel';

import MeActions from '../../actions/MeActions';
import LoginActions from '../../actions/LoginActions';

import MeStore from '../../stores/Me';

import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

class Web extends Component {
  static route(props) {
    return {
      component: Web,
      title: 'Web',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      source: this.props.source,
      origin: this.props.origin,
      token: this.props.token,
      title: this.props.title
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.origin ? [
          <NavigationBar key='navbar' type='back' title={this.state.title} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        ] : [
          <NavigationBar
            key='navbar'
            type='back'
            title={this.state.title}
            leftButtonTitle='Retour'
            onLeftButtonPress={() => {
              MeActions.closeLoginFacebookAndroid();
              LoginActions.loginFacebookAndroid(this.state.token);
            }} />
        ]}
        <WebView
          automaticallyAdjustContentInsets={false}
          source={{uri: this.state.source}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          startInLoadingState={true} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  }
});

export default Web;