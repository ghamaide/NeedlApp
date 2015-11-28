'use strict';

import alt from '../alt';
import RecoActions from '../actions/RecoActions';
import MeStore from './Me';

export class RecoStore {

  constructor() {
    this.restaurants = [];
    this.query = null;
    this.saved = false;

    this.status = {};
    this.status.restaurantsLoading = [];
    this.status.restaurantsLoadingError = {};

    this.status.getRecoLoading = false;
    this.status.getRecoError = null;

    this.status.reco = {};

    this.bindListeners({
      handleFetchRestaurants: RecoActions.FETCH_RESTAURANTS,
      handleRestaurantsFetched: RecoActions.RESTAURANTS_FETCHED,
      handleRestaurantsFetchFailed: RecoActions.RESTAURANTS_FETCH_FAILED,
      handleReset: RecoActions.RESET,
      handleSaveReco: RecoActions.SAVE_RECO,
      handleRecoSaveFailed: RecoActions.RECO_SAVE_FAILED,
      handleRecoSaved: RecoActions.RECO_SAVED,

      handleSetReco: RecoActions.SET_RECO,

      handleGetReco: RecoActions.GET_RECO,
      handleGetRecoFailed: RecoActions.GET_RECO_FAILED,
      handleGetRecoSuccess: RecoActions.GET_RECO_SUCCESS
    });
  }

  handleGetReco(restaurantId) {
    this.status.getRecoLoading = false;
    this.status.getRecoError = null;
    this.status.getRecoLoading = restaurantId;
  }

  handleGetRecoFailed(data) {
    console.log("Error");
    if (this.status.getRecoLoading !== data.restaurantId) {
      return;
    }
    this.status.getRecoLoading = false;
    this.status.getRecoError = data.err;
  }

  handleGetRecoSuccess(reco) {
    this.status.reco = reco;
    this.status.getRecoLoading = false;
    this.status.getRecoError = null;
  }

  handleSetReco(reco) {
    this.status.reco = reco;
  }

  handleSaveReco() {
    delete this.errSave;
  }

  handleRecoSaved() {
    this.saved = true;
  }

  handleRecoSaveFailed(data) {
    this.errSave = data.err;
  }

  handleReset() {
    this.waitFor(MeStore);
    this.restaurants = [];
    this.query = null;
    this.saved = false;
    this.status.reco = {};
    delete this.errSave;
    this.status.getRecoLoading = false;
    this.status.getRecoError = null;
  }

  handleFetchRestaurants(query) {
    this.query = query;
    this.restaurants = [];
    this.status.restaurantsLoading = true;
    delete this.status.restaurantsLoadingError;
  }

  handleRestaurantsFetched(data) {
    if (data.query !== this.query) {
      return;
    }

    this.restaurants = data.restaurants;
    this.status.restaurantsLoading = false;
  }

  handleRestaurantsFetchFailed(data) {
    if (data.query !== this.query) {
      return;
    }
    this.status.restaurantsLoading = false;
    this.status.restaurantsLoadingError = data.err;
  }

  static error() {
    return this.getState().status.restaurantsLoadingError;
  }

  static loading() {
    return this.getState().status.restaurantsLoading;
  }

  static getReco() {
    return this.getState().status.reco;
  }

  static getRecoLoading() {
    return !!this.getState().status.getRecoLoading;
  }

  static getRecoErr() {
    return this.getState().status.getRecoError;
  }
}

export default alt.createStore(RecoStore);
