'use strict';

import React, {Component, StyleSheet, View} from 'react-native';

import _ from 'lodash';

class Overlay extends Component {
  render() {
    return (
      <View key={this.props.key} style={[styles.overlayWrapper, this.props.style]}>
        {this.props.children}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  overlayWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
});

export default Overlay;
