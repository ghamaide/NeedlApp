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
    var friendsRequests = ProfilStore.getRequestsReceived().length;
    var unseenNotifications = NotifsStore.nbUnseenNotifs();
    var newBadge = MeStore.hasNewBadge() ? 1 : 0;
    var pastille = friendsRequests + unseenNotifications + newBadge;
    var hasShared = MeStore.getState().me.HAS_SHARED;

    return (
      <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', top: Platform.OS === 'ios' ? 18 : 2, left: 0, width: 40, height: 40}}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.props.onPress} style={{padding: 10}}>
          <Image style={{width: 22, height: 22, tintColor: '#FE3139'}} source={require('../../assets/img/other/icons/list.png')} />
        </TouchableHighlight>
        
        {pastille ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>{pastille < 10 ? pastille : '9+'}</Text>
          </View>
        : null}

        {!hasShared && !pastille ?
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
    top: Platform.OS === 'ios' ? -2 : 0,
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FE3139',
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
