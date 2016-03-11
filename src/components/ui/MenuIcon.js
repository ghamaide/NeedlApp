'use strict';

import React, {Component, Image, Platform, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

import MeStore from '../../stores/Me'
import NotifsStore from '../../stores/Notifs'
import ProfilStore from '../../stores/Profil'

class MenuIcon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var friends_requests = ProfilStore.getRequestsReceived().length;
    var unseen_notifications = NotifsStore.nbUnseenNotifs();
    var pastille = friends_requests + unseen_notifications;
    var has_shared = MeStore.getState().me.HAS_SHARED;

    return (
      <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', top: Platform.OS === 'ios' ? 22 : 2, left: 0, width: 40, height: 40}}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.props.onPress}>
          <Image style={{width: 22, height: 22, tintColor: '#EF582D'}} source={require('../../assets/img/other/icons/list.png')} />
        </TouchableHighlight>
        
        {pastille ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>{pastille < 10 ? pastille : '9+'}</Text>
          </View>
        : null}

        {!has_shared && !pastille ?
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
