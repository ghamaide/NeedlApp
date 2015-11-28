'use strict';

import React, {StyleSheet, Image, Component, Text, ScrollView} from 'react-native';

import Button from '../elements/Button';

class WelcomeCEO extends Component {
  static route() {
    return {
      component: WelcomeCEO,
      title: 'Bienvenue sur Needl !'
    };
  }

  render() {
    return (
      <ScrollView
        style={{flex: 1, backgroundColor: 'white'}}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        <Text style={[styles.message, {marginBottom: 10}]}>Tu peux désormais accéder à ta carte personnalisée de Paris comprenant toutes tes recommandations ainsi que celles de tes amis.</Text>
        <Text style={[styles.message, {marginBottom: 20}]}>En attendant qu'ils s'inscrivent, tu peux compter sur ma sélection de burgers, pizzas et restaurants thaïs! Ce sont mes 3 passions culinaires, et ces adresses sont de loin mes préférées!</Text>
        <Text style={[styles.message, {marginBottom: 20}]}>Valentin, CEO Needl</Text>
        <Image style={styles.avatar} source={{uri: 'http://needl.s3.amazonaws.com/production/users/pictures/000/000/125/original/picture?1435579332'}} />
        <Button label="On y va ?" onPress={() => {
          this.props.navigator.resetToTab(0);
        }} />
      </ScrollView

      >
    );
  }
}

var styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    color: '#717171'
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 20
  }
});

export default WelcomeCEO;
