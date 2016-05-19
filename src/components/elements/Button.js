'use strict';

import React, {Component} from 'react';
import {StyleSheet, TouchableHighlight, View} from 'react-native';

import Text from '../ui/Text';

class Button extends Component {
  render() {
    return (
      <TouchableHighlight style={[styles.buttonWrapper, this.props.style]} onPress={this.props.onPress}>
        <View style={styles.button}>
          <Text style={styles.text}>{this.props.label}</Text>
        </View>
      </TouchableHighlight>
    );
  };
}

var styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 20,
    height: 40
  },
  button: {
    backgroundColor: '#FE3139',
    borderColor: '#FE3139',
    borderWidth: 1,
    borderRadius: 20,
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center'
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default Button;
