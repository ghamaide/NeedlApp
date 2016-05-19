'use strict';

import React, {Component} from 'react';
import {Dimensions, Image, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';

import Text from './Text';

import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me'
import NotifsStore from '../../stores/Notifs'
import ProfilStore from '../../stores/Profil'

class Menu extends Component {
  constructor(props) {
    super(props);
  }

  renderItem = (index, name, icon) => {
    var pastille;
    var has_shared;
    var showInvitations = MeStore.getState().showInvitations;
    switch (index) {
      case 1 : 
        has_shared = MeStore.getState().me.HAS_SHARED;
        break;
      case 2 :
        pastille = NotifsStore.nbUnseenNotifs();
        break;
      case 3 :
        pastille = MeStore.hasNewBadge() ? (showInvitations ? 1 + ProfilStore.getRequestsReceived().length : ProfilStore.getRequestsReceived().length) : (showInvitations ? 0 + ProfilStore.getRequestsReceived().length : 0);
        break;
      default :
        break;
    }

    return (
      <View key={index} style={styles.itemContainer}>
        <TouchableHighlight
          underlayColor='rgba(0, 0, 0, 0)'
          style={{padding: 10}}
          onPress={() => {
            if (this.props.tabsBlocked) {
              return;
            }

            if (index == 0) {
              RestaurantsActions.resetFilters();
            }

            this.props.resetToTab(index);
          }}>
          <View style={styles.itemInnerContainer}>
            <Image source={icon} style={[styles.icons, {opacity: this.props.active == index ? 1 : 0.5}]} />
            {/*<Text style={styles.itemText}>{name}</Text>*/}
          </View>
        </TouchableHighlight>

        {pastille ?
          <View style={[styles.pastilleContainer, {opacity: this.props.active == index ? 1 : 0.5}]}>
            <Text style={styles.pastilleText}>{pastille < 10 ? pastille : '9+'}</Text>
          </View>
          : null}

        {!has_shared && typeof has_shared !== 'undefined' ?
          <View style={[styles.pastilleContainer, {opacity: this.props.active == index ? 1 : 0.5}]}>
            <Text style={styles.pastilleText}>!</Text>
          </View>
          : null}
      </View>
    );
  };

  render() {

    return (
      <View style={styles.menuContainer}>
        <LinearGradient start={[0.0, 0.0]} end={[1.0, 1.0]} colors={['#FE3824', '#FE2851']} style={styles.linearGradient} />
          {_.map(this.props.tabs, (tab, index) => {
            return this.renderItem(index, tab.title, tab.icon);
          })}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  linearGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  menuContainer: {
    height: 50,
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemContainer: {
    padding: 5,
    flex: 1,
    backgroundColor: 'transparent'
  },
  itemInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemText: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 14,
    marginLeft: 15
  },
  icons: {
    tintColor:'#FFFFFF',
    width: 25,
    height: 25
  },
  pastilleContainer: {
    position: 'absolute',
    right: 15,
    top: 6,
    height: 18,
    width: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pastilleText: {
    color: '#FE3139',
    fontWeight: 'bold',
    fontSize: 9
  }
});

export default Menu;
