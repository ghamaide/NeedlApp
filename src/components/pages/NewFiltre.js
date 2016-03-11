'use strict';

import React, {Component, StyleSheet, View} from 'react-native';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

class NewFiltre extends Component {
  static route(props) {
    return {
      component: NewFiltre,
      title: 'Filtres',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();

    this.state.prices_filter = [];
    this.state.occasions_filter = [];
    this.state.types_filter = [];
    this.state.friends_filter = [];
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange() {
    this.setState(this.restaurantsState());
  };

  restaurantsState = () => {
    return  {
      prices: RestaurantsStore.getPrices(),
      occasions: RestaurantsStore.getOccasions(),
      types: RestaurantsStore.getTypes(),
      friends: RestaurantsStore.getFriends()
    };
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Filtres' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        
        {!_.isEmpty(this.state.prices) ? [
          <View key='prices' style={styles.filtreContainer}>
            {_.map(this.state.prices, (price) => {
              return <Text>{price}</Text>
            })}
          </View>
        ] : null}
        
        {!_.isEmpty(this.state.occasions) ? [
          <View key='occasions' style={styles.filtreContainer}>
            {_.map(this.state.occasions, (occasion) => {
              return <Text>{occasion}</Text>
            })}
         </View>
        ] : null} 
        
        {!_.isEmpty(this.state.types) ? [
          <View key='types' style={styles.filtreContainer}>
          {_.map(this.state.types, (type) => {
            return <Text>{type}</Text>
          })}
          </View>
        ] : null} 

        {!_.isEmpty(this.state.friends) ? [
          <View key='friends' style={styles.filtreContainer}>
            {_.map(this.state.friends, (friend_id) => {
              var friend = ProfilStore.getProfil(friend_id);
              return <Text>{friend.fullname}</Text>
            })}
          </View>
        ] : null} 
      </View>
    );
  };
}

var styles = StyleSheet.create({
  filtreContainer: {
    flexDirection: 'row'
  }
});

export default NewFiltre;