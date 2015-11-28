'use strict';

import alt from '../alt';
import _ from 'lodash';

import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import ProfilActions from '../actions/ProfilActions';
import CachedStore from './CachedStore';

export class MeStore extends CachedStore {

  constructor() {
    super();

    this.me = {};

    this.hasBeenUploadWelcomed = false;

    this.status.uploadingList = false;
    this.status.uploadingListError = null;

    this.bindListeners({
      handleRecoSaved: [RecoActions.RECO_SAVED, RestaurantsActions.ADD_WISH],

      handleLoginSuccess: LoginActions.LOGIN_SUCCESS,
      handleLoginFailed: LoginActions.LOGIN_FAILED,
      handleLogout: LoginActions.LOGOUT,
      handleLogin: LoginActions.LOGIN,
      handleLoginCancelled: LoginActions.LOGIN_CANCELLED,
      handleEditSuccess: MeActions.EDIT_SUCCESS,
      handleEditFailed: MeActions.EDIT_FAILED,
      handleEdit: MeActions.EDIT,
      handleCleanEditError: MeActions.CLEAN_EDIT_ERROR,
      handleProfilFetched: ProfilActions.PROFIL_FETCHED,

      handleUploadList: MeActions.UPLOAD_LIST,
      handleUploadListSuccess: MeActions.UPLOAD_LIST_SUCCESS,
      handleUploadListFailed: MeActions.UPLOAD_LIST_FAILED,

      hanldleUploadContacts : MeActions.UPLOAD_CONTACTS,
      hanldleUploadContactsSuccess : MeActions.UPLOAD_CONTACTS_SUCCESS,
      hanldleUploadContactsFailed : MeActions.UPLOAD_CONTACTS_FAILED,

      handleHasBeenUploadWelcomed: MeActions.HAS_BEEN_UPLOAD_WELCOMED
    });
  }

  handleUploadList() {
    this.status.uploadingList = true;
    this.status.uploadingListError = null;
  }

  handleUploadListFailed(err) {
    this.status.uploadingList = false;
    this.status.uploadingListError = err;
  }

  handleUploadListSuccess() {
    this.status.uploadingList = false;
  }

  handleProfilFetched(profil) {
    if (profil.id === this.me.id) {
      this.me = _.extend({}, this.me, {
        name: profil.name,
        email: profil.email
      });
    }
  }

  handleCleanEditError() {
    delete this.status.editingError;
  }

  handleRecoSaved() {
    this.me.HAS_SHARED = true;
  }

  handleLoginSuccess(me) {
    this.status.loggingIn = false;
    this.me = me.user;
    this.me.HAS_SHARED = !!me.nb_recos || !!me.nb_wishes;
  }

  handleLoginFailed(err) {
    this.status.loggingIn = false;
    this.status.loginFailedError = err;
  }

  handleLoginCancelled() {
    this.status.loggingIn = false;
    delete this.status.loginFailedError;
  }

  handleLogout() {
    this.me = {};
  }

  handleLogin() {
    this.status.loggingIn = true;
    delete this.status.loginFailedError;
  }

  handleEdit() {
    this.status.editing = true;
  }

  handleEditFailed(err) {
    this.status.editing = false;
    this.status.editingError = err;
  }

  handleEditSuccess(data) {
    this.status.editing = false;
    this.me.name = data.name;
    this.me.email = data.email;
  }

  handleHasBeenUploadWelcomed() {
    this.hasBeenUploadWelcomed = true;
  }

  hanldleUploadContacts() {
    this.status.uploadingContacts = true;
    this.status.uploadingContactsError = null;
  }

  hanldleUploadContactsFailed(err) {
    this.status.uploadingContacts = false;
    this.status.uploadingContactsError = err;
  }

  hanldleUploadContactsSuccess() {
    this.status.uploadingContacts = false;
  }

  static uploadingList() {
    return this.getState().status.uploadingList;
  }

  static uploadingListError() {
    return this.getState().status.uploadingListError;
  }

  static hasBeenUploadWelcomed() {
    return this.getState().hasBeenUploadWelcomed;
  }
}

export default alt.createStore(MeStore);
