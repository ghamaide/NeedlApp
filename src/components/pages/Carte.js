'use strict';

import React, {Dimensions, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import MapView from 'react-native-maps';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import Overlay from '../elements/Overlay';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Restaurant from './Restaurant';
import Results from './Results';
import Filtre from './Filtre';

var windowWidth = Dimensions.get('window').width;

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

    // Radius for center circle
    this.state.radius = RATIO * RestaurantsStore.getDistance(region.latitude, region.longitude - region.longitudeDelta / 2, region.latitude, region.longitude + region.longitudeDelta / 2);

    // Overlay in case no restaurants with criteria are found. Defauts to false.
    this.state.error_overlay = false;
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
        if (!this.state.showedCurrentPosition && this.isInParis(initialPosition)) {
          this.setState({
            region: {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude,
              latitudeDelta: this.state.defaultLatitudeDelta,
              longitudeDelta: this.state.defaultLongitudeDelta
            },
            radius: RATIO * RestaurantsStore.getDistance(initialPosition.coords.latitude, initialPosition.coords.longitude - this.state.defaultLongitudeDelta / 2, initialPosition.coords.latitude, initialPosition.coords.longitude + this.state.defaultLongitudeDelta / 2)
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
    var center = {
      latitude: this.state.region.latitude,
      longitude: this.state.region.longitude
    };

    return (
      <View style={{flex: 1, position: 'relative'}}>
        <NavigationBar 
          type='default' 
          title='Carte'
          rightImage={require('../../assets/img/actions/icons/filter.png')}
          rightButtonTitle="+ d'options" 
          onRightButtonPress={() => this.props.navigator.push(Filtre.route())} />

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
                this.props.navigator.push(Results.route({rank: 1}))
              } else {
                this.setState({error_overlay: true});
              }
            }}>
            <Text style={styles.submitText}>Lancer ma recherche !</Text>
          </TouchableHighlight>
        </View>

        <MenuIcon onPress={this.props.toggle} />

        {this.state.error_overlay ? [
          <Overlay key='error_overlay' style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', alignItems: 'center', justifyContent: 'center'}}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>Aucun restaurant ne correspond à tes critères dans la zone recherchée.</Text>
              <Text style={styles.errorMessage}>Essaie de chercher avec d'autres critères ou dans une autre zone.</Text>
              <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.setState({error_overlay: false})} style={styles.closeButton}>
                <Text style={{textAlign: 'center', color: '#FFFFFF', fontSize: 12}}>Fermer</Text>
              </TouchableHighlight>
            </View>
          </Overlay>
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
    borderRadius: 3,
    padding: 10,
    borderColor: '#FE3139',
    position: 'absolute',
    bottom: 5,
    left: 10,
    width: windowWidth - 20
  },
  submitText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
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
  }
});

export default Carte;