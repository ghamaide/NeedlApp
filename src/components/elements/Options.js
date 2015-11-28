'use strict';

import React, {StyleSheet, Component, View} from 'react-native';

class Options extends Component {

  render() {
    return (
      <View style={styles.optionsWrappers}>
        {this.props.children}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  optionsWrappers: {
    backgroundColor: 'black',
    padding: 10
  },
  optionsButton: {
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 40,
    flexDirection: 'row',
    margin: 5
  },
  optionsImage: {
    width: 16,
    height: 16,
    marginRight: 5,
    marginTop: 2
  },
  optionsText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent'
  }
});

export default Options;
