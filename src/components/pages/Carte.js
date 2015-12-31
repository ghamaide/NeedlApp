'use strict';

import React, {StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, Image, PixelRatio} from 'react-native';
import _ from 'lodash';
import Dimensions from 'Dimensions';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';
import MeActions from '../../actions/MeActions';

import Page from '../ui/Page';
import Filtre from './Filtre';
import Liste from './Liste';
import Restaurant from './Restaurant';

import Carousel from '../ui/Carousel';
import RestaurantElement from '../elements/Restaurant';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;
var radius = 150;
var topSize = (windowHeight === 667 ? 40 : (windowHeight === 568 ? 25 : (windowHeight === 480 ? 18 : 42) ))

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
    this.state.showedCurrentPosition = MeStore.getState().showedCurrentPosition;
    this.state.defaultLatitudeDelta = 4 / 110.574;
    this.state.defaultLongitudeDelta = 1 / (111.320*Math.cos(this.state.defaultLatitudeDelta)) ;

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
        (initialPosition) => {
          if (!MeStore.getState().showedCurrentPosition) {
            this.setState({
              center: {latitude: initialPosition.coords.latitude, longitude: initialPosition.coords.longitude, latitudeDelta: this.state.defaultLatitudeDelta, longitudeDelta: this.state.defaultLongitudeDelta}
            });
            MeActions.showedCurrentPosition(true);
          }
        },
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
    var mapHeight = windowHeight - 124;

    var centerCircleLatitude = region.latitude + (mapHeight -  windowWidth  - (topSize * 2)) * (region.latitudeDelta / (2 * mapHeight));
    var centerCircleLongitude = region.longitude;

    RestaurantsActions.setRegion(radius, region.longitude, region.latitude, region.longitudeDelta, region.latitudeDelta, centerCircleLongitude, centerCircleLatitude, windowWidth, mapHeight);
    this.setState({data: RestaurantsStore.filteredRestaurants()});
    this.setState({isChanging : false});
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

  renderPage() {
    return (
  		<View style={{flex: 1, position: 'relative'}}>
        <MapView
          key="map"
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
              title: restaurant.name
            };
          })}
          region={this.state.center}
          onAnnotationPress={this.onAnnotationPress}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete} />

        {this.state.isChanging ? 
          [
            <View key="target_container" style={styles.targetContainer}>
              <View key="target_top_container" style={[styles.fillRectangleTop, {width: windowWidth}]} />
              <Image
                key="target_image"
                source={require('../../assets/img/other/images/target.png')}
                style={[styles.targetImage, {width: windowWidth, height: windowWidth, tintColor: 'rgba(0, 0, 0, 0.4)'}]} />
              <View key="target_bottom_container" style={styles.fillRectangleBottom} />
            </View>
          ] : []}

        {this.state.data.length ? [
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

        {!this.state.data.length && !this.state.isChanging ? [        
          <View key="no_restaurants" style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>Pas de restaurants dans cette zone</Text>
          </View>
        ] : []}
        
				<TouchableHighlight key="filter_button" style={styles.filterMessage} underlayColor="#FFFFFF" onPress={() => {
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
  },
  targetImage: {
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  fillRectangleBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  fillRectangleTop: {
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    height: topSize
  }
});

export default Carte;