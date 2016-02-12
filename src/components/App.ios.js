'use strict';

import React, {DeviceEventEmitter, Component, AppStateIOS, View, PushNotificationIOS, Image, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';

import _ from 'lodash';
import Overlay from 'react-native-overlay';

import TabView from './ui/TabView';
import Text from './ui/Text';

import Button from './elements/Button';

import ProfilActions from '../actions/ProfilActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import NotifsActions from '../actions/NotifsActions';
import MeActions from '../actions/MeActions';

import MeStore from '../stores/Me';
import ProfilStore from '../stores/Profil';
import NotifsStore from '../stores/Notifs';
import RestaurantsStore from '../stores/Restaurants';

import Profil from './pages/Profil';
import Restaurant from './pages/Restaurant';
import Carte from './pages/Carte';
import Friends from './pages/Friends';
import Notifs from './pages/Notifs';
import Liste from './pages/Liste';
import RecoStep1 from './pages/Reco/Step1';

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

  getNotificationTab(notification) {
    var notificationTab;
    switch(notification.getData().type) {
      case 'reco':
        notificationTab = 3;
        break;
      case 'friend':
        notificationTab = 1;
        break;
    }
    return notificationTab;
  };

  onNotification = (notification) => {
    var notificationTab = this.getNotificationTab(notification);

    if (notificationTab && AppStateIOS.currentState !== 'active') {
      this.refs.tabs.resetToTab(notificationTab, {skipCache: true});
    }
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

  startActions() {
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
    MeActions.startActions.defer(this.props.version);
    RestaurantsActions.fetchRestaurants.defer();
    ProfilActions.fetchProfils.defer();
    NotifsActions.fetchNotifs.defer();
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    NotifsStore.listen(this.onPastillesChange);

    PushNotificationIOS.requestPermissions();
    PushNotificationIOS.addEventListener('register', this.onDeviceToken);
    PushNotificationIOS.addEventListener('notification', this.onNotification);
    AppStateIOS.addEventListener('change', this.onAppStateChange);

    DeviceEventEmitter.addListener('quickActionShortcut', this.onQuickActionShortcut);

    var coldNotif = PushNotificationIOS.popInitialNotification();
    if (coldNotif) {
      this.notifLaunchTab = this.getNotifTab(coldNotif);
    }

    this.startActions();
  };

  componentWillUnmount() {
    NotifsStore.unlisten(this.onPastillesChange);
    MeStore.unlisten(this.onMeChange);
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Overlay isVisible={this.state.showOverlayMapTutorial}>
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

        <Overlay isVisible={!this.state.hasBeenUploadWelcomed}>
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
            <Button label="On y va !" onPress={() => {
              MeActions.hasBeenUploadWelcomed();
            }} style={{margin: 5}}/>
          </ScrollView>
        </Overlay>

        <Overlay isVisible={(typeof this.state.showedUpdateMessage !== 'undefined' && !this.state.showedUpdateMessage)}>
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
            <Button label="Passer" onPress={() => {
              MeActions.showedUpdateMessage();
            }} style={{margin: 5}}/>
          </ScrollView>
        </Overlay>

        <TabView 
          ref="tabs"
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
