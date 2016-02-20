"use strict";

import React, {Component, StyleSheet, View, Text} from 'react-native';

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
        <View style={[styles.triangle, {borderBottomColor: backgroundColor}]} />
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
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginLeft: 16,
    transform: [
      {rotate: '180deg'}
    ]
  }
});

export default PriceMarker;