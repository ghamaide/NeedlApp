'use strict';

import React, {StyleSheet, Component, View, ActivityIndicatorIOS} from 'react-native';

import _ from 'lodash';

import Text from './Text';

class Page extends Component {

  renderLoading() {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicatorIOS
        animating={true}
        style={[{height: 80}]}
        size="large" />
      </View>
    );
  };

  renderError() {
    return <Text>Error</Text>;
  };

  render() {
    if (!this.state) {
      return this.renderLoading();
    }

    if (__DEV__ && !_.isEmpty(this.state.error)) {
      return this.renderError();
    }

    return this.renderPage();
  };
}

var styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Page;
