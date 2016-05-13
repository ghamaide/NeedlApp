'use strict';

import _ from 'lodash';

import alt from '../alt';

import FollowingsActions from '../actions/FollowingsActions';
import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';
import MeActions from '../actions/MeActions';
import ProfilActions from '../actions/ProfilActions';
import RecoActions from '../actions/RecoActions';

import CachedStore from './CachedStore';
import MeStore from './Me';

export class ProfilStore extends CachedStore {

  constructor() {
    super();

    this.temporary_profiles = [];

    this.me = {};
    this.friends = [];
    this.followings = [];
    this.experts = [];
    this.requests_sent = [];
    this.requests_received = [];
    this.removed_friends = [];

    this.status.loading = false;
    this.status.error = {}
  
    this.bindListeners({
      handleFetchFriends: ProfilActions.fetchFriends,
      handleFetchFriendsSuccess: ProfilActions.fetchFriendsSuccess,
      handleFetchFriendsFailed: ProfilActions.fetchFriendsFailed,

      handleFetchProfil: ProfilActions.FETCH_PROFIL,
      handleFetchProfilSuccess: ProfilActions.FETCH_PROFIL_SUCCESS,
      handleFetchProfilFailed: ProfilActions.FETCH_PROFIL_FAILED,

      handleFetchFollowings: ProfilActions.fetchFollowings,
      handleFetchFollowingsSuccess: ProfilActions.fetchFollowingsSuccess,
      handleFetchFollowingsFailed: ProfilActions.fetchFollowingsFailed,

      handleFetchAllExperts: ProfilActions.fetchAllExperts,
      handleFetchAllExpertsSuccess: ProfilActions.fetchAllExpertsSuccess,
      handleFetchAllExpertsFailed: ProfilActions.fetchAllExpertsFailed,

      handleAskFriendshipSuccess: FriendsActions.ASK_FRIENDSHIP_SUCCESS,
      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,
      handleRefuseFriendshipSuccess: FriendsActions.REFUSE_FRIENDSHIP_SUCCESS,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleFollowExpertSuccess: FollowingsActions.FOLLOW_EXPERT_SUCCESS,
      handleUnfollowExpertSuccess: FollowingsActions.UNFOLLOW_EXPERT_SUCCESS,

      handleMaskProfil: FriendsActions.MASK_PROFIL,
      handleMaskProfilFailed: FriendsActions.MASK_PROFIL_FAILED,
      handleMaskProfilSuccess: FriendsActions.MASK_PROFIL_SUCCESS,

      handleDisplayProfil: FriendsActions.DISPLAY_PROFIL,
      handleDisplayProfilFailed: FriendsActions.DISPLAY_PROFIL_FAILED,
      handleDisplayProfilSuccess: FriendsActions.DISPLAY_PROFIL_SUCCESS,

      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,
      handleRemoveRecoSuccess: RecoActions.REMOVE_RECO_SUCCESS,

      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,
      handleRemoveWishSuccess: RecoActions.REMOVE_WISH_SUCCESS,

      handleEditSuccess: MeActions.EDIT_SUCCESS,
      handleUploadPictureSuccess: MeActions.UPLOAD_PICTURE_SUCCESS,

      handleLogout: LoginActions.CALLBACK_LOGOUT,
    });
  }

  handleFetchFriends() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchFriendsSuccess(result) {
    this.friends = _.forEach(result.friends, (friend) => {
      friend.badge = this.renderBadge(friend.score);
      _.forEach(friend.friends, (friend_of_friend) => {
        friend_of_friend.badge = this.renderBadge(friend_of_friend.score);
      });
    });
    this.requests_received = result.requests_received;
    this.requests_sent = result.requests_sent;
    this.removed_friends = [];
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
      _.forEach(profil.friends, (friend) => {
        friend.badge = this.renderBadge(friend.score);
      });
      this.me = _.extend(profil, {badge: this.renderBadge(profil.score)});
    } else {
      var indexFriends = _.findIndex(this.friends, (friend) => {return friend.id === profil.id});
      var indexFollowings = _.findIndex(this.followings, (following) => {return following.id === profil.id;});
      if (indexFriends > -1) {
        _.forEach(profil.friends, (friend) => {
          friend.badge = this.renderBadge(friend.score);
        });
        this.friends[indexFriends] = _.extend(profil, {badge: this.renderBadge(profil.score)});
      } else if (indexFollowings > -1) {
        this.followings[indexFollowings] = _.extend(profil, {badge: this.renderBadge(profil.score)});
      }
    }
    this.status.loading = false;
  }

  handleFetchProfilFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleAskFriendshipSuccess(result) {
    this.requests_sent.push(result.request);
  }

  handleAcceptFriendshipSuccess(result) {
    this.friends.push(_.extend(result.friend, {badge: this.renderBadge(result.friend.score)}));
    _.remove(this.requests_received, (request) => {
      return request.friendship_id == result.friendship_id;
    });
  }

  handleRefuseFriendshipSuccess(friendship_id) {
    _.remove(this.requests_sent, (request) => {
      return request.friendship_id === friendship_id;
    });
  }

  handleRemoveFriendshipSuccess(result) {
    var friend_id = _.find(this.friends, (friend) => {return friend.friendship_id === result.friendship_id}).id;
    var removed_friend = _.remove(this.friends, (friend) => {
      return friend.id == friend_id;
    });
    this.removed_friends.push(removed_friend[0]);
  }

  handleFollowExpertSuccess(result) {
    var expert = _.remove(this.experts, (expert) => {
      return expert.id == result.expert_id;
    });

    this.followings.push(_.extend(expert[0], {badge: this.renderBadge(expert.score)}));
  }

  handleUnfollowExpertSuccess(result) {
    var expert_id = _.find(this.followings, (following) => {return following.followership_id === result.followership_id}).id;
    var expert = _.remove(this.followings, (following) => {
      return following.id == expert_id;
    });

    this.experts.push(expert[0]);
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
    this.followings = _.forEach(result.followings, (following) => {
      following.badge = this.renderBadge(following.score);
    });
    this.status.loading = false;
  }

  handleFetchAllExperts() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchAllExpertsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchAllExpertsSuccess(result) {
    this.experts = _.forEach(result.experts, (expert) => {
      expert.badge = this.renderBadge(expert.score);
    });
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

  handleMaskProfilSuccess(result) {
    var friend_id = _.find(this.friends, (profil) => {return profil.friendship_id === result.friendshipId}).id;
    var index = _.findIndex(this.friends, function(o) {return o.id === friend_id});
    if (index > -1) {
      this.friends[index].invisible = true;
    } else {
      // normalement, on ne rentre jamais ici car on ne peut pas masquer / afficher un expert
      index = _.findIndex(this.followings, function(o) {return o.id === friend_id});
      this.followings[index].invisible = true;
    }
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

  handleDisplayProfilSuccess(result) {
    var friend_id = _.find(this.friends, (profil) => {return profil.friendship_id === result.friendshipId}).id;
    var index = _.findIndex(this.friends, function(o) {return o.id === friend_id});
    if (index > -1) {
      this.friends[index].invisible = false;
    } else {
      // normalement, on ne rentre jamais ici car on ne peut pas masquer / afficher un expert
      index = _.findIndex(this.followings, function(o) {return o.id === friend_id});
      this.followings[index].invisible = false;
    }
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
  }

  handleRemoveRecoSuccess(restaurant) {
    var newProfil = this.me;
    _.remove(newProfil.recommendations, (restaurantID) => {
     return restaurantID === restaurant.id;
    });
    this.me = newProfil;
  }

  handleAddWishSuccess(result) {
    var newProfil = this.me;
    newProfil.wishes.push(result.restaurant.id);
    this.me = newProfil;
  }

  handleRemoveWishSuccess(restaurant) {
    var newProfil = this.me;
    _.remove(newProfil.wishes, (restaurantID) => {
     return restaurantID === restaurant.id;
    });
    this.me = newProfil;
  }
  
  handleEditSuccess(result) {
    var newProfil = this.me;
    newProfil.fullname = result.name;
    if (result.public) {
      newProfil.public = true;
      newProfil.description = result.description;
      newProfil.tags = result.tags;
    }
  }

  handleUploadPictureSuccess(result) {
    this.me = _.extend(this.me, {picture : result});
  }

  handleLogout() {
    this.me = {};
    this.friends = [];
    this.followings = [];
    this.experts = [];
    this.requests_sent = [];
    this.requests_received = [];
    this.removed_friends = [];
  }

  renderBadge(score) {
    if (score == 0) {
      return ProfilStore.MAP_BADGES[0];
    } else if (score < 3) {
      return ProfilStore.MAP_BADGES[1];
    } else if (score < 5) {
      return ProfilStore.MAP_BADGES[2];
    } else if (score < 10) {
      return ProfilStore.MAP_BADGES[3];
    } else if (score < 30) {
      return ProfilStore.MAP_BADGES[4];
    } else if (score < 60) {
      return ProfilStore.MAP_BADGES[5];
    } else if (score < 100) {
      return ProfilStore.MAP_BADGES[6];
    } else if (score < 200) {
      return ProfilStore.MAP_BADGES[7];
    } else if (score < 500) {
      return ProfilStore.MAP_BADGES[8];
    } else {
      return ProfilStore.MAP_BADGES[9];
    }
  }

  static error() {
    return this.getState().status.error;
  }

  static loading() {
    return this.getState().status.loading;
  }

  static getFriendFromFriendship(friendship_id) {
    return _.find(_.concat(this.getState().friends, this.getState().removed_friends), (friend) => {return friend.friendship_id === friendship_id});
  }

  static getFollowingFromFollowership(followership_id) {
    return _.find(_.concat(this.getState().followings, this.getState().experts), (following) => {return following.followership_id === followership_id});
  }

  static getRequestReceived(user_id) {
    return _.find(this.getState().requests_received, (request) => {return request.id == user_id});
  }

  static getProfil(id) {
    return _.find(_.concat(this.getState().me, this.getState().friends, this.getState().experts, this.getState().followings, this.getState().removed_friends), (profil) => {return profil.id === id});
  }

  static getProfils() {
    return _.concat(this.getState().friends, this.getState().me, this.getState().followings);
  }

  static getFriends() {
    return _.sortBy(this.getState().friends, ['name']);
  }

  static isFriend(userId) {
    return _.filter(this.getState().friends, (friend) => {return friend.id === userId}).length > 0;
  }

  static getFriendsFromUser(user_id) {
    return _.sortBy(this.getProfil(user_id).friends, ['name']);
  }

  static getFollowings() {
    return this.getState().followings;
  }

  static isFollowing(userId) {
    return _.filter(this.getState().followings, (following) => {return following.id === userId}).length > 0;
  }

  static getFollowingsFromUser(user_id) {
    return this.getProfil(user_id).followings;
  }

  static getThanksFromUser(user_id) {
    return this.getProfil(user_id).thanks;
  }

  static getMe() {
    return this.getState().me;
  }

  static getRequestsSent() {
    return this.getState().requests_sent;
  }

  static getRequestsReceived() {
    return this.getState().requests_received;
  }

  static getAllExperts() {
    return this.getState().experts;
  }

  static MAP_BADGES = [
    {
      rank: 0,
      image: require('../assets/img/badges/novice.png'),
      name: 'Novice',
      description: 'Tu as maintenant tous les outils pour tisser la toile de tes restaurants préférés !'
    },
    {
      rank: 1,
      image: require('../assets/img/badges/brodeur.png'),
      name: 'Brodeur',
      description: 'Ton âme d’explorateur a été dévoilée, elle peut désormais s’épanouir librement !'
    },
    {
      rank: 3,
      image: require('../assets/img/badges/apprenti.png'),
      name: 'Apprenti',
      description: 'Tes premières tentatives ont porté leurs fruits, continue ainsi à développer tes talents !'
    },
    {
      rank: 5,
      image: require('../assets/img/badges/retoucheur.png'),
      name: 'Retoucheur',
      description: 'Tu es une solution en situation de crise et tu n’as jamais laissé tombé l’un des tiens.'
    },
    {
      rank: 10,
      image: require('../assets/img/badges/tricoteur.png'),
      name: 'Tricoteur',
      description: 'Tu as toujours une bonne idée qu’importe le lieu, et tu la partages avec plaisir.'
    },
    {
      rank: 30,
      image: require('../assets/img/badges/confectionneur.png'),
      name: 'Confectionneur',
      description: 'Ta toile s’est étoffée et tes recommandations sont plus que jamais recherchées.'
    },
    {
      rank: 60,
      image: require('../assets/img/badges/faconneur.png'),
      name: 'Façonneur',
      description: 'L’ascension par l’adresse, la reconnaissance par la maîtrise.'
    },
    {
      rank: 100,
      image: require('../assets/img/badges/tailleur.png'),
      name: 'Tailleur',
      description: 'Tu dessines le paysage culinaire de tes fidèles.'
    },
    {
      rank: 200,
      image: require('../assets/img/badges/createur.png'),
      name: 'Créateur',
      description: 'Tu inities les tendances par l’univers que tu partages.'
    },
    {
      rank: 500,
      image: require('../assets/img/badges/hautcouturier.png'),
      name: 'Grand Couturier',
      description: 'Tes coups de cœur se sèment et s’essaiment.'
    }
  ];
}

export default alt.createStore(ProfilStore);
