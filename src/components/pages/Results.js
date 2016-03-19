'use strict';

import React, {View} from 'react-native';

import _ from 'lodash';
import Polyline from 'polyline';

import RestaurantElement from '../elements/Restaurant';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';

import RestaurantsStore from '../../stores/Restaurants';

class Results extends Page {
  static route(props) {
    return {
      component: Results,
      title: 'Results',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.resultsState();
    this.state.polylineCoords = [];
    this.state.rank = this.props.rank;
  };

  resultsState() {
    return {
      restaurants: RestaurantsStore.filteredRestaurants().slice(0, 3),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  onRestaurantsChange = () => {
    this.setState(this.resultsState());
  };

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
    //this.getDirections({latitude: 48.8, longitude: 2.34});
  };

  componentDidMount() {
    _.forEach(this.state.restaurants, (restaurant, key) => {
      this.getDirections({latitude: 48.8, longitude: 2.34}, restaurant, key);
    });
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  onPressMenu = (index) => {
    if (this.state.rank != index) {
      this.setState({rank: index});
    }
  };

  getDirections = (origin, restaurant, index) => {
    console.log(origin);
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
        var polylineCoords = this.state.polylineCoords;
        polylineCoords[index] = this.createRouteCoordinates(json);
        this.setState({polylineCoords: polylineCoords});
        resolve(json);
      }).catch((err) => {
        reject(err);
      });
    });
  };

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
    var restaurant = this.state.restaurants[this.state.rank - 1];
    var titles = [], index = 0;
    _.map(this.state.restaurants, (restaurant) => {
      index +=1;
      titles.push('#' + index);
    });

    return (
      <View>
        <NavigationBar 
          key='navbar' 
          type='switch_and_back'
          active={this.state.rank}
          titles={titles}
          onPress={this.onPressMenu}
          leftButtonTitle='Retour'
          onLeftButtonPress={() => this.props.navigator.pop()} />

          <RestaurantElement
            restaurant={restaurant}
            onRegionChangeComplete={this.onRegionChangeComplete}
            polylineCoords={this.state.polylineCoords[this.state.rank - 1]}
            navigator={this.props.navigator}
            loading={this.state.loading}
            rank={_.findIndex(this.state.restaurants, restaurant) + 1} />

      </View>
    );
  };
}

export default Results;
