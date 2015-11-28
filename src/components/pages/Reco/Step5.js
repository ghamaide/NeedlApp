'use strict';

import React, {StyleSheet, Component, Text, View} from 'react-native';

import ToggleGroup from './ToggleGroup';
import Step6 from './Step6';
import RecoStore from '../../../stores/Reco';


class RecoStep5 extends Component {
  static route() {
    return {
      component: RecoStep5,
      title: 'Prix',
      rightButtonTitle: 'Valider',
      onRightButtonPress() {
        var reco = RecoStore.getReco();
        if (!reco['price_range']) {
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
        <Text style={styles.title}>Sélectionne le prix moyen du plat principal</Text>
        <ToggleGroup
          maxSelection={1}
          fifo={true}
          selectedInitial={[reco.price_range]}
          onSelect={(v) => {
            reco['price_range'] = v;
          }}
          onUnselect={(v, selected) => {
            delete reco['price_range'];
          }}>
          {(Toggle) => {
            return <View style={{alignItems: 'center'}}>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} activeInitial={false} text="€" label="- 15 €" value={1} />
                <Toggle size={60} style={styles.pastille} activeInitial={false} text="€€" label="15 à 20 €" value={2} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} style={styles.pastille} activeInitial={false} text= "€€€" label="20 à 30 €" value={3} />
                <Toggle size={60} style={styles.pastille} activeInitial={false} text="€€€+" label="+ 30 €" value={4} />
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
  color: 'white',
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

export default RecoStep5;
