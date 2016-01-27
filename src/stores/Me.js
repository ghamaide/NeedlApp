'use strict';

import alt from '../alt';
import _ from 'lodash';

import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import TempActions from '../actions/TempActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';
import ProfilActions from '../actions/ProfilActions';

import CachedStore from './CachedStore';

export class MeStore extends CachedStore {

  constructor() {
    super();

    this.me = {};

    this.hasBeenUploadWelcomed = false;

    this.showOverlayMapTutorial = true;

    this.showedCurrentPosition = false;

    this.showedUpdateMessage = true;
    
    this.dismissedUpdateMessage = false;

    this.showTabBar = true;

    this.version = 0;

    this.hasUploadedContacts = false;
    this.uploadedContacts = [];

    this.status.uploadingContacts = false;
    this.status.uploadingContactsError = null;

    this.status.sendingMessage = false;
    this.status.sendingMessageError = null;

    this.status.sendingVersion = false;
    this.status.sendingVersionError = null;

    this.bindListeners({
      handleSaveRecoSuccess: [RecoActions.SAVE_RECO_SUCCESS, RestaurantsActions.ADD_WISH],

      handleLoginSuccess: LoginActions.LOGIN_SUCCESS,
      handleLoginFailed: LoginActions.LOGIN_FAILED,
      handleLogout: LoginActions.LOGOUT,
      handleLogin: LoginActions.LOGIN,
      handleLoginCancelled: LoginActions.LOGIN_CANCELLED,
      handleEditSuccess: TempActions.editSuccess,
      handleEditFailed: TempActions.EDIT_FAILED,
      handleEdit: TempActions.EDIT,
      handleCleanEditError: TempActions.CLEAN_EDIT_ERROR,
      handleProfilFetched: ProfilActions.PROFIL_FETCHED,

      handleUploadContacts : TempActions.UPLOAD_CONTACTS,
      handleUploadContactsSuccess : TempActions.UPLOAD_CONTACTS_SUCCESS,
      handleUploadContactsFailed : TempActions.UPLOAD_CONTACTS_FAILED,

      handleSendMessageContact : TempActions.SEND_MESSAGE_CONTACT,
      handleSendMessageContactSuccess : TempActions.SEND_MESSAGE_CONTACT_SUCCESS,
      handleSendMessageContactFailed : TempActions.SEND_MESSAGE_CONTACT_FAILED,

      handleHasBeenUploadWelcomed: TempActions.HAS_BEEN_UPLOAD_WELCOMED,
      
      handleHideOverlayMapTutorial: TempActions.HIDE_OVERLAY_MAP_TUTORIAL,
      
      handleDisplayTabBar: TempActions.DISPLAY_TAB_BAR,

      handleShowedCurrentPosition: TempActions.SHOWED_CURRENT_POSITION,

      handleShowedUpdateMessage: TempActions.SHOWED_UPDATE_MESSAGE,

      handleSetVersion: TempActions.SET_VERSION,

      handleSendVersionSuccess: TempActions.SEND_VERSION_SUCCESS,
      handleSendVersionFailed: TempActions.SEND_VERSION_FAILED
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

  handleSaveRecoSuccess() {
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
    this.hasUploadedContacts = true;
  }

  handleSendMessageContact() {
    this.status.sendingMessage = true;
    this.status.sendingMessageError = null;
  }

  handleSendMessageContactFailed(err) {
    this.status.sendingMessage = false;
    this.status.sendingMessageError = err;
  }

  handleSendMessageContactSuccess(id) {
    this.status.sendingMessage = false;
    if (!_.contains(this.uploadedContacts, id)) {
      this.uploadedContacts.push(id);  
    }
  }

  handleDisplayTabBar(display) {
    this.showTabBar = display;
  }

  handleSendVersionFailed(err) {
    this.status.sendingVersion = false;
    this.status.sendingVersionError = err;
  }

  handleSendVersionSuccess(result) {
    this.status.sendingVersionError = null;
    this.status.sendingVersion = false;
    if (!result && !this.dismissedUpdateMessage) {
      this.showedUpdateMessage = false;
    }
    
  }

  handleSendVersion() {
    this.status.sendingVersion = true;
  }

  handleSetVersion(version) {
    this.version = version;
  }

  handleShowedUpdateMessage() {
    this.showedUpdateMessage = true;
    this.dismissedUpdateMessage = true;
  }

  handleShowedCurrentPosition(showed) {
    this.showedCurrentPosition = showed;
  }

  handleHideOverlayMapTutorial() {
    this.showOverlayMapTutorial = false;
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

  static sendingVersion() {
    return this.getState().status.sendingVersion;
  }

  static sendingVersionError() {
    return this.getState().status.sendingVersionError;
  }

  static showedUpdateMessage() {
    return this.getState().showedUpdateMessage;
  }

  static hasBeenUploadWelcomed() {
    return this.getState().hasBeenUploadWelcomed;
  }

  static showOverlayMapTutorial() {
    return this.getState().showOverlayMapTutorial;
  }
}

export default alt.createStore(MeStore);
