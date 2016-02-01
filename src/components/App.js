'use strict';

import React, {Component, AppStateIOS, View, PushNotificationIOS, Image, StyleSheet, ScrollView, TouchableHighlight} from 'react-native';

import _ from 'lodash';
import Overlay from 'react-native-overlay';

import TabView from './ui/TabView';
import Text from './ui/Text';

import Button from './elements/Button';

import FriendsActions from '../actions/FriendsActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import NotifsActions from '../actions/NotifsActions';
import MeActions from '../actions/MeActions';

import MeStore from '../stores/Me';
import FriendsStore from '../stores/Friends';
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
      friendsPastille: FriendsStore.nbUnseenRequests(),
      notifsPastille: NotifsStore.nbUnseenNotifs(),
      errors: [],
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
      showOverlayMapTutorial: MeStore.showOverlayMapTutorial()
    };
  };

  onPastillesChange = () => {
    this.setState({
      friendsPastille: FriendsStore.nbUnseenRequests(),
      notifsPastille: NotifsStore.nbUnseenNotifs()
    });
  };

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

  onNotification = (notif) => {
    var notifTab = this.getNotifTab(notif);

    if (notifTab && AppStateIOS.currentState !== 'active') {
      this.refs.tabs.resetToTab(notifTab, {skipCache: true});
    }
  };

  onAppStateChange = (state) => {
    if (state === 'active') {
      this.startActions();
    }
  };

  startActions() {
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
    MeActions.startActions.defer(this.props.version);
    FriendsActions.fetchFriends.defer();
    NotifsActions.fetchNotifs.defer();
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    FriendsStore.listen(this.onPastillesChange);
    NotifsStore.listen(this.onPastillesChange);

    PushNotificationIOS.requestPermissions();
    PushNotificationIOS.addEventListener('register', this.onDeviceToken);
    PushNotificationIOS.addEventListener('notification', this.onNotification);
    AppStateIOS.addEventListener('change', this.onAppStateChange);

    var coldNotif = PushNotificationIOS.popInitialNotification();
    if (coldNotif) {
      this.notifLaunchTab = this.getNotifTab(coldNotif);
    }

    this.startActions();
  };

  componentWillUnmount() {
    FriendsStore.unlisten(this.onPastillesChange);
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
              name: 'Découvrir',
              icon: require('../assets/img/tabs/icons/home.png')
            },
            {
              component: Friends,
              name: 'Amis',
              icon: require('../assets/img/tabs/icons/friend.png'),
              pastille: this.state.friendsPastille < 10 ? this.state.friendsPastille : '9+'
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
