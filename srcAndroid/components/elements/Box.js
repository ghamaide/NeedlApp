'use strict';

import React, {StyleSheet, Component, Text, View, TouchableHighlight, Image, PixelRatio} from 'react-native';
import Dimensions from 'Dimensions';

var windowWidth = (Dimensions.get('window').width / PixelRatio.get()) - 6;

class Box extends Component {

  render() {
    return (
      <TouchableHighlight style={[styles.boxWrapper, {width: windowWidth, height: windowWidth}]} onPress={this.props.onPress}>
        <View style={[styles.box, {width: windowWidth, height: windowWidth}]}>
          <Image 
            source={this.props.image} 
            style={[styles.boxImage, {width: windowWidth, height: windowWidth}]} />
          <Text style={styles.boxText}>{this.props.label}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  boxWrapper: {
    flex: 1,
    alignItems: 'stretch',
    margin: 3
  },
  box: {
    flex: 1,
    alignItems: 'stretch',
  },
  boxImage: {
    flex: 1,
  },
  boxText: {
    flex: 1,
    fontWeight: '900',
    fontSize: 13,
    color: 'white',
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0)'
  }
});

export default Box;
