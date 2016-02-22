'use strict';

import React, {Component, Image, Platform, StyleSheet, Text, View } from 'react-native';

class PriceMarker extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    var backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : '#EF582D';

    return (
      <View style={styles.container}>
        <View style={[styles.bubble, {backgroundColor: backgroundColor, borderColor: backgroundColor}]}>
          <Text style={styles.budget}>{this.props.text}</Text>
        </View>
        {Platform.OS === 'ios' ? [
          <View style={[styles.triangle, styles.triangleIOS, {borderBottomColor: backgroundColor}]} />
        ] : [
          <View style={[styles.triangle, styles.triangleAndroid, {borderBottomColor: backgroundColor}]} />
        ]}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  bubble: {
    flex: 0,
    width: 40,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 3,
    borderWidth: 0.5,
  },
  budget: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [
      {rotate: '180deg'}
    ]
  },
  triangleAndroid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    marginLeft: 19
  },
  triangleIOS: {
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    marginLeft: 16
  }
});

export default PriceMarker;