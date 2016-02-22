'use strict';

import React, {StyleSheet, Dimensions, TouchableHighlight, Component, View, Image, Platform, ActivityIndicatorIOS, ProgressBarAndroid} from 'react-native';
import _ from 'lodash';

import Text from '../ui/Text';

import LoginActions from '../../actions/LoginActions';

import MeActions from '../../actions/MeActions';

import MeStore from '../../stores/Me';

var windowWidth = Dimensions.get('window').width;

class Connection extends Component {
 
  constructor(props) {
    super(props);

    this.state = this.networkState();
  };

  networkState() {
    return {
      loading: MeStore.loading(),
      isConnected: MeStore.isConnected()
    }
  }

  componentWillMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  onMeChange = () => {
    this.setState(this.networkState());
  };

  onPress = () => {
    MeActions.checkConnectivity();
  };
  
  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={require('../../assets/img/other/icons/needllogo.png')} resizeMode={Image.resizeMode.contain} />
        <Text style={styles.text}>Malheureusement vous n'êtes pas connecté à Internet, veuillez vous connecter pour pouvoir accéder à tous vos restos !</Text>
        {this.state.loading ? [
          Platform.OS === 'ios' ? [
            <ActivityIndicatorIOS
              key='loading_ios'
              color='#FFFFFF'
              animating={true}
              style={{height: 80, padding: 15, marginTop: 20}}
              size='large' />
          ] : [
            <ProgressBarAndroid key='loading_android' indeterminate />
          ]
        ] : [
          <TouchableHighlight key="try_again" style={styles.button} underlayColor='rgba(0, 0, 0, 0)' onPress={this.onPress}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableHighlight>
        ]}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container:  {
    backgroundColor: '#EF582D',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    width: 250,
    height: 125,
    marginBottom: 20
  },
  text: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  button: {
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginTop: 20
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
  }
});

export default Connection;
