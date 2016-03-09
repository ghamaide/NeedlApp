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
      has_shared: MeStore.getState().me.HAS_SHARED
    };
  };

  restaurantsState() {
    return {
      error: RestaurantsStore.error(),
      loading: RestaurantsStore.loading()
    }
  };

  goToRestaurant = () => {
    var reco = RecoStore.getReco();
    var id = reco.restaurant.origin === 'foursquare' ? 0 : reco.restaurant.id;
    this.props.navigator.replace(Restaurant.route({id: id, fromReco: true}, reco.restaurant.name));
  };

  componentDidMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
    this.addActivity();
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  addActivity = () => {
    var reco = RecoStore.getReco();
    if (reco.approved) {
      if (!reco.editing) {
        RecoActions.addReco(reco, this.goToRestaurant);
      } else {
        RecoActions.updateRecommendation(reco, this.goToRestaurant);
      }
    } else {
      RecoActions.addWish(reco.restaurant.id, reco.restaurant.origin, this.goToRestaurant);
    }
  };

  render() {
    var content;
    if (!this.state.error) {
      content = (Platform.OS === 'ios' ? <ActivityIndicatorIOS animating={true} style={[{height: 80}]} size='large' /> : <ProgressBarAndroid indeterminate />); 
    }

    if (this.state.error) {
      if (__DEV__) {
        console.log(this.state.error);
      }
      content = <View style={styles.errorBlock}>
        <Text style={{color: '#555555', marginBottom: 15}}>Erreur lors de l'enregistrement</Text>
        <Button style={styles.errorButton}
          label='Réessayer'
          onPress={this.addActivity} />
      </View>;
    }

    return (
      <View style={styles.container}>
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
