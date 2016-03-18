'use strict';


import _ from 'lodash';
import qs from 'qs';

import alt from '../alt';

import request from '../utils/api';

export class RecoActions {

  fetchRestaurants(query) {
    return (dispatch) => {
      dispatch();

      if (this.fetchRestaurantRequest) {
        this.fetchRestaurantRequest.abort();
      }

      this.fetchRestaurantRequest = request('GET', '/api/v2/restaurants/autocomplete')
        .query({query: query})
        .end((err, result) => {
          delete this.fetchRestaurantRequest;

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

  setReco(reco) {
    return reco;
  }

  addReco(reco, callback) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/recommendations')
        .query(qs.stringify({
          restaurant_id: reco.restaurant.id,
          restaurant_origin: reco.restaurant.origin,
          recommendation: {
            friends_thanking: reco.friends_thanking,
            experts_thanking: reco.experts_thanking,
            strengths: reco.strengths,
            ambiences: reco.ambiences,
            occasions: reco.occasions,
            review: reco.review,
            public: reco.public
          }
        }, { arrayFormat: 'brackets' }))
        .end((err, result) => {
          if (err) {
            return this.addRecoFailed(err);
          }
          this.addRecoSuccess(result);
          callback();
        });
    }
  }

  addRecoSuccess(result) {
    return result;
  }

  addRecoFailed(err) {
    return err;
  }

  updateRecommendation(reco, callback) {
    return (dispatch) => {
      dispatch();

      request('PUT', '/api/v2/recommendations/' + reco.restaurant.id)
        .query(qs.stringify({
          restaurant_origin: reco.restaurant.origin,
          recommendation: {
            friends_thanking: reco.friends_thanking,
            experts_thanking: reco.experts_thanking,
            strengths: reco.strengths,
            ambiences: reco.ambiences,
            occasions: reco.occasions,
            review: reco.review
          }
        }, { arrayFormat: 'brackets' }))
        .end((err, result) => {
          if (err) {
            return this.updateRecommendationFailed(err);
          }
          this.updateRecommendationSuccess(result);
          callback();
        });
    }
  }

  updateRecommendationFailed(err) {
    return err;
  }

  updateRecommendationSuccess(result) {
    return result;
  }

  removeReco(restaurant, callback) {
    return (dispatch) => {
      dispatch();

      request('DELETE', '/api/v2/recommendations/' + restaurant.id)
        .end((err, result) => {
          if (err) {
            return this.removeRecoFailed(err);
          }

          this.removeRecoSuccess(result);

          callback();
        });
    }
  }

  removeRecoFailed(err) {
    return err;
  }

  removeRecoSuccess(data) {
    return data;
  }

  addWish(restaurant_id, origin, callback) {
    return (dispatch) => {
      dispatch();

      request('POST', '/api/v2/wishes')
        .query(qs.stringify({
          restaurant_id: restaurant_id,
          restaurant_origin: origin
        }, { arrayFormat: 'brackets' }))
        .end((err, result) => {
          if (err) {
            return this.addWishFailed(err);
          }

          if (callback) {
            callback()
          }

          this.addWishSuccess(result);
        });
    }
  }

  addWishFailed(err) {
    return err;
  }

  addWishSuccess(result) {
    return result;
  }

  removeWish(restaurant, callback) {
    return (dispatch) => {
      dispatch(restaurant);

      request('DELETE', '/api/v2/wishes/' + restaurant.id)
        .end((err, result) => {
          if (err) {
            return this.removeWishFailed(err);
          }

          callback();
          this.removeWishSuccess(result);
        });
    }
  }

  removeWishFailed(err) {
    return err;
  }

  removeWishSuccess(restaurant) {
    return restaurant;
  }
}

export default alt.createActions(RecoActions);
