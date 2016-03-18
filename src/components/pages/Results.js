'use strict';

import React, {View} from 'react-native';

import _ from 'lodash';

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
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  onPressMenu = (index) => {
    if (this.state.rank != index) {
      this.setState({rank: index});
    }
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
            loading={this.state.loading}
            rank={this.state.rank}
            already_recommended={this.state.already_recommended}
            already_wishlisted={this.state.already_wishlisted} />

      </View>
    );
  };
}

export default Results;
