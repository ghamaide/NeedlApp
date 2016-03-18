'use strict';

import React, {ActivityIndicatorIOS, Alert, AppState, Component, DeviceEventEmitter, Dimensions, Image, Linking, Platform, ProgressBarAndroid, PushNotificationIOS, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

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
import RecoStep3 from './pages/Reco/Step3';
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
      showOverlayTutorial: MeStore.showOverlayTutorial()
    }
  };

  onMeChange = () => {
    this.setState({
      meLoading: MeStore.loading(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showedUpdateMessage: MeStore.showedUpdateMessage(),
      showOverlayTutorial: MeStore.showOverlayTutorial(),
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

  onAppStateChange = (state) => {
    // Remove to update app when users goes back on it
    // if (state === 'active') {
    //   this.startActions();
    // }
  };

  onQuickActionShortcut = (data) => {
    switch(data.type) {
      case 'fr.needl.map':
        this.refs.tabs.resetToTab(0);
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

  getParameterByName = (name, url) => {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  handleOpenURL = (event, from) => {
    if (from === 'closed_app') {
      var newURL = event.replace('needl://', '');
    } else {
      var newURL = event.url.replace('needl://', '');
    }
    var index = _.findIndex(newURL, function(char) {return char === '?'});
    if (index > -1) {
      var id = this.getParameterByName('id', newURL);
      newURL = newURL.substring(0, index);
    }

    switch(newURL) {
      case 'user':
        this.refs.tabs.resetToTab(1);
        if (!isNaN(id) && typeof ProfilStore.getProfil(parseInt(id)) !== 'undefined') {
          this.refs.tabs.refs.tabs.push(Profil.route({id: parseInt(id)}));
        }
        break;
      case 'friends':
        this.refs.tabs.resetToTab(1);
        break;
      case 'notifs':
        this.refs.tabs.resetToTab(3);
        break;
      case 'profil':
        this.refs.tabs.resetToTab(4);
        break;
      case 'home':
        this.refs.tabs.resetToTab(0);
        break;
      case 'map':
        this.refs.tabs.resetToTab(0);
        break;
      case 'restaurant':
        this.refs.tabs.resetToTab(0);
        if (!isNaN(id) && typeof RestaurantsStore.getRestaurant(parseInt(id)) !== 'undefined') {
          this.refs.tabs.refs.tabs.push(Restaurant.route({id: parseInt(id)}));
        }
        break;
      case 'recommendation':
        this.refs.tabs.resetToTab(0)
        if (!isNaN(id) && typeof RestaurantsStore.getRestaurant(id) !== 'undefined') {
          var restaurant = RestaurantsStore.getRestaurant(parseInt(id));
          RecoActions.setReco({restaurant: {id: restaurant.id, origin: 'db'}, recommendation: true});
          this.refs.tabs.refs.tabs.push(RecoStep3.route())
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
    RestaurantsActions.fetchRestaurants.defer();
    NotifsActions.fetchNotifications.defer();
  };

  componentWillMount() {
    this.onUpdate();
    MeStore.listen(this.onMeChange);
    NotifsStore.listen(this.onNotificationsChange);
    ProfilStore.listen(this.onProfileChange);
    RestaurantsStore.listen(this.onRestaurantsChange);

    AppState.addEventListener('change', this.onAppStateChange);

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
      // console.log('1');
      // console.log(params);
    });
    
    Branch.setIdentity(MeStore.getState().me.id.toString());

    Branch.getFirstReferringParams((params) => {
      // console.log('2');
      // console.log(params);
      if (params.from === 'friend_invitation') {
        // do something because he arrived from friend invitation 
      }
    });

    Branch.getLatestReferringParams((params) => {
      // console.log('3');
      // console.log(params);
    });

    this.startActions();
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    NotifsStore.unlisten(this.onNotificationsChange);
    ProfilStore.unlisten(this.onProfileChange);
    RestaurantsStore.unlisten(this.onRestaurantsChange);

    AppState.removeEventListener('change', this.onAppStateChange);
    
    Linking.removeEventListener('url', this.handleOpenURL);

    if (Platform.OS === 'ios') {
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


  // Actions to add the new variables in local storage when user upgrades his version
  onUpdate = () => {
    if ((Platform.OS == 'ios' && MeStore.getState().me.app_version < '2.1.0') || (Platform.OS == 'android' && MeStore.getState().me.app_version < '1.1.0')) {
      RestaurantsActions.setFilter.defer('friends', []);
    }
  };

  render() {
    var loading_array = [this.state.meLoading, this.state.notificationsLoading, this.state.profileLoading, this.state.restaurantsLoading];
    var index_loading = 0;
    _.forEach(loading_array, (loading) => {
      if (typeof loading == 'undefined') {
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
              component: Friends,
              title: 'Mes conseillers',
              icon: require('../assets/img/tabs/icons/friend.png'),
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

        {this.state.showOverlayTutorial ? [
          <Overlay key='overlay_tutorial'>
            <TouchableHighlight style={{flex: 1}} underlayColor='rgba(0, 0, 0, 0)' onPress={() => MeActions.hideOverlayTutorial()}>
              <ScrollView
                style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingTop: 50}}
                contentInset={{top: 0}}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}>
                <Image style={styles.arrowLeft} source={require('../assets/img/other/icons/arrow_curved.png')} />
                <Image style={styles.arrowRight} source={require('../assets/img/other/icons/arrow_curved.png')} />
                <Text style={styles.titleLeft}>Visualise les restaurants sur ta carte perso de Paris !</Text>
                <Text style={styles.titleRight}>Visualise les restaurants sur ta carte perso de Paris !</Text>
              </ScrollView>
            </TouchableHighlight>
          </Overlay>
        ] : null}

        {!this.state.hasBeenUploadWelcomed ? [
          <Overlay key='has_been_upload_welcomed'>
            <ScrollView
              style={{flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50}}
              contentInset={{top: 0}}
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.container}>
              <View style={styles.avatarWrapper}>
                <Image style={styles.avatar} source={require('../assets/img/other/icons/personal.png')} />
              </View>
              <Text style={styles.title}>Ton app est unique !</Text>
              <Text style={styles.message}>Elle s’affine continuellement au rythme de ton utilisation. Tu découvriras les restaurants préférés de tes amis, et, en appoint, nos restaurants “valeurs sûres”.</Text>
              <Button label='On y va !' onPress={() => {
                MeActions.hasBeenUploadWelcomed();
              }} style={{margin: 5}}/>
            </ScrollView>
          </Overlay>
        ] : null}

        {typeof this.state.showedUpdateMessage !== 'undefined' && !this.state.showedUpdateMessage && false ? [
          <Overlay key='show_update_message'>
            <ScrollView
              style={{flex: 1, backgroundColor: '#FFFFFF', paddingTop: 50}}
              contentInset={{top: 0}}
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.container}>
              <View style={styles.avatarWrapper}>
                <Image style={styles.avatar} source={require('../assets/img/tabs/icons/home.png')} />
              </View>
              <Text style={styles.title}>Ton app a été updatée !</Text>
              <Text style={styles.message}>Rends toi dès maintenant sur l'AppStore pour la mettre à jour !</Text>
              <Button label='Passer' onPress={() => {
                MeActions.showedUpdateMessage();
              }} style={{margin: 5}}/>
            </ScrollView>
          </Overlay>
        ] : null}

        {index_loading > 1 && !this.state.showOverlayTutorial ? [
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
    backgroundColor: '#FE3139',
    marginTop: 20
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
