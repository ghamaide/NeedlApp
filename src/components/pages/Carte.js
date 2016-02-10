'use strict';

import React, {StyleSheet, View, TouchableHighlight, Image, PixelRatio, Platform, ActivityIndicatorIOS, ProgressBarAndroid} from 'react-native';

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
import MeStore from '../../stores/Me';

import Filtre from './Filtre';
import Liste from './Liste';
import Restaurant from './Restaurant';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

class Carte extends Page {
  static route() {
    return {
      component: Carte,
      title: 'Restaurants',
      rightButtonIcon: require('../../assets/img/other/icons/map.png')
    };
  };

  restaurantsState() {
    return {
      // we want the map even if it is still loading
      data: RestaurantsStore.filteredRestaurants().slice(0, 15),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),      
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.region = RestaurantsStore.getState().region;
    this.state.showedCurrentPosition = MeStore.getState().showedCurrentPosition,
    this.state.showsUserLocation = false;
    this.state.defaultLatitudeDelta = 10 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320*Math.cos(this.state.defaultLatitudeDelta)) ;
    this.state.paris = {
      northLatitude: 48.91,
      southLatitude: 48.8,
      westLongitude: 2.25,
      eastLongitude: 2.42
    };
    this.state.showChangeRegion = false;
  };

  startActions() {
    this.setState({showsUserLocation: true});

    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        if (!MeStore.getState().showedCurrentPosition && this.isInParis(initialPosition)) {
          this.setState({
            region: {latitude: initialPosition.coords.latitude, longitude: initialPosition.coords.longitude, latitudeDelta: this.state.defaultLatitudeDelta, longitudeDelta: this.state.defaultLongitudeDelta}
          });
          MeActions.showedCurrentPosition(true);
        }
      },
      (error) => console.log("---" + error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  };

  isInParis = (initialPosition) => {
    return (initialPosition.coords.latitude <= this.state.paris.northLatitude && initialPosition.coords.latitude >= this.state.paris.southLatitude && initialPosition.coords.longitude <= this.state.paris.eastLongitude && initialPosition.coords.longitude >= this.state.paris.westLongitude);
  };

  componentWillMount() {
    this.startActions();
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  onSubmitChangeRegion = () => {
    var currentRegion = {
      east: this.state.region.longitude + this.state.region.longitudeDelta / 2,
      west:this.state.region.longitude - this.state.region.longitudeDelta / 2,
      south:this.state.region.latitude - this.state.region.latitudeDelta / 2,
      north:this.state.region.latitude + this.state.region.latitudeDelta / 2
    };

    RestaurantsActions.setRegion(currentRegion, this.state.region, () => {this.setState({showChangeRegion: false})});
  };

  onRegionChangeComplete = (region) => {
    this.setState({region: region, displayRestaurant: false});
    this.setState({showChangeRegion: true});    
  };

  onMapPress = (zone) => {
     this.setState({displayRestaurant: false});
  };

  onMarkerSelect = (marker) => {
    // trigger event marker
    console.log('on marker select');
    console.log(marker);
    // this.setState({displayRestaurant: true});
  };

  onSelect = (event) => {
    // trigger event marker
    console.log('on select');
    console.log(event);
    // this.setState({displayRestaurant: true});
  };

  renderPage() {
    return (
  		<View style={{flex: 1, position: 'relative'}}>
        <NavigationBar key="navbar" image={require('../../assets/img/other/icons/list.png')} title="Carte" rightButtonTitle="Liste" onRightButtonPress={() => this.props.navigator.replace(Liste.route())} />
        <View key="mapcontainer" style={{flex: 1, position: 'relative'}}>
          <MapView
            key="map"
            ref="mapview"
            style={styles.restaurantsMap}
            showsUserLocation={this.state.showsUserLocation}
            region={this.state.region}
            onRegionChangeComplete={this.onRegionChangeComplete}
            onPress={this.onMapPress}
            onMarkerSelect={this.onMarkerSelect}>
            
            {_.map(this.state.data, (restaurant) => {
              var myRestaurant = _.contains(restaurant.friends_recommending, MeStore.getState().me.id);
              myRestaurant = myRestaurant || _.contains(restaurant.friends_wishing, MeStore.getState().me.id);
              var coordinates = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              return (
                <MapView.Marker
                  ref={restaurant.id}
                  key={restaurant.id}
                  coordinate={coordinates}
                  onSelect={this.onSelect}
                  pinColor={myRestaurant ? 'green' : 'red'}>
                  <MapView.Callout>
                    <View>
                      <Text>{restaurant.name}</Text>
                    </View>
                  </MapView.Callout>
                </MapView.Marker>
              );
            })}
          </MapView>

          {this.state.displayRestaurant ? [
            <View style={styles.restaurantContainer}>
              <RestaurantElement
                rank={_.findIndex(this.state.data, this.state.restaurant) + 1}
                isNeedl={this.state.restaurant.score <= 5}
                key={"restaurant_" + this.state.restaurant.id}
                name={this.state.restaurant.name}
                picture={this.state.restaurant.pictures[0]}
                type={this.state.restaurant.food[1]}
                budget={this.state.restaurant.price_range}
                height={120}
                onPress={() => {
                  this.props.navigator.push(Restaurant.route({id: this.state.restaurant.id}, this.state.restaurant.name));
                }}/>
              </View>
            ] : []
          }

          {this.state.showChangeRegion ? [
            <View key="change_region_button" style={styles.changeRegionButtonContainer}>
              {this.state.loading ? [
                Platform.OS === 'ios' ? <ActivityIndicatorIOS key="loading" animating={true} style={[{height: 40}]} size="small" /> : <ProgressBarAndroid key="loading" indeterminate /> 
               ] : [
                <TouchableHighlight key="button" onPress={this.onSubmitChangeRegion} underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={{fontSize: 12, color: '#333333'}}>Rechercher dans cette zone</Text>
                </TouchableHighlight>
              ]}
            </View>
            ] : null}

          {!this.state.data.length ? [        
            <View key="no_restaurants" style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>Pas de restaurants dans cette zone</Text>
            </View>
          ] : []}
        </View>
			</View>
		);
  };
}

var styles = StyleSheet.create({
  restaurantsMap: {
    flex: 1,
    position: 'relative'
  },
  changeRegionButtonContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    height: 40,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#EF582D',
    borderWidth: 1
  },
  restaurantContainer: {
    height: 120,
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
  },
  emptyTextContainer: {
    position: 'absolute',
    bottom: (windowHeight - 134) / 2,
    left: 0,
    width: windowWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    padding: 10,
    color: '#FFFFFF'
  }
});

export default Carte;