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
      <ScrollView
        style={{flex: 1, backgroundColor: 'black'}}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Sélectionne 1 à 3 points forts</Text>
         <ToggleGroup
          ref="togglegroup"
          maxSelection={3}
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
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/cuisine.png')} activeInitial={false} label="Cuisine" value={1} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/service.png')} activeInitial={false} label="Service" value={2} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/cadre.png')} activeInitial={false} label="Cadre" value={3} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/original.png')} activeInitial={false} label="Original" value={4} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/copieux.png')} activeInitial={false} label="Copieux" value={5} />
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/vins.png')} activeInitial={false} label="Vins" value={6} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} icon={require('../../../assets/img/qtiteprix.png')} activeInitial={false} label="Qté Prix" value={7} />
              </View>
            </View>;
          }}
        </ToggleGroup>
      </ScrollView>
    );
  }
}

var styles = StyleSheet.create({
 container: {
  backgroundColor: 'transparent',
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center'
 },
 title: {
  marginBottom: 30,
  color: 'white',
  marginTop: 10,
  fontSize: 16,
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

export default RecoStep4;
