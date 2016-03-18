'use strict';

import React, {Component, StyleSheet, View, WebView} from 'react-native';

import Mixpanel from 'react-native-mixpanel';

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
      title: this.props.title
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar key='navbar' type='back' title={this.state.title} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <WebView
          automaticallyAdjustContentInsets={false}
          style={styles.webview}
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
    flex: 1
  },
  webview: {

  }
});

export default Web;