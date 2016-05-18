'use strict';

import React from "react";
import {Dimensions, Image, Platform, StyleSheet, TouchableHighlight, View} from "react-native";

import _ from 'lodash';
import MapView from 'react-native-maps';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import Onboard from '../elements/Onboard';
import Overlay from '../elements/Overlay';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Restaurant from './Restaurant';
import Filtre from './Filtre';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var triangleWidth = 25;

let buttonSize = 45;
let buttonMargin = 10;

var RATIO = 0.4;

class Carte extends Page {
  static route(props) {
    return {
      component: Carte,
      title: 'Carte',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    if (Platform.OS === 'android') {
      var region = typeof RestaurantsStore.getState().currentRegion.latitude !== 'undefined' ? RestaurantsStore.getState().currentRegion : RestaurantsStore.getState().region;
    } else {
      var region = RestaurantsStore.getState().currentRegion || RestaurantsStore.getState().region;
    }

    this.state = this.restaurantsState();

    // Region is where the user left
    this.state.region = region;

    // Whether to show user's location
    this.state.showsUserLocation = false;

    // To specify the default level of zoom
    this.state.defaultLatitudeDelta = 10 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320 * Math.cos(this.state.defaultLatitudeDelta));

    // Paris 4 point coordinates and center
    this.state.paris = {
      northLatitude: 48.91,
      centerLatitude: 48.86,
      southLatitude: 48.8,
      westLongitude: 2.25,
      centerLongitude: 2.34,
      eastLongitude: 2.42
    };

    // Radius for center circle
    this.state.radius = RATIO * RestaurantsStore.getDistance(region.latitude, region.longitude - region.longitudeDelta / 2, region.latitude, region.longitude + region.longitudeDelta / 2);

    // Overlay in case no restaurants with criteria are found. Defauts to false.
    this.state.error_overlay = false;
    this.state.message1 = '';
    this.state.message2 = '';

    // Onboarding overlay
    this.state.onboarding_overlay = !MeStore.getState().me.map_onboarding;
  };

  // State update with every store update
  restaurantsState() {
    return {
      restaurants: RestaurantsStore.filteredRestaurants().slice(0, 3),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  // Actions to be done on mounting the component
  startActions() {
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
            },
            radius: RATIO * RestaurantsStore.getDistance(initialPosition.coords.latitude, initialPosition.coords.longitude - this.state.defaultLongitudeDelta / 2, initialPosition.coords.latitude, initialPosition.coords.longitude + this.state.defaultLongitudeDelta / 2)
          });
        } else {
          this.setState({
            region: {
              latitude: this.state.paris.centerLatitude,
              longitude: this.state.paris.centerLongitude,
              latitudeDelta: this.state.defaultLatitudeDelta,
              longitudeDelta: this.state.defaultLongitudeDelta
            },
            radius: RATIO * RestaurantsStore.getDistance(this.state.paris.centerLatitude, this.state.paris.centerLongitude - this.state.defaultLongitudeDelta / 2, this.state.paris.centerLatitude, this.state.paris.centerLongitude + this.state.defaultLongitudeDelta / 2)
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
          },
          radius: RATIO * RestaurantsStore.getDistance(this.state.paris.centerLatitude, this.state.paris.centerLongitude - this.state.defaultLongitudeDelta / 2, this.state.paris.centerLatitude, this.state.paris.centerLongitude + this.state.defaultLongitudeDelta / 2)
        });
      },
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
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
    MeStore.unlisten(this.onMeChange);
  };

  componentDidMount() {
    var region = this.state.region;
    this.setState({radius: RATIO * RestaurantsStore.getDistance(region.latitude, region.longitude - region.longitudeDelta / 2, region.latitude, region.longitude + region.longitudeDelta / 2)});
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  onMeChange = () => {
    this.setState({onboarding_overlay: !MeStore.getState().me.map_onboarding});
  }

  // Set the region and circle radius, and set region for future map displays (not centering on user's location afterwards)
  onRegionChangeComplete = (region) => {
    if (!this.state.loading && this.state.onboarding_overlay) {
      this.setState({onboarding_overlay: false});
      MeActions.updateOnboardingStatus('map');
    }

    this.setState({region: region});
    var west = {
      latitude: region.latitude,
      longitude: region.longitude - region.longitudeDelta / 2
    };

    var east = {
      latitude: region.latitude,
      longitude: region.longitude + region.longitudeDelta / 2
    };

    var radius = RATIO * RestaurantsStore.getDistance(west.latitude, west.longitude, east.latitude, east.longitude)

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

    var radius = RATIO * RestaurantsStore.getDistance(west.latitude, west.longitude, east.latitude, east.longitude)
    this.setState({radius: radius});
  };

  renderPage() {
    if (Platform.OS === 'android') {
      var center = {
        latitude: this.state.region.latitude || this.state.paris.centerLatitude,
        longitude: this.state.region.longitude || this.state.paris.centerLongitude
      };
    } else {
      var center = {
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude
      };
    }

    return (
      <View style={{flex: 1, position: 'relative'}}>
        <MapView
          ref='mapview'
          rotateEnabled={false}
          style={styles.restaurantsMap}
          showsUserLocation={this.state.showsUserLocation}
          region={this.state.region}
          onRegionChangeComplete={this.onRegionChangeComplete}
          onRegionChange={this.onRegionChange}>
          <MapView.Circle
            center={center}
            radius={this.state.radius}
            fillColor='rgba(0, 0, 0, 0.1)'
            strokeColor='#FE3139' />
        </MapView>
        <TouchableHighlight
          underlayColor='rgba(0, 0, 0, 0)'
          style={styles.submitButton}
          onPress={() => {
            if (this.state.restaurants.length > 0) {
              this.props.navigator.push(Restaurant.route({rank: 1}));
            } else {
              this.setState({error_overlay: true, message1: 'Aucun restaurant ne correspond à tes critères dans la zone recherchée.', message2: 'Essaie de chercher avec d\'autres critères ou dans une autre zone.'});
            }
          }}>
          <Image source={require('../../assets/img/icons/search.png')} style={styles.submitIcon} />
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor='rgba(0, 0, 0, 0)'
          style={styles.filterButton}
          onPress={() => {
            if (!RestaurantsStore.filterActive() && this.state.restaurants.length == 0) {
              this.setState({error_overlay: true, message1: 'Tu n\'as ucun restaurant dans cette zone.', message2: 'Essaie de changer d\'endroit'});
            } else {
              this.props.navigator.push(Filtre.route());
            }
          }}>
          <Image source={require('../../assets/img/actions/icons/filter.png')} style={styles.filterIcon} />
        </TouchableHighlight>

        {this.state.error_overlay ? [
          <Overlay key='error_overlay' style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center'}}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{this.state.message1}</Text>
              <Text style={styles.errorMessage}>{this.state.message2}</Text>
              <TouchableHighlight 
                underlayColor='rgba(0, 0, 0, 0)'
                style={styles.closeButton}
                onPress={() => {
                  this.setState({error_overlay: false});
                }}>
                <Text style={{textAlign: 'center', color: '#FFFFFF', fontSize: 12}}>Fermer</Text>
              </TouchableHighlight>
            </View>
          </Overlay>
        ] : null}

        {/* Onboarding for zone in the middle of the map */}
        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_map' style={{top: 60}} triangleBottom={-25} triangleRight={windowWidth / 2 - triangleWidth} rotation='180deg'>
            <Text style={styles.onboardingText}><Text style={{color: '#FE3139'}}>Zoome</Text> et <Text style={{color: '#FE3139'}}>déplace</Text> toi pour ajuster la zone de recherche</Text>
          </Onboard>
        ] : null}

        {/* Onboarding for the button that shows the filters */}
        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_filter' style={{bottom: buttonSize + 2 * buttonMargin + 20}} triangleBottom={-25} triangleRight={buttonMargin} rotation='180deg'>
            <Text style={styles.onboardingText}>Lance ta recherche avec <Text style={{color: '#FE3139'}}>plus de critères</Text></Text>
          </Onboard>
        ] : null}

        {/* Onboarding for the button that launches the search immediately */}
        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_search' style={{width: windowWidth - 2 * (buttonSize + buttonMargin) - triangleWidth - 10, bottom: buttonMargin / 2}} triangleBottom={12.5} triangleRight={-27.5} rotation='90deg'>
            <Text style={styles.onboardingText}>Trouve ton restaurant <Text style={{color: '#FE3139'}}>immédiatement</Text></Text>
          </Onboard>
        ] : null}

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
    right: (2 * buttonMargin) + buttonSize,
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitIcon: {
    tintColor: '#FFFFFF',
    height: buttonSize - 20,
    width: (buttonSize - 20) / 1.9
  },
  filterButton : {
    backgroundColor: '#FFFFFF',
    borderColor: '#FE3139',
    borderWidth: 1,
    position: 'absolute',
    bottom: buttonMargin,
    right: buttonMargin,
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterIcon: {
    tintColor: '#FE3139',
    width: buttonSize - 20,
    height: buttonSize - 20
  },
  errorContainer: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 5,
    color: '#FE3139'
  },
  closeButton: {
    backgroundColor: '#FE3139',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 5
  },
  onboardingText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#EEEDF1',
    margin: 5
  }
});

export default Carte;