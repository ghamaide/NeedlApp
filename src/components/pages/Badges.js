'use strict';

import React, {Component, Dimensions, Image, ScrollView, StyleSheet, View} from 'react-native';

import _ from 'lodash';

import NavigationBar from '../ui/NavigationBar';
import Text from '../ui/Text';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';

var windowWidth = Dimensions.get('window').width;

var IMAGE_HEIGHT = 50;

class Badges extends Component {
  static route() {
    return {
      component: Badges,
      title: 'Bagdes'
    };
  };

  constructor(props) {
    super(props);
  };

  render() {
    var profil = ProfilStore.getProfil(MeStore.getState().me.id);

    var index = _.findIndex(ProfilStore.MAP_BADGES, (badge) => {return badge.rank === profil.badge.rank});
    var scoreToDo = ProfilStore.MAP_BADGES[index + 1].rank - ProfilStore.MAP_BADGES[index].rank;
    var progress = parseInt(100 * (profil.score - ProfilStore.MAP_BADGES[index].rank) / scoreToDo);

    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Badges' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView contentInset={{top:0}} automaticallyAdjustContentInsets={false}>
          <View style={styles.progressContainer}>
            <View style={{backgroundColor: '#9CE62A', position: 'absolute', top: 0, left: 0, right: (100 - progress) * windowWidth / 100, height: 50}} />
            <Text style={{textAlign: 'center', color: '#3A325D', fontSize: 14, backgroundColor: 'transparent'}}>{progress}% d'effectué jusqu'au prochain niveau !</Text>
          </View>

          {_.map(ProfilStore.MAP_BADGES, (badge, key) => {
            var visible_description = (profil.score >= badge.rank);
            var active = profil.badge.rank === badge.rank;
            return (
              <View key={'badge_' + key} style={[styles.badgeContainer, {backgroundColor: active ? '#C1BFCC' : 'transparent'}]}>
                <Image style={styles.badgeImage} source={badge.image} />
                <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center', width: windowWidth - IMAGE_HEIGHT - 30}}>
                  <Text style={styles.badgeName}>
                    <Text style={{fontWeight: '500', fontSize: 13}}>{badge.name} </Text>
                    <Text style={{fontSize: 11}}>- {badge.rank} remerciement{badge.rank > 1 ? 's' : ''}</Text>
                  </Text>
                  {visible_description ? [
                    <Text key={'description_' + key} style={styles.badgeDescription}>{badge.description}</Text>
                  ] : null}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  progressContainer: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
    height: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  badgeImage: {
    width: IMAGE_HEIGHT,
    height: IMAGE_HEIGHT,
    borderRadius: IMAGE_HEIGHT / 2,
    marginRight: 10
  },
  badgeName: {
    color: '#3A325D'
  },
  badgeDescription: {
    fontSize: 12,
    color: '#3A325D'
  }
});

export default Badges;
