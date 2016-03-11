'use strict';

import React, {AppRegistry, Component} from 'react-native';

import _ from 'lodash';

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