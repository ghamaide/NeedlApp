'use strict';

import _ from 'lodash';

import alt from '../alt';

import FriendsActions from '../actions/FriendsActions';
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

      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleFetchProfil: ProfilActions.FETCH_PROFIL,
      handleFetchProfilSuccess: ProfilActions.FETCH_PROFIL_SUCCESS,
      handleFetchProfilFailed: ProfilActions.FETCH_PROFIL_FAILED,

      handleFetchFollowings: ProfilActions.fetchFollowings,
      handleFetchFollowingsSuccess: ProfilActions.fetchFollowingsSuccess,
      handleFetchFollowingsFailed: ProfilActions.fetchFollowingsFailed,

      handleMaskProfil: ProfilActions.MASK_PROFIL,
      handleMaskProfilFailed: ProfilActions.MASK_PROFIL_FAILED,
      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfil: ProfilActions.DISPLAY_PROFIL,
      handleDisplayProfilFailed: ProfilActions.DISPLAY_PROFIL_FAILED,
      handleDisplayProfilSuccess: ProfilActions.DISPLAY_PROFIL_SUCCESS,

      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,
      handleRemoveRecoSuccess: RecoActions.REMOVE_RECO_SUCCESS,

      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,
      handleRemoveWishSuccess: RecoActions.REMOVE_WISH_SUCCESS,

      handleEditSuccess: MeActions.EDIT_SUCCESS
    });
  }

  handleFetchFriends() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchFriendsSuccess(profils) {
    this.friends = profils.friends;
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

  handleFetchProfilSuccess(profil) {
    if (profil.id == MeStore.getState().me.id) {
      this.me = profil;
    } else {
      var newProfil = profil;
      var indexFriends = _.findIndex(this.friends, function(o) {return o.id === profil.id;});
      var indexFollowings = _.findIndex(this.followings, function(o) {return o.id === profil.id;});
      if (indexFriends > -1) {
        this.friends[index] = profil;
      } else if (indexFollowings > -1) {
        this.followings[index] = profil
      } else {
        this.profil = profil;
      }
    }
    this.profils = _.concat(this.friends, this.me, this.followings);
    this.status.loading = false;
  }

  handleFetchProfilFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveFriendshipSuccess(id) {
    _.remove(this.friends, (friend) => {
      return friend.id == id;
    });
    this.profils = _.concat(this.me, this.friends, this.followings);
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
    var index = _.findIndex(this.friends, function(o) {return o.id === idProfil;});
    if (index > -1) {
      this.friends[index].invisible = true;
    } else {
      index = _.findIndex(this.followings, function(o) {return o.id === idProfil;});
      this.followings[index].invisible = true;
    }
    this.profils = _.concat(this.me, this.friends, this.followings);
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
    var index = _.findIndex(this.friends, function(o) {return o.id === idProfil;});
    if (index > -1) {
      this.friends[index].invisible = false;
    } else {
      index = _.findIndex(this.followings, function(o) {return o.id === idProfil;});
      this.followings[index].invisible = false;
    }
    this.profils = _.concat(this.me, this.friends, this.followings);
    this.status.loading = false;
  }

  handleAddRecoSuccess(result) {
    var newProfil = this.me;
    newProfil.recommendations.push(result.restaurant.id);
    if (_.includes(newProfil.wishes, result.restaurant.id)) {
      _.remove(newProfil.wishes, (restaurant_id) => {
        return restaurant_id == result.restaurant.id;
      })
    }
    this.me = newProfil;
    this.profils = _.concat(this.friends, this.me, this.followings);
  }

  handleRemoveRecoSuccess(restaurant) {
    var newProfil = this.me;
    _.remove(newProfil.recommendations, (restaurantID) => {
     return restaurantID === restaurant.id;
    });
    this.me = newProfil;
    this.profils = _.concat(this.friends, this.me, this.followings);
  }

  handleAddWishSuccess(result) {
    var newProfil = this.me;
    newProfil.wishes.push(result.restaurant.id);
    this.me = newProfil;
    this.profils = _.concat(this.friends, this.me, this.followings);
  }

  handleRemoveWishSuccess(restaurant) {
    var newProfil = this.me;
    _.remove(newProfil.wishes, (restaurantID) => {
     return restaurantID === restaurant.id;
    });
    this.me = newProfil;
    this.profils = _.concat(this.me, this.friends, this.followings);
  }
  
  handleEditSuccess(data) {
    this.me = _.extend(this.me, {fullname : data.name});
    this.profils = _.concat(this.me, this.friends, this.followings);
  }

  handleLogout() {
    this.profil = {};
    this.me = {};
    this.friends = [];
    this.followings = [];
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
    return _.concat(this.getState().friends, this.getState().me, this.getState().followings);
  }

  static getFriends() {
    return this.getState().friends;
  }

  static getFollowings() {
    return this.getState().followings;
  }
}

export default alt.createStore(ProfilStore);
