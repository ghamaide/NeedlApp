'use strict';

import alt from '../alt';
import _ from 'lodash';

import RestaurantsActions from '../actions/RestaurantsActions';
import RecoActions from '../actions/RecoActions';
import ProfilActions from '../actions/ProfilActions';
import CachedStore from './CachedStore';
import MeStore from './Me';
import RecoStore from './Reco';

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
      latitude: 48.8534100,
      longitude: 2.3378000,
      longitudeDelta: 0.12,
      latitudeDelta: 0.065
    };

    this.currentRegion = {};

    this.showPersonalContent = true;

    this.restoID = 0;

    this.restaurants = [];

    this.status.loading = false;
    this.status.error = {};

    this.bindListeners({
      handleFetchRestaurants: RestaurantsActions.FETCH_RESTAURANTS,
      handleRestaurantsFetched: RestaurantsActions.RESTAURANTS_FETCHED,
      handleRestaurantsFetchFailed: RestaurantsActions.RESTAURANTS_FETCH_FAILED,

      handleFetchRestaurant: RestaurantsActions.FETCH_RESTAURANT,
      handleRestaurantFetched: RestaurantsActions.RESTAURANT_FETCHED,
      handleRestaurantFetchFailed: RestaurantsActions.RESTAURANT_FETCH_FAILED,

      handleSetFilter: RestaurantsActions.SET_FILTER,

      handleSetDisplayPersonal: RestaurantsActions.SET_DISPLAY_PERSONAL,

      handleMaskProfilSuccess: ProfilActions.MASK_PROFIL_SUCCESS,

      handleSetRegion: RestaurantsActions.SET_REGION,
      handleSetRegionSuccess: RestaurantsActions.SET_REGION_SUCCESS,

      handleAddWish: RestaurantsActions.ADD_WISH,
      handleAddWishFailed: RestaurantsActions.ADD_WISH_FAILED,
      handleAddWishSuccess: RestaurantsActions.ADD_WISH_SUCCESS,

      handleRemoveWish: RestaurantsActions.REMOVE_WISH,
      handleRemoveWishFailed: RestaurantsActions.REMOVE_WISH_FAILED,
      handleRemoveWishSuccess: RestaurantsActions.REMOVE_WISH_SUCCESS,

      handleSaveRecoSuccess: RecoActions.SAVE_RECO_SUCCESS,
      handleSaveReco: RecoActions.SAVE_RECO,

// ================================================================================================

      handleRemoveReco: RestaurantsActions.REMOVE_RECO,
      handleRemoveRecoFailed: RestaurantsActions.REMOVE_RECO_FAILED,
      handleRemoveRecoSuccess: RestaurantsActions.REMOVE_RECO_SUCCESS,


    });
  }

  handleFetchRestaurants() {
    this.status.loading = true;
    delete this.status.error;
  }

  handleRestaurantsFetched(restaurants) {
    var newRestaurants = restaurants;

    _.each(newRestaurants, (restaurant) => {
      return _.extend(restaurant, {ON_MAP: true, subways: this.parseSubways(restaurant.subways)});
    });

    this.restaurants = newRestaurants;
    this.status.loading = false;
  }

  handleRestaurantsFetchFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleFetchRestaurant(id) {
    this.status.loading = true;
    delete this.status.error;
  }

  handleRestaurantFetched(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = restaurant;
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true}));
    }
    this.status.loading = false;
  }

  handleRestaurantFetchFailed(data) {
    this.status.loading = false;
    this.status.error = data.err;
  }

  handleMaskProfilSuccess(id) {
    _.map(this.restaurants, (restaurant) => {
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
        restaurant.ON_MAP = false;
      }
    });
  }

  handleSetFilter(data) {
    var newFilters = _.clone(this.filters);
    newFilters[data.label] = data.ids;
    this.filters = newFilters;
  }

  handleSetDisplayPersonal(display) {
    this.showPersonalContent = display;
  }

  handleSetRegion() {
    this.status.loading = true;
  }

  handleSetRegionSuccess(data) {
    this.status.loading = false;
    this.currentRegion = data.currentRegion;
    this.region = data.region;
  }

  handleAddWish(restaurant) {
    this.status.loading = true;
  }

  handleAddWishFailed(data) {
    this.status.loading = false;
    this.status.error = data.err;
  }

  handleAddWishSuccess(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = restaurant;
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true}));
    }
    this.status.loading = false;
  }

  handleRemoveWish(restaurant) {
    this.status.loading = true;
  }

  handleRemoveWishFailed(data) {
    this.status.loading = false;
    this.status.error = data.err;
  }

  handleRemoveWishSuccess(restaurant) {
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    this.restaurants[index] = _.extend(restaurant, {ON_MAP: restaurant.reviews.length + restaurant.friends_wishing.length > 0});
    this.status.loading = false;
  }

  handleSaveRecoSuccess(reco) {
    var restaurant = reco.restaurant;
    var index = _.findIndex(this.restaurants, function(o) {return o.id === restaurant.id;});
    if (index > -1) {
      this.restaurants[index] = restaurant;
    } else {
      this.restaurants.push(_.extend(restaurant, {ON_MAP: true}));
    }
    this.status.loading = false;
  }

  handleSaveReco() {
    this.status.loading = true;
  }

  handleRemoveReco() {
    this.status.loading = true;
  }

  handleRemoveRecoFailed(err) {
    this.status.loading = false;
    this.status.error = err;
  }

  handleRemoveRecoSuccess(data) {
    this.handleRestaurantsFetched(data.restaurants);
    this.status.loading = false;    
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

    return _.map(restaurant.friends_wishing || [], function(id) {
      return parseInt(id);
    });
  }

  static getRecommenders(id) {
    var restaurant = this.getRestaurant(id);

    if (!restaurant) {
      return false;
    }

    return _.map(restaurant.friends_recommending || [], function(recommendation) {
      return parseInt(recommendation);
    });
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

  static filteredRestaurants() {
    var filters = this.getState().filters;
    var currentRegion = this.getState().currentRegion;
    var showPersonalContent = this.getState().showPersonalContent;

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

      if(!showPersonalContent && _.contains(restaurant.friends_recommending, MeStore.getState().me.id)) {
        return false;
      }

      if (restaurant.longitude <= currentRegion.west || restaurant.longitude >= currentRegion.east || restaurant.latitude <= currentRegion.south || restaurant.latitude >= currentRegion.north) {
        return false;
      }

      // var deltaX = (region.width / region.deltaLong) * (region.longCentre - restaurant.longitude);
      // var deltaY = (region.mapHeight / region.deltaLat) * (region.latCentre - restaurant.latitude);

      // if (Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) + 15 > region.radius) {
      //   return false;
      // }

      return true;
    });

    return _.sortByOrder(filteredRestaurants, ['score'], ['desc']);
  }

  static filterActive() {
    var filters = this.getState().filters;
    return (filters.prices.length > 0) || (filters.ambiences.length > 0) || (filters.occasions.length > 0) || (filters.types.length > 0);
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
      label: 'Fast',
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
