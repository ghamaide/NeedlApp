'use strict';

import React, {Component} from 'react';
import {Dimensions, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var triangleHeight = 15;
var triangleWidth = 25;

class Onboard extends Component {
  render() {
    if (this.props.rotation) {
      var rotation = this.props.rotation;
    } else {
      var rotation = '0deg';
    }

    return (
      <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.props.onPress}>
        <View key={this.props.key} style={[styles.onboardingContainer, this.props.style]}>
          {this.props.children}
          <View style={[styles.onboardingTriangle, {transform: [{rotate: rotation}], position: 'absolute', bottom: this.props.triangleBottom, top: this.props.triangleTop, right: this.props.triangleRight}]}></View>
        </View>
      </TouchableHighlight>
    );
  };
}

var styles = StyleSheet.create({
  onboardingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: 5,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    marginLeft: 5,
    marginRight: 5,
    padding: 5,
    width: windowWidth - 10
  },
  onboardingTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    overflow: 'hidden',
    borderRightWidth: triangleHeight,
    borderTopWidth: 0,
    borderLeftWidth: triangleHeight,
    borderBottomWidth: triangleWidth,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.7)',
  }
});

export default Onboard;
