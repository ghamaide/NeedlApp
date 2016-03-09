'use strict';

import React, {ActivityIndicatorIOS, Component, StyleSheet, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

class Page extends Component {

  renderLoading() {
    return (
      <View style={styles.wrapper}>
        <ActivityIndicatorIOS
        animating={true}
        style={[{height: 80}]}
        size='large' />
      </View>
    );
  };

  renderError() {
    return (
      <View style={styles.wrapper}>
        <Text>Error</Text>
      </View>
    );
  };

  render() {
    if (!this.state) {
      return this.renderLoading();
    }

    if (__DEV__ && !_.isEmpty(this.state.error)) {
      console.log(this.state.error);
      // return this.renderError();
    }

    return this.renderPage();
  };
}

var styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Page;
