'use strict';

import React, {AppRegistry, Component, Platform} from 'react-native';

import _ from 'lodash';

import RestaurantsActions from './src/actions/RestaurantsActions';

import MeStore from './src/stores/Me';
import ProfilStore from './src/stores/Profil';
import FriendsStore from './src/stores/Friends';
import RestaurantsStore from './src/stores/Restaurants';

import Login from './src/components/pages/Login';
import App from './src/components/App';

class NeedlIOS extends Component {

  needlState() {
    return {
      ready: MeStore.getState().status.ready &&
              ProfilStore.getState().status.ready &&
              RestaurantsStore.getState().status.ready,
      loggedIn: !!MeStore.getState().me.id
    };
  };

  constructor(props) {
    super(props);

    this.state = this.needlState();
    this.state.isConnected = true;
  };

  componentWillMount() {
    this.onUpdate();
    MeStore.listen(this.onReadyChange.bind(this));
    ProfilStore.listen(this.onReadyChange.bind(this));
    RestaurantsStore.listen(this.onReadyChange.bind(this));
    FriendsStore.listen(this.onReadyChange.bind(this));
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onReadyChange.bind(this));
    ProfilStore.unlisten(this.onReadyChange.bind(this));
    RestaurantsStore.unlisten(this.onReadyChange.bind(this));
    FriendsStore.unlisten(this.onReadyChange.bind(this));
  };

  // Actions to add the new variables in local storage when user upgrades his version
  onUpdate = () => {
    if (_.isEmpty(MeStore.getState().me) || ((Platform.OS == 'ios' && MeStore.getState().me.app_version < '3.0.0') || (Platform.OS == 'android' && MeStore.getState().me.app_version < '1.1.0'))) {
      console.log('update');
      RestaurantsActions.setFilter.defer('friends', []);
    }
  };

  onReadyChange = () => {
    this.setState(this.needlState());
  };

  render() {
    if (!this.state.ready) {
      return null;
    }

    // if (!this.state.isConnected) {
    //   return <Connection />
    // }

    if (!this.state.loggedIn) {
      return <Login />;
    }

    return <App />;
  };
}

AppRegistry.registerComponent('NeedlIOS', () => NeedlIOS);