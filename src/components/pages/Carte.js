'use strict';

import React, {StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, Image} from 'react-native';
import _ from 'lodash';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';

import Page from '../ui/Page';
import Filtre from './Filtre/List';
import Liste from './Liste';
import Restaurant from './Restaurant';

import Carousel from '../ui/Carousel';

class Carte extends Page {
  static route(title) {
    return {
      component: Carte,
      title: title,
      rightButtonTitle: 'Liste',
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
      error: RestaurantsStore.error()
    };
  }

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.showsUserLocation = false;
    this.state.initialPosition = 'unknown';
    this.state.center = {
      latitude: 48.8534100,
      longitude: 2.3378000,
      latitudeDelta: 0.12,
      longitudeDelta: 0.065
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
    var westLongitude = region.longitude + region.longitudeDelta;
    var eastLongitude = region.longitude - region.longitudeDelta;
    var northLatitude = region.latitude + region.latitudeDelta;
    var bottomLatitude = region.latitude - region.latitudeDelta;
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
              subtitle: restaurant.food[1]
              /*rightCallout: {
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
          onRegionChangeComplete={this.onRegionChangeComplete} />

        <Carousel
          style={styles.carousel}
          ref="carousel"
          onPageChange={this.carouselOnPageChange}>
          {_.map(this.state.data, (restaurant) => {
            return (
                <Image
                  source={{uri: restaurant.pictures[0]}}
                  style={styles.imageRestaurant}>
                  <View style={styles.imageRestaurantInfos}>
                    <Text style={styles.imageRestaurantName}>{restaurant.name}</Text>
                  </View>
                </Image>
            );
          })}
        </Carousel>
        
				<TouchableHighlight style={styles.filterMessage} underlayColor='#38E1B2' onPress={() => this.props.navigator.push(Filtre.route())}>
						<View style={styles.filterContainer}>
              {RestaurantsStore.filterActive() ? 
                [
                  <View key={'opened'} style={styles.triangleDown} />
                ] : [
                  <View key={'closed'} style={styles.triangleRight} />
                ]
              }
              <Text style={styles.filterMessageText}>
                {RestaurantsStore.filterActive() ? 'Filtre activé - ' + this.state.data.length + ' résultat' + (this.state.data.length > 1 ? 's' : '') : 'Filtre désactivé'}
              </Text>
            </View>
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
    backgroundColor: '#38E1B2',
    padding: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0
  },
  filterMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  triangleRight: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [
      {rotate: '90deg'}
    ]
  },
  triangleDown: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    transform: [
      {rotate: '180deg'}
    ]
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
  }
});

export default Carte;