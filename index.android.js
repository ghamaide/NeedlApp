'use strict';

import React, {AppRegistry, Component, StyleSheet, Text, View, TextInput} from 'react-native';

import _ from 'lodash';
import Login from './srcAndroid/components/pages/Login';
import App from './srcAndroid/components/App';
//import EditMe from './srcAndroid/components/pages/EditMe';
import MeStore from './srcAndroid/stores/Me';
import MeActions from './srcAndroid/actions/MeActions';
import ProfilStore from './srcAndroid/stores/Profil';
import FriendsStore from './srcAndroid/stores/Friends';
import RestaurantsStore from './srcAndroid/stores/Restaurants';

class NeedlIOS extends Component {

  static getNeedlState() {
    return {
      ready: MeStore.getState().status.ready &&
              ProfilStore.getState().status.ready &&
              FriendsStore.getState().status.ready &&
              RestaurantsStore.getState().status.ready,
      loggedIn: !!MeStore.getState().me.id
    };
  }

  state = NeedlIOS.getNeedlState()

  componentWillMount() {
    MeActions.showedCurrentPosition(false);
    MeStore.listen(this.onReadyChange.bind(this));
    ProfilStore.listen(this.onReadyChange.bind(this));
    RestaurantsStore.listen(this.onReadyChange.bind(this));
    FriendsStore.listen(this.onReadyChange.bind(this));
  }

  componentWillUnmount() {
    MeStore.unlisten(this.onReadyChange.bind(this));
    ProfilStore.unlisten(this.onReadyChange.bind(this));
    RestaurantsStore.unlisten(this.onReadyChange.bind(this));
    FriendsStore.unlisten(this.onReadyChange.bind(this));
  }

  onReadyChange = () => {
    this.setState(NeedlIOS.getNeedlState());
  }

  render() {
    if (!this.state.ready) {
      return null;
    }

    if (!this.state.loggedIn) {
      return <Login />;
    }

    return <App />;
  }
}

AppRegistry.registerComponent('NeedlIOS', () => NeedlIOS);
