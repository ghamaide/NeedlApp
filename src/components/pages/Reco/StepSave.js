'use strict';

import React, {ActivityIndicatorIOS, Component, Platform, ProgressBarAndroid, StyleSheet, View} from 'react-native';

import Text from '../../ui/Text';

import Button from '../../elements/Button';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';
import RestaurantsStore from '../../../stores/Restaurants';

import RecoActions from '../../../actions/RecoActions';

import Restaurant from '../Restaurant';

class RecoStepSave extends Component {
  static route(props) {
    return {
      component: RecoStepSave,
      title: 'StepSave', 
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
  };

  restaurantsState() {
    return {
      error: RestaurantsStore.error(),
      loading: RestaurantsStore.loading()
    }
  };

  goToRestaurant = () => {
    var reco = RecoStore.getReco();
    var id = reco.restaurant.id;
    setTimeout(() => {
      this.props.navigator.resetTo(Restaurant.route({toggle: this.props.toggle, id: id, fromReco: true}, reco.restaurant.name));
    }, 1000);
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
    this.setState({error: ''});
    var reco = RecoStore.getReco();
    if (reco.type === 'recommendation') {
      if (!reco.editing) {
        RecoActions.addReco(reco, this.goToRestaurant);
        if (!_.isEmpty(reco.pictures)) {
          // upload pictures here
          RecoActions.uploadPictures(reco.pictures, reco.restaurant.id);
        }
      } else {
        RecoActions.updateRecommendation(reco, this.goToRestaurant);
        if (!_.isEmpty(reco.pictures)) {
          // upload pictures here
          RecoActions.uploadPictures(reco.pictures, reco.restaurant.id);
        }
      }
    } else {
      RecoActions.addWish(reco.restaurant.id, reco.restaurant.origin, this.goToRestaurant);
    }
  };

  render() {
    var content;
    if (!this.state.error) {
      content = (Platform.OS === 'ios' ? <ActivityIndicatorIOS animating={true} color='#FE3139' style={[{height: 80}]} size='large' /> : <ProgressBarAndroid indeterminate />); 
    }

    if (this.state.error) {
      if (__DEV__) {
        console.log(this.state.error);
      }
      content = <View style={styles.errorBlock}>
        <Text style={{color: '#837D9B', marginBottom: 15}}>Erreur lors de l'enregistrement</Text>
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
