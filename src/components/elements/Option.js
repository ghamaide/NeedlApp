'use strict';

import React, {Component} from 'react';
import {Image, StyleSheet, TouchableHighlight, View} from 'react-native';

import Text from '../ui/Text';

class Option extends Component {
  static defaultProps = {
    onPress() {}
  };

  render() {
    return (
      <TouchableHighlight style={[styles.optionsButtonWrapper, this.props.style]} onPress={this.props.onPress}>
        <View style={[styles.optionsButton]}>
          <Image style={styles.optionsImage} source={this.props.icon} resizeMode={Image.resizeMode.contain} />
          <Text style={styles.optionsText}>{this.props.label}</Text>
        </View>
      </TouchableHighlight>
    );
  };
}

var styles = StyleSheet.create({
  optionsButtonWrapper: {
    borderRadius: 20,
    height: 40,
    margin: 5
  },
  optionsButton: {
    backgroundColor: '#837D9B',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 40,
    flexDirection: 'row'
  },
  optionsImage: {
    width: 16,
    height: 16,
    marginRight: 5,
    marginTop: 2
  },
  optionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'transparent'
  }
});

export default Option;
