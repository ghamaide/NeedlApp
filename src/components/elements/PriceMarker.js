"use strict";

import React, {Component, StyleSheet, View, Text} from 'react-native';

class PriceMarker extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    var budget = _.map(_.range(0, Math.min(3, this.props.budget)), function() {
      return '€';
    }).join('') + (this.props.budget > 3 ? '+' : '');

    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Text style={styles.budget}>{budget}</Text>
        </View>
        <View style={styles.triangle} />
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
    backgroundColor: '#EF582D',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 3,
    borderColor: '#EF582D',
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
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF582D',
    marginLeft: 16,
    transform: [
      {rotate: '180deg'}
    ]
  }
});

export default PriceMarker;