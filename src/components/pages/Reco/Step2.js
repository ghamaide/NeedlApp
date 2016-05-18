'use strict';

import React, {Component} from "react";
import {Dimensions, StyleSheet, View} from "react-native";

import ToggleGroup from './ToggleGroup';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';

import Onboard from '../../elements/Onboard';

import MeActions from '../../../actions/MeActions';
import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import NotifsStore from '../../../stores/Notifs';
import RecoStore from '../../../stores/Reco';

import Restaurant from '../Restaurant';
import Step4 from './Step4';
import StepSave from './StepSave';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var triangleWidth = 25;

class RecoStep2 extends Component {
  static route(props) {
    
    return {
      component: RecoStep2,
      title: 'Statut',
      passProps: props
    };
  };

  state = {
    onboarding_overlay: !MeStore.getState().me.recommendation_onboarding
  };

  render() {
    var reco = RecoStore.getReco();
    var activity = NotifsStore.getRecommendation(reco.restaurant.id, MeStore.getState().me.id);

    return (
      <View style={{flex: 1}}>
        <NavigationBar 
          type='back'
          title='Statut'
          leftButtonTitle='Retour' 
          onLeftButtonPress={() => {
            MeActions.updateOnboardingStatus('recommendation');
            this.props.navigator.pop();
          }} />
        <View style={styles.container}>
          <Text style={styles.title}>As-tu déjà testé le restaurant '{reco.restaurant.name}' ?</Text>
          <ToggleGroup
            maxSelection={1}
            fifo={true}
            onSelect={(value) => {
              reco.type = value;
              MeActions.updateOnboardingStatus('recommendation');
              
              if (typeof activity == 'undefined') {
                if (reco.type === 'recommendation') {
                  return this.props.navigator.push(Step4.route());
                } else {
                  return this.props.navigator.push(StepSave.route());
                }
              } else {
                if (reco.type === 'recommendation') {
                  if (activity.notification_type == 'recommendation') {
                    return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_recommended'}, reco.restaurant.name));
                  } else {
                    return this.props.navigator.push(Step4.route());
                  }
                } else {
                  if (activity.notification_type == 'wish') {
                    return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_wishlisted'}, reco.restaurant.name));
                  } else if (activity.notification_type == 'recommendation') {
                    return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_recommended'}, reco.restaurant.name));
                  }
                }
              }
            }}
            onUnselect={() => {
              delete reco.type;
            }}>
            {(Toggle) => {
              return (
                <View style={styles.pastilleContainer}>
                  <Toggle
                    size={60}
                    width={140}
                    style={styles.pastille}
                    icon={require('../../../assets/img/actions/icons/japprouve.png')}
                    activeInitial={false}
                    label='Je recommande'
                    value={'recommendation'} />
                  <Toggle
                    size={60}
                    width={140}
                    style={styles.pastille}
                    icon={require('../../../assets/img/actions/icons/aessayer.png')}
                    activeInitial={false}
                    label='Sur ma wishlist'
                    value={'wish'} />
                </View>
              );
            }}
          </ToggleGroup>
        </View>

        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_recommendation' style={{top: windowHeight/ 2 - 90}} triangleBottom={-25} triangleRight={windowWidth / 2 - triangleWidth + 75} rotation='180deg'>
            <Text style={styles.onboardingText}>Renseigne tes <Text style={{color: '#FE3139'}}>coups de coeur</Text> et gagne en statut.</Text>
          </Onboard>
        ] : null}

        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_wish' style={{top: windowHeight/ 2 + 130}} triangleTop={-25} triangleRight={windowWidth / 2 - triangleWidth - 65} >
            <Text style={styles.onboardingText}><Text style={{color: '#FE3139'}}>Garde en mémoire</Text> pour plus tard.</Text>
          </Onboard>
        ] : null}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    marginBottom: 30,
    fontSize: 13,
    color: '#C1BFCC',
    textAlign: 'center'
  },
  pastilleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pastille: {
    margin: 10
  },
  onboardingText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#EEEDF1',
    margin: 10
  }
});

export default RecoStep2;
