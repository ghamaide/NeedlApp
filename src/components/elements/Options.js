'use strict';

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';

class Options extends Component {

  render() {
    return (
      <View style={styles.optionsWrappers}>
        {this.props.children}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  optionsWrappers: {
    backgroundColor: '#FFFFFF',
    padding: 10
  }
});

export default Options;
