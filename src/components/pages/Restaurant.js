'use strict';

import React from 'react';
import {Dimensions, Image, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView from 'react-native-maps';
import Modal from 'react-native-modalbox';
import Polyline from 'polyline';
import Swiper from 'react-native-swiper';

import Overlay from '../elements/Overlay';
import RestaurantElement from '../elements/Restaurant';
import RestaurantHeader from '../elements/RestaurantHeader';
import PriceMarker from '../elements/PriceMarker';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Filtre from './Filtre';

var windowHeight = Dimensions.get('window').height;
var windowWidth = Dimensions.get('window').width;

class Restaurant extends Page {
  static route(props) {
    return {
      component: Restaurant,
      title: 'Restaurant',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantState();

    this.state.rank = this.props.rank || 0;

    // Destination guide polyline
    this.state.polylineCoords = [];

    // Paris 4 point coordinates and center
    this.state.paris = {
      northLatitude: 48.91,
      centerLatitude: 48.86,
      southLatitude: 48.8,
      westLongitude: 2.25,
      centerLongitude: 2.34,
      eastLongitude: 2.42
    };

    // Initially, we assume the user is not in Paris
    this.state.isInParis = false;

    // Whether to show user's location
    this.state.showsUserLocation = true;

    // Initial region is the first restaurant
    this.state.region = RestaurantsStore.getState().currentRegion;

    if (Platform.OS === 'android') {
      this.state.position = {
        latitude: this.state.paris.centerLatitude,
        longitude: this.state.paris.centerLongitude 
      };
    }

    this.state.onboardingOverlay = !MeStore.getState().me.restaurant_onboarding;
    this.state.wishlistOverlay = false;
  };

  restaurantState() {
    return {
      restaurants: RestaurantsStore.filteredRestaurants(),
      restaurant: RestaurantsStore.getRestaurant(this.props.id),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantState());
  };

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);

    // For use on Android, getCurrentPosition doesn't work
    if (Platform.OS === 'android') {
      navigator.geolocation.watchPosition((initialPosition) => {
        if (this.isInParis(initialPosition)) {
          this.setState({
            position: {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude
            },
            isInParis: true
          });
          this.getDirections(this.state.position);
        }
      });
    }

    // Fetch user's current location
    navigator.geolocation.getCurrentPosition(
      (initialPosition) => {
        if (this.isInParis(initialPosition)) {
          this.setState({
            position: {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude
            },
            isInParis: true
          });
          this.getDirections(this.state.position);
        } else {
          this.setState({
            position: {
              latitude: this.state.paris.centerLatitude,
              longitude: this.state.paris.centerLongitude
            }
          });
        }
      },
      (error) => {
        if (__DEV__) {
          console.log(error);
        }
        this.setState({
          position: {
            latitude: this.state.paris.centerLatitude,
            longitude: this.state.paris.centerLongitude
          }
        });
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  componentDidMount() {
    // Check if we display a message
    if (this.props.note == 'already_wishlisted') {
      this.setState({already_wishlisted: true});
      this.timer = setTimeout(() => {
        this.setState({already_wishlisted: false});
      }, 3000);
    } else if (this.props.note == 'already_recommended') {
      this.setState({already_recommended: true});
      this.timer = setTimeout(() => {
        this.setState({already_recommended: false});
      }, 3000);
    }

    if (this.props.action == 'create_wish') {
      this.setState({wishlistOverlay: true});
    }
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
    if (this.props.note == 'already_wishlisted' || this.props.note == 'already_recommended') {
      clearTimeout(this.timer);
    }
  };

  // Check if position is in paris
  isInParis = (initialPosition) => {
    return (initialPosition.coords.latitude <= this.state.paris.northLatitude && initialPosition.coords.latitude >= this.state.paris.southLatitude && initialPosition.coords.longitude <= this.state.paris.eastLongitude && initialPosition.coords.longitude >= this.state.paris.westLongitude);
  };

  onPressMenu = (index) => {
    if (this.state.rank != index) {
      this.setState({rank: index});
      if (this.state.isInParis) {
        this.getDirections(this.state.position);
      }
    }
  };

  // Destination guide, fetch from API
  getDirections = (origin) => {
    if (this.state.rank > 0) {
      var restaurant = this.state.restaurants[this.state.rank - 1];
    } else {
      var restaurant = this.state.restaurant;
    }

    var toCoords = {
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
    };

    var url = 'https://maps.googleapis.com/maps/api/directions/json?mode=walking&';
        url += 'origin=' + origin.latitude + ',' + origin.longitude;
        url += '&destination=' + toCoords.latitude + ',' + toCoords.longitude + '&key=AIzaSyC0gDzLFVYe_3PYk_MWuzQZ8P-kr18V7t8';

    return new Promise((resolve, reject) => {;
      fetch(url)
      .then((response) => {
        return response.json();
      }).then((json) => {
        this.setState({polylineCoords: this.createRouteCoordinates(json)});
        resolve(json);
      }).catch((err) => {
        reject(err);
      });
    });
  };

  // Destination guide, get coordinate route
  createRouteCoordinates = (data) => {
    if (data.status !== 'OK') {
      return [];
    }

    let points = data.routes[0].overview_polyline.points;
    let steps = Polyline.decode(points);
    let polylineCoords = [];

    for (let i=0; i < steps.length; i++) {
      let tempLocation = {
        latitude : steps[i][0],
        longitude : steps[i][1]
      }
      polylineCoords.push(tempLocation);
    }

    return polylineCoords;
  };

  // Check if position is in paris
  isInParis = (initialPosition) => {
    return (initialPosition.coords.latitude <= this.state.paris.northLatitude && initialPosition.coords.latitude >= this.state.paris.southLatitude && initialPosition.coords.longitude <= this.state.paris.eastLongitude && initialPosition.coords.longitude >= this.state.paris.westLongitude);
  };

  onRegionChangeComplete = (region) => {
    this.setState({region: region});
  };

  closeOnboarding = () => {
    this.setState({onboardingOverlay: false});
    MeActions.updateOnboardingStatus('restaurant');
  }

  renderPage() {
    if (this.state.rank > 0) {
      var restaurant = this.state.restaurants[this.state.rank - 1];
      var restaurants = this.state.restaurants.slice(0, 3);
      if (this.state.restaurants.length > 3) {
        restaurants.push(this.state.restaurants.slice(3, _.min([this.state.restaurants.length - 1, 20])));
      }
    } else {
      var restaurant = this.state.restaurant;
    }

    var titles = [], index = 0;
    _.map(restaurants, (restaurant) => {
      if (index < 3) {
        index +=1;
        titles.push('#' + index);
      } else {
        titles.push('+');
      }
    });

    return (
      <View>
        {this.state.rank > 0 ? [
          <NavigationBar 
            key='navbar'
            type='switch_and_back'
            active={this.state.rank}
            titles={titles}
            onPress={this.onPressMenu}
            rightButtonTitle='mes envies'
            rightImage={require('../../assets/images/icons/filter.png')}
            onRightButtonPress={() => {
              this.props.navigator.replace(Filtre.route())
            }}
            leftButtonTitle='Retour'
            onLeftButtonPress={() => {
              RestaurantsActions.resetFilters();
              this.props.navigator.pop();
            }} />
        ] : [
          !this.props.fromReco ? [
            <NavigationBar
              key='navbar'
              type='back'
              title={restaurant.name}
              leftButtonTitle='Retour'
              onLeftButtonPress={() => {
                this.props.navigator.pop()
              }} />
          ] : null
        ]}

        {this.state.rank > 0 ? [
          <Swiper 
            key='restaurants'
            index={this.state.rank - 1}
            showsButtons={false}
            loop={false}
            width={Dimensions.get('window').width}
            height={Platform.OS === 'ios' ? Dimensions.get('window').height - 60 : Dimensions.get('window').height - 40}
            autoplay={false}
            onMomentumScrollEnd={(e, state, context) => {
              this.setState({rank: state.index + 1});
              if (this.state.isInParis) {
                this.getDirections(this.state.position);
              }
              // Add code to remove overlay here if ont already removed
              if (this.state.onboardingOverlay) {
                this.closeOnboarding();
              }
            }}
            paginationStyle={{bottom: -15 /* Out of visible range */}}>
            {_.map(restaurants, (restaurant, key) => {
              if (key < 3) {
                return (
                  <RestaurantElement
                    key={key}
                    style={{paddingTop: this.props.fromReco ? 20 : 0}}
                    onboardingOverlay={key == 0 && this.state.onboardingOverlay}
                    closeOnboarding={this.closeOnboarding}
                    restaurant={restaurant}
                    navigator={this.props.navigator}
                    loading={this.state.loading}
                    isInParis={true}
                    polylineCoords={this.state.polylineCoords}
                    onImageTap={() => this.setState({pictureOverlay: true})}
                    rank={key + 1} />
                );
              } else {
                return (
                  <ScrollView key='other_restaurants' style={{flex: 1}}>
                    {_.map(restaurant, (resto, key) => {
                      return (
                        <RestaurantHeader
                          key={resto.id}
                          style={{backgroundColor: 'transparent', borderBottomWidth: .5, borderColor: '#FFFFFF'}}
                          height={225}
                          name={resto.name}
                          picture={resto.pictures[0]}
                          type={resto.food[1]}
                          budget={resto.price_range}
                          subway={RestaurantsStore.closestSubwayName(resto.id)}
                          underlayColor='#EEEDF1'
                          rank={key + 4}
                          onPress={() => {
                            this.props.navigator.push(Restaurant.route({id: resto.id}, resto.name));
                          }} />
                      );
                    })}
                  </ScrollView>
                );
              }
            })}
          </Swiper>
        ] : [
          <RestaurantElement
            key='restaurant'
            restaurant={restaurant}
            navigator={this.props.navigator}
            loading={this.state.loading}
            isInParis={true}
            polylineCoords={this.state.polylineCoords}
            onImageTap={() => this.setState({pictureOverlay: true})}
            already_recommended={this.state.already_recommended}
            already_wishlisted={this.state.already_wishlisted} />
        ]}

        {/* Overlay for adding to wishlist */}
        {/*
        <Modal
          key='modal'
          style={styles.wishlistModal}
          position='center'
          swipeArea={0}
          isOpen={this.state.wishlistOverlay}
          onClosed={() => this.setState({wishlistOverlay: false})}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>Ajouter le restaurant {this.state.restaurant.name} à ta wishlist ?</Text>
            <View style={{flexDirection: 'row'}}>
              <TouchableHighlight 
                underlayColor='rgba(0, 0, 0, 0)'
                style={styles.submitButton}
                onPress={() => {
                  if (RestaurantsStore.loading()) {
                    return;
                  }
                  RecoActions.addWish(restaurant.id, 'db');
                }}>
                <Text style={{textAlign: 'center', color: '#FFFFFF', fontSize: 12}}>Valider</Text>
              </TouchableHighlight>
              <TouchableHighlight 
                underlayColor='rgba(0, 0, 0, 0)'
                style={styles.closeButton}
                onPress={() => {
                  this.setState({wishlistOverlay: false});
                }}>
                <Text style={{textAlign: 'center', color: '#FE3139', fontSize: 12}}>Annuler</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        */}

        {/* Overlay View for Carousel of Photos */}
        {restaurant.pictures && restaurant.pictures.length > 0 ? [
          <Modal
            key='modal'
            style={styles.modal}
            position='top'
            swipeArea={(windowHeight / 2) - 150}
            isOpen={this.state.pictureOverlay}
            onClosed={() => this.setState({pictureOverlay: false})}>
              <Swiper
                style={{backgroundColor: 'rgba(0, 0, 0, .4)'}}
                showsButtons={false}
                width={windowWidth}
                height={windowHeight}
                autoplay={Platform.OS === 'ios' ? true : false}
                autoplayTimeout={5}
                paginationStyle={{bottom: 5}}
                dot={<View style={{backgroundColor:'rgba(0, 0, 0, 0.4)', width: 5, height: 5,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                activeDot={<View style={{backgroundColor: '#FE3139', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}>
                {_.map(restaurant.pictures, (picture, key) => {
                  return <Image key={'picture_' + key} style={{marginLeft: 20, marginRight: 20, marginTop: (windowHeight / 2) - 150, width: windowWidth - 40, height: 300}} resizeMode='cover' source={{uri: picture}} />
                })}
              </Swiper>
              <TouchableHighlight
                underlayColor='rgba(0, 0, 0, 0)'
                style={{width: 30, height: 30, borderRadius: 15, borderColor: '#EEEDF1', borderWidth: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 7, top: 7}}
                onPress={() => {
                  this.setState({pictureOverlay: false});
                }}>
                <Icon
                  name='times'
                  size={15}
                  color='#EEEDF1' />
            </TouchableHighlight>
          </Modal>
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
  modal: {
   width: windowWidth,
   height: windowHeight,
   justifyContent: 'flex-end',
   alignItems: 'flex-end',
   backgroundColor: 'transparent'
  },
  wishlistModal: {
   width: windowWidth,
   height: windowHeight,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  modalContainer: {
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  modalMessage: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 5,
    color: '#FE3139'
  },
  submitButton: {
    backgroundColor: '#FE3139',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 5
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 5,
    borderWidth: 1,
    borderColor: '#FE3139'
  }
});

export default Restaurant;
