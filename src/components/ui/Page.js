'use strict';

import React, {StyleSheet, Component, Text, View, ActivityIndicatorIOS} from 'react-native';
import _ from 'lodash';

class Page extends Component {

  renderLoading() {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicatorIOS
        animating={true}
        style={[{height: 80}]}
        size="large" />
    </View>);
  }

  renderError() {
    return <Text>Error</Text>;
  }

  render() {
    if (!this.state) {
      return this.renderLoading();
    }

    if (this.state.data) {
      return this.renderPage();
    }

    if (this.state.error) {
      return this.renderError();
    }

    if (this.state.loading || !this.state.data) {
      return this.renderLoading();
    }

  }
}

var styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Page;
