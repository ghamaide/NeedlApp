'use strict';

import React, {ActivityIndicatorIOS, Component, Platform, ProgressBarAndroid, StyleSheet, View} from 'react-native';

import Text from '../../ui/Text';

import Button from '../../elements/Button';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';
import RestaurantsStore from '../../../stores/Restaurants';

import RecoActions from '../../../actions/RecoActions';

import Liste from '../Liste';
import Restaurant from '../Restaurant';

class RecoStepSave extends Component {
  static route(title) {
    return {
      component: RecoStepSave,
      title: 'StepSave'
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      hasShared: MeStore.getState().me.HAS_SHARED
    };
  };

  goToRestaurant = () => {
    var reco = RecoStore.getReco();
    var id = reco.restaurant.origin === 'foursquare' ? 0 : reco.restaurant.id;
    this.props.navigator.replace(Restaurant.route({id: id, fromReco: true}, reco.restaurant.name));
  };

  componentDidMount() {
    var reco = RecoStore.getReco();
    RecoActions.saveReco(reco, this.goToRestaurant);
  };

  render() {
    var content;

    var reco = RecoStore.getReco();

    if (!this.state.error) {
      content = (Platform.OS === 'ios' ? <ActivityIndicatorIOS animating={true} style={[{height: 80}]} size='large' /> : <ProgressBarAndroid indeterminate />); 
    }

    if (this.state.error && this.state.error.notice) {
      content = <View style={styles.errorBlock}>
        <Text style={{color: 'white'}}>{this.state.err.notice}</Text>
        <Button style={styles.errorButton}
          label='Ok !'
          onPress={this.goToRestaurant} />
      </View>;
    }

    if (this.state.error && !this.state.error.notice) {
      content = <View style={styles.errorBlock}>
        <Text style={{color: 'white'}}>Erreur lors de l'enregistrement</Text>
        <Button style={styles.errorButton}
          label='Réessayer'
          onPress={() => {
            RecoActions.saveReco(reco);
          }} />
      </View>;
    }

    return (
      <View style={styles.container}>
        <Text style={{color: '#000000'}}>Merci d'avoir partagé!</Text>
        {content}
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
 errorBlock: {
  marginTop: 10,
  padding: 10,
  alignItems: 'center',
 },
 errorButton: {
  marginTop: 10
 }
});

export default RecoStepSave;
