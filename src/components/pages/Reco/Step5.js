'use strict';

import React, {Component} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';

import ToggleGroup from './ToggleGroup';

import Text from '../../ui/Text';
import NavigationBar from '../../ui/NavigationBar';

import RecoStore from '../../../stores/Reco';

import Step6 from './Step6';

var windowWidth = Dimensions.get('window').width;

class RecoStep5 extends Component {
  static route(props) {
    return {
      component: RecoStep5,
      title: 'Occasions',
      passProps: props
    };
  };

  state = {};

  onRightButtonPress = () => {
    var reco = RecoStore.getReco();
    if (!reco.occasions || !reco.occasions.length) {
      return;
    }
    this.props.navigator.push(Step6.route());
  };

  render() {
    var reco = RecoStore.getReco();
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Occasions' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} rightButtonTitle='Valider' onRightButtonPress={this.onRightButtonPress} />      
        <View style={styles.container}>
          <Text style={styles.title}>Sélectionne une ou plusieurs occasions correspondant au restaurant</Text>
          <ToggleGroup
            maxSelection={8}
            fifo={true}
            selectedInitial={reco.occasions}
            onSelect={(v, selected) => {
              reco.occasions = selected;
            }}
            onUnselect={(v, selected) => {
              reco.occasions = selected;
            }}>
            {(Toggle) => {
              return (
                <View style={{alignItems: 'center'}}>
                  <View style={styles.pastilleContainer}>
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/dej_business.png')} activeInitial={false} label='Business' value={1} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/en_couple.png')} activeInitial={false} label='Couple' value={2} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/en_famille.png')} activeInitial={false} label='Famille' value={3} />
                  </View>
                  <View style={styles.pastilleContainer}>
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/entre_amis.png')} activeInitial={false} label='Amis' value={4} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/grandes_tablees.png')} activeInitial={false} label='Groupe' value={5} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/brunch.png')} activeInitial={false} label='Brunch' value={6} />
                  </View>
                  <View style={styles.pastilleContainer}>
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/terrasse.png')} activeInitial={false} label='Terrasse' value={7} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/fast.png')} activeInitial={false} label='Fast' value={8} />
                    <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/date.png')} activeInitial={false} label='Date' value={9} />
                  </View>
                </View>
              );
            }}
          </ToggleGroup>
          <View style={styles.progressBar}>
            <View style={styles.progressBarCompleted} />
          </View>
        </View>
      </View>
    );
  };
}

var styles = StyleSheet.create({
 container: {
  backgroundColor: 'transparent',
  padding: 10,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
 },
 title: {
  marginBottom: 30,
  color: '#3A325D',
  fontSize: 13,
  textAlign: 'center'
 },
 pastilleContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start'
 },
 pastille: {
  marginLeft: 15,
  marginRight: 15,
  marginTop: 10,
  marginBottom: 10
 },
progressBar: {
  top: 0,
  left: 0,
  right: 0,
  height: 10,
  position: 'absolute',
  backgroundColor: '#C1BFCC'
 },
progressBarCompleted: {
  backgroundColor: '#9CE62A',
  position: 'absolute',
  top: 0,
  left: 0,
  width: (2 * windowWidth) / 3,
  height: 10
 }
});

export default RecoStep5;
