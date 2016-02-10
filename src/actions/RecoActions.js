'use strict';

import alt from '../alt';

import _ from 'lodash';
import request from '../utils/api';
import qs from 'qs';

export class RecoActions {

  fetchRestaurants(query) {
    return (dispatch) => {
      dispatch();

      if (this.fetchRestaurantRequest) {
        this.fetchRestaurantRequest.abort();
      }

      this.fetchRestaurantRequest = request('GET', '/api/restaurants/autocomplete')
        .query({query: query})
        .end((err, result) => {
          delete this.fetchRestaurantRequest;

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

  setReco(reco) {
    return reco;
  }

  saveReco(reco) {
    return (dispatch) => {
      dispatch(reco);

      this.fetchRestaurantRequest = request('GET', '/api/recommendations')
        .query(qs.stringify({
          restaurant_id: reco.restaurant.id,
          restaurant_origin: reco.restaurant.origin,
          recommendation: {
            wish: !reco.approved,
            strengths: reco.strengths,
            ambiences: reco.ambiances,
            occasions: reco.occasions,
            review: reco.review
          }
        }, { arrayFormat: 'brackets' }))
        .end((err, restaurant) => {
          if (err) {
            return this.saveRecoFailed(err, reco);
          }

          this.saveRecoSuccess(reco, restaurant);
        });
    }
  }

  getReco(restaurantId, restaurantName) {
    return (dispatch) => {
      dispatch(restaurantId);

      request('GET', '/api/recommendations/modify')
        .query({'restaurant_id': restaurantId})
        .end((err, res) => {
          if (err) {
            return this.getRecoFailed(err, restaurantId);
          }

          var reco = {
            restaurant: {
              id: restaurantId,
              origin: 'db',
              name: restaurantName
            },
            ambiances: _.map(res.ambiences, (id) => {
              return parseInt(id);
            }),
            occasions: _.map(res.occasions, (id) => {
              return parseInt(id);
            }),
            strengths: _.map(res.strengths, (id) => {
              return parseInt(id);
            }),
            //'price_range': parseInt(res.price_range[0]),
            review: res.review,
            approved: true
          };

          this.getRecoSuccess(reco);
        });
    }
  }

  getRecoFailed(err, restaurantId) {
    return {err: err, restaurantId: restaurantId};
  }

  getRecoSuccess(reco) {
    return reco;
  }

  saveRecoSuccess(reco, restaurant) {
    reco.restaurant = restaurant;
    return reco;
  }

  saveRecoFailed(err, reco) {
    return {err: err, reco: reco};
  }
}

export default alt.createActions(RecoActions);
