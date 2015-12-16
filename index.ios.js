'use strict';

import React, {AppRegistry, Component, StyleSheet, Text, View, TextInput} from 'react-native';

var OldText = Text;

class NewText extends OldText {
  defaultProps = {
    customFont: false
  }

  render() {
    var props = _.clone(this.props);

    if (this.props.customFont) {
      return super.render();
    }

    if (_.isArray(this.props.style)){
      props.style.push({fontFamily: 'Quicksand-Regular'});
    } else if (props.style) {
      props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
    } else {
      props.style = {fontFamily: 'Quicksand-Regular'};
    }

    this.props = props;

    return super.render();
  }
}

React.Text = NewText;

var OldTextInput = TextInput;

class NewTextInput extends OldTextInput {
  defaultProps = {}
  render() {
    var props = _.clone(this.props);

    if (_.isArray(this.props.style)){
      props.style.push({fontFamily: 'Quicksand-Regular'});
    } else if (props.style) {
      props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
    } else {
      props.style = {fontFamily: 'Quicksand-Regular'};
    }

    this.props = props;

    return super.render();
  }
}

React.TextInput = NewTextInput;

import _ from 'lodash';
import Login from './src/components/pages/Login';
import App from './src/components/App';
import MeStore from './src/stores/Me';
import ProfilStore from './src/stores/Profil';
import FriendsStore from './src/stores/Friends';
import RestaurantsStore from './src/stores/Restaurants';

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

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('NeedlIOS', () => NeedlIOS);