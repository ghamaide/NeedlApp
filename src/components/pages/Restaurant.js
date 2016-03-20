'use strict';

import React, {View} from 'react-native';

import _ from 'lodash';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';

import RestaurantElement from '../elements/Restaurant';

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

    this.state = this.restaurantsState();
    this.state.already_wishlisted = false;
    this.state.already_recommended = false;
  };

  restaurantsState() {
    return {
      restaurant: RestaurantsStore.getRestaurant(this.props.id),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
    if (this.props.note == 'already_wishlisted' || this.props.note == 'already_recommended') {
      clearTimeout(this.timer);
    }
  };

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

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  renderPage() {
    var restaurant = this.state.restaurant;

    return (
      <View>
        {this.props.fromReco ? [
          <NavigationBar key='navbar' type='default' title={restaurant.name} />
        ] : [
          <NavigationBar key='navbar' type='back' title={restaurant.name} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        ]}
        <RestaurantElement 
          restaurant={restaurant}
          navigator={this.props.navigator}
          loading={this.state.loading}
          already_recommended={this.state.already_recommended}
          already_wishlisted={this.state.already_wishlisted} />
        {this.props.fromReco ? [
          <MenuIcon key='menu_icon' onPress={this.props.toggle} />
        ] : null}
      </View>
    );
  };
}

export default Restaurant;
