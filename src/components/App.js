'use strict';

import React, {Alert, AppState, Component, DeviceEventEmitter, Image, Linking, Platform, PushNotificationIOS, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

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
import Liste from './pages/Liste';
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
      notifsPastille: NotifsStore.nbUnseenNotifs(),
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial()
    }
  };

  onPastillesChange = () => {
    this.setState({
      notifsPastille: NotifsStore.nbUnseenNotifs()
    });
  };

  onMeChange = () => {
    this.setState({
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showedUpdateMessage: MeStore.showedUpdateMessage(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial(),
      showTabBar: MeStore.getState().showTabBar
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
    if (state === 'active') {
      this.startActions();
    }
  };

  onQuickActionShortcut = (data) => {
    switch(data.type) {
      case 'fr.needl.map':
        this.refs.tabs.resetToTab(0);
        this.refs.tabs.refs.tabs.replace(Carte.route());
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
        if (!isNaN(id)) {
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
        this.refs.tabs.refs.tabs.replace(Carte.route());
        break;
      case 'restaurant':
        this.refs.tabs.resetToTab(0);
        if (!isNaN(id)) {
          this.refs.tabs.refs.tabs.push(Restaurant.route({id: parseInt(id)}));
        }
        break;
      case 'recommendation':
        this.refs.tabs.resetToTab(0)
        if (!isNaN(id)) {
          var restaurant = RestaurantsStore.getRestaurant(parseInt(id));
          RecoActions.setReco({restaurant: {id: restaurant.id, origin: 'db'}, approved: true, step2: true});
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
    RestaurantsActions.fetchRestaurants.defer();
    ProfilActions.fetchFriends.defer();
    ProfilActions.fetchFollowings.defer();
    NotifsActions.fetchNotifs.defer();
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    NotifsStore.listen(this.onPastillesChange);

    AppState.addEventListener('change', this.onAppStateChange);

    if (Platform.OS === 'ios') {
      PushNotificationIOS.requestPermissions();
      PushNotificationIOS.addEventListener('register', this.onDeviceToken);
      PushNotificationIOS.addEventListener('notification', this.onNotificationIOS);
      
      DeviceEventEmitter.addListener('quickActionShortcut', this.onQuickActionShortcut);

      Linking.addEventListener('url', this.handleOpenURL);
    
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

      var coldNotif = PushNotificationIOS.popInitialNotification();
      if (coldNotif) {
        this.notifLaunchTab = this.getNotifTab(coldNotif);
      }
    }

    this.startActions();
  };

  componentWillUnmount() {
    NotifsStore.unlisten(this.onPastillesChange);
    MeStore.unlisten(this.onMeChange);

    AppState.removeEventListener('change', this.onAppStateChange);

    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeEventListener('register', this.onDeviceToken);
      PushNotificationIOS.removeEventListener('notification', this.onNotificationIOS);

      Linking.removeEventListener('url', this.handleOpenURL);

      Branch.logout();
    }
  };

  componentDidMount() {
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleOpenURL(url, 'closed_app');
      }
    }).catch((err) => {
      console.log(err);
    })

    if (Platform.OS === 'android') {
      GcmAndroid.addEventListener('register', this.onDeviceToken);

      GcmAndroid.addEventListener('registerError', function(error){
        console.log('registerError', error.message);
      });

      GcmAndroid.addEventListener('notification', this.onNotificationAndroid);

      DeviceEventEmitter.addListener('sysNotificationClick', this.onOpenNotificationAndroid);

      GcmAndroid.requestPermissions();
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <TabView 
          ref='tabs'
          onTab={(tab) => {
            this.setState({tab});
          }}
          tabs={[
            {
              component: Liste,
              title: 'Découvrir',
              icon: require('../assets/img/tabs/icons/home.png')
            },
            {
              component: Friends,
              title: 'Amis',
              icon: require('../assets/img/tabs/icons/friend.png'),
            },
            {
              component: RecoStep1,
              icon: require('../assets/img/tabs/icons/add.png'),
              hasShared: MeStore.getState().me.HAS_SHARED
            },
            {
              component: Notifs,
              title: 'Notifs',
              icon: require('../assets/img/tabs/icons/notif.png'),
              pastille: this.state.notifsPastille < 10 ? this.state.notifsPastille : '9+'
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

        {this.state.showOverlayMapTutorial ? [
          <Overlay key='overlay_map_tutorial'>
            <TouchableHighlight style={{flex: 1}} underlayColor='rgba(0, 0, 0, 0)' onPress={() => MeActions.hideOverlayMapTutorial()}>
              <ScrollView
                style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingTop: 50}}
                contentInset={{top: 0}}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}>
                <Image style={styles.arrow} source={require('../assets/img/other/icons/arrow_curved.png')} />
                <Text style={styles.titleShowMap}>Visualise les restaurants sur ta carte perso de Paris !</Text>
              </ScrollView>
            </TouchableHighlight>
          </Overlay>
        ] : null}

        {!this.state.hasBeenUploadWelcomed ? [
          <Overlay key='has_been_upload_welcomed'>
            <ScrollView
              style={{flex: 1, backgroundColor: 'white', paddingTop: 50}}
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
              style={{flex: 1, backgroundColor: 'white', paddingTop: 50}}
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
