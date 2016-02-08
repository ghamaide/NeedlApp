'use strict';

import React, {StyleSheet, Component, View, ProgressBarAndroid} from 'react-native';

import Text from '../../ui/Text';

import Button from '../../elements/Button';

import RecoStore from '../../../stores/Reco';
import MeStore from '../../../stores/Me';

import RecoActions from '../../../actions/RecoActions';

import Restaurant from '../Restaurant';
import Liste from '../Liste';

class RecoStepSave extends Component {
  static route(title) {
    return {
      component: RecoStepSave,
      // hack: a cause des deux resetToConsécutifs, on est obligé
      // de setter le titre tel qu'il sera appres
      // pour pas rester avec un Merci...
      title: title
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
    this.props.navigator.resetTo(Restaurant.route({id: id}, reco.restaurant.name));
  };

  onRecoChange = () => {
    if (RecoStore.getState().saved) {
      if (!this.state.hasShared) {
        return this.props.navigator.resetTo(Liste.route());
      }
      return this.goToRestaurant();
    }

    this.setState({
      err: RecoStore.getState().errSave
    });
  };

  componentDidMount() {
    RecoStore.listen(this.onRecoChange);
    var reco = RecoStore.getReco();
    RecoActions.saveReco(reco);
  };

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoChange);
  };

  render() {
    var content;

    var reco = RecoStore.getReco();

    if (!this.state.err) {
      content = <ProgressBarAndroid indeterminate />;
    }

    if (this.state.err && this.state.err.notice) {
      content = <View style={styles.errorBlock}>
        <Text style={{color: 'white'}}>{this.state.err.notice}</Text>
        <Button style={styles.errorButton}
          label="Ok !"
          onPress={this.goToRestaurant} />
      </View>;
    }

    if (this.state.err && !this.state.err.notice) {
      content = <View style={styles.errorBlock}>
        <Text style={{color: 'white'}}>Erreur lors de l'enregistrement</Text>
        <Button style={styles.errorButton}
          label="Réessayer"
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
