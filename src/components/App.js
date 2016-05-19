'use strict';

import React, {Component} from 'react';
import {ActivityIndicatorIOS, Alert, AppState, DeviceEventEmitter, Dimensions, Image, Linking, Platform, ProgressBarAndroid, PushNotificationIOS, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Branch from 'react-native-branch';
import DeviceInfo from 'react-native-device-info';
import GcmAndroid from 'react-native-gcm-android';
import Notification from 'react-native-system-notification';

import TabView from './ui/TabView';
import Text from './ui/Text';

import Button from './elements/Button';
import Overlay from './elements/Overlay';

import MeActions from '../actions/MeActions';
import NotifsActions from '../actions/NotifsActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';

import MeStore from '../stores/Me';
import NotifsStore from '../stores/Notifs';
import ProfilStore from '../stores/Profil';
import RestaurantsStore from '../stores/Restaurants';

import Carte from './pages/Carte';
import Friends from './pages/Friends';
import Notifs from './pages/Notifs';
import Profil from './pages/Profil';
import RecoStep1 from './pages/Reco/Step1';
import RecoStep4 from './pages/Reco/Step4';
import Restaurant from './pages/Restaurant';

var tab = 0;

if (Platform.OS === 'android' && GcmAndroid.launchNotification) {
  var notification = GcmAndroid.launchNotification;
  var info = JSON.parse(notification.data);
  Notification.create({
    subject: info.alert
  });
  GcmAndroid.stopService();
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = this.appState();
  };

  appState() {
    return {
      unseen_notifications: NotifsStore.nbUnseenNotifs(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
    }
  };

  onMeChange = () => {
    this.setState({
      meLoading: MeStore.loading(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showedUpdateMessage: MeStore.showedUpdateMessage(),
      hasNewBadge: MeStore.hasNewBadge()
    });
  };

  onNotificationsChange = () => {
    this.setState({
      notificationsLoading: NotifsStore.loading(),
    });
  };

  onProfileChange = () => {
    this.setState({
      profileLoading: ProfilStore.loading(),
    });
  };

  onRestaurantsChange = () => {
    this.setState({
      restaurantsLoading: RestaurantsStore.loading()
    });
  };

  onDeviceToken = (deviceToken) => {
    MeActions.saveDeviceToken(deviceToken);
  };

  onNotificationAndroid = (notification) => {
    var info = JSON.parse(notification.data.data);
    switch(info.type) {
      case 'reco':
        tab = 3;
        break;
      case 'friend':
        tab = 1;
        break;
    }
    Notification.create({
      subject: info.alert
    });
  };

  onNotificationIOS = (notification) => {
    var notificationTab = this.getNotificationTab(notification);

    if (notificationTab && AppState.currentState !== 'active') {
      this.refs.tabs.resetToTab(notificationTab, {skipCache: true});
    }
  };

  onOpenNotificationAndroid = (e) => {
    if (tab !== 0 && AppState.currentState !== 'active') {
      this.refs.tabs.resetToTab(tab, {skipCache: true});
    }
  };

  getNotificationTab(notification) {
    var notificationTab;
    var type = notification.getData().type;

    switch(type) {
      case 'reco':
        notificationTab = 3;
        break;
      case 'friend':
        notificationTab = 1;
        break;
    }
    return notificationTab;
  };

  onQuickActionShortcut = (data) => {
    switch(data.type) {
      case 'fr.needl.map':
        this.refs.tabs.resetToTab(0);
        if (!_.isEmpty(RestaurantsStore.filteredRestaurants())) {
           this.refs.tabs.refs.tabs.push(Restaurant.route({rank: 1}));
        }
        break;
      case 'fr.needl.top_rated_restaurant':
        var top_rated_restaurant = RestaurantsStore.filteredRestaurants()[0] || RestaurantsStore.getRestaurants()[0];
        this.refs.tabs.resetToTab(0);
        if (typeof top_rated_restaurant !== 'undefined') {
          this.refs.tabs.refs.tabs.push(Restaurant.route({id: top_rated_restaurant.id}, top_rated_restaurant.name));
        }
        break;
    }
  };

  getURLParameter = (url, name) => {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url)||[,""])[1].replace(/\+/g, '%20'))||null;
  };

  handleOpenURL = (event, origin) => {
    if (origin == 'closed_app') {
      var newURL = event.replace('needl://', '');
    } else {
      var newURL = event.url.replace('needl://', '');
    }

    var id = this.getURLParameter(newURL, 'id');
    var restaurantId = this.getURLParameter(newURL, 'restaurant_id');
    var influencerId = this.getURLParameter(newURL, 'influencer_id');

    
    var index = _.findIndex(newURL, (char) => {return char == '?'});
    if (index > -1) {
      newURL = newURL.substring(0, index);
    }

    switch(newURL) {
      case 'user':
        this.refs.tabs.resetToTab(3);
        if (!isNaN(id) && typeof ProfilStore.getProfil(parseInt(id)) !== 'undefined') {
          this.refs.tabs.refs.tabs.push(Profil.route({id: parseInt(id)}));
        }
        break;
      case 'friends':
        this.refs.tabs.resetToTab(3);
        this.refs.tabs.refs.tabs.push(Friends.route({index: 1}));
        break;
      case 'followings':
        this.refs.tabs.resetToTab(3);
        this.refs.tabs.refs.tabs.push(Friends.route({index: 2}));
        break;
      case 'notifs':
        this.refs.tabs.resetToTab(2);
        break;
      case 'profil':
        this.refs.tabs.resetToTab(3);
        break;
      case 'home':
        this.refs.tabs.resetToTab(0);
        break;
      case 'restaurant':
        this.refs.tabs.resetToTab(0);
        if (!isNaN(restaurantId) && typeof RestaurantsStore.getRestaurant(parseInt(restaurantId)) !== 'undefined') {
          this.refs.tabs.refs.tabs.push(Restaurant.route({id: parseInt(restaurantId)}));
        }
        break;
      case 'wishlist':
        this.refs.tabs.resetToTab(0)
        if (!isNaN(restaurantId)) {
          RestaurantsActions.fetchRestaurant(parseInt(restaurantId), () => {
            this.refs.tabs.refs.tabs.push(Restaurant.route({id: parseInt(restaurantId), influencerId: parseInt(influencerId), action: 'create_wish'}));
          });
        }
        break;
    }
  };

  startActions() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }

    MeActions.startActions.defer(DeviceInfo.getVersion());
    ProfilActions.fetchProfil.defer(MeStore.getState().me.id);
    ProfilActions.fetchFriends.defer();
    ProfilActions.fetchFollowings.defer();
    ProfilActions.fetchAllExperts.defer();
    NotifsActions.fetchNotifications.defer();
    RestaurantsActions.fetchRestaurants.defer();
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    NotifsStore.listen(this.onNotificationsChange);
    ProfilStore.listen(this.onProfileChange);
    RestaurantsStore.listen(this.onRestaurantsChange);

    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions();
      PushNotificationIOS.addEventListener('register', this.onDeviceToken);
      PushNotificationIOS.addEventListener('notification', this.onNotificationIOS);
      
      DeviceEventEmitter.addListener('quickActionShortcut', this.onQuickActionShortcut);

      Linking.addEventListener('url', this.handleOpenURL);

      var coldNotif = PushNotificationIOS.popInitialNotification();
      if (coldNotif) {
        this.notifLaunchTab = this.getNotifTab(coldNotif);
      }
    }

    Branch.getInitSessionResultPatiently(({params, error}) => {
      // do something here
    });
    
    Branch.setIdentity(MeStore.getState().me.id.toString());

    Branch.getLatestReferringParams((params) => {
      // do something here
    });

    this.startActions();
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    NotifsStore.unlisten(this.onNotificationsChange);
    ProfilStore.unlisten(this.onProfileChange);
    RestaurantsStore.unlisten(this.onRestaurantsChange);

    if (Platform.OS === 'ios') {
      Linking.removeEventListener('url', this.handleOpenURL);
      PushNotificationIOS.removeEventListener('register', this.onDeviceToken);
      PushNotificationIOS.removeEventListener('notification', this.onNotificationIOS);

      Branch.logout();
    }
  };

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleOpenURL(url, 'closed_app');
      }
    }).catch((err) => {
      if (__DEV__) {
        console.log(err);
      }
    })

    if (Platform.OS === 'android') {
      GcmAndroid.addEventListener('register', this.onDeviceToken);

      GcmAndroid.addEventListener('registerError', (error) => {
        if (__DEV__) {
          console.log('registerError', error.message);
        }
      });

      GcmAndroid.addEventListener('notification', this.onNotificationAndroid);

      DeviceEventEmitter.addListener('sysNotificationClick', this.onOpenNotificationAndroid);

      GcmAndroid.requestPermissions();
    }
  };

  render() {
    var loading_array = [this.state.meLoading, this.state.notificationsLoading, this.state.profileLoading, this.state.restaurantsLoading];
    var index_loading = 0;
    _.forEach(loading_array, (loading, key) => {
      if (typeof loading == 'undefined' || (key == 3 && loading)) {
        index_loading += 2;
      } else if (loading) {
        index_loading += 1;
      }
    });

    return (
      <View style={{flex: 1}}>
        <TabView 
          ref='tabs'
          onTab={(tab) => {
            this.setState({tab});
          }}
          tabs={[
            {
              component: Carte,
              title: 'Découvrir',
              icon: require('../assets/img/tabs/icons/home.png')
            },
            {
              component: RecoStep1,
              title: 'Recommander',
              icon: require('../assets/img/tabs/icons/add.png'),
            },
            {
              component: Notifs,
              title: 'Notifs',
              icon: require('../assets/img/tabs/icons/notif.png'),
            },
            {
              component: Profil,
              title: 'Profil',
              icon: require('../assets/img/tabs/icons/account.png')
            }
          ]}
          initialSkipCache={!!this.notifLaunchTab}
          initialSelected={this.notifLaunchTab || 0}
          tabsBlocked={false} />

        {index_loading > 1 ? [
          <Overlay key='loading_overlay'>
            <ScrollView
              style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)'}}
              contentInset={{top: 0}}
              alignItems='center'
              justifyContent='center'
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.container}>
              {Platform.OS === 'ios' ? [
                <ActivityIndicatorIOS
                  key='loading_ios'
                  animating={true}
                  color='#FE3139'
                  style={[{height: 80}]}
                  size='large' />
              ] : [
                <ProgressBarAndroid key='loading_android' indeterminate />
              ]}
            </ScrollView>
          </Overlay>
        ] : null}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  arrowRight: {
    height: 60,
    width: 60,
    position: 'absolute',
    right: 40,
    top: 10,
    tintColor: '#FFFFFF'
  },
  arrowLeft: {
    height: 60,
    width: 60,
    position: 'absolute',
    left: 20,
    top: 10,
    tintColor: '#FFFFFF',
    transform: [
      {rotateY: '180deg'}
    ]
  },
  titleLeft: {
    width: Dimensions.get('window').width / 2,
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    top: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  titleRight: {
    width: Dimensions.get('window').width / 2,
    position: 'absolute',
    right: 0,
    top: 80,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  }
});

export default App;
