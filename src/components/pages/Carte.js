'use strict';

import React, {ActivityIndicatorIOS, Image, Platform, ProgressBarAndroid, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Dimensions from 'Dimensions';
import MapView from 'react-native-maps';
import Slider from 'react-native-slider';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import PriceMarker from '../elements/PriceMarker';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Liste from './Liste';
import Restaurant from './Restaurant';

var RATIO = 0.4;

class Carte extends Page {
  static route(props) {
    return {
      component: Carte,
      title: 'Carte',
      passProps: props
    };
  };

  restaurantsState() {
    return {
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  constructor(props) {
    super(props);

    var region = RestaurantsStore.getState().currentRegion || RestaurantsStore.getState().region;

    this.state = this.restaurantsState();

    this.state.region = region;
    this.state.showedCurrentPosition = MeStore.getState().showedCurrentPosition,
    this.state.showsUserLocation = false;

    // To specify the default level of zoom
    this.state.defaultLatitudeDelta = 10 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320 * Math.cos(this.state.defaultLatitudeDelta)) ;

    // Paris 4 point coordinates
    this.state.paris = {
      northLatitude: 48.91,
      southLatitude: 48.8,
      westLongitude: 2.25,
      eastLongitude: 2.42
    };

    // Remove if removing overlays
    this.state.radius = RATIO * this.getDistance(region.latitude, region.longitude - region.longitudeDelta / 2, region.latitude, region.longitude + region.longitudeDelta / 2);
  };

  // Actions to be done on mounting the component
  startActions() {
    this.setState({showsUserLocation: true});

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        if (!this.state.showedCurrentPosition && this.isInParis(initialPosition)) {
          this.setState({
            region: {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude,
              latitudeDelta: this.state.defaultLatitudeDelta,
              longitudeDelta: this.state.defaultLongitudeDelta
            },
            radius: RATIO * this.getDistance(initialPosition.coords.latitude, initialPosition.coords.longitude - this.state.defaultLongitudeDelta / 2, initialPosition.coords.latitude, initialPosition.coords.longitude + this.state.defaultLongitudeDelta / 2)
          });
          MeActions.showedCurrentPosition(true);
        }
      },
      (error) => console.log(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  };

  // Check if position is in paris
  isInParis = (initialPosition) => {
    return (initialPosition.coords.latitude <= this.state.paris.northLatitude && initialPosition.coords.latitude >= this.state.paris.southLatitude && initialPosition.coords.longitude <= this.state.paris.eastLongitude && initialPosition.coords.longitude >= this.state.paris.westLongitude);
  };

  componentWillMount() {
    this.startActions();
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  // Set the region and circle radius, and set region for future map displays (not centering on user's location afterwards)
  onRegionChangeComplete = (region) => {
    this.setState({region: region});
    var west = {
      latitude: region.latitude,
      longitude: region.longitude - region.longitudeDelta / 2
    };

    var east = {
      latitude: region.latitude,
      longitude: region.longitude + region.longitudeDelta / 2
    };

    var radius = RATIO * this.getDistance(west.latitude, west.longitude, east.latitude, east.longitude)

    this.setState({radius: radius});
    RestaurantsActions.setRegion(this.state.region);
  };

  // Update the region and circle radius
  onRegionChange = (region) => {
    this.setState({region: region});
    var west = {
      latitude: region.latitude,
      longitude: region.longitude - region.longitudeDelta / 2
    };

    var east = {
      latitude: region.latitude,
      longitude: region.longitude + region.longitudeDelta / 2
    };

    var radius = RATIO * this.getDistance(west.latitude, west.longitude, east.latitude, east.longitude)
    this.setState({radius: radius});
  };

  // get distance in meters between two points defined by their coordinates
  getDistance = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // radius of the earth in km
    var dLat = this.deg2rad(lat2-lat1);
    var dLon = this.deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d * 1000; // distance in meters
  };

  // support function to get measure in radians from measure in degrees
  deg2rad = (deg) => {
    return deg * (Math.PI/180)
  };

  renderPage() {
    var center = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude
    };

    return (
      <View style={{flex: 1, position: 'relative'}}>
        <NavigationBar type='default' rightImage={require('../../assets/img/other/icons/list.png')} title='Carte' rightButtonTitle='Liste' onRightButtonPress={() => this.props.navigator.replace(Liste.route({toggle: this.props.toggle}))} />
        <View style={{flex: 1, position: 'relative'}}>
          <MapView
            ref='mapview'
            style={styles.restaurantsMap}
            showsUserLocation={this.state.showsUserLocation}
            region={this.state.region}
            onRegionChangeComplete={this.onRegionChangeComplete}
            onRegionChange={this.onRegionChange}
            onPress={this.onPress}
            onMarkerSelect={this.onMarkerSelect}>

            <MapView.Circle
              center={center}
              radius={this.state.radius}
              fillColor='rgba(0, 0, 0, 0.2)'
              strokeColor='#EF582D'
            />
          </MapView>
        </View>

        <MenuIcon onPress={this.props.toggle} />
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

export default Carte;