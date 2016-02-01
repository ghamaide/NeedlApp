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
      data: ProfilStore.getState().profils[this.currentProfil()]
    };
  };

  constructor(props) {
    super(props);

    this.state = this.mapState();
    this.state.isChanging = false;
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
    this.state.radius = 4000;
    
    this.state.center = {
      latitude: RestaurantsStore.getState().region.lat,
      longitude: RestaurantsStore.getState().region.long,
      latitudeDelta: RestaurantsStore.getState().region.deltaLat,
      longitudeDelta: RestaurantsStore.getState().region.deltaLong,
    };
  };

  onFocus = (event) => {
    if (event.data.route.component === CarteProfil) {
      this.setState({showsUserLocation: true});

      navigator.geolocation.getCurrentPosition(
        (initialPosition) => {
          //do something here
          this.setState({region : {latitude: initialPosition.coords.latitude, longitude: initialPosition.coords.longitude, latitudeDelta: this.state.defaultLatitudeDelta, longitudeDelta: this.state.defaultLongitudeDelta}});
        },
        (error) => console.log("---" + error.message),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      );
    }
  };

  componentWillMount() {
    ProfilStore.listen(this.onProfilsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  };

  componentWillUnmount() {
    ProfilStore.unlisten(this.onProfilsChange);
  };

  onProfilsChange = () => {
    this.setState(this.mapState());
  };

  onRegionChangeComplete = (region) => {
    this.setState({region: region});
  };

  onMapPress = (zone) => {
    this.setState({displayRestaurant: false});
  };

  onMarkerPress = (marker) => {
    // trigger event marker
    // this.setState({displayRestaurant: true});
  };

  renderPage() {
    var profil = this.state.data;

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
            {_.map(profil.recommendations, (restaurant) => {
              var coordinate = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              return (
                <MapView.Marker 
                  key={restaurant.id}
                  coordinate={coordinate}
                  title={restaurant.name}
                  pinColor='red' />
              );
            })}
            {_.map(profil.wishes, (restaurant) => {
              var coord = {latitude: restaurant.latitude, longitude: restaurant.longitude};
              return (
                <MapView.Marker 
                  key={restaurant.id}
                  coordinate={coord}
                  title={restaurant.name}
                  pinColor='green' />
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

          {this.state.data.length && false ? [
            <Carousel
              key="carousel"
              style={styles.carousel}
              ref="carousel"
              onPageChange={this.carouselOnPageChange}>
              {_.map(this.state.data, (restaurant) => {
                return (
                  <RestaurantElement
                    rank={_.findIndex(this.state.data, restaurant) + 1}
                    isNeedl={restaurant.score <= 5}
                    key={"restaurant_" + restaurant.id}
                    name={restaurant.name}
                    picture={restaurant.pictures[0]}
                    type={restaurant.food[1]}
                    budget={restaurant.price_range}
                    height={120}
                    onPress={() => {
                      this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                    }}/>
                );
              })}
            </Carousel>
          ] : []}

         <TouchableHighlight key="filter_button" style={styles.filterMessage} underlayColor="#FFFFFF" onPress={() => {
          this.props.navigator.push(Filtre.route());
        }}>
            <Text style={styles.filterMessageText}>
              {RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
            </Text>
          </TouchableHighlight>
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
  filterMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    height: 45,
    borderColor: '#EF582D',
    borderWidth: 1,
    borderRadius: 1
  },
  filterMessageText: {
    color: '#EF582D',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center'
  },
  imageRestaurant: {
    flex: 1,
    position: 'relative',
    height: 120,
  },
  carousel: {
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
  },
  imageRestaurantInfos: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'    
  },
  imageRestaurantName: {
    fontWeight: '900',
    fontSize: 11,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
    marginTop: 2,
    position: 'absolute',
    bottom: 30,
    left: 5
  },
  targetContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent'
  }
});

export default CarteProfil;