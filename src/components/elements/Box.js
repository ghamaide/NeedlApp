'use strict';

import React, {StyleSheet, Component, Text, View, TouchableHighlight, Image} from 'react-native';

class Box extends Component {

  render() {
    return (
      <TouchableHighlight style={styles.boxWrapper} onPress={this.props.onPress}>
        <View style={styles.box}>
          <Image 
            source={this.props.image} 
            style={styles.boxImage} />
          <Text style={styles.boxText}>{this.props.label}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  boxWrapper: {
    width: 150,
    height: 150,
    alignItems: 'stretch',
    margin: 3
  },
  box: {
    width: 150,
    height: 150,
    alignItems: 'stretch'
  },
  boxImage: {
    flex: 1,
    width: 150,
    height: 150
  },
  boxText: {
    flex: 1,
    fontWeight: '900',
    fontSize: 15,
    color: 'white',
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0)'
  }
});

export default Box;
