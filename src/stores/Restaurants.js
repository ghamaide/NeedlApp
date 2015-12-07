'use strict';

import alt from '../alt';
import _ from 'lodash';

import RestaurantsActions from '../actions/RestaurantsActions';
import RecoActions from '../actions/RecoActions';
import ProfilActions from '../actions/ProfilActions';
import CachedStore from './CachedStore';
import MeStore from './Me';

export class RestaurantsStore extends CachedStore {

  constructor() {
    super();

    this.filters = {
      prix: {
        id: null,
        value: 'Tous'
      },
      food: {
        id: null,
        value: 'Tous'
      },
      friend: {
        id: null,
        value: 'Tous'
      },
      metro: {
        id: null,
        value: 'Tous'
      },
      ambiance: {
        id: null,
        value: 'Tous'
      }
    };

    this.restaurants = {};
    this.status.restaurantsLoading = [];
    this.status.restaurantsLoadingError = {};
    this.status.allRestaurantsLoading = false;
    this.status.allRestaurantsLoadingError = null;

    this.status.restaurantsWishAdding = [];
    this.status.restaurantsWishAddingError = {};
    this.status.restaurantsWishRemoving = [];
    this.status.restaurantsWishRemovingError = {};
    this.status.restaurantsRecoRemoving = [];
    this.status.restaurantsRecoRemovingError = {};

    this.bindListeners({
      handleFetchRestaurants: RestaurantsActions.FETCH_RESTAURANTS,
      handleRestaurantsFetched: RestaurantsActions.RESTAURANTS_FETCHED,
      handleRestaurantsFetchFailed: RestaurantsActions.RESTAURANTS_FETCH_FAILED,

      handleFetchRestaurant: RestaurantsActions.FETCH_RESTAURANT,
      handleRestaurantFetched: RestaurantsActions.RESTAURANT_FETCHED,
      handleRestaurantFetchFailed: RestaurantsActions.RESTAURANT_FETCH_FAILED,

      handleRecoSaved: RecoActions.RECO_SAVED,

      handleAddWish: RestaurantsActions.ADD_WISH,
      handleAddWishFailed: RestaurantsActions.ADD_WISH_FAILED,
      handleAddWishSuccess: RestaurantsActions.ADD_WISH_SUCCESS,

      handleRemoveWish: RestaurantsActions.REMOVE_WISH,
      handleRemoveWishFailed: RestaurantsActions.REMOVE_WISH_FAILED,
      handleRemoveWishSuccess: RestaurantsActions.REMOVE_WISH_SUCCESS,

      handleRemoveReco: RestaurantsActions.REMOVE_RECO,
      handleRemoveRecoFailed: RestaurantsActions.REMOVE_RECO_FAILED,
      handleRemoveRecoSuccess: RestaurantsActions.REMOVE_RECO_SUCCESS,

      handleSetFilter: RestaurantsActions.SET_FILTER,

      handleProfilInvisible: ProfilActions.MASK_PROFIL_SUCCESS
    });
  }

  handleProfilInvisible(id) {

    _.each(this.restaurants, (restaurant) => {
      var nb = 0;

      if (restaurant.friends_recommending) {
        nb += restaurant.friends_recommending.length;
      }
      if (restaurant.friends_wishing) {
        nb += restaurant.friends_wishing.length;
      }

      if (nb > 1) {
        return;
      }

      if (_.isEqual(restaurant.friends_recommending, [id]) || _.isEqual(restaurant.friends_wishing, [id])) {
        this.restaurants[restaurant.id] = _.extend({}, restaurant, {ON_MAP: false});
      }
    });
  }

  handleSetFilter(data) {
    var newFilters = _.clone(this.filters);
    newFilters[data.type] = data.filter;
    this.filters = newFilters;
  }

  handleAddWish(restaurant) {
    this.status.restaurantsWishAdding.push(restaurant.id);
  }
  handleAddWishFailed(data) {
    _.remove(this.status.restaurantsWishAdding, function(id) {
      return id === data.restaurant.id;
    });
    this.status.restaurantsWishAddingError[data.restaurant.id] = data.err;
  }
  handleAddWishSuccess(restaurant) {
    _.remove(this.status.restaurantsWishAdding, function(id) {
      return id === restaurant.id;
    });
    this.updateRestauAfterWishRecoUpdate(restaurant);
  }
  static addWishError(id) {
    return this.getState().status.restaurantsWishAddingError[id];
  }
  static addWishLoading(id) {
    return _.contains(this.getState().status.restaurantsWishAdding, id);
  }

  handleRemoveWish(restaurant) {
    this.status.restaurantsWishRemoving.push(restaurant.id);
  }
  handleRemoveWishFailed(data) {
    _.remove(this.status.restaurantsWishRemoving, function(id) {
      return id === data.restaurant.id;
    });
    this.status.restaurantsWishRemovingError[data.restaurant.id] = data.err;
  }
  handleRemoveWishSuccess(restaurant) {
    _.remove(this.status.restaurantsWishRemoving, function(id) {
      return id === restaurant.id;
    });
    this.updateRestauAfterWishRecoUpdate(restaurant);
  }
  static removeWishError(id) {
    return this.getState().status.restaurantsWishRemovingError[id];
  }
  static removeWishLoading(id) {
    return _.contains(this.getState().status.restaurantsWishRemoving, id);
  }

  handleRemoveReco(restaurant) {
    this.status.restaurantsRecoRemoving.push(restaurant.id);
  }
  handleRemoveRecoFailed(data) {
    _.remove(this.status.restaurantsRecoRemoving, function(id) {
      return id === data.restaurant.id;
    });
    this.status.restaurantsRecoRemovingError[data.restaurant.id] = data.err;
  }
  handleRemoveRecoSuccess(data) {
    _.remove(this.status.restaurantsRecoRemoving, function(id) {
      return id === data.oldRestaurant.id;
    });
    this.handleRestaurantsFetched(data.restaurants);
  }
  static removeRecoError(id) {
    return this.getState().status.restaurantsRecoRemovingError[id];
  }
  static removeRecoLoading(id) {
    return _.contains(this.getState().status.restaurantsRecoRemoving, id);
  }

  updateRestauAfterWishRecoUpdate(restaurant) {
    // restaurantfetched ne retourne pas friends_recommending
    restaurant.friends_recommending = _.keys(restaurant.reviews);
    this.restaurants[restaurant.id] = _.extend(_.clone(this.restaurants[restaurant.id] || {}), restaurant);
    this.restaurants[restaurant.id].ON_MAP = restaurant.friends_recommending && restaurant.friends_recommending.length || (restaurant.friends_wishing && restaurant.friends_wishing.length);
  }

  handleRecoSaved(reco) {
    this.updateRestauAfterWishRecoUpdate(reco.restaurant);
  }

  parseSubways(subways) {
    var newSubways = [[], []];
    _.each(subways, (subway) => {
      var s = subway.split('=>"');
      newSubways[0].push(parseInt(s[0].substr(1)));
      newSubways[1].push(s[1].substr(0, s[1].length - 2));
    });

    return newSubways;
  }

// all at once
  handleFetchRestaurants() {
    this.status.allRestaurantsLoading = true;
    delete this.status.allRestaurantsLoadingError;
  }

  handleRestaurantsFetched(restaurants) {
    var newRestaurants = {};

    // set all restaurants as not on the map
    _.each(this.restaurants, (restaurant) => {
      newRestaurants[restaurant.id] = _.extend({}, restaurant, {ON_MAP: false});
    });

    // update from received restaurant
    // we reset this restaurant as on the map
    _.each(restaurants, (restaurant) => {
      newRestaurants[restaurant.id] = _.extend(_.clone(this.restaurants[restaurant.id] || {}), restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
    });

    this.restaurants = newRestaurants;

    this.status.allRestaurantsLoading = false;
  }

  handleRestaurantsFetchFailed(err) {
    this.status.allRestaurantsLoading = false;
    this.status.allRestaurantsLoadingError = err;
  }

// one by one

  handleFetchRestaurant(id) {
    console.log('2');
    this.status.restaurantsLoading.push(id);
    delete this.status.restaurantsLoadingError[id];
    console.log('3');
  }

  handleRestaurantFetched(restaurant) {
    // restaurantfetched ne retourne pas friends_recommending
    restaurant.friends_recommending = _.keys(restaurant.reviews);
    this.restaurants[restaurant.id] = _.extend(_.clone(this.restaurants[restaurant.id] || {}), restaurant, {subways: this.parseSubways(restaurant.subways)});
    _.remove(this.status.restaurantsLoading, function(id) {
      return id === restaurant.id;
    });
  }

  handleRestaurantFetchFailed(data) {
    _.remove(this.status.restaurantsLoading, function(id) {
      return id === data.id;
    });
    this.status.restaurantsLoadingError[data.id] = data.err;
  }

//

  static error(id) {
    if (!id) {
      return this.getState().status.allRestaurantsLoadingError;
    }

    return this.getState().status.restaurantsLoadingError[id];
  }

  static loading(id) {
    if (!id) {
      return this.getState().status.allRestaurantsLoading;
    }

    return _.contains(this.getState().status.restaurantsLoading, id);
  }

  static restaurant(id) {
    return this.getState().restaurants[id];
  }

  static restaurants() {
    return _.values(this.getState().restaurants);
  }

  static hasMenu(id) {
    return this.hasMenuEntree(id) || this.hasMenuMainCourse(id) || this.hasMenuDessert(id);
  }

  static hasMenuEntree(id) {
    var restau = this.restaurant(id);

    if (!restau) {
      return false;
    }

    return !!restau.starter1 ||
      !!restau.starter2;
  }

  static hasMenuMainCourse(id) {
    var restau = this.restaurant(id);

    if (!restau) {
      return false;
    }

    return !!restau.main_course1 ||
      !!restau.main_course2 ||
      !!restau.main_course3;
  }

  static hasMenuDessert(id) {
    var restau = this.restaurant(id);

    if (!restau) {
      return false;
    }

    return !!restau.dessert1 ||
      !!restau.dessert2;
  }

  static wishers(id) {
    var restau = this.restaurant(id);

    if (!restau) {
      return false;
    }

    return _.map(restau.friends_wishing || [], function(id) {
      return parseInt(id);
    });
  }

  static recommenders(id) {
    var restau = this.restaurant(id);

    if (!restau) {
      return false;
    }

    var recos;

    recos = restau.friends_recommending || [];

    return _.map(recos, function(reco) {
      return parseInt(reco);
    });
  }

  static searchable() {
    return _.filter(this.getState().restaurants, (restaurant) => {
      return restaurant.ON_MAP;
    });
  }

  static isSearchable(id) {
    return this.restaurant(id) && this.restaurant(id).ON_MAP;
  }

  static searchablePrix() {
    return _.sortBy(_.remove(_.uniq(_.pluck(this.searchable(), 'price_range')), function(budget) {
      return !!budget;
    }));
  }

  static typeFilters() {
    var types = {};

    _.each(this.getState().restaurants, (restaurant) => {
      if (!restaurant.ON_MAP) {
        return;
      }

      types[restaurant.food[0]] = {
        id: restaurant.food[0],
        value: restaurant.food[1]
      };
    });

    return _.sortBy(_.values(types), (type) => {
      return type.value;
    });
  }

  static metroFilters() {
    var metros = {};

    _.each(this.getState().restaurants, (restaurant) => {
      if (!restaurant.ON_MAP) {
        return;
      }

      _.each(restaurant.subways[0], (id, index) => {
        metros[id] = {
          id: id,
          value: restaurant.subways[1][index]
        };
      });
    });

    return _.sortBy(_.values(metros), (metro) => {
      return metro.value;
    });
  }

  static searchableAmbiances() {
    return _.sortBy(_.remove(_.uniq(_.flatten(_.pluck(this.searchable(), 'ambiences'))), function(ambiance) {
      return !!ambiance;
    }));
  }

  static MAP_AMBIANCES = {
    1: {
      label: 'Chic',
      icon: require('../assets/img/chic.png')
    },
    2: {
      label: 'Festif',
      icon: require('../assets/img/festif.png')
    },
    6: {
      label: 'Casual',
      icon: require('../assets/img/casual.png')
    },
    4: {
      label: 'Ensoleillé',
      icon: require('../assets/img/ensoleille.png')
    },
    5: {
      label: 'Fast',
      icon: require('../assets/img/fast.png')
    },
    3: {
      label: 'Typique',
      icon: require('../assets/img/typique.png')
    }
  }

  static MAP_AMBIANCES_2 = {
    1: {
      label: 'Chic',
      icon: require('../assets/img/chic.jpg')
    },
    2: {
      label: 'Festif',
      icon: require('../assets/img/festif.jpg')
    },
    3: {
      label: 'Terrasse',
      icon: require('../assets/img/terrasse.jpg')
    },
    4: {
      label: 'Bonne Franquette',
      icon: require('../assets/img/bonne_franquette.jpg')
    },
    5: {
      label: 'Traditionnel',
      icon: require('../assets/img/traditionnel.jpg')
    },
    6: {
      label: 'Fast',
      icon: require('../assets/img/fast.jpg')
    },
    7: {
      label: 'Romantique',
      icon: require('../assets/img/romantique.jpg')
    },
    8: {
      label: 'Autres',
      icon: require('../assets/img/autre.jpg')
    }
  }

  static MAP_OCCASIONS = {
    1: {
      label: 'Business',
      icon: require('../assets/img/dej_business.jpg')
    },
    2: {
      label: 'En Couple',
      icon: require('../assets/img/en_couple.jpg')
    },
    3: {
      label: 'En Famille',
      icon: require('../assets/img/en_famille.jpg')
    },
    4: {
      label: 'Entre amis',
      icon: require('../assets/img/entre_amis.jpg')
    },
    5: {
      label: 'Grandes tablees',
      icon: require('../assets/img/grandes_tablees.jpg')
    },
    6: {
      label: 'Pour un date',
      icon: require('../assets/img/date.jpg')
    },
    7: {
      label: 'Brunch',
      icon: require('../assets/img/brunch.jpg')
    },
    8: {
      label: 'Autres',
      icon: require('../assets/img/autre.jpg')
    },
  }

  static MAP_STRENGTHS = {
    1: {
      label: 'Cuisine',
      icon: require('../assets/img/cuisine.png')
    },
    2: {
      label: 'Service',
      icon: require('../assets/img/service.png')
    },
    3: {
      label: 'Cadre',
      icon: require('../assets/img/cadre.png')
    },
    4: {
      label: 'Original',
      icon: require('../assets/img/original.png')
    },
    5: {
      label: 'Copieux',
      icon: require('../assets/img/copieux.png')
    },
    6: {
      label: 'Vins',
      icon: require('../assets/img/vins.png')
    },
    7: {
      label: 'Qté Prix',
      icon: require('../assets/img/qtiteprix.png')
    }
  }

  static subways(id) {
    var restaurant = this.restaurant(id);

    if (!restaurant) {
      return {};
    }

    return _.zipObject.apply(null, restaurant.subways);
  }

  static closestSubwayName(id) {
    var restaurant = this.restaurant(id);

    if (!restaurant) {
      return null;
    }

    return this.subways(id)[restaurant.closest_subway];
  }

  static filteredRestaurants() {
    var filters = this.getState().filters;

    return _.filter(this.searchable(), (restaurant) => {
      //prix
      if (filters.prix.id && restaurant.price_range !== filters.prix.id) {
        return false;
      }

      if (filters.food.id && !_.contains(restaurant.food, filters.food.id)) {
        return false;
      }

      if (filters.friend.id && !_.contains(this.recommenders(restaurant.id), filters.friend.id)) {
        return false;
      }

      if (filters.metro.id && !this.subways(restaurant.id)[filters.metro.id]) {
        return false;
      }

      if (filters.ambiance.id && !_.contains(restaurant.ambiences, filters.ambiance.id)) {
        return false;
      }

      return true;
    });
  }

  static filterActive() {
    return _.some(this.getState().filters, (filter) => {
      return !!filter.id;
    });
  }
}

export default alt.createStore(RestaurantsStore);
