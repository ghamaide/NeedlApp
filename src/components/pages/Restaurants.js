'use strict';

import React, {StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';

import Page from '../ui/Page';
import Filtre from './Filtre/List';
import Liste from './Liste';
import Restaurant from './Restaurant';

class Restaurants extends Page {
  static route() {
    return {
      component: Restaurants,
      title: 'Carte',
			/* FIXME : find a  way to go to the filters page == Still doesn't work with ES6 fat arrow
			leftButtonTitle: 'Filtrer',
			onLeftButtonPress: () => {
				this.push(Liste.route());
			},
			*/
      rightButtonTitle: 'Liste',
      onRightButtonPress() {
				this.replace(Liste.route());
      }
    };
  }

  restaurantsState() {
    return {
      // we want the map even if it is still loading
      data: RestaurantsStore.filteredRestaurants(),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error()
    };
  }

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.showsUserLocation = false;
  }

  onFocus = (event) => {
    if (event.data.route.component === Restaurants && event.data.route.fromTabs) {
      RestaurantsActions.fetchRestaurants();

      this.setState({showsUserLocation: true});

      navigator.geolocation.getCurrentPosition(
        () => PushNotificationIOS.requestPermissions(),
        () => PushNotificationIOS.requestPermissions()
      );
    }
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  }
	
  renderPage() {
    return (
				<View style={{flex: 1, position: 'relative'}}>
					<MapView
						style={styles.restaurantsMap}
						showsUserLocation={this.state.showsUserLocation}
						annotations={_.map(this.state.data, (restaurant) => {
							var myRestaurant = _.contains(restaurant.friends_recommending, MeStore.getState().me.id);
							myRestaurant = myRestaurant || _.contains(restaurant.friends_wishing, MeStore.getState().me.id);
							return {
								latitude: restaurant.latitude,
								longitude: restaurant.longitude,
								title: restaurant.name,
								subtitle: restaurant.food[1],
								color: myRestaurant ? 'green' : 'red',
								rightCallout: {
									type: 'button',
									onPress: () => {
										this.props.navigator.push(Restaurant.route({id: restaurant.id}));
									}
								},
								leftCallout: {
									type: 'image',
									config: {
										image: restaurant.pictures[0]
									}
								}
							};
						})}
						region={{
							latitude: 48.8534100,
							longitude: 2.3378000,
							latitudeDelta: 0.12,
							longitudeDelta: 0.065
						}} />
						<TouchableHighlight style={styles.filterMessage} underlayColor='#38E1B2' onPress={() => this.props.navigator.push(Filtre.route())}>
								<Text style={styles.filterMessageText}>
									{RestaurantsStore.filterActive() ? 'Filtre activé - ' + this.state.data.length + ' résultat' + (this.state.data.length > 1 ? 's' : '') : 'Filtre désactivé'}
								</Text>
						</TouchableHighlight>
					</View>
		);
  }
}

var styles = StyleSheet.create({
  restaurantsMap: {
    flex: 1,
    position: 'relative'
  },
  filterMessage: {
    backgroundColor: '#38E1B2',
    padding: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  filterMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  }
});

export default Restaurants;