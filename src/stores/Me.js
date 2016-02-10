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

    // this.me = {};

    this.me = {
      HAS_SHARED: true,
      admin: false,
      app_version: null,
      authentication_token: "4LAv-94uE8-vJhHprrfJ",
      birthday: null,
      code: null,
      created_at: "2015-12-12T10:27:46Z",
      email: "hamaide.gregoire@gmail.com",
      gender: "male",
      id: 573,
      name: "Greg Hmd",
      picture: "http://needl.s3.amazonaws.com/production/users/pictures/000/000/573/original/picture?1449916065",
      picture_content_type: "image/jpeg",
      picture_file_name: "picture",
      picture_file_size: 18019,
      picture_updated_at: "2015-12-12T10:27:45Z",
      provider: "facebook",
      score: 0,
      token: "CAAXFDbD3mR8BAPxDWMMRZCIl83Gk7qJZAQc6ZAxWMXA96qFBoR797AWzdRQa2ZARwr7N3h48qNcDK9nYauQ4MId7s739gZBydbYZCDKmNqk6ZBWUqFvgi8DYMKQNc8ZBL9Fa85blUk6RomC6CV1ZAcQkl12dMk9ZCwy4N9V97Q9vn3SF3ZBCwZA90lAwMdsHk9YwAcm1DDBATPNmirtDZBPIQpAqW65aNyAh0mN4ZD",
      token_expiry: null,
      uid: "138033766558653",
      updated_at: "2016-02-08T13:06:44Z"
    }

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

// ================================================================================================

      handleSaveRecoSuccess: [RecoActions.SAVE_RECO_SUCCESS, RestaurantsActions.ADD_WISH],

      handleStartActions: MeActions.START_ACTIONS,
      handleStartActionsFailed: MeActions.START_ACTIONS_FAILED,
      handleStartActionsSuccess: MeActions.START_ACTIONS_SUCCESS,

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

      handleUploadContacts : MeActions.UPLOAD_CONTACTS,
      handleUploadContactsSuccess : MeActions.UPLOAD_CONTACTS_SUCCESS,
      handleUploadContactsFailed : MeActions.UPLOAD_CONTACTS_FAILED,

      handleSendMessageContact : MeActions.SEND_MESSAGE_CONTACT,
      handleSendMessageContactSuccess : MeActions.SEND_MESSAGE_CONTACT_SUCCESS,
      handleSendMessageContactFailed : MeActions.SEND_MESSAGE_CONTACT_FAILED,

      handleHasBeenUploadWelcomed: MeActions.HAS_BEEN_UPLOAD_WELCOMED,
      
      handleHideOverlayMapTutorial: MeActions.HIDE_OVERLAY_MAP_TUTORIAL,
      
      handleDisplayTabBar: MeActions.DISPLAY_TAB_BAR,

      handleShowedUpdateMessage: MeActions.SHOWED_UPDATE_MESSAGE,

      handleShowedCurrentPosition: MeActions.SHOWED_CURRENT_POSITION
    });
  }

  handleStartActions() {
    this.showedCurrentPosition = false;
  }

  handleStartActionsFailed(err) {
    this.status.sendingVersion = false;
    this.status.sendingVersionError = err;
  }

  handleStartActionsSuccess(result) {
    this.status.sendingVersionError = null;
    this.status.sendingVersion = false;
    if (!result && !this.dismissedUpdateMessage) {
      this.showedUpdateMessage = false;
    }
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

  handleShowedUpdateMessage() {
    this.showedUpdateMessage = true;
    this.dismissedUpdateMessage = true;
  }

  handleHideOverlayMapTutorial() {
    this.showOverlayMapTutorial = false;
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
