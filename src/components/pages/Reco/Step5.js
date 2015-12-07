'use strict';

import React, {StyleSheet, Component, Text, View} from 'react-native';

import ToggleGroup from './ToggleGroup';
import Step6 from './Step6';
import RecoStore from '../../../stores/Reco';


class RecoStep5 extends Component {
  static route() {
    return {
      component: RecoStep5,
      title: 'Occasion',
      rightButtonTitle: 'Valider',
      onRightButtonPress() {
        var reco = RecoStore.getReco();
        console.log(reco);
        if (!reco.occasions || !reco.occasions.length) {
          return;
        }
        this.push(Step6.route());
      }
    };
  }

  state = {}

  render() {
    var reco = RecoStore.getReco();
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sélectionne les occasions correspondant au restaurant</Text>
        <ToggleGroup
          maxSelection={3}
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
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/dej_business.png')} activeInitial={false} label="Business" value={1} />
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/en_couple.png')} activeInitial={false} label="Couple" value={2} />
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/en_famille.png')} activeInitial={false} label="Famille" value={3} />
                </View>
                <View style={styles.pastilleContainer}>
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/entre_amis.png')} activeInitial={false} label="Amis" value={4} />
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/grandes_tablees.png')} activeInitial={false} label="Nombreux" value={5} />
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/date.png')} activeInitial={false} label="Date" value={6} />
                </View>
                <View style={styles.pastilleContainer}>
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/brunch.png')} activeInitial={false} label="Brunch" value={7} />
                  <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/occasions/icons/autre.png')} activeInitial={false} label="Autres" value={8} />
                </View>
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
  backgroundColor: 'transparent',
  padding: 10,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
 },
 title: {
  marginBottom: 30,
  color: '#000000',
  fontSize: 13,
  textAlign: 'center'
 },
 pastilleContainer: {
  flexDirection: 'row',
  alignItems: 'center'
 },
 pastille: {
  marginLeft: 15,
  marginRight: 15,
  marginTop: 10,
  marginBottom: 10
 }
});

export default RecoStep5;
