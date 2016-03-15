'use strict';

import React, {Image, Platform, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Dimensions from 'Dimensions';
import MapView from 'react-native-maps';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import PriceMarker from '../elements/PriceMarker';
import RestaurantElement from '../elements/Restaurant';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import Filtre from './Filtre';
import Profil from './Profil';
import Restaurant from './Restaurant';

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
    var recommendations_and_wishes = _.concat(profile.recommendations, profile.wishes);
    var restaurants = [];
    _.forEach(recommendations_and_wishes, (restaurantId) => {
      var restaurant = RestaurantsStore.getRestaurant(restaurantId);
      restaurants.push(_.extend(restaurant, {from: _.includes(restaurant.my_friends_wishing, this.currentProfil()) ? 'wish' : 'recommendation'}));
    });
    
    var sortedRestaurants = _.reverse(_.sortBy(restaurants, ['score']));

    return (
      <View style={{flex: 1, position: 'relative'}}>
        {!this.props.id ? [
          <NavigationBar 
            key='navbarfromtab'
            type='default'
            title='Carte'
            rightImage={require('../../assets/img/tabs/icons/account.png')}
            rightButtonTitle='Profil'
            onRightButtonPress={() => this.props.navigator.replace(Profil.route({toggle: this.props.toggle}))} />
        ] : [
          <NavigationBar 
            key='navbarfrompush'
            title='Carte'
            type='back'
            leftButtonTitle='Retour'
            onLeftButtonPress={() => this.props.navigator.pop()}
            rightImage={require('../../assets/img/tabs/icons/account.png')}
            rightButtonTitle='Profil'
            onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: this.props.id}))} />
        ]}
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
              return (
                <MapView.Marker
                  key={restaurant.id}
                  coordinate={coordinates}
                  onSelect={this.onSelect}>
                  <PriceMarker text={_.findIndex(sortedRestaurants, restaurant) + 1} backgroundColor={restaurant.from === 'wish' ? '#9EE43E' : '#FE3139'} />
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
        {!this.props.id ? [
        <MenuIcon key='menu_icon' onPress={this.props.toggle} />
        ] : null}
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