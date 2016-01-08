'use strict';

import React, {Component, View, NativeModules, Text, Image, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';
// import Overlay from 'react-native-overlay';
import _ from 'lodash';

import TabView from './ui/TabView';
// import ErrorToast from './ui/ErrorToast';

import Profil from './pages/Profil';
import Friends from './pages/Friends';
import Notifs from './pages/Notifs';
import Liste from './pages/Liste';
import RecoStep1 from './pages/Reco/Step1';

import EditMe from './pages/EditMe';

import MeStore from '../stores/Me';
import FriendsStore from '../stores/Friends';
import NotifsStore from '../stores/Notifs';
import RestaurantsStore from '../stores/Restaurants';

import FriendsActions from '../actions/FriendsActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import NotifsActions from '../actions/NotifsActions';
import MeActions from '../actions/MeActions';

import Button from './elements/Button';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      friendsPastille: FriendsStore.nbUnseenRequests(),
      notifsPastille: NotifsStore.nbUnseenNotifs(),
      errors: [],
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial()
    };
  }

  onPastillesChange = () => {
    this.setState({
      friendsPastille: FriendsStore.nbUnseenRequests(),
      notifsPastille: NotifsStore.nbUnseenNotifs()
    });
  }

  onMeChange = () => {
    var errors = this.state.errors;

    var sendVersionError = MeStore.sendingVersionError();
    if (sendVersionError && !_.contains(errors, sendVersionError)) {
      errors.push(sendVersionError);
    }

    this.setState({
      sendingVersion: MeStore.sendingVersion(),
      errors: errors,
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showedUpdateMessage: MeStore.showedUpdateMessage(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial(),
      showTabBar: MeStore.getState().showTabBar
    });
  }

  onDeviceToken = (deviceToken) => {
    MeActions.saveDeviceToken(deviceToken);
  }

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
  }

  onNotification = (notif) => {
    var notifTab = this.getNotifTab(notif);

    if (notifTab && AppStateIOS.currentState !== 'active') {
      this.refs.tabs.resetToTab(notifTab, {skipCache: true});
    }
  }

  onAppStateChange = (state) => {
    if (state === 'active') {
      this.startActions();
    }
  }

  startActions() {
    // PushNotificationIOS.setApplicationIconBadgeNumber(0);
    MeActions.sendVersion(MeStore.getState().version);
    MeActions.resetBadgeNumber();
    FriendsActions.fetchFriends();
    NotifsActions.fetchNotifs();
    // StatusBarIOS.setStyle('default');
  }

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    FriendsStore.listen(this.onPastillesChange);
    NotifsStore.listen(this.onPastillesChange);

    // PushNotificationIOS.requestPermissions();
    // PushNotificationIOS.addEventListener('register', this.onDeviceToken);
    // PushNotificationIOS.addEventListener('notification', this.onNotification);
    // AppStateIOS.addEventListener('change', this.onAppStateChange);

    // var coldNotif = PushNotificationIOS.popInitialNotification();
    // if (coldNotif) {
    //   this.notifLaunchTab = this.getNotifTab(coldNotif);
    // }

    this.startActions();
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.onPastillesChange);
    NotifsStore.unlisten(this.onPastillesChange);
    MeStore.unlisten(this.onMeChange);
  }

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
              id: 0,
              component: Liste,
              name: 'Découvrir',
              icon: require('../assets/img/tabs/icons/home.png')
            },
            {
              id: 1,
              component: Friends,
              name: 'Amis',
              icon: require('../assets/img/tabs/icons/friend.png'),
              pastille: this.state.friendsPastille < 10 ? this.state.friendsPastille : '9+'
            },
            {
              id: 2,
              component: RecoStep1,
              icon: require('../assets/img/tabs/icons/add.png'),
              hasShared: MeStore.getState().me.HAS_SHARED
            },
            {
              id: 3,
              component: Notifs,
              name: 'Notifs',
              icon: require('../assets/img/tabs/icons/notif.png'),
              pastille: this.state.notifsPastille < 10 ? this.state.notifsPastille : '9+'
            },
            {
              id: 4,
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
  }
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
