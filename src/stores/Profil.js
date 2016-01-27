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

    this.profils = {};
    this.status.profilsLoading = [];
    this.status.profilsLoadingError = {};

    this.status.profilMasking = [];
    this.status.profilMaskingError = {};
    this.status.profilDisplaying = [];
    this.status.profilDisplayingError = {};

    this.bindListeners({
      handleFetchProfil: ProfilActions.FETCH_PROFIL,
      handleProfilFetched: ProfilActions.PROFIL_FETCHED,
      handleProfilFetchFailed: ProfilActions.PROFIL_FETCH_FAILED,
      handleMeEditSuccess: MeActions.EDIT_SUCCESS,
      handleRemoveRecoSuccess: RestaurantsActions.REMOVE_RECO_SUCCESS,

      handleMaskProfil: ProfilActions.MASK_PROFIL,
      handleMaskProfilFailed: ProfilActions.MASK_PROFIL_FAILED,
      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfil: ProfilActions.DISPLAY_PROFIL,
      handleDisplayProfilFailed: ProfilActions.DISPLAY_PROFIL_FAILED,
      handleDisplayProfilSuccess: ProfilActions.DISPLAY_PROFIL_SUCCESS
    });
  }

  handleMaskProfil(id) {
    this.status.profilMasking.push(id);
    delete this.status.profilMaskingError[id];
  }
  handleMaskProfilFailed(data) {
    _.remove(this.status.profilMasking, function(id) {
      return id === data.id;
    });
    this.status.profilMaskingError[data.id] = data.err;
  }
  handleMaskProfilSuccess(idProfil) {
    _.remove(this.status.profilMasking, function(id) {
      return id === idProfil;
    });
    this.profils[idProfil] = _.extend({}, this.profils[idProfil], {invisible: true});
  }
  static maskProfilError(id) {
    return this.getState().status.profilMaskingError[id];
  }
  static maskProfilLoading(id) {
    return _.contains(this.getState().status.profilMasking, id);
  }

  handleDisplayProfil(id) {
    this.status.profilDisplaying.push(id);
    delete this.status.profilDisplayingError[id];
  }
  handleDisplayProfilFailed(data) {
    _.remove(this.status.profilDisplaying, function(id) {
      return id === data.id;
    });
    this.status.profilDisplayingError[data.id] = data.err;
  }
  handleDisplayProfilSuccess(idProfil) {
    _.remove(this.status.profilDisplaying, function(id) {
      return id === idProfil;
    });
    this.profils[idProfil] = _.extend({}, this.profils[idProfil], {invisible: false});
  }
  static displayProfilError(id) {
    return this.getState().status.profilDisplayingError[id];
  }
  static displayProfilLoading(id) {
    return _.contains(this.getState().status.profilDisplaying, id);
  }

  handleRemoveRecoSuccess(data) {
    var restaurant = data.oldRestaurant;
    var newProfil = _.clone(this.profils[MeStore.getState().me.id]);
    _.remove(newProfil.recommendations, (restau) => {
     return restau.id === restaurant.id;
    });
    this.profils[MeStore.getState().me.id] = newProfil;
  }

  handleMeEditSuccess() {
    this.waitFor(MeStore);
    var me = MeStore.getState().me;

    //clone
    this.profils[me.id] = _.merge({}, this.profils[me.id], {name: me.name});
  }

  handleFetchProfil(id) {
    console.log("fetching");
    this.status.profilsLoading.push(id);
    delete this.status.profilsLoadingError[id];
  }

  handleProfilFetched(profil) {
    console.log("fetched");
    this.profils[profil.id] = profil;
    _.remove(this.status.profilsLoading, function(id) {
      return id === profil.id;
    });
    console.log(this.status.profilsLoading);
  }

  handleProfilFetchFailed(data) {
    _.remove(this.status.profilsLoading, function(id) {
      return id === data.id;
    });
    this.status.profilsLoadingError[data.id] = data.err;
  }

  static error(id) {
    return this.getState().status.profilsLoadingError[id];
  }

  static loading(id) {
    return _.includes(this.getState().status.profilsLoading, id);
  }

  static profil(id) {
    return this.getState().profils[id];
  }
}

export default alt.createStore(ProfilStore);
