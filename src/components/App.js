'use strict';

import React, {Component, AppStateIOS, View, PushNotificationIOS, NativeModules, Text, Image, StyleSheet, ActivityIndicatorIOS, ScrollView, StatusBarIOS} from 'react-native';
import Overlay from 'react-native-overlay';
import _ from 'lodash';

import TabView from './ui/TabView';
import ErrorToast from './ui/ErrorToast';

import Profil from './pages/Profil';
import Friends from './pages/Friends';
import Notifs from './pages/Notifs';
import Liste from './pages/Liste';
import RecoStep1 from './pages/Reco/Step1';

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
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed()
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

    var uploadListError = MeStore.uploadingListError();
    if (uploadListError && !_.contains(errors, uploadListError)) {
      errors.push(uploadListError);
    }

    this.setState({
      uploadingList: MeStore.uploadingList(),
      errors: errors,
      hasBeenUploadWelcomed: MeStore.hasBeenUploadWelcomed(),
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
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
    MeActions.resetBadgeNumber();

    FriendsActions.fetchFriends();
    NotifsActions.fetchNotifs();
    StatusBarIOS.setStyle('default');
  }

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    FriendsStore.listen(this.onPastillesChange);
    NotifsStore.listen(this.onPastillesChange);

    PushNotificationIOS.addEventListener('register', this.onDeviceToken);
    PushNotificationIOS.addEventListener('notification', this.onNotification);
    AppStateIOS.addEventListener('change', this.onAppStateChange);

    var coldNotif = PushNotificationIOS.popInitialNotification();
    if (coldNotif) {
      this.notifLaunchTab = this.getNotifTab(coldNotif);
    }

    this.startActions();
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.onPastillesChange);
    NotifsStore.unlisten(this.onPastillesChange);
    MeStore.unlisten(this.onMeChange);
  }

  pickImage() {
    var options = {
      title: 'Choisis ta photo', // specify null or empty string to remove the title
      cancelButtonTitle: 'Annuler',
      takePhotoButtonTitle: 'Prendre une photo...', // specify null or empty string to remove this button
      chooseFromLibraryButtonTitle: 'Choisir une photo de tes albums...', // specify null or empty string to remove this button
      quality: 0.2,
      allowsEditing: false, // Built in iOS functionality to resize/reposition the image
      noData: false // Disables the base64 `data` field from being generated (greatly improves performance on large photos)
    }
    
    NativeModules.UIImagePickerManager.showImagePicker(options, (didCancel, response) => {
      console.log('Response = ', response);

      if (didCancel) {
        console.log('User cancelled image picker');
      }

      else {
        var uri = 'data:image/jpeg;base64,' + response.data;
        MeActions.uploadList(uri, () => {
          this.setState({showUploadConfirmation: true});
          setTimeout(() => {
            this.setState({showUploadConfirmation: false});
          }, 4000);
        });
      }
    });
  }

  render() {
    var uploadText = "Si toi aussi tu stockes tes restaurants à tester dans des notes ou quoi que ce soit d'autres, prends des screenshots et importe-les! Tu pourras également le faire à tout autre moment sur ta page profil. Les restaurants seront alors automatiquement ajoutés à ta wishlist sous 24h.";

    if (this.state.secondTime) {
      uploadText = "Ta photo a bien été récupérée, tes restaurants seront ajoutés à ta wishlist d'ici 24h. Si besoin, tu peux importer d'autres photos ou commencer à naviguer!";
    }

    return (
      <View style={{flex: 1}}>
        {_.map(this.state.errors, (error, i) => {
          return <ErrorToast key={i} value={JSON.stringify(error)} appBar={true} />;
        })}
        <Overlay isVisible={this.state.uploadingList}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <View style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              opacity: 0.5
            }} />
            <ActivityIndicatorIOS
              animating={true}
              color="#EF582D"
              style={[{height: 80}]}
              size="large"
            />
          </View>
        </Overlay>

        <Overlay isVisible={!this.state.selectingPhoto && !this.state.uploadingList && !this.state.hasBeenUploadWelcomed}>
          <ScrollView
            style={{flex: 1, backgroundColor: 'white', paddingTop: 50}}
            contentInset={{top: 0}}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.containerCEOMessage}>
            <Text style={[styles.messageCEO, {marginBottom: 10}]}>Tu peux désormais accéder à ta carte personnalisée de Paris comprenant toutes tes recommandations ainsi que celles de tes amis.</Text>
            <Text style={[styles.messageCEO, {marginBottom: 20}]}>En attendant qu'ils s'inscrivent, tu peux compter sur ma sélection de burgers, pizzas et restaurants thaïs! Ce sont mes 3 passions culinaires, et ces adresses sont de loin mes préférées!</Text>
            <Text style={[styles.messageCEO, {marginBottom: 20}]}>Valentin, CEO Needl</Text>
            <Image style={styles.avatarCEO} source={{uri: 'http://needl.s3.amazonaws.com/production/users/pictures/000/000/125/original/picture?1435579332'}} />
            <Button label="Passer" onPress={() => {
              MeActions.hasBeenUploadWelcomed();
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
              name: 'Accueil',
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
  }
}

var styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  backContainer: {
    backgroundColor: 'white',
    opacity: 0.8,
    position: 'absolute',
    top: 0,
    bottom: -40,
    left: 0,
    right: -40
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold'
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    color: '#EF582D',
    fontWeight: 'bold'
  },
  containerCEOMessage: {
    padding: 20,
    alignItems: 'center'
  },
  messageCEO: {
    textAlign: 'center',
    fontSize: 14,
    color: '#717171'
  },
  avatarCEO: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 20
  },
  messageImportList: {
    textAlign: 'center',
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    paddingRight: 10,
    paddingLeft: 10
  },
  titleImportList: {
    textAlign: 'center',
    fontSize: 18,
    color: '#EF582D',
    fontWeight: 'bold',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 10
  },
  containerReco: {
    backgroundColor: 'white'
  },
  containerFirstMessageReco: {
    backgroundColor: '#38E1B2',
    padding: 10
  },
  textFirstMessageReco: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  restaurantQueryInput: {
    height: 30,
    backgroundColor: '#EEEEEE',
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 15,
    margin: 10
  },
  restaurantsList: {
    backgroundColor: 'white',
    marginBottom: 20
  },
  restaurantRowInner: {
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 10
  },
  noResultText: {
    fontWeight: 'bold',
    color: '#222'
  },
  activityIndicator: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default App;
