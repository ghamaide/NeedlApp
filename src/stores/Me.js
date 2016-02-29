'use strict';

import _ from 'lodash';

import alt from '../alt';

import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';

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

    this.isConnected = false;

    this.hasUploadedContacts = false;
    this.uploadedContacts = [];

    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({

      handleSaveRecoSuccess: [RecoActions.SAVE_RECO_SUCCESS, RestaurantsActions.ADD_WISH],

      handleStartActions: MeActions.START_ACTIONS,
      handleStartActionsFailed: MeActions.START_ACTIONS_FAILED,
      handleStartActionsSuccess: MeActions.START_ACTIONS_SUCCESS,

      handleLoginFacebookSuccess: LoginActions.LOGIN_FACEBOOK_SUCCESS,
      handleLoginFacebookFailed: LoginActions.LOGIN_FACEBOOK_FAILED,
      handleLoginFacebook: LoginActions.LOGIN_FACEBOOK,
      handleLoginFacebookCancelled: LoginActions.LOGIN_FACEBOOK_CANCELLED,

      handleLoginEmailSuccess: LoginActions.LOGIN_EMAIL_SUCCESS,
      handleLoginEmailFailed: LoginActions.LOGIN_EMAIL_FAILED,
      handleLoginEmail: LoginActions.LOGIN_EMAIL,

      handleCreateAccount: LoginActions.CREATE_ACCOUNT,
      handleCreateAccountFailed: LoginActions.CREATE_ACCOUNT_FAILED,
      handleCreateAccountSuccess: LoginActions.CREATE_ACCOUNT_SUCCESS,

      handleLogout: LoginActions.LOGOUT,

      handleEditSuccess: MeActions.EDIT_SUCCESS,
      handleEditFailed: MeActions.EDIT_FAILED,
      handleEdit: MeActions.EDIT,
      
      handleUploadContacts : MeActions.UPLOAD_CONTACTS,
      handleUploadContactsSuccess : MeActions.UPLOAD_CONTACTS_SUCCESS,
      handleUploadContactsFailed : MeActions.UPLOAD_CONTACTS_FAILED,

      handleSendMessageContact : MeActions.SEND_MESSAGE_CONTACT,
      handleSendMessageContactSuccess : MeActions.SEND_MESSAGE_CONTACT_SUCCESS,
      handleSendMessageContactFailed : MeActions.SEND_MESSAGE_CONTACT_FAILED,

      handleHasBeenUploadWelcomed: MeActions.HAS_BEEN_UPLOAD_WELCOMED,
      
      handleDisplayTabBar: MeActions.DISPLAY_TAB_BAR,

      handleShowedCurrentPosition: MeActions.SHOWED_CURRENT_POSITION,

      handleCheckConnectivity: MeActions.checkConnectivity,
      handleCheckConnectivitySuccess: MeActions.checkConnectivitySuccess,

// ================================================================================================

      handleHideOverlayMapTutorial: MeActions.HIDE_OVERLAY_MAP_TUTORIAL,

      handleShowedUpdateMessage: MeActions.SHOWED_UPDATE_MESSAGE

    });
  }

  handleSaveRecoSuccess() {
    this.me.HAS_SHARED = true;
  }

  handleStartActions() {
    this.showedCurrentPosition = false;
    delete this.status.error;
  }

  handleStartActionsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleStartActionsSuccess(result) {
    this.status.error = null;
    if (!result && !this.dismissedUpdateMessage) {
      this.showedUpdateMessage = false;
    }
    this.status.loading = false;
  }

  handleLoginFacebookSuccess(me) {
    this.me = me.user;
    this.me.HAS_SHARED = !!me.nb_recos || !!me.nb_wishes;
    this.status.loading = false;
  }

  handleLoginFacebookFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleLoginFacebookCancelled() {
    this.status.loading = false;
    delete this.status.error;
  }

  handleLogout() {
    this.me = {};
    this.showedCurrentPosition = false;
    delete this.status.error;
  }

  handleLoginFacebook() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleLoginEmail() {
    this.status.loading = true;
    delete this.status.error; 
  }

  handleLoginEmailSuccess(me) {
    this.me = me.user;
    this.me.HAS_SHARED = !!me.nb_recos || !!me.nb_wishes;
    this.status.loading = false;
  }

  handleLoginEmailFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleCreateAccount() {
    this.status.loading = true;
    delete this.status.error; 
  }

  handleCreateAccountFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleCreateAccountSuccess(me) {
    this.me = me.user;
    this.me.HAS_SHARED = !!me.nb_recos || !!me.nb_wishes;
    this.status.loading = false;
  }

  handleEdit() {
    this.status.loading = true;
  }

  handleEditFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleEditSuccess(data) {
    this.status.loading = false;
    this.me.name = data.name;
    this.me.email = data.email;
  }

  handleHasBeenUploadWelcomed() {
    this.hasBeenUploadWelcomed = true;
  }

  handleUploadContacts() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleUploadContactsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleUploadContactsSuccess() {
    this.status.loading = false;
    this.hasUploadedContacts = true;
  }

  handleSendMessageContact() {
    this.status.loading = true;
    delete this.status.sendingMessageError;
  }

  handleSendMessageContactFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleSendMessageContactSuccess(id) {
    if (!_.includes(this.uploadedContacts, id)) {
      this.uploadedContacts.push(id);  
    }
    this.status.loading = false;
  }

  handleDisplayTabBar(display) {
    this.showTabBar = display;
  }

  handleSendVersionFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleSendVersionSuccess(result) {
    if (!result && !this.dismissedUpdateMessage) {
      this.showedUpdateMessage = false;
    }
    this.status.loading = false;
  }

  handleSendVersion() {
    this.status.loading = true;
  }

  handleShowedCurrentPosition(showed) {
    this.showedCurrentPosition = showed;
  }

  handleCheckConnectivity() {
    this.status.loading = true;
  }

  handleCheckConnectivitySuccess(isConnected) {
    this.isConnected = isConnected;
    this.status.loading = false;
  }

  static getMe() {
    return this.getState().me;
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }

  static hasBeenUploadWelcomed() {
    return this.getState().hasBeenUploadWelcomed;
  }

  static isConnected() {
    return this.getState().isConnected;
  }


  handleShowedUpdateMessage() {
    this.showedUpdateMessage = true;
    this.dismissedUpdateMessage = true;
  }

  handleHideOverlayMapTutorial() {
    this.showOverlayMapTutorial = false;
  }

  static showedUpdateMessage() {
    return this.getState().showedUpdateMessage;
  }

  static showOverlayMapTutorial() {
    return this.getState().showOverlayMapTutorial;
  }
}

export default alt.createStore(MeStore);
