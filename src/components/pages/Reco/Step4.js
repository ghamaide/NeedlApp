'use strict';

import React, {StyleSheet, Component, Text, View, ScrollView} from 'react-native';

import ToggleGroup from './ToggleGroup';
import Step5 from './Step5';
import RecoStore from '../../../stores/Reco';


class RecoStep4 extends Component {
  static route() {
    return {
      component: RecoStep4,
      title: 'Points forts',
      rightButtonTitle: 'Valider',
      onRightButtonPress() {
        var reco = RecoStore.getReco();
        if (!reco.strengths || !reco.strengths.length) {
          return;
        }
        this.push(Step5.route());
      }
    };
  }

  state = {}

  render() {
    var reco = RecoStore.getReco();
    return (
      <View style={styles.container}>        
        <Text style={styles.title}>Sélectionne une ou plusieurs points forts</Text>
         <ToggleGroup
          ref="togglegroup"
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
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/cuisine.png')} activeInitial={false} label="Cuisine" value={1} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/service.png')} activeInitial={false} label="Service" value={2} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/cadre.png')} activeInitial={false} label="Cadre" value={3} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/original.png')} activeInitial={false} label="Original" value={4} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/copieux.png')} activeInitial={false} label="Copieux" value={5} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/vins.png')} activeInitial={false} label="Vins" value={6} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/points_forts/icons/qtiteprix.png')} activeInitial={false} label="Qté Prix" value={7} />
              </View>
            </View>;
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
  marginTop: 10,
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

export default RecoStep4;
