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
      <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', top: Platform.OS === 'ios' ? 27 : 7, left: 5, width: 30, height: 30}}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.props.onPress}>
          <Image style={{width: 22, height: 22, tintColor: '#EF582D'}} source={require('../../assets/img/other/icons/list.png')} />
        </TouchableHighlight>
        
        {this.props.pastille ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>{this.props.pastille < 10 ? this.props.pastille : '9+'}</Text>
          </View>
        : null}

        {!this.props.has_shared && !this.props.pastille ?
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
    top: -5,
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
