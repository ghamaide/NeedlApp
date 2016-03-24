'use strict';

import React, {AppRegistry, Component, NetInfo} from 'react-native';

import _ from 'lodash';

import RestaurantsActions from './src/actions/RestaurantsActions';

import MeStore from './src/stores/Me';
import ProfilStore from './src/stores/Profil';
import FriendsStore from './src/stores/Friends';
import RestaurantsStore from './src/stores/Restaurants';

import App from './src/components/App';
import Connection from './src/components/pages/Connection';
import Login from './src/components/pages/Login';

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
      return <Login />;
    }

    return <App />;
  };
}

AppRegistry.registerComponent('NeedlIOS', () => NeedlIOS);