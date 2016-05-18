'use strict';

import React, {Component} from "react";
import {Dimensions, StyleSheet, View} from "react-native";

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
      <View key={this.props.key} style={[styles.onboardingContainer, this.props.style]}>
        <View style={[styles.onboardingTriangle, {transform: [{rotate: rotation}], position: 'absolute', bottom: this.props.triangleBottom, top: this.props.triangleTop, right: this.props.triangleRight}]}></View>
        {this.props.children}
      </View>
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
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: triangleHeight,
    borderRightWidth: triangleHeight,
    borderBottomWidth: triangleWidth,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.7)'
  }
});

export default Onboard;
