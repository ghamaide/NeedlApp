'use strict';

import _ from 'lodash';

import alt from '../alt';

import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import ProfilActions from '../actions/ProfilActions';
import RestaurantsActions from '../actions/RestaurantsActions';

import CachedStore from './CachedStore';
import MeStore from './Me';
import RecoActions from '../actions/RecoActions';

export class ProfilStore extends CachedStore {

  constructor() {
    super();

    this.profil = {};
    this.me = {};
    this.friends = [];
    this.followings = [];

    this.status.loading = false;
    this.status.error = {}
  
    this.bindListeners({
      handleLogout: LoginActions.LOGOUT,

      handleFetchFriends: ProfilActions.fetchFriends,
      handleFetchFriendsSuccess: ProfilActions.fetchFriendsSuccess,
      handleFetchFriendsFailed: ProfilActions.fetchFriendsFailed,

      handleFetchProfil: ProfilActions.FETCH_PROFIL,
      handleProfilFetched: ProfilActions.PROFIL_FETCHED,
      handleProfilFetchFailed: ProfilActions.PROFIL_FETCH_FAILED,

      handleFetchFollowings: ProfilActions.fetchFollowings,
      handleFetchFollowingsSuccess: ProfilActions.fetchFollowingsSuccess,
      handleFetchFollowingsFailed: ProfilActions.fetchFollowingsFailed,

      handleMaskProfil: ProfilActions.MASK_PROFIL,
      handleMaskProfilFailed: ProfilActions.MASK_PROFIL_FAILED,
      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfil: ProfilActions.DISPLAY_PROFIL,
      handleDisplayProfilFailed: ProfilActions.DISPLAY_PROFIL_FAILED,
      handleDisplayProfilSuccess: ProfilActions.DISPLAY_PROFIL_SUCCESS,

      handleSaveRecoSuccess: RecoActions.SAVE_RECO_SUCCESS,
      handleRemoveRecoSuccess: RestaurantsActions.REMOVE_RECO_SUCCESS,

      handleAddWishSuccess: RestaurantsActions.ADD_WISH_SUCCESS,
      handleRemoveWishSuccess: RestaurantsActions.REMOVE_WISH_SUCCESS,

      handleEditSuccess: MeActions.EDIT_SUCCESS

// ================================================================================================

    });
  }

  handleLogout() {
    this.profil = {};
    this.me = {};
    this.friends = [];
    this.followings = [];
  }

  handleFetchFriends() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchFriendsSuccess(profils) {
    this.friends = profils.friends;
    this.me = profils.me;
    this.profils = _.concat(this.friends, this.me, this.followings);
    this.status.loading = false;
  }

  handleFetchFriendsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchProfil() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleProfilFetched(profil) {
    var index = _.findIndex(this.profils, function(o) {return o.id === profil.id;});
    var newProfil = profil;
    // var recommendations = _.map(newProfil.recommendations ,(recommendation) => {
    //   return recommendation.id;
    // });
    // var wishes = _.map(newProfil.wishes ,(wish) => {
    //   return wish.id;
    // });
    // newProfil.recommendations = recommendations;
    // newProfil.wishes = wishes;

    if (index > -1) {
      this.profils[index] = profil;
    } else {
      this.profils.push(profil);
    }
    this.status.loading = false;
  }

  handleProfilFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchFollowings() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchFollowingsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchFollowingsSuccess(result) {
    this.followings = result.followings;
    this.profils = _.concat(this.friends, this.me, this.followings);
    this.status.loading = false;
  }

  handleMaskProfil() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleMaskProfilFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleMaskProfilSuccess(idProfil) {
    var index = _.findIndex(this.profils, function(o) {return o.id === idProfil;});
    this.profils[index].invisible = true;
    this.status.loading = false;
  }

  handleDisplayProfil() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleDisplayProfilFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleDisplayProfilSuccess(idProfil) {
    var index = _.findIndex(this.profils, function(o) {return o.id === idProfil;});
    this.profils[index].invisible = false;
    this.status.loading = false;
  }

  handleRemoveRecoSuccess(data) {
    var index = _.findIndex(this.profils, function(o) {return o.id === MeStore.getState().me.id;});
    var newProfil = this.profils[index];
    _.remove(newProfil.recommendations, (restaurantID) => {
     return restaurantID === data.oldRestaurant.id;
    });
    this.profils[index] = newProfil;
  }

  handleRemoveWishSuccess(restaurant) {
    var index = _.findIndex(this.profils, function(o) {return o.id === MeStore.getState().me.id;});
    var newProfil = this.profils[index];
    _.remove(newProfil.wishes, (restaurantID) => {
     return restaurantID === restaurant.id;
    });
    this.profils[index] = newProfil;
  }

  handleSaveRecoSuccess(reco) {
    var index = _.findIndex(this.profils, function(o) {return o.id === MeStore.getState().me.id;});
    var newProfil = this.profils[index];
    if (reco.approved) {
      newProfil.recommendations.push(reco.restaurant.id);
    } else {
      newProfil.wishes.push(reco.restaurant.id);
    }
    this.profils[index] = newProfil;
  }

  handleAddWishSuccess(restaurant) {
    var index = _.findIndex(this.profils, function(o) {return o.id === MeStore.getState().me.id;});
    var newProfil = this.profils[index];
    newProfil.wishes.push(restaurant.id);
    this.profils[index] = newProfil;
  }
  
  handleEditSuccess(data) {
    var index = _.findIndex(this.profils, function(o) {return o.id === MeStore.getState().me.id;});
    this.profils[index] = _.extend(this.profils[index], {fullname : data.name});
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }

  static getProfil(id) {
    return _.find(this.getState().profils, function(o) {return o.id === id;});
  }

  static getProfils() {
    return _.concat(this.getState().friends, this.getState.me, this.getState().followings);
  }

  static getFriends() {
    return this.getState().friends;
  }

  static getFollowings() {
    return this.getState().followings;
  }
}

export default alt.createStore(ProfilStore);
