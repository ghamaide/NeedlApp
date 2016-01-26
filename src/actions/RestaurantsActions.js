'use strict';

import alt from '../alt';
import request from '../utils/api';

export class RestaurantsActions {

  fetchRestaurants() {
    return (dispatch) => {
      // dispatch();

      request('GET', '/api/restaurants')
        .end((err, result) => {
          if (err) {
            return this.restaurantsFetchFailed(err);
          }
          this.restaurantsFetched(result);
        });
    }
  }

  restaurantsFetched(restaurants) {
    return restaurants;
  }

  restaurantsFetchFailed(err) {
    return err;
  }

  fetchRestaurant(id) {
    return (dispatch) => {
      // dispatch(id);

      request('GET', '/api/restaurants/' + id)
        .end((err, result) => {
          if (err) {
            return this.restaurantFetchFailed(err, id);
          }
          this.restaurantFetched(result);
        });
    }
  }

  restaurantFetched(restaurant) {
    return restaurant;
  }

  restaurantFetchFailed(err, id) {
    return {err: err, id: id};
  }

  addWish(restaurant) {
    return (dispatch) => {
      dispatch(restaurant);

      request('GET', '/api/wishes')
        .query({
          'restaurant_id': restaurant.id
        })
        .end((err, restaurantUpdated) => {
          if (err) {
            return this.addWishFailed(err, restaurant);
          }

          this.addWishSuccess(restaurantUpdated);
        });
    }
  }

  addWishFailed(err, restaurant) {
    return {err: err, restaurant: restaurant};
  }

  addWishSuccess(restaurant) {
    return restaurant;
  }

  removeWish(restaurant, callback) {
    return (dispatch) => {
      dispatch(restaurant);

      request('GET', '/api/wishes')
        .query({
          'restaurant_id': restaurant.id,
          destroy: true
        })
        .end((err, restaurantUpdated) => {
          if (err) {
            return this.removeWishFailed(err, restaurant);
          }

          this.removeWishSuccess(restaurantUpdated);

          callback();
        });
    }
  }

  removeWishFailed(err, restaurant) {
    return {err: err, restaurant: restaurant};
  }

  removeWishSuccess(restaurant) {
    return restaurant;
  }

  removeReco(restaurant, callback) {
    return (dispatch) => {
      dispatch(restaurant);

      request('GET', '/api/recommendations')
        .query({
          'restaurant_id': restaurant.id,
          destroy: true
        })
        .end((err, restaurants) => {
          if (err) {
            return this.removeRecoFailed(err, restaurant);
          }

          this.removeRecoSuccess({restaurants: restaurants, oldRestaurant: restaurant});

          callback();
        });
    }
  }

  removeRecoFailed(err, restaurant) {
    return {err: err, restaurant: restaurant};
  }

  removeRecoSuccess(restaurant) {
    return restaurant;
  }

  setFilter(label, ids) {
    return {label: label, ids: ids};
  }

  setRegion(radius, long, lat, deltaLong, deltaLat, longCentre, latCentre, width, mapHeight) {
    return {radius: radius, long: long, lat: lat, deltaLong: deltaLong, deltaLat: deltaLat, longCentre: longCentre, latCentre: latCentre, width: width, mapHeight: mapHeight};
  }

  setDisplayPersonal(display) {
    return display;
  }

  clearFilters() {
    return function (dispatch) {
      dispatch();
    }
  }
}

export default alt.createActions(RestaurantsActions);
