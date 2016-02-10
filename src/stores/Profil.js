'use strict';

import alt from '../alt';
import _ from 'lodash';
import ProfilActions from '../actions/ProfilActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import MeActions from '../actions/MeActions';
import MeStore from './Me';
import CachedStore from './CachedStore';

export class ProfilStore extends CachedStore {

  constructor() {
    super();

    this.profil = {};
    this.profils = [];

    this.status.loading = false;
    this.status.error = {}
  
    this.bindListeners({
      handleFetchProfils: ProfilActions.fetchProfils,
      handleFetchProfilsSuccess: ProfilActions.fetchProfilsSuccess,
      handleFetchProfilsFailed: ProfilActions.fetchProfilsFailed,

      handleFetchProfil: ProfilActions.FETCH_PROFIL,
      handleProfilFetched: ProfilActions.PROFIL_FETCHED,
      handleProfilFetchFailed: ProfilActions.PROFIL_FETCH_FAILED,

      handleMaskProfil: ProfilActions.MASK_PROFIL,
      handleMaskProfilFailed: ProfilActions.MASK_PROFIL_FAILED,
      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfil: ProfilActions.DISPLAY_PROFIL,
      handleDisplayProfilFailed: ProfilActions.DISPLAY_PROFIL_FAILED,
      handleDisplayProfilSuccess: ProfilActions.DISPLAY_PROFIL_SUCCESS,

      handleRemoveRecoSuccess: RestaurantsActions.REMOVE_RECO_SUCCESS,

      handleEditSuccess: MeActions.EDIT_SUCCESS

// ================================================================================================

    });
  }

  handleFetchProfils() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchProfilsSuccess(profils) {
    this.profils = profils.friends;
    this.status.loading = false;
  }

  handleFetchProfilsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchProfil(id) {
    this.status.loading = true;
    delete this.status.error;
  }

  handleProfilFetched(profil) {
    var index = _.findIndex(this.profils, function(o) {return o.id === profil.id;});
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
    console.log(newProfil);
    this.profils[index] = newProfil;
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
    return this.getState().profils;
  }
  
  handleEditSuccess(data) {
    var index = _.find(this.getState().profils, function(o) {return o.id === MeStore.getState().me.id;});

    this.profils[index].name = data.name;
    this.profils[index].email = data.email;
  }
}

export default alt.createStore(ProfilStore);
