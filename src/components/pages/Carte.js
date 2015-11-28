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

var mapRef = 'mapRef';

class Carte extends Page {
  static route(title) {
    return {
      component: Carte,
      title: title,
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
    this.state.initialPosition = 'unkown';
    this.state.options = {
      center: {
        latitude: 48.8534100,
        longitude: 2.3378000
      },
      zoom: 11
    };
  }

  onFocus = (event) => {
    if (event.data.route.component === Carte) {
      RestaurantsActions.fetchRestaurants();

      this.setState({showsUserLocation: true});
/*
      navigator.geolocation.getCurrentPosition(
        () => PushNotificationIOS.requestPermissions(),
        () => PushNotificationIOS.requestPermissions()
      );
*/

      navigator.geolocation.getCurrentPosition(
        (initialPosition) => this.setState({initialPosition}),
        (error) => console.log(error.message),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
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

  onRegionChangeComplete = (region) => {
    // to check if in area
    var westLongitude = region.longitude + region.longitudeDelta
    var eastLongitude = region.longitude - region.longitudeDelta
    var northLatitude = region.latitude + region.latitudeDelta
    var bottomLatitude = region.latitude - region.latitudeDelta
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
          }}
          onRegionChangeComplete={this.onRegionChangeComplete} />

				<TouchableHighlight style={styles.filterMessage} underlayColor='#38E1B2' onPress={() => this.props.navigator.push(Filtre.route())}>
						<View style={styles.filterContainer}>
              {RestaurantsStore.filterActive() ? 
                [
                  <View key={'opened'} style={styles.triangleDown} />
                ] : [
                  <View key={'closed'} style={styles.triangleRight} />
                ]
              }
              <Text style={styles.filterMessageText}>
                {RestaurantsStore.filterActive() ? 'Filtre activé - ' + this.state.data.length + ' résultat' + (this.state.data.length > 1 ? 's' : '') : 'Filtre désactivé'}
              </Text>
            </View>
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
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  triangleRight: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [
      {rotate: '90deg'}
    ]
  },
    triangleDown: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [
      {rotate: '180deg'}
    ]
  }
});

export default Carte;