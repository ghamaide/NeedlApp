'use strict';

import React, {View} from 'react-native';

import _ from 'lodash';
// Uncomment for destination guide
import Polyline from 'polyline';

import RestaurantElement from '../elements/Restaurant';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';

import RestaurantsActions from '../../actions/RestaurantsActions';

import RestaurantsStore from '../../stores/Restaurants';

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

    // Initial position
    this.state.position = {
      latitude: this.state.paris.centerLatitude,
      longitude: this.state.paris.centerLongitude
    };

    this.state.isInParis = false;
  };

  restaurantState() {
    return {
      restaurants: RestaurantsStore.filteredRestaurants().slice(0, 3),
      restaurant: RestaurantsStore.getRestaurant(this.props.id),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantState());
  };

  componentWillMount() {
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

    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentDidMount() {
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
      this.getDirections(this.state.position);
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

  renderPage() {
    if (this.state.rank > 0) {
      var restaurant = this.state.restaurants[this.state.rank - 1];
    } else {
      var restaurant = this.state.restaurant;
    }
    var titles = [], index = 0;
    _.map(this.state.restaurants, (restaurant) => {
      index +=1;
      titles.push('#' + index);
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
            leftButtonTitle='Retour'
            onLeftButtonPress={() => {
              RestaurantsActions.resetFilters();
              this.props.navigator.pop();
            }} />
        ] : [
          this.props.fromReco ? [
            <NavigationBar key='navbar' type='default' title={restaurant.name} />
          ] : [
            <NavigationBar key='navbar' type='back' title={restaurant.name} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
          ]
        ]}

        <RestaurantElement
          restaurant={restaurant}
          navigator={this.props.navigator}
          loading={this.state.loading}
          isInParis={true}
          polylineCoords={this.state.polylineCoords}
          already_recommended={this.state.already_recommended}
          already_wishlisted={this.state.already_wishlisted}
          rank={_.findIndex(this.state.restaurants, restaurant) + 1} />

        {this.props.fromReco ? [
          <MenuIcon key='menu_icon' onPress={this.props.toggle} />
        ] : null}
      </View>
    );
  };
}

export default Restaurant;
