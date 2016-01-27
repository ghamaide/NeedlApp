'use strict';

import React, {StyleSheet, Component, View, TouchableHighlight, Image} from 'react-native';

import _ from 'lodash';

import Text from '../ui/Text';

class FriendCard extends Component {

  static defaultProps = {
    onAccept() {},
    onignore() {}
  };

  render() {
    var nbRecos = _.isNumber(this.props.number_of_recos) ? this.props.number_of_recos : this.props.number;

    return (
      <View style={[styles.friendRow, {backgroundColor: (this.props.accepted && '#38E1B2') || (this.props.ignored && '#AAA') || 'white'}]}>
        <View style={styles.friendInfos}>
          <Image source={{uri: this.props.picture}} style={styles.friendImage} />
          <Text style={styles.friendName}>{this.props.name}</Text>
          <Text style={styles.friendReco}>{nbRecos} reco{nbRecos > 1 ? 's' : ''}</Text>
        </View>
        {!this.props.accepted && !this.props.ignored ?
          <View style={styles.actionBar}>
            <TouchableHighlight style={styles.ignore} onPress={this.props.onIgnore}>
              <View style={[styles.actionButton, styles.ignore]}>
                <Text style={styles.actionText}>{this.props.ignoreText}</Text>
              </View>
            </TouchableHighlight>

            <TouchableHighlight style={styles.accept} onPress={this.props.onAccept}>
              <View style={[styles.actionButton, styles.accept]}>
                <Text style={styles.actionText}>{this.props.acceptText}</Text>
              </View>
            </TouchableHighlight>
          </View>
         : null}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  friendRow: {
    margin: 20,
    borderRadius: 4
  },
  friendInfos: {
    padding: 20,
    alignItems: 'center'
  },
  friendImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20
  },
  friendName: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500'
  },
  friendReco: {
    color: '#818181'
  },
  actionBar: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 10
  },
  actionText: {
    color: 'white',
    textAlign: 'center'
  },
  ignore: {
    backgroundColor: '#AAA',
    flex: 1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4
  },
  accept: {
    backgroundColor: '#38E1B2',
    flex: 1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  }
});

export default FriendCard;
