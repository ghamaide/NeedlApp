'use strict';

import _ from 'lodash';

import alt from '../alt';

import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';

import CachedStore from './CachedStore';

export class MeStore extends CachedStore {

  constructor() {
    super();

    this.me = {};

    this.hasBeenUploadWelcomed = false;
    this.showOverlayTutorial = true;
    this.showedUpdateMessage = true;
    this.dismissedUpdateMessage = false;

    this.hasNewBadge = false;

    this.version = 0;

    this.hasUploadedContacts = false;
    this.uploadedContacts = [];

    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({

      handleAddActivitySuccess: [RecoActions.ADD_RECO_SUCCESS, RecoActions.ADD_WISH],

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

      handleRecoverPassword: LoginActions.RECOVER_PASSWORD,
      handleRecoverPasswordFailed: LoginActions.RECOVER_PASSWORD_FAILED,
      handleRecoverPasswordSuccess: LoginActions.RECOVER_PASSWORD_SUCCESS,

      handleEdit: MeActions.EDIT,
      handleEditFailed: MeActions.EDIT_FAILED,
      handleEditSuccess: MeActions.EDIT_SUCCESS,

      handleFetchProfilSuccess: ProfilActions.FETCH_PROFIL_SUCCESS,
      
      handleUploadContacts : MeActions.UPLOAD_CONTACTS,
      handleUploadContactsSuccess : MeActions.UPLOAD_CONTACTS_SUCCESS,
      handleUploadContactsFailed : MeActions.UPLOAD_CONTACTS_FAILED,

      handleSendMessageContact : MeActions.SEND_MESSAGE_CONTACT,
      handleSendMessageContactSuccess : MeActions.SEND_MESSAGE_CONTACT_SUCCESS,
      handleSendMessageContactFailed : MeActions.SEND_MESSAGE_CONTACT_FAILED,

      handleLinkFacebookAccount: MeActions.LINK_FACEBOOK_ACCOUNT,
      handleLinkFacebookAccountFailed: MeActions.LINK_FACEBOOK_ACCOUNT_FAILED,
      handleLinkFacebookAccountSuccess: MeActions.LINK_FACEBOOK_ACCOUNT_SUCCESS,

      handleLogout: LoginActions.LOGOUT,

      handleHasBeenUploadWelcomed: MeActions.HAS_BEEN_UPLOAD_WELCOMED,

      handleHideOverlayTutorial: MeActions.HIDE_OVERLAY_TUTORIAL,

      handleShowedUpdateMessage: MeActions.SHOWED_UPDATE_MESSAGE,

      handleHideNewBadge: MeActions.HIDE_NEW_BADGE
    });
  }

  handleAddActivitySuccess() {
    this.me.HAS_SHARED = true;
  }

  handleStartActions() {
    delete this.status.error;
  }

  handleStartActionsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleStartActionsSuccess(result) {
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
    var me = me.user;
    me.HAS_SHARED = !!me.nb_recos || !!me.nb_wishes;
    this.me = me;
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
    this.me = _.extend(me.user, {HAS_SHARED: !!me.nb_recos || !!me.nb_wishes});
    this.status.loading = false;
  }

  handleFetchProfilSuccess(profil) {
    if (profil.id === this.me.id) {
      this.me.app_version = profil.app_version;
      this.me.platform = profil.platform;
      var oldScore = this.me.score || 0;
      this.me.score = profil.score;
      if (!this.hasNewBadge) {
        if (oldScore < 1) {
          this.hasNewBadge = profil.score >= 1;
        } else if (oldScore >= 1 && oldScore < 3) {
          this.hasNewBadge = profil.score >= 3;
        } else if (oldScore >= 3 && oldScore < 5) {
          this.hasNewBadge = profil.score >= 5;
        } else if (oldScore >= 5 && oldScore < 10) {
          this.hasNewBadge = profil.score >= 10;
        } else if (oldScore >= 10 && oldScore < 30) {
          this.hasNewBadge = profil.score >= 30;
        } else if (oldScore >= 30 && oldScore < 60) {
          this.hasNewBadge = profil.score >= 60;
        } else if (oldScore >= 60 && oldScore < 100) {
          this.hasNewBadge = profil.score >= 100;
        } else if (oldScore >= 100 && oldScore < 200) {
          this.hasNewBadge = profil.score >= 200;
        } else if (oldScore >= 200 && oldScore < 500) {
          this.hasNewBadge = profil.score >= 500;
        } else if (oldScore >= 500) {
          this.hasNewBadge = false;
        }
      }
    }
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

  handleRecoverPassword() {
    delete this.status.error;
    this.status.loading = true;
  }

  handleRecoverPasswordFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRecoverPasswordSuccess(result) {
    this.status.loading = false;
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

  handleSendVersion() {
    this.status.loading = true;
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

  handleLinkFacebookAccount() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleLinkFacebookAccountFailed(err) {
    this.status.error = err;
    this.status.loading = false;
  }

  handleLinkFacebookAccountSuccess() {
    this.status.loading = false;
  }

  handleShowedUpdateMessage() {
    this.showedUpdateMessage = true;
    this.dismissedUpdateMessage = true;
  }

  handleHideOverlayTutorial() {
    this.showOverlayTutorial = false;
  }

  handleHideNewBadge() {
    this.hasNewBadge = false;
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

  static showedUpdateMessage() {
    return this.getState().showedUpdateMessage;
  }

  static showOverlayTutorial() {
    return this.getState().showOverlayTutorial;
  }

  static hasNewBadge() {
    return this.getState().hasNewBadge;
  }
}

export default alt.createStore(MeStore);
