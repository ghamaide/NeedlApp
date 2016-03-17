'use strict';

import _ from 'lodash';

import alt from '../alt';

import FollowingsActions from '../actions/FollowingsActions';
import FriendsActions from '../actions/FriendsActions';
import LoginActions from '../actions/LoginActions';
import RecoActions from '../actions/RecoActions';
import RestaurantsActions from '../actions/RestaurantsActions';

import CachedStore from './CachedStore';
import MeStore from './Me';
import ProfilStore from './Profil';

export class RestaurantsStore extends CachedStore {

  constructor() {
    super();

    this.showPersonalContent = true;
    this.restaurants = [];

    this.filters = {
      prices: [],
      types: [],
      ambiences: [],
      occasions: [],
      friends: []
    };

    this.currentRegion = {};

    this.region = {
      latitude: 48.8534100,
      longitude: 2.3378000,
      longitudeDelta: 0.12,
      latitudeDelta: 0.065
    };

    this.saved = false;

    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleLogout: LoginActions.LOGOUT,

      handleFetchRestaurants: RestaurantsActions.FETCH_RESTAURANTS,
      handleFetchRestaurantsSuccess: RestaurantsActions.FETCH_RESTAURANTS_SUCCESS,
      handleFetchRestaurantsFailed: RestaurantsActions.FETCH_RESTAURANTS_FAILED,

      handleFetchRestaurant: RestaurantsActions.FETCH_RESTAURANT,
      handleFetchRestaurantSuccess: RestaurantsActions.FETCH_RESTAURANT_SUCCESS,
      handleFetchRestaurantFailed: RestaurantsActions.FETCH_RESTAURANT_FAILED,

      handleAcceptFriendshipSuccess: FriendsActions.ACCEPT_FRIENDSHIP_SUCCESS,
      handleRemoveFriendshipSuccess: FriendsActions.REMOVE_FRIENDSHIP_SUCCESS,

      handleFollowExpertSuccess: FollowingsActions.FOLLOW_EXPERT_SUCCESS,
      handleUnfollowExpertSuccess: FollowingsActions.UNFOLLOW_EXPERT_SUCCESS,

      handleMaskProfilSuccess: FriendsActions.MASK_PROFIL_SUCCESS,
      handleDisplayProfilSuccess: FriendsActions.DISPLAY_PROFIL_SUCCESS,

      handleSetRegion: RestaurantsActions.SET_REGION,

      handleAddWish: RecoActions.ADD_WISH,
      handleAddWishFailed: RecoActions.ADD_WISH_FAILED,
      handleAddWishSuccess: RecoActions.ADD_WISH_SUCCESS,

      handleRemoveWish: RecoActions.REMOVE_WISH,
      handleRemoveWishFailed: RecoActions.REMOVE_WISH_FAILED,
      handleRemoveWishSuccess: RecoActions.REMOVE_WISH_SUCCESS,

      handleAddReco: RecoActions.ADD_RECO,
      handleAddRecoFailed: RecoActions.ADD_RECO_FAILED,
      handleAddRecoSuccess: RecoActions.ADD_RECO_SUCCESS,

      handleUpdateRecommendation: RecoActions.UPDATE_RECOMMENDATION,
      handleUpdateRecommendationSuccess: RecoActions.UPDATE_RECOMMENDATION_SUCCESS,
      handleUpdateRecommendationFailed: RecoActions.UPDATE_RECOMMENDATION_FAILED,

      handleRemoveReco: RecoActions.REMOVE_RECO,
      handleRemoveRecoFailed: RecoActions.REMOVE_RECO_FAILED,
      handleRemoveRecoSuccess: RecoActions.REMOVE_RECO_SUCCESS,

      handleSetFilter: RestaurantsActions.SET_FILTER,

      handleSetDisplayPersonal: RestaurantsActions.SET_DISPLAY_PERSONAL
    });
  }

  handleLogout() {
    this.showPersonalContent = true;
    this.restaurants = [];
    this.filters = {
      prices: [],
      types: [],
      ambiences: [],
      occasions: [],
      friends: []
    };
    this.currentRegion = {};
    this.region = {
      latitude: 48.8534100,
      longitude: 2.3378000,
      longitudeDelta: 0.12,
      latitudeDelta: 0.065
    };
    this.saved = false;
  }

  handleFetchRestaurants() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchRestaurantsSuccess(restaurants) {
    var newRestaurants = restaurants;

    // Extend each restaurant with necessary information
    _.each(newRestaurants, (restaurant) => {
      return _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
    });

    this.restaurants = newRestaurants;
    this.status.loading = false;
  }

  handleFetchRestaurantsFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchRestaurant(id) {
    this.status.loading = true;
    delete this.status.error;
  }

  handleFetchRestaurantSuccess(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id});

    // Update restaurant
    if (index > -1) {
      this.restaurants[index] = _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)}));
    }
    this.status.loading = false;
  }

  handleFetchRestaurantFailed(data) {
    this.status.loading = false;
    this.status.error = data.err;
  }

  handleAcceptFriendshipSuccess(result) {
    var ids = [];

    // Populate array of ids of restaurants
    _.forEach(this.restaurants, (restaurant) => {ids.push(restaurant.id)});

    // Update each restaurant
    _.forEach(result.restaurants, (restaurant) => {
      var index = _.findIndex(ids, (id) => restaurant.id == id);
      if (index > -1) {
        this.restaurants[index] = _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
      } else {
        this.restaurants.push(_.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)}));
      }
    });
  }

  handleRemoveFriendshipSuccess(result) {
    var friend_id = ProfilStore.getFriendFromFriendship(result.friendship_id).id;
    var ids = [];

    // Remove all the restaurants where friend was only recommender or wisher
    _.remove(this.restaurants, (restaurant) => {
      var nb = 0;
      if (restaurant.my_friends_recommending) {
        nb += restaurant.my_friends_recommending.length;
      }
      if (restaurant.my_friends_wishing) {
        nb += restaurant.my_friends_wishing.length;
      }
      if (nb > 1) {
        return false;
      }
      if (_.isEqual(restaurant.my_friends_recommending, [friend_id]) || _.isEqual(restaurant.my_friends_wishing, [friend_id])) {
        return true;
      }
    });

    // Populate array of ids of restaurants
    _.forEach(this.restaurants, (restaurant) => {ids.push(restaurant.id)});

    // Update each restaurant
    _.forEach(result.restaurants, (restaurant) => {
      var index = _.findIndex(ids, (id) => restaurant.id == id);
      if (index > -1) {
        this.restaurants[index] = _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
      } else {
        this.restaurants.push(_.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)}));
      }
    });
  }

  handleMaskProfilSuccess(id) {
    // Mask all the restaurants where friend was only recommender or wisher
    _.map(this.restaurants, (restaurant) => {
      var nb = 0;

      if (restaurant.my_friends_recommending) {
        nb += restaurant.my_friends_recommending.length;
      }
      if (restaurant.my_friends_wishing) {
        nb += restaurant.my_friends_wishing.length;
      }

      if (nb > 1) {
        return;
      }

      if (_.isEqual(restaurant.my_friends_recommending, [id]) || _.isEqual(restaurant.my_friends_wishing, [id])) {
        restaurant.ON_MAP = false;
      }
    });
  }

  handleDisplayProfilSuccess(id) {
    // Display all the restaurants where friend was recommender or wisher and restaurant wasn't on map
    _.map(this.restaurants, (restaurant) => {
      if (restaurant.ON_MAP = false && _.includes(restaurant.my_friends_wishing, id) || _.includes(restaurant.my_friends_recommending, id)) {
        restaurant.ON_MAP = true;
      }
    });
  }

  handleFollowExpertSuccess(result) {
    _.forEach(result.restaurants, (restaurant) => {
      var index = _.findIndex(this.restaurants, (restaurant_local) => {return restaurant_local.id == restaurant.id});
      if (index > -1) {
        this.restaurants[index] = _.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
      } else {
        this.restaurants.push(_.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)}));
      }
    });
  }

  handleUnfollowExpertSuccess(result) {
    // Update each restaurant
    _.forEach(result.restaurants, (restaurant) => {
      var index = _.findIndex(this.restaurants, (restaurant_local) => {return restaurant_local.id == restaurant.id});
      if (index > -1) {
        this.restaurants[index] = _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
      } else {
        this.restaurants.push(_.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)}));
      }
    });
  }

  handleAddReco() {
    this.status.loading = true;
  }
  
  handleAddRecoFailed(err) {
    this.status.error = err;
    this.status.loading = false;
  }

  handleAddRecoSuccess(result) {
    var restaurant = result.restaurant;
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = _.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)}));
    }
    this.saved = true;
    this.status.loading = false;
  }

  handleUpdateRecommendation() {
    delete this.status.error;
    this.status.loading = true;
  }

  handleUpdateRecommendationFailed(err) {
    this.status.error = err;
    this.status.loading = false;
  }

  handleUpdateRecommendationSuccess(result) {
    var restaurant = result.restaurant;
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = _.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)}));
    }
    this.saved = true;
    this.status.loading = false;
  }

  handleRemoveReco() {
    this.status.loading = true;
  }

  handleRemoveRecoFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveRecoSuccess(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});

    if (index > -1) {
      this.restaurants[index] = _.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)});
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: this.isOnMap(restaurant), subways: this.parseSubways(restaurant.subways)}));
    }
    this.status.loading = false;
  }

  handleAddWish(restaurant) {
    this.status.loading = true;
  }

  handleAddWishFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleAddWishSuccess(result) {
    var restaurant = result.restaurant;
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = _.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)}));
    }
    this.status.loading = false;
  }

  handleRemoveWish(restaurant) {
    this.status.loading = true;
  }

  handleRemoveWishFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveWishSuccess(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    this.restaurants[index] = _.extend(restaurant, {subways: this.parseSubways(restaurant.subways), ON_MAP: this.isOnMap(restaurant)});
    this.status.loading = false;
  }

  handleSetFilter(data) {
    var newFilters = _.clone(this.filters);
    newFilters[data.label] = data.ids;
    this.filters = newFilters;
  }

  handleSetDisplayPersonal(display) {
    this.showPersonalContent = display;
  }

  handleSetRegion(region) {
    this.currentRegion = region;
  }

  parseSubways(subways) {
    var newSubways = [];
    _.each(subways, (subway) => {
      var s = subway.split('=>"');
      var newSubway = {
        id: parseInt(s[0].substr(1)),
        name: s[1].substr(0, s[1].length - 2)
      };
      newSubways.push(newSubway);
    });

    return newSubways;
  }

  isOnMap(restaurant) {
    var index = 0;
    var friends_recommending_and_friends_wishing = _.concat(restaurant.my_friends_wishing, restaurant.my_friends_recommending);
    _.forEach(friends_recommending_and_friends_wishing, (friendId) => {
      if (!ProfilStore.getProfil(friendId).invisible) {
        index += 1;
      }
    });
    if (index > 0) {
      return true;
    } else {
      return false;
    }
  }

  // get distance in meters between two points defined by their coordinates
  static getDistance(latitude1, longitude1, latitude2, longitude2) {
    var R = 6371; // radius of the earth in km
    var dLat = this.deg2rad(latitude2 - latitude1);
    var dLon = this.deg2rad(longitude2 - longitude1); 
    var a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(latitude1)) * Math.cos(this.deg2rad(latitude2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = R * c;
    return d * 1000; // distance in meters
  }

  // support function to get measure in radians from measure in degrees
  static deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  static getRestaurants() {
    return this.getState().restaurants;
  }

  static getRestaurant(id) {
    return _.find(this.getState().restaurants, function(o) {return o.id === id;});
  }

  static loading() {
    return this.getState().status.loading;
  }

  static error() {
    return this.getState().status.error;
  }

  static hasMenu(id) {
    return this.hasMenuEntree(id) || this.hasMenuMainCourse(id) || this.hasMenuDessert(id);
  }

  static hasMenuEntree(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return false;
    }

    return !!restaurant.starter1 || !!restaurant.starter2;
  }

  static hasMenuMainCourse(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return false;
    }

    return !!restaurant.main_course1 || !!restaurant.main_course2 || !!restaurant.main_course3;
  }

  static hasMenuDessert(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return false;
    }

    return !!restaurant.dessert1 || !!restaurant.dessert2;
  }

  static getWishers(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return false;
    }

    var visible_friends_wishing = _.filter(restaurant.my_friends_wishing, function(friend) {
      return !friend.invisible;
    });

    return visible_friends_wishing;
  }

  static getRecommenders(id) {
    var restaurant = this.getRestaurant(id);
    if (!restaurant) {
      return false;
    }

    var visible_friends_recommending = _.filter(restaurant.my_friends_recommending, function(friend) {
      return !friend.invisible;
    });

    return visible_friends_recommending;
  }

  static searchable() {
    return _.filter(this.getState().restaurants, (restaurant) => {
      return restaurant.ON_MAP;
    });
  }

  static isSearchable(id) {
    return this.getRestaurant(id) && this.getRestaurant(id).ON_MAP;
  }

  static closestSubwayName(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return null;
    }

    return _.find(restaurant.subways, function(subway) {return subway.id === restaurant.closest_subway}).name;
  }

  static filteredRestaurants(filters) {
    if (_.isEmpty(filters)) {
      var filters = this.getState().filters;
    }
    var currentRegion = this.getState().currentRegion;
    var showPersonalContent = this.getState().showPersonalContent;

    var west = {
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude - currentRegion.longitudeDelta / 2
    };
    var east = {
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude + currentRegion.longitudeDelta / 2
    };
    var radius = 0.4 * this.getDistance(west.latitude, west.longitude, east.latitude, east.longitude);

    var filteredRestaurants =  _.filter(this.searchable(), (restaurant) => {

      var intAmbiences = _.map(restaurant.ambiences, (ambience) => {
        return parseInt(ambience);
      });

      var intOccasions = _.map(restaurant.occasions, (occasion) => {
        return parseInt(occasion);
      });

      if (filters.prices.length > 0 && filters.prices.indexOf(restaurant.price_range) === -1) {
        return false;
      }

      if (filters.ambiences.length > 0 && _.isEmpty(_.intersection(filters.ambiences, intAmbiences))) {
        return false;
      }

      if (filters.occasions.length > 0 && _.isEmpty(_.intersection(filters.occasions, intOccasions))) {
        return false;
      }

      if (filters.types.length > 0 && _.isEmpty(_.intersection(filters.types, restaurant.types))) {
        return false;
      }

      if (filters.friends && filters.friends.length > 0 && _.isEmpty(_.intersection(filters.friends, restaurant.my_friends_recommending))) {
        return false;
      }

      // uncomment to show personal content
      // if(!showPersonalContent && _.includes(restaurant.friends_recommending, MeStore.getState().me.id)) {
      //   return false;
      // }

      // uncomment to get restaurants in circle only
      if (this.getDistance(restaurant.latitude, restaurant.longitude, currentRegion.latitude, currentRegion.longitude) > radius) {
        return false;
      }

      return true;
    });

    return _.reverse(_.sortBy(filteredRestaurants, ['score']));
  }

  static getPrices(restaurants) {
    if (_.isEmpty(restaurants)) {
      restaurants = this.filteredRestaurants();
    }
    var prices =  _.map(restaurants, (restaurant) => {
      return restaurant.price_range;
    });
    return _.sortBy(_.remove(_.uniq(prices), null));
  }

  static getOccasions(restaurants) {
    if (_.isEmpty(restaurants)) {
      restaurants = this.filteredRestaurants();
    }
    var occasions = [];
    _.forEach(restaurants, (restaurant) => {
      _.forEach(restaurant.occasions, (occasion) => {
        occasions.push(parseInt(occasion));
      });
    });
    return _.sortBy(_.uniq(occasions));
  }

  static getTypes(restaurants) {
    if (_.isEmpty(restaurants)) {
      restaurants = this.filteredRestaurants();
    }
    var types = [];
    _.forEach(restaurants, (restaurant) => {
      _.forEach(restaurant.types, (type) => {
        types.push(type);
      });
    });
    return _.sortBy(_.uniq(types));
  }

  static getFriends(restaurants) {
    if (_.isEmpty(restaurants)) {
      restaurants = this.filteredRestaurants();
    }
    var friends = [];
    _.forEach(restaurants, (restaurant) => {
      _.forEach(restaurant.my_friends_recommending, (friend_id) => {
        var friend = ProfilStore.getProfil(friend_id);
        friends.push(friend);
      });
    });

    var sorted_friends = _.sortBy(_.uniq(friends), ['name']);
    var ids = _.map(sorted_friends, (friend) => {
      return friend.id;
    });

    return ids;
  }

  static getAvailableFilters(exception) {
    var restaurants;
    switch (exception) {
      case 'price' : 
        restaurants = this.filteredRestaurants({prices: [], occasions: this.getState().filters.occasions, ambiences: [], types: this.getState().filters.types, friends: this.getState().filters.friends});
        return this.getPrices(restaurants);
        break;
      case 'occasion' :
        restaurants = this.filteredRestaurants({prices: this.getState().filters.prices, occasions: [], ambiences: [], types: this.getState().filters.types, friends: this.getState().filters.friends});
        return this.getOccasions(restaurants);
        break;
      case 'type' :
        restaurants = this.filteredRestaurants({prices: this.getState().filters.prices, occasions: this.getState().filters.occasions, ambiences: [], types: [], friends: this.getState().filters.friends});
        return this.getTypes(restaurants);
        break;
      case 'friend' :
        restaurants = this.filteredRestaurants({prices: this.getState().filters.prices, occasions: this.getState().filters.occasions, ambiences: [], types: this.getState().filters.types, friends: []});
        return this.getFriends(restaurants);
        break;
    }
  }

  static filterActive() {
    var filters = this.getState().filters;
    return (filters.prices.length > 0) || (filters.ambiences.length > 0) || (filters.occasions.length > 0) || (filters.types.length > 0);
  }

  static MAP_PRICES = [
    {
      label: 1,
      icon: require('../assets/img/prices/icons/prix_1.png')
    },
    {
      label: 2,
      icon: require('../assets/img/prices/icons/prix_2.png')
    },
    {
      label: 3,
      icon: require('../assets/img/prices/icons/prix_3.png')
    },
    {
      label: 4,
      icon: require('../assets/img/prices/icons/prix_4.png')
    }
  ];

  static MAP_AMBIENCES = [
    {
      label: 'Chic',
      icon: require('../assets/img/ambiances/icons/chic.png')
    },
    {
      label: 'Festif',
      icon: require('../assets/img/ambiances/icons/festif.png')
    },
    {
      label: 'Convivial',
      icon: require('../assets/img/ambiances/icons/convivial.png')
    },
    {
      label: 'Romantique',
      icon: require('../assets/img/ambiances/icons/romantique.png')
    },
    {
      label: 'Branché',
      icon: require('../assets/img/ambiances/icons/branche.png')
    },
    {
      label: 'Typique',
      icon: require('../assets/img/ambiances/icons/typique.png')
    },
    {
      label: 'Cosy',
      icon: require('../assets/img/ambiances/icons/cosy.png')
    },
    {
      label: 'Inclassable',
      icon: require('../assets/img/ambiances/icons/autre.png')
    }
  ];

  static MAP_OCCASIONS = [
    {
      label: 'Business',
      icon: require('../assets/img/occasions/icons/dej_business.png')
    },
    {
      label: 'Couple',
      icon: require('../assets/img/occasions/icons/en_couple.png')
    },
    {
      label: 'Famille',
      icon: require('../assets/img/occasions/icons/en_famille.png')
    },
    {
      label: 'Amis',
      icon: require('../assets/img/occasions/icons/entre_amis.png')
    },
    {
      label: 'Groupe',
      icon: require('../assets/img/occasions/icons/grandes_tablees.png')
    },
    {
      label: 'Brunch',
      icon: require('../assets/img/occasions/icons/brunch.png')
    },
    {
      label: 'Terrasse',
      icon: require('../assets/img/occasions/icons/terrasse.png')
    },
    {
      label: 'Rapide',
      icon: require('../assets/img/occasions/icons/fast.png')
    },
    {
      label: 'Date',
      icon: require('../assets/img/occasions/icons/date.png')
    }
  ];

  static MAP_STRENGTHS = [
    {
      label: 'Cuisine',
      icon: require('../assets/img/points_forts/icons/cuisine.png')
    },
    {
      label: 'Service',
      icon: require('../assets/img/points_forts/icons/service.png')
    },
    {
      label: 'Cadre',
      icon: require('../assets/img/points_forts/icons/cadre.png')
    },
    {
      label: 'Original',
      icon: require('../assets/img/points_forts/icons/original.png')
    },
    {
      label: 'Copieux',
      icon: require('../assets/img/points_forts/icons/copieux.png')
    },
    {
      label: 'Vins',
      icon: require('../assets/img/points_forts/icons/vins.png')
    },
    {
      label: 'Qté Prix',
      icon: require('../assets/img/points_forts/icons/qtiteprix.png')
    }
  ];

  static MAP_TYPES = [
    {
      label: 'Coréen',
      icon: require('../assets/img/types/icons/korean.png')
    },
    {
      label: 'Thai',
      icon: require('../assets/img/types/icons/thai.png')
    },
    {
      label: 'Chinois',
      icon: require('../assets/img/types/icons/chinese.png')
    },
    {
      label: 'Indien',
      icon: require('../assets/img/types/icons/indian.png')
    },
    {
      label: 'Japonais',
      icon: require('../assets/img/types/icons/japanese.png')
    },
    {
      label: 'Sushi',
      icon: require('../assets/img/types/icons/sushi.png')
    },
    {
      label: 'Autres Asie',
      icon: require('../assets/img/types/icons/others_asia.png')
    },
    {
      label: 'Français',
      icon: require('../assets/img/types/icons/french.png')
    },
    {
      label: 'Italien',
      icon: require('../assets/img/types/icons/italian.png')
    },
    {
      label: 'Pizza',
      icon: require('../assets/img/types/icons/pizza.png')
    },
    {
      label: 'Burger',
      icon: require('../assets/img/types/icons/burger.png')
    },
    {
      label: 'Street Food',
      icon: require('../assets/img/types/icons/street_food.png')
    },
    {
      label: 'Autres Europe',
      icon: require('../assets/img/types/icons/others_europe.png')
    },
    {
      label: 'Viandes et Grillades',
      icon: require('../assets/img/types/icons/grill.png')
    },
    {
      label: 'Oriental',
      icon: require('../assets/img/types/icons/oriental.png')
    },
    {
      label: 'Mexicain',
      icon: require('../assets/img/types/icons/mexican.png')
    },
    {
      label: 'Autres Amérique Latine',
      icon: require('../assets/img/types/icons/latino.png')
    },
    {
      label: 'Fruits de mer',
      icon: require('../assets/img/types/icons/seafood.png')
    },
    {
      label: 'Africain',
      icon: require('../assets/img/types/icons/african.png')
    },
    {
      label: 'Créole',
      icon: require('../assets/img/types/icons/creole.png')
    },
    {
      label: 'Crêpes',
      icon: require('../assets/img/types/icons/crepes.png')
    },
    {
      label: 'Tapas',
      icon: require('../assets/img/types/icons/tapas.png')
    },
    {
      label: 'Végétarien',
      icon: require('../assets/img/types/icons/vegetarian.png')
    }
  ];
}

export default alt.createStore(RestaurantsStore);
