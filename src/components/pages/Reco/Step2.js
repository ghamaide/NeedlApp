'use strict';

import React, {Component, StyleSheet, View} from 'react-native';

import ToggleGroup from './ToggleGroup';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';

import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';

import Step3 from './Step3';
import StepSave from './StepSave';

class RecoStep2 extends Component {
  static route() {
    
    return {
      component: RecoStep2,
      title: 'Statut'
    };
  };

  state = {};

  render() {
    var reco = RecoStore.getReco();

    return (
      <View style={{flex: 1}}>
        <NavigationBar title="Statut" leftButtonTitle="Retour" onLeftButtonPress={() => this.props.navigator.pop()} />
        <View style={styles.container}>
          <Text style={styles.title}>As-tu déjà testé le restaurant "{reco.restaurant.name}" ?</Text>
          <ToggleGroup
            maxSelection={1}
            fifo={true}
            onSelect={(value) => {
              reco.approved = (value === 'approved');
              reco.step2 = true;

              if (reco.approved) {
                return this.props.navigator.push(Step.route());
              }

              this.props.navigator.resetTo(StepSave.route());
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
                    width={140}
                    style={styles.pastille}
                    icon={require('../../../assets/img/actions/icons/japprouve.png')}
                    activeInitial={false}
                    label="Je recommande"
                    value={'approved'} />
                  <Toggle
                    size={60}
                    width={140}
                    style={styles.pastille}
                    icon={require('../../../assets/img/actions/icons/aessayer.png')}
                    activeInitial={false}
                    label="Sur ma wishlist"
                    value={'totry'} />
                </View>
              );
            }}
          </ToggleGroup>
        </View>
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
