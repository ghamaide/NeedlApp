'use strict';

import React, {StyleSheet, Component, Image, Text, View} from 'react-native';

import MeStore from '../../stores/Me';
import Mixpanel from 'react-native-mixpanel';

class Help extends Component {
  static route(title, props) {
    return {
      component: Help,
      title: title,
      passProps: props
    };
  }

  getHelpState() {

    return {
      errors: this.state.errors
    };
  }

  constructor() {
    super();

    this.state = {
      errors: []
    };
    this.state = this.getHelpState();
  }

  componentDidMount() {
    Mixpanel.sharedInstanceWithToken('1637bf7dde195b7909f4c3efd151e26d');
    Mixpanel.trackWithProperties('Help Page From ' + this.props.from, {id: MeStore.getState().me.id});
  }

  render() {
    if (this.props.from === 'liste') {
      return (
        <View style={styles.container}>
          <View style={styles.avatarWrapper}>
            <Image style={styles.avatar} source={require('../../assets/img/other/icons/algorithm.png')} />
          </View>
          <Text style={styles.title}>Classement sur mesure</Text>
          <Text style={[styles.message, {marginBottom: 30}]}>Notre algorithme identifie les restaurants préférés de tes amis, et les pondère suivant la similarité de leurs goûts avec les tiens, pour mettre en avant les restaurants qui te correspondent le mieux.</Text>
          <Text style={styles.message}>En appoint, nous te proposons une sélection de restaurants ; des valeurs sûres où l’on n’est jamais déçu !</Text>
        </View>
      );
    } else if (this.props.from === 'restaurant') {
      return (
        <View style={styles.container}>
          <View style={styles.avatarWrapper}>
            <Image style={styles.avatar} source={require('../../assets/img/tabs/icons/home.png')} />
          </View>
          <Text style={styles.title}>Les valeurs sûres</Text>
          <Text style={styles.message}>Nous avons épluché les avis de bloggers culinaires, échangé avec des professionnels et des passionnés de la restauration pour vous faire part des adresses qui font l’unanimité.</Text>
        </View>
      );
    }
  }
}

var styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#707070',
    marginBottom: 40
  },
  message: {
    textAlign: 'center',
    fontSize: 15,
    color: '#414141'
  },
  container: {
    flex: 1,
    marginTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center'
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
  }
});

export default Help;