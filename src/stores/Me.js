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

    this.showedCurrentPosition = false;

    this.showTabBar = true;

    this.version = 0;

    this.status.uploadingList = false;
    this.status.uploadingListError = null;

    this.status.uploadingContacts = false;
    this.status.uploadingContactsError = null;

    this.status.sendingMessage = false;
    this.status.sendingMessageError = null;

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

      handleUploadContacts : MeActions.UPLOAD_CONTACTS,
      handleUploadContactsSuccess : MeActions.UPLOAD_CONTACTS_SUCCESS,
      handleUploadContactsFailed : MeActions.UPLOAD_CONTACTS_FAILED,

      handleSendMessageContact : MeActions.SEND_MESSAGE_CONTACT,
      handleSendMessageContactSuccess : MeActions.SEND_MESSAGE_CONTACT_SUCCESS,
      handleSendMessageContactFailed : MeActions.SEND_MESSAGE_CONTACT_FAILED,

      handleHasBeenUploadWelcomed: MeActions.HAS_BEEN_UPLOAD_WELCOMED,
      
      handleDisplayTabBar: MeActions.DISPLAY_TAB_BAR,

      handleShowedCurrentPosition: MeActions.SHOWED_CURRENT_POSITION,

      handleSetVersion: MeActions.SET_VERSION
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

  handleUploadContacts() {
    this.status.uploadingContacts = true;
    this.status.uploadingContactsError = null;
  }

  handleUploadContactsFailed(err) {
    this.status.uploadingContacts = false;
    this.status.uploadingContactsError = err;
  }

  handleUploadContactsSuccess() {
    this.status.uploadingContacts = false;
  }

  handleSendMessageContact() {
    this.status.sendingMessage = true;
    this.status.sendingMessageError = null;
  }

  handleSendMessageContactFailed(err) {
    this.status.sendingMessage = false;
    this.status.sendingMessageError = err;
  }

  handleSendMessageContactSuccess() {
    this.status.sendingMessage = false;
  }

  handleDisplayTabBar(display) {
    this.showTabBar = display;
  }

  handleSetVersion(version) {
    this.version = version;
  }

  handleShowedCurrentPosition(showed) {
    this.showedCurrentPosition = showed;
  }

  static uploadingContactsError() {
    return this.getState().status.uploadingContactsError;
  }

  static uploadingContacts() {
    return this.getState().status.uploadingContacts;
  }

  static sendingMessageError() {
    return this.getState().status.sendingMessageError;
  }

  static sendingMessage() {
    return this.getState().status.sendingMessage;
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
