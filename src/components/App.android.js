'use strict';

import React, {Component, View, Image, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';

import _ from 'lodash';

import TabView from './ui/TabView';
import Text from './ui/Text';

import Button from './elements/Button';

import ProfilActions from '../actions/ProfilActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import NotifsActions from '../actions/NotifsActions';
import MeActions from '../actions/MeActions';

import MeStore from '../stores/Me';
import NotifsStore from '../stores/Notifs';
import RestaurantsStore from '../stores/Restaurants';

import Profil from './pages/Profil';
import Friends from './pages/Friends';
import Notifs from './pages/Notifs';
import Liste from './pages/Liste';
import RecoStep1 from './pages/Reco/Step1';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notifsPastille: NotifsStore.nbUnseenNotifs(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial()
    };
  };

  onPastillesChange = () => {
    this.setState({
      notifsPastille: NotifsStore.nbUnseenNotifs()
    });
  };

  onMeChange = () => {
    this.setState({
      sendingVersion: MeStore.sendingVersion(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showedUpdateMessage: MeStore.showedUpdateMessage(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial(),
      showTabBar: MeStore.getState().showTabBar
    });
  };

  onDeviceToken = (deviceToken) => {
    MeActions.saveDeviceToken(deviceToken);
  };

  getNotifTab(notif) {
    var notifTab;
    switch(notif.getData().type) {
      case 'reco':
        notifTab = 3;
        break;
      case 'friend':
        notifTab = 1;
        break;
    }
    return notifTab;
  };

  startActions() {
    MeActions.startActions.defer(this.props.version);
    RestaurantsActions.fetchRestaurants.defer();
    ProfilActions.fetchProfils.defer();
    NotifsActions.fetchNotifs.defer();
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    NotifsStore.listen(this.onPastillesChange);

    this.startActions();
  };

  componentWillUnmount() {
    NotifsStore.unlisten(this.onPastillesChange);
    MeStore.unlisten(this.onMeChange);
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <TabView 
          ref="tabs"
          onTab={(tab) => {
            this.setState({tab});
          }}
          tabs={[
            {
              component: Liste,
              name: 'Découvrir',
              icon: require('../assets/img/tabs/icons/home.png')
            },
            {
              component: Friends,
              name: 'Amis',
              icon: require('../assets/img/tabs/icons/friend.png'),
            },
            {
              component: RecoStep1,
              icon: require('../assets/img/tabs/icons/add.png'),
              hasShared: MeStore.getState().me.HAS_SHARED
            },
            {
              component: Notifs,
              name: 'Notifs',
              icon: require('../assets/img/tabs/icons/notif.png'),
              pastille: this.state.notifsPastille < 10 ? this.state.notifsPastille : '9+'
            },
            {
              component: Profil,
              name: 'Profil',
              icon: require('../assets/img/tabs/icons/account.png')
            }
          ]}
          initialSkipCache={!!this.notifLaunchTab}
          initialSelected={this.notifLaunchTab || 0}
          tabsBlocked={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#707070',
    marginBottom: 20
  },
  message: {
    textAlign: 'center',
    fontSize: 15,
    color: '#414141',
    marginBottom: 50
  },
  avatar: {
    height: 40,
    width: 40,
    margin: 15,
    tintColor: '#FFFFFF'
  },
  avatarWrapper: {
    height: 70,
    width: 70,
    borderRadius: 35,
    marginBottom: 40,
    backgroundColor: '#EF582D',
    marginTop: 20
  },
  arrow: {
    height: 60,
    width: 60,
    position: 'absolute',
    right: 40,
    top: 0,
    tintColor: '#FFFFFF'
  },
  titleShowMap: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 70
  },
});

export default App;
