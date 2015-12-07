'use strict';

import alt from '../alt';
import _ from 'lodash';
import request from '../utils/api';
import qs from 'qs';

export class RecoActions {

  fetchRestaurants(query) {
    this.dispatch(query);

    if (this.fetchRestaurantRequest) {
      this.fetchRestaurantRequest.abort();
    }

    this.fetchRestaurantRequest = request('GET', '/api/restaurants/autocomplete')
      .query({query: query})
      .end((err, result) => {
        delete this.fetchRestaurantRequest;

        if (err) {
          return this.actions.restaurantsFetchFailed(err, query);
        }

        this.actions.restaurantsFetched(query, result);
      });
  }

  saveReco(reco) {
    this.dispatch(reco);

    this.fetchRestaurantRequest = request('GET', '/api/recommendations')
      .query(qs.stringify({
        restaurant_id: reco.restaurant.id,
        restaurant_origin: reco.restaurant.origin,
        recommendation: {
          wish: !reco.approved,
          strengths: reco.strengths,
          // attention pb d'orthographe coté serveur
          ambiences: reco.ambiances,
          price_ranges: reco.price_range && [reco.price_range],
          review: reco.review
        }
      }, { arrayFormat: 'brackets' }))
      .end((err, restaurant) => {
        if (err) {
          return this.actions.recoSaveFailed(err, reco);
        }

        this.actions.recoSaved(reco, restaurant);
      });
  }

  getReco(restaurantId, restaurantName) {
    this.dispatch(restaurantId);

    request('GET', '/api/recommendations/modify')
      .query({'restaurant_id': restaurantId})
      .end((err, res) => {
        if (err) {
          return this.actions.getRecoFailed(err, restaurantId);
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
          'price_range': parseInt(res.price_range[0]),
          review: res.review,
          approved: true
        };

        this.actions.getRecoSuccess(reco);
      });

  }

  getRecoFailed(err, restaurantId) {
    this.dispatch({err: err, restaurantId: restaurantId});
  }

  getRecoSuccess(reco) {
    this.dispatch(reco);
  }

  recoSaved(reco, restaurant) {
    reco.restaurant = restaurant;
    this.dispatch(reco);
  }

  recoSaveFailed(err, reco) {
    this.dispatch({err: err, reco: reco});
  }

  restaurantsFetched(query, restaurants) {
    this.dispatch({
      query: query,
      restaurants: restaurants
    });
  }

  restaurantsFetchFailed(err, query) {
    this.dispatch({err: err, query: query});
  }

  reset() {
    //this.dispatch();
  }

  setReco(reco) {
    this.dispatch(reco);
  }
}

export default alt.createActions(RecoActions);
