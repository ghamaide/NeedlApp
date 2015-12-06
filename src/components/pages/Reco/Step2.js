'use strict';

import React, {StyleSheet, Component, Text, View} from 'react-native';

import ToggleGroup from './ToggleGroup';
import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';
import StepSave from './StepSave';
import Step3 from './Step3';

class RecoStep2 extends Component {
  static route() {
    
    return {
      component: RecoStep2,
      title: 'Statut'
    };
  }

  state = {}

  render() {

    var reco = RecoStore.getReco();

    return (
      <View style={styles.container}>
        <Text style={styles.title}>As-tu déjà testé le restaurant "{reco.restaurant.name}" ?</Text>
        <ToggleGroup
          maxSelection={1}
          fifo={true}
          onSelect={(value) => {
            reco.approved = value === 'approved';
            reco.step2 = true;
						
						if (reco.approved) {
							return this.props.navigator.push(Step3.route());
						}

						// hack pour le fucking title ..
						// because resetTo does not change title if only one page in the stack
        		var title = MeStore.getState().me.HAS_SHARED ? reco.restaurant.name : 'Bienvenue sur Needl !';
        		this.props.navigator.resetTo(StepSave.route(title));
          }}
          onUnselect={() => {
            delete reco.approved;
            reco.step2 = false;
          }}>
          {(Toggle) => {
            return (
              <View style={styles.pastilleContainer}>
                <Toggle
                  size={60}
                  style={styles.pastille}
                  icon={require('../../../assets/img/japprouve.png')}
                  activeInitial={false}
                  label="Je recommande"
                  value={'approved'} />
                <Toggle
                  size={60}
                  style={styles.pastille}
                  icon={require('../../../assets/img/aessayer.png')}
                  activeInitial={false}
                  label="Sur ma wishlist"
                  value={'totry'} />
              </View>
            );
          }}
        </ToggleGroup>
      </View>
    );
  }
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
  fontSize: 14,
  color: '#888888',
  textAlign: 'center'
 },
 pastilleContainer: {
  flexDirection: 'row',
  alignItems: 'center'
 },
 pastille: {
  margin: 10
 }
});

export default RecoStep2;
