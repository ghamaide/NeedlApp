'use strict';

import React, {StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, Image, PixelRatio} from 'react-native';
import _ from 'lodash';
import Dimensions from 'Dimensions';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';

import Page from '../ui/Page';
//import Filtre from './Filtre/List';
import Filtre from './Filtre';
import Liste from './Liste';
import Restaurant from './Restaurant';

import Carousel from '../ui/Carousel';
import RestaurantElement from '../elements/Restaurant';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;
var radius = 150;
var topSize = (windowHeight === 667 ? 35 : (windowHeight === 568 ? 25 : (windowHeight === 480 ? 18 : 42) ))

class Carte extends Page {
  static route() {
    return {
      component: Carte,
      title: 'Restaurants',
      rightButtonIcon: require('../../assets/img/other/icons/map.png'),
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
      error: RestaurantsStore.error(),
      isChanging: false
    };
  }

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.isChanging = false;
    this.state.showsUserLocation = false;
    this.state.initialPosition = 'unknown';
    this.state.annotations = [
      {latitude: 48.8534100, longitude: 2.3378000, title: 'center'},
      {latitude: 48.8534100, longitude: 2.3378000, title: 'lol'}
    ];
    this.state.center = {
      latitude: RestaurantsStore.getState().region.lat,
      longitude: RestaurantsStore.getState().region.long,
      latitudeDelta: RestaurantsStore.getState().region.deltaLat,
      longitudeDelta: RestaurantsStore.getState().region.deltaLong,
    };
  }

  onFocus = (event) => {
    if (event.data.route.component === Carte) {
      RestaurantsActions.fetchRestaurants();

      this.setState({showsUserLocation: true});

      navigator.geolocation.getCurrentPosition(
        () => PushNotificationIOS.requestPermissions(),
        () => PushNotificationIOS.requestPermissions()
      );

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
    this.setState({isChanging : false});
    var mapHeight = windowHeight - 124;

    var centerCircleLatitude = region.latitude + (mapHeight -  windowWidth  - (topSize * 2)) * (region.latitudeDelta / (2 * mapHeight));
    var centerCircleLongitude = region.longitude;
    // var deltaCircleLatitude = radius * region.latitudeDelta / mapHeight;
    // var deltaCircleLongitude = radius * region.longitudeDelta / windowWidth;

    RestaurantsActions.setRegion(radius, region.longitude, region.latitude, region.longitudeDelta, region.latitudeDelta, centerCircleLongitude, centerCircleLatitude, windowWidth, mapHeight);
    this.setState({data: RestaurantsStore.filteredRestaurants()});

    //var center = {latitude: region.latitude, longitude: region.longitude, title: 'center'};

    //this.setState({annotations: [centerCircle, westCircle, eastCircle, northCircle, southCircle]});
  }

  onRegionChange = (region) => {
    // to see if the user is changing region
    this.setState({isChanging : true});
  }

  onAnnotationPress = (annotation) => {
    this.setState({index : _.findIndex(this.state.data, {'name' : annotation.title})});
    this.refs.carousel.goToPage(this.state.index, 'annotationPress');
  }

  carouselOnPageChange = (i, from) => {
    var event = {
      nativeEvent: {
        action: 'annotation-click',
        annotation: this.state.data[i]
      }
    }
    this.setState({index : i});
    if (from !== 'annotationPress' && from !== 'layout') {
      // Here call function to select annotation on map
      //this.refs.mapview._onPress(event);
    }
  }

  getDistance = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = this.deg2rad(lon2 - lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *  Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  renderPage() {
    return (
  		<View style={{flex: 1, position: 'relative'}}>
        <MapView
          ref="mapview"
          style={styles.restaurantsMap}
          showsUserLocation={this.state.showsUserLocation}
          followUserLocation={false}
          annotations={_.map(this.state.data, (restaurant) => {
            var myRestaurant = _.contains(restaurant.friends_recommending, MeStore.getState().me.id);
            myRestaurant = myRestaurant || _.contains(restaurant.friends_wishing, MeStore.getState().me.id);
            return {
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              title: restaurant.name,
              /*subtitle: restaurant.food[1]
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
              }*/
            };
          })}
          region={this.state.center}
          onAnnotationPress={this.onAnnotationPress}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete} />

        {this.state.isChanging ? 
          [
            <View style={styles.targetContainer}>
              <View style={[styles.fillRectangleTop, {width: windowWidth}]} />
              <Image
                source={require('../../assets/img/other/images/target.png')}
                style={[styles.targetImage, {width: windowWidth, height: windowWidth, tintColor: 'rgba(0, 0, 0, 0.4)'}]} />
              <View style={styles.fillRectangleBottom} />
            </View>
          ] : [
            null
          ]
        }

        {this.state.data.length ? [
          <Carousel
            style={styles.carousel}
            ref="carousel"
            onPageChange={this.carouselOnPageChange}>
            {_.map(this.state.data, (restaurant) => {
              return (
                <RestaurantElement
                  name={restaurant.name}
                  pictures={restaurant.pictures}
                  type={restaurant.food[1]}
                  budget={restaurant.price_range}
                  height={120}
                  onPress={() => {
                    this.props.navigator.push(Restaurant.route({id: restaurant.id}));
                  }}/>
              );
            })}
          </Carousel>
        ] : []}
        
				<TouchableHighlight style={styles.filterMessage} underlayColor="#FFFFFF" onPress={() => {
          this.props.navigator.push(Filtre.route());
        }}>
            <Text style={styles.filterMessageText}>
              {RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
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
  },
  targetImage: {
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  fillRectangleBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  fillRectangleTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    height: topSize
  }
});

export default Carte;