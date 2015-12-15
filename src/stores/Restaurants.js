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
      prices: [],
      types: [],
      ambiences: [],
      occasions: []
    };

    this.region = {
      lat: 48.8534100,
      long: 2.3378000,
      deltaLong: 0.12,
      deltaLat: 0.065
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
      handleSetRegion: RestaurantsActions.SET_REGION,

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
    newFilters[data.label] = data.ids;
    this.filters = newFilters;
  }

  handleSetRegion(data) {
    this.region = data;
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
    this.status.restaurantsLoading.push(id);
    delete this.status.restaurantsLoadingError[id];
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

  static searchableAmbiences() {
    return _.sortBy(_.remove(_.uniq(_.flatten(_.pluck(this.searchable(), 'ambiences'))), function(ambience) {
      return !!ambience;
    }));
  }

  static searchableOccasions() {
    return _.sortBy(_.remove(_.uniq(_.flatten(_.pluck(this.searchable(), 'occasions'))), function(occasion) {
      return !!occasion;
    }));
  }

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
      icon: require('../assets/img/ambiances/icons/typique.png')
    },
    {
      label: 'Romantique',
      icon: require('../assets/img/ambiances/icons/romantique.png')
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
      label: 'En Couple',
      icon: require('../assets/img/occasions/icons/en_couple.png')
    },
    {
      label: 'En Famille',
      icon: require('../assets/img/occasions/icons/en_famille.png')
    },
    {
      label: 'Entre amis',
      icon: require('../assets/img/occasions/icons/entre_amis.png')
    },
    {
      label: 'Grandes tablees',
      icon: require('../assets/img/occasions/icons/grandes_tablees.png')
    },
    {
      label: 'Brunch',
      icon: require('../assets/img/occasions/icons/brunch.png')
    },
    {
      label: 'Terrasse',
      icon: require('../assets/img/ambiances/icons/terrasse.png')
    },
    {
      label: 'Fast',
      icon: require('../assets/img/ambiances/icons/fast.png')
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
    var region = this.getState().region;

    var findOne = function (haystack, arr) {
      return arr.some(function (v) {
        return haystack.indexOf(v) >= 0;
      });
    };

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

      if (filters.ambiences.length > 0 && !findOne(filters.ambiences, intAmbiences)) {
        return false;
      }

      if (filters.occasions.length > 0 && !findOne(filters.occasions, intOccasions)) {
        return false;
      }

      if (filters.types.length > 0 && !findOne(filters.types, restaurant.types)) {
        return false;
      }

      var deltaX = (region.width / region.deltaLong) * (region.longCentre - restaurant.longitude);
      var deltaY = (region.mapHeight / region.deltaLat) * (region.latCentre - restaurant.latitude);

      if (Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) + 10 > region.radius) {
        return false;
      }

      return true;
    });

    return filteredRestaurants;
  }

  static filterActive() {
    var filters = this.getState().filters;
    console.log(filters);
    return (filters.prices.length > 0) || (filters.ambiences.length > 0) || (filters.occasions.length > 0) || (filters.types.length > 0);
  }
}

export default alt.createStore(RestaurantsStore);
