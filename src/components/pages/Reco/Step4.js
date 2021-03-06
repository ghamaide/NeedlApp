'use strict';

import React, {Component} from 'react';
import {Dimensions, ScrollView, StyleSheet, View} from 'react-native';

import ToggleGroup from './ToggleGroup';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';

import RecoStore from '../../../stores/Reco';

import Step5 from './Step5';

var windowWidth = Dimensions.get('window').width;

class RecoStep4 extends Component {
  static route(props) {
    return {
      component: RecoStep4,
      title: 'Points forts',
      passProps: props
      
    };
  };

  state = {};

  onRightButtonPress = () => {
    var reco = RecoStore.getReco();
    if (!reco.strengths || !reco.strengths.length) {
      return;
    }
    this.props.navigator.push(Step5.route());
  };

  render() {
    var reco = RecoStore.getReco();
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Points forts' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} rightButtonTitle='Valider' onRightButtonPress={this.onRightButtonPress} />      
        <View style={styles.container}> 
          <Text style={styles.title}>Sélectionne un ou plusieurs points forts</Text>
           <ToggleGroup
            ref='togglegroup'
            maxSelection={7}
            fifo={true}
            selectedInitial={reco.strengths}
            onSelect={(v, selected) => {
              reco.strengths = selected;
            }}
            onUnselect={(v, selected) => {
              reco.strengths = selected;
            }}>
            {(Toggle) => {
              return <View style={{alignItems: 'center'}}>
                <View style={styles.pastilleContainer}>
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/cuisine.png')} activeInitial={false} label='Cuisine' value={1} />
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/service.png')} activeInitial={false} label='Service' value={2} />
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/cadre.png')} activeInitial={false} label='Cadre' value={3} />
                </View>
                <View style={styles.pastilleContainer}>
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/original.png')} activeInitial={false} label='Original' value={4} />
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/copieux.png')} activeInitial={false} label='Copieux' value={5} />
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/vins.png')} activeInitial={false} label='Vins' value={6} />
                </View>
                <View style={styles.pastilleContainer}>
                  <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/images/icons/qtiteprix.png')} activeInitial={false} label='Qté Prix' value={7} />
                </View>
              </View>;
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
  marginTop: 10,
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
  width: windowWidth / 3,
  height: 10
 }
});

export default RecoStep4;
