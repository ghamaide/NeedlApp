'use strict';

import React, {Component, Image, Platform, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

class MenuIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', top: Platform.OS === 'ios' ? 27 : 5, left: 5, width: 30, height: 30, backgroundColor: '#EF582D', borderRadius: 5}}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.props.onPress}>
          <Image style={{width: 22, height: 22}} source={require('../../assets/img/tabs/icons/home.png')} />
        </TouchableHighlight>
        
        {this.props.pastille && this.props.has_shared ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>{this.props.pastille}</Text>
          </View>
        : null}

        {!this.props.has_shared ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>!</Text>
          </View>
        : null}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  pastilleContainer: {
    position: 'absolute',
    left: 20,
    top: -10,
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF582D',
    borderColor: '#FFFFFF',
    borderWidth: 1
  },
  pastilleText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10
  }
});

export default MenuIcon;
