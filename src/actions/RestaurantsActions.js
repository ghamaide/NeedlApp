'use strict';

import _ from 'lodash';
import alt from '../alt';
import request from '../utils/api';

export class RestaurantsActions {

  fetchRestaurants() {
    return (dispatch) => {
      dispatch();

      request('GET', '/api/v2/restaurants')
        .end((err, result) => {
          if (err) {
            return this.fetchRestaurantsFailed(err);
          }
          this.fetchRestaurantsSuccess(result);
        });
    }
  }

  fetchRestaurantsSuccess(restaurants) {
    return restaurants;
  }

  fetchRestaurantsFailed(err) {
    return err;
  }

  fetchRestaurant(id) {
    return (dispatch) => {
      dispatch(id);

      request('GET', '/api/v2/restaurants/' + id)
        .end((err, result) => {
          if (err) {
            return this.fetchRestaurantFailed(err, id);
          }

          this.fetchRestaurantSuccess(result);
        });
    }
  }

  fetchRestaurantSuccess(restaurant) {
    return restaurant;
  }

  fetchRestaurantFailed(err, id) {
    return {err: err, id: id};
  }

  setFilter(label, ids) {
    return {label: label, ids: ids};
  }

  setRegion(currentRegion, region, callback) {
    return (dispatch) => {
      dispatch();
      
      this.setRegionSuccess({currentRegion: currentRegion, region: region}, callback);
     }
  }

  setRegionSuccess(data, callback) {
    callback();
    return data;
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
