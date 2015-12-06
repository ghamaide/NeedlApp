'use strict';

import alt from '../alt';
import request from '../utils/api';

export class RestaurantsActions {

  fetchRestaurants() {
    //this.dispatch();

    request('GET', '/api/restaurants')
      .end((err, result) => {
        if (err) {
          return this.actions.restaurantsFetchFailed(err);
        }
        this.actions.restaurantsFetched(result);
      });
  }

  restaurantsFetched(restaurants) {
    this.dispatch(restaurants);
  }

  restaurantsFetchFailed(err) {
    this.dispatch(err);
  }

  fetchRestaurant(id) {
    //this.dispatch(id);

    request('GET', '/api/restaurants/' + id)
      .end((err, result) => {
        if (err) {
          return this.actions.restaurantFetchFailed(err, id);
        }
        this.actions.restaurantFetched(result);
      });
  }

  restaurantFetched(restaurant) {
    this.dispatch(restaurant);
  }

  restaurantFetchFailed(err, id) {
    this.dispatch({err: err, id: id});
  }

  addWish(restaurant) {
    this.dispatch(restaurant);

    request('GET', '/api/wishes')
      .query({
        'restaurant_id': restaurant.id
      })
      .end((err, restaurantUpdated) => {
        if (err) {
          return this.actions.addWishFailed(err, restaurant);
        }

        this.actions.addWishSuccess(restaurantUpdated);
      });
  }

  addWishFailed(err, restaurant) {
    this.dispatch({err: err, restaurant: restaurant});
  }

  addWishSuccess(restaurant) {
    this.dispatch(restaurant);
  }

  removeWish(restaurant, callback) {
    this.dispatch(restaurant);

    request('GET', '/api/wishes')
      .query({
        'restaurant_id': restaurant.id,
        destroy: true
      })
      .end((err, restaurantUpdated) => {
        if (err) {
          return this.actions.removeWishFailed(err, restaurant);
        }

        this.actions.removeWishSuccess(restaurantUpdated);

        callback();
      });
  }

  removeWishFailed(err, restaurant) {
    this.dispatch({err: err, restaurant: restaurant});
  }

  removeWishSuccess(restaurant) {
    this.dispatch(restaurant);
  }

  removeReco(restaurant, callback) {
    this.dispatch(restaurant);

    request('GET', '/api/recommendations')
      .query({
        'restaurant_id': restaurant.id,
        destroy: true
      })
      .end((err, restaurants) => {
        if (err) {
          return this.actions.removeRecoFailed(err, restaurant);
        }

        this.actions.removeRecoSuccess({restaurants: restaurants, oldRestaurant: restaurant});

        callback();
      });
  }

  removeRecoFailed(err, restaurant) {
    this.dispatch({err: err, restaurant: restaurant});
  }

  removeRecoSuccess(restaurant) {
    this.dispatch(restaurant);
  }

  setFilter(type, filter) {
    this.dispatch({type: type, filter: filter});
  }

  clearFilters() {
    this.dispatch();
  }
}

export default alt.createActions(RestaurantsActions);
