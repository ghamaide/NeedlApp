'use strict';

import React, {StyleSheet, View, TouchableHighlight, Image, PixelRatio} from 'react-native';

import _ from 'lodash';
import Dimensions from 'Dimensions';
import MapView from 'react-native-maps';

import Page from '../ui/Page';
import Text from '../ui/Text';
import Carousel from '../ui/Carousel';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';

import RestaurantsActions from '../../actions/RestaurantsActions';
import MeActions from '../../actions/MeActions';

import RestaurantsStore from '../../stores/Restaurants';
import ProfilStore from '../../stores/Profil';
import MeStore from '../../stores/Me';

import Filtre from './Filtre';
import Profil from './Profil';
import Restaurant from './Restaurant';


var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

class CarteProfil extends Page {
  static route(props) {
    return {
      component: CarteProfil,
      passProps: props
    };
  };

 currentProfil() {
    return this.props.id || MeStore.getState().me.id;
  };

  mapState() {
    return {
      // we want the map even if it is still loading
      profile: ProfilStore.getProfil(this.currentProfil()),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.mapState();
    this.state.region = RestaurantsStore.getState().region;
    this.state.showsUserLocation = false;
    this.state.showedCurrentPosition = MeStore.getState().showedCurrentPosition;
    this.state.defaultLatitudeDelta = 4 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320*Math.cos(this.state.defaultLatitudeDelta)) ;
    this.state.paris = {
      northLatitude: 48.91,
      southLatitude: 48.8,
      westLongitude: 2.25,
      eastLongitude: 2.42
    }
  };

  startActions = () => {
    this.setState({showsUserLocation: true});

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
          this.setState({
            region: {latitude: initialPosition.coords.latitude, longitude: initialPosition.coords.longitude, latitudeDelta: this.state.defaultLatitudeDelta, longitudeDelta: this.state.defaultLongitudeDelta}
          });
          MeActions.showedCurrentPosition(true);
      },
      (error) => console.log(error.message),
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

  onRegionChangeComplete = (region) => {
    this.setState({region: region, displayRestaurant: false});
  };

  onMapPress = (zone) => {
    this.setState({displayRestaurant: false});
  };

  onSelect = (event) => {
    // trigger event marker
    console.log('on select');
    console.log(event);
    // this.setState({displayRestaurant: true});
  };

  renderPage() {
    var profile = this.state.profile;
    console.log(profile);
    return (
  		<View style={{flex: 1, position: 'relative'}}>
        <NavigationBar key="navbar" image={require('../../assets/img/tabs/icons/account.png')} title="Carte" rightButtonTitle="Profil" onRightButtonPress={() => this.props.navigator.replace(Profil.route())} />
        <View key="mapcontainer" style={{flex: 1, position: 'relative'}}>
          <MapView
            key="map"
            ref="mapview"
            style={styles.restaurantsMap}
            showsUserLocation={this.state.showsUserLocation}
            region={this.state.region}
            onRegionChange={this.onRegionChange}
            onRegionChangeComplete={this.onRegionChangeComplete}
            onPress={this.onMapPress}
            onMarkerSelect={this.onMarkerPress}>     
            {_.map(profile.recommendations, (recommendationId) => {
              var restaurant = RestaurantsStore.getRestaurant(recommendationId);
              var coordinates = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              return (
                <MapView.Marker
                  key={restaurant.id}
                  coordinate={coordinates}
                  onSelect={this.onSelect}
                  pinColor={myRestaurant ? 'green' : 'red'}>
                  <PriceMarker budget={restaurant.price_range} />
                  <MapView.Callout>
                    <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name))}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <Image source={{uri: restaurant.pictures[0]}} style={{height: 50, width: 50, marginRight: 5}} />
                        <View>
                          <Text style={{color: '#333333', fontSize: (Platform.OS === 'ios' ? 15 : 14), fontWeight: '500', marginBottom: 5}}>{restaurant.name}</Text>
                          <Text style={{color: '#333333', fontSize: 13}}>{restaurant.food[1]}</Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </MapView.Callout>
                </MapView.Marker>
              );
            })}
            {_.map(profile.wishes, (wishId) => {
              var restaurant = RestaurantsStore.getRestaurant(wishId);
              var coordinates = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              return (
                <MapView.Marker
                  key={restaurant.id}
                  coordinate={coordinates}
                  onSelect={this.onSelect}
                  pinColor={myRestaurant ? 'green' : 'red'}>
                  <PriceMarker budget={restaurant.price_range} />
                  <MapView.Callout>
                    <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name))}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <Image source={{uri: restaurant.pictures[0]}} style={{height: 50, width: 50, marginRight: 5}} />
                        <View>
                          <Text style={{color: '#333333', fontSize: (Platform.OS === 'ios' ? 15 : 14), fontWeight: '500', marginBottom: 5}}>{restaurant.name}</Text>
                          <Text style={{color: '#333333', fontSize: 13}}>{restaurant.food[1]}</Text>
                        </View>
                      </View>
                    </TouchableHighlight>
                  </MapView.Callout>
                </MapView.Marker>
              );
            })}
          </MapView>
        </View>
			</View>
		);
  };
}

var styles = StyleSheet.create({
  restaurantsMap: {
    flex: 1,
    position: 'relative'
  }
});

export default CarteProfil;