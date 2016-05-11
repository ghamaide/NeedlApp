'use strict';

import React, {Image, Platform, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Dimensions from 'Dimensions';
import MapView from 'react-native-maps';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import PriceMarker from '../elements/PriceMarker';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import Filtre from './Filtre';
import Profil from './Profil';
import Restaurant from './Restaurant';

let buttonSize = 45;
let buttonMargin = 10;

class CarteProfil extends Page {
  static route(props) {
    return {
      component: CarteProfil,
      title: 'Carte Profil',
      passProps: props
    };
  };

 currentProfil() {
    return this.props.id || MeStore.getState().me.id;
  };

  mapState() {
    return {
      profile: ProfilStore.getProfil(this.currentProfil()),
      loading: ProfilStore.loading(),
      error: ProfilStore.error()
    };
  };

  constructor(props) {
    super(props);

    if (Platform.OS === 'android') {
      var region = typeof RestaurantsStore.getState().currentRegion.latitude !== 'undefined' ? RestaurantsStore.getState().currentRegion : RestaurantsStore.getState().region;
    } else {
      var region = RestaurantsStore.getState().currentRegion || RestaurantsStore.getState().region;
    }

    this.state = this.mapState();
    
    // Region is where the user left
    this.state.region = region;
    
    // Whether to show user's location
    this.state.showsUserLocation = false;

    // To specify the default level of zoom
    this.state.defaultLatitudeDelta = 4 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320*Math.cos(this.state.defaultLatitudeDelta)) ;
    
    // Paris 4 point coordinates and center
    this.state.paris = {
      northLatitude: 48.91,
      centerLatitude: 48.86,
      southLatitude: 48.8,
      westLongitude: 2.25,
      centerLongitude: 2.34,
      eastLongitude: 2.42
    };
  };

  startActions = () => {
    this.setState({showsUserLocation: true});

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        if (this.isInParis(initialPosition)) {
          this.setState({
            region: {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude,
              latitudeDelta: this.state.defaultLatitudeDelta,
              longitudeDelta: this.state.defaultLongitudeDelta
            }
          });
        } else {
          this.setState({
            region: {
              latitude: this.state.paris.centerLatitude,
              longitude: this.state.paris.centerLongitude,
              latitudeDelta: this.state.defaultLatitudeDelta,
              longitudeDelta: this.state.defaultLongitudeDelta
            }
          });
        }
      },
      (error) => {
        if (__DEV__) {
          console.log(error);
        }
        this.setState({
           region: {
            latitude: this.state.paris.centerLatitude,
            longitude: this.state.paris.centerLongitude,
            latitudeDelta: this.state.defaultLatitudeDelta,
            longitudeDelta: this.state.defaultLongitudeDelta
          }
        });
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  };

  componentWillMount() {
    this.startActions();
    ProfilStore.listen(this.onProfilsChange);
  };

  componentWillUnmount() {
    ProfilStore.unlisten(this.onProfilsChange);
  };

  onProfilsChange = () => {
    this.setState(this.mapState());
  };

  // Check if position is in paris
  isInParis = (initialPosition) => {
    return (initialPosition.coords.latitude <= this.state.paris.northLatitude && initialPosition.coords.latitude >= this.state.paris.southLatitude && initialPosition.coords.longitude <= this.state.paris.eastLongitude && initialPosition.coords.longitude >= this.state.paris.westLongitude);
  };

  onRegionChangeComplete = (region) => {
    this.setState({region: region});
  };

  renderPage() {
    var profile = this.state.profile;
    var isFollowing = ProfilStore.isFollowing(profile.id);
    var recommendations_and_wishes = isFollowing ? profile.public_recommendations : _.concat(profile.recommendations, profile.wishes);
    var restaurants = [];
    _.forEach(recommendations_and_wishes, (restaurantId) => {
      var restaurant = RestaurantsStore.getRestaurant(restaurantId);
      restaurants.push(_.extend(restaurant, {from: _.includes(restaurant.my_friends_wishing, this.currentProfil()) ? 'wish' : 'recommendation'}));
    });
    
    var sortedRestaurants = _.reverse(_.sortBy(restaurants, ['score']));

    return (
      <View style={{flex: 1, position: 'relative'}}>
        <View key='mapcontainer' style={{flex: 1, position: 'relative'}}>
          <MapView
            key='map'
            ref='mapview'
            style={styles.restaurantsMap}
            showsUserLocation={this.state.showsUserLocation}
            region={this.state.region}
            onRegionChange={this.onRegionChange}
            onRegionChangeComplete={this.onRegionChangeComplete}
            onPress={this.onMapPress}
            onMarkerSelect={this.onMarkerPress}>     
            {_.map(sortedRestaurants, (restaurant) => {
              var coordinates = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              var budget = _.map(_.range(0, Math.min(3, restaurant.price_range)), function() {
                return '€';
              }).join('') + (restaurant.price_range > 3 ? '+' : '');

              if (!budget) {
                budget = '-'
              }
              return (
                <MapView.Marker
                  key={restaurant.id}
                  coordinate={coordinates}>
                  <PriceMarker text={budget} backgroundColor={restaurant.from === 'wish' ? '#9CE62A' : '#FE3139'} />
                  <MapView.Callout>
                    <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name))}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <Image source={{uri: restaurant.pictures[0]}} style={{height: 50, width: 50, marginRight: 5}} />
                        <View>
                          <Text style={{color: '#3A325D', fontSize: (Platform.OS === 'ios' ? 15 : 14), fontWeight: '500', marginBottom: 5}}>{restaurant.name}</Text>
                          <Text style={{color: '#3A325D', fontSize: 13}}>{restaurant.food[1]}</Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </MapView.Callout>
                </MapView.Marker>
              );
            })}
          </MapView>
        </View>

      {/* Button to switch to profile */}
        <TouchableHighlight
          underlayColor='rgba(0, 0, 0, 0)'
          style={styles.submitButton}
          onPress={() => {
            if (!this.props.id) {
              this.props.navigator.replace(Profil.route())
            } else {
              this.props.navigator.replace(Profil.route({id: this.props.id}));
            }
          }}>
          <Image source={require('../../assets/img/tabs/icons/account.png')} style={styles.submitIcon} />
        </TouchableHighlight> 
      </View>
    );
  };
}

var styles = StyleSheet.create({
  restaurantsMap: {
    flex: 1,
    position: 'relative'
  },
  submitButton : {
    backgroundColor: '#FE3139',
    borderColor: '#FE3139',
    position: 'absolute',
    bottom: buttonMargin,
    right: buttonMargin,
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitIcon: {
    tintColor: '#FFFFFF',
    height: buttonSize - 20,
    width: buttonSize - 20
  }
});

export default CarteProfil;