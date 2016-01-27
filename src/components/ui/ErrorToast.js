'use strict';

import React, {View, Component, StyleSheet, TouchableHighlight} from 'react-native';

import Overlay from 'react-native-overlay';

import Text from './Text';

class ErrorToast extends Component {
  state = {
    closed: false
  };

  render() {
    var value = "Votre requête a eu un problème d'exécution, veuillez réessayer";

    if (this.props.forceTrueValue)
      value = this.props.value;

    return (
      <Overlay isVisible={!this.state.closed}>
        <View style={[styles.toast, {marginTop: this.props.appBar ? 60 : 20}]}>
          <View style={styles.content}>
            <Text style={styles.toastValue}>{value}</Text>
          </View>

          <TouchableHighlight onPress={() => {this.setState({closed: true}); }} style={styles.dismissButton}>
            <Text style={styles.dismissButtonText}>Fermer</Text>
          </TouchableHighlight>
        </View>
      </Overlay>
    );
  };
}

var styles = StyleSheet.create({
  toast: {
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  toastValue: {
    color: 'white'
  },
  content: {
    flex: 9
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'red',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    height: 30,
    marginRight: 15,
    alignItems: 'center'
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }
});

export default ErrorToast;
