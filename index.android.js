'use strict';

import React, {AppRegistry, Component, NetInfo} from 'react-native';

import _ from 'lodash';

import RestaurantsActions from './src/actions/RestaurantsActions';
import MeActions from './src/actions/MeActions';

import MeStore from './src/stores/Me';
import ProfilStore from './src/stores/Profil';
import FriendsStore from './src/stores/Friends';
import RestaurantsStore from './src/stores/Restaurants';

import App from './src/components/App';
import Connection from './src/components/pages/Connection';
import Login from './src/components/pages/Login';
import Web from './src/components/pages/Web';

class NeedlIOS extends Component {

  needlState() {
    return {
      ready: MeStore.getState().status.ready &&
              ProfilStore.getState().status.ready &&
              RestaurantsStore.getState().status.ready,
      loggedIn: MeStore.getState().logged,
      openLoginAndroid: MeStore.getState().status.openLoginAndroid
    };
  };

  constructor(props) {
    super(props);

    this.state = this.needlState();
    this.state.isConnected = true;
  };

  componentWillMount() {
    this.onUpdate();
        MeActions.closeLoginFacebookAndroid();
    MeStore.listen(this.onReadyChange.bind(this));
    ProfilStore.listen(this.onReadyChange.bind(this));
    RestaurantsStore.listen(this.onReadyChange.bind(this));
    FriendsStore.listen(this.onReadyChange.bind(this));
  };

  componentDidMount() {
    NetInfo.isConnected.fetch().done((isConnected) => {
      this.setState({isConnected});
    });
    NetInfo.isConnected.addEventListener('change', this.handleFirstConnectivityChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onReadyChange.bind(this));
    ProfilStore.unlisten(this.onReadyChange.bind(this));
    RestaurantsStore.unlisten(this.onReadyChange.bind(this));
    FriendsStore.unlisten(this.onReadyChange.bind(this));
    NetInfo.isConnected.removeEventListener('change', handleFirstConnectivityChange);
  };

  createToken = () => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i < 10; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }

  handleFirstConnectivityChange = (isConnected) => {
    this.setState({isConnected});
  };

  // Actions to add the new variables in local storage when user upgrades his version
  onUpdate = () => {
    // If not logged in or logged in and below current version
    if (_.isEmpty(MeStore.getState().me) || MeStore.getState().me.app_version < '1.1.0') {
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

    if (!this.state.isConnected) {
      return <Connection />
    }

    if (!this.state.loggedIn) {
      if (this.state.openLoginAndroid) {
        var token = this.createToken();
        return <Web origin='android' source={'http://www.needl.fr/users/auth/facebook?origin=app&token=' + token} token={token} />
      } else {
        return <Login />;
      }
    }

    return <App />;
  };
}

AppRegistry.registerComponent('NeedlIOS', () => NeedlIOS);