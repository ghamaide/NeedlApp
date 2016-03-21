'use strict';

import React, {Component, Dimensions, Image, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';
import LinearGradient from 'react-native-linear-gradient';

import Text from './Text';

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
    switch (index) {
      case 1 : 
        pastille = ProfilStore.getRequestsReceived().length;
        break;
      case 2 : 
        has_shared = MeStore.getState().me.HAS_SHARED;
        break;
      case 3 :
        pastille = NotifsStore.nbUnseenNotifs();
        break;
      case 4 :
        pastille = MeStore.hasNewBadge() ? 1 : 0
        break;
      default :
        break;
    }

    return (
      <View key={index} style={styles.itemContainer}>
        <TouchableWithoutFeedback onPress={() => {
          if (this.props.tabsBlocked) {
            return;
          }
          this.props.resetToTab(index);
        }}>
          <View style={styles.itemInnerContainer}>
            <Image source={icon} style={styles.icons} />
            <Text style={styles.itemText}>{name}</Text>
          </View>
        </TouchableWithoutFeedback>

        {pastille ?
          <View style={styles.pastilleContainer}>
            <Text style={styles.pastilleText}>{pastille < 10 ? pastille : '9+'}</Text>
          </View>
          : null}

        {!has_shared && typeof has_shared !== 'undefined' ?
          <View style={styles.pastilleContainer}>
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
    flex: 1,
    height: Dimensions.get('window').height,
    width: 2 * Dimensions.get('window').width / 3,
    paddingTop: 60,
    backgroundColor: '#FE3139'
  },
  itemContainer: {
    padding: 10,
    margin: 5,
    backgroundColor: 'transparent'
  },
  itemInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemText: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 14,
    marginLeft: 15
  },
  icons: {
    tintColor:'#FFFFFF',
    width: 20,
    height: 20
  },
  pastilleContainer: {
    position: 'absolute',
    left: 23,
    top: 0,
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
    fontSize: 10
  }
});

export default Menu;
