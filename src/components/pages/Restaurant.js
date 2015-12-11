'use strict';

import React, {StyleSheet, Text, View, ScrollView, MapView, Image, TouchableHighlight} from 'react-native';
import _ from 'lodash';
import RNComm from 'react-native-communications';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import ProfilActions from '../../actions/ProfilActions';
import ProfilStore from '../../stores/Profil';
import MeStore from '../../stores/Me';
import RecoActions from '../../actions/RecoActions';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
import Carousel from '../ui/Carousel';
import RestaurantElement from '../elements/Restaurant';
import Button from '../elements/Button';
import Options from '../elements/Options';
import Option from '../elements/Option';
import Toggle from './Reco/Toggle';
import RecoStep3 from './Reco/Step3';

class Restaurant extends Page {
  static route(props, title) {
    return {
      component: Restaurant,
      title: title,
      passProps: props
    };
  }

  restaurantsState() {
    var restaurant = RestaurantsStore.restaurant(this.props.id);

    var errors = this.state.errors;

    var removeRecoErr = RestaurantsStore.removeRecoError(this.props.id);
    if (removeRecoErr && !_.contains(errors, removeRecoErr)) {
      errors.push(removeRecoErr);
    }

    var removeWishErr = RestaurantsStore.removeWishError(this.props.id);
    if (removeWishErr && !_.contains(errors, removeWishErr)) {
      errors.push(removeWishErr);
    }

    var addWishErr = RestaurantsStore.addWishError(this.props.id);
    if (addWishErr && !_.contains(errors, addWishErr)) {
      errors.push(addWishErr);
    }

    return {
      data: restaurant,
      loading: RestaurantsStore.loading(this.props.id),
      error: RestaurantsStore.error(this.props.id),
      errors: errors
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: []
    };
    this.state = this.restaurantsState();
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  }

  onProfilStoreUpdate = () => {
    this.forceUpdate();
  }

  componentDidUpdate() {
    var restaurant = RestaurantsStore.restaurant(this.props.id);

    if (restaurant) {
      var users = _.filter(_.union(RestaurantsStore.recommenders(restaurant.id), RestaurantsStore.wishers(restaurant.id)), (userId) => {
        return !ProfilStore.profil(userId) && !ProfilStore.loading(userId);
      });

      _.each(users, (userId) => {
        ProfilActions.fetchProfil(userId);
      });
    }
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
    ProfilStore.listen(this.onProfilStoreUpdate);
    RestaurantsActions.fetchRestaurant(this.props.id);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
    ProfilStore.unlisten(this.onProfilStoreUpdate);
  }

  getToggle (map, v, color) {
    return <Toggle
      style={styles.toggle}
      labelColor={color}
      label={map[v].label}
      icon={map[v].icon}
      active={false}
      size={60}/>;
  }

  approuve = (editing) => {
    var restaurant = this.state.data;

    var props;

    if (editing) {
      props = {
        'restaurant_name': restaurant.name,
        'restaurant_id': restaurant.id,
        editing: true
      };
    } else {
      RecoActions.setReco({
        restaurant: {
          id: restaurant.id,
          origin: 'db',
          name: restaurant.name
        },
        approved: true
      });
    }

    this.props.navigator.push(RecoStep3.route(props));
  }

  call = () => {
    RNComm.phonecall(this.state.data.phone_number, false);
  }

  renderPage() {
    var restaurant = this.state.data;
    var budget = _.map(_.range(0, Math.min(3, restaurant.price_range)), function() {
      return '€';
    }).join('') + (restaurant.price_range > 3 ? '+' : '');

    return (
      <ScrollView
        style={{flex: 1}}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <RestaurantElement
            name={restaurant.name}
            pictures={restaurant.pictures}
            type={restaurant.food[1]}
            height={250}
            budget={restaurant.price_range} />
        </View>

        <View style={[styles.callContainer]}>
          <Text style={styles.reservationText}>Réserver une table</Text>
          <Button style={styles.button} label="Appeler" onPress={this.call} />
        </View>

        <View style={styles.recoContainer}>
          {RestaurantsStore.recommenders(restaurant.id).length ?
            <View>
              <Text style={styles.containerTitle}>Ils l'ont recommandé</Text>
              <View style={{alignItems: 'center'}}>
                <Carousel ref="carousel" style={{
                  flexDirection: 'row',
                  height: 80,
                  width: 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent'
                }} elemSize={80} insetMargin={80} leftFlecheStyle={{marginLeft: -35}} rightFlecheStyle={{right: 0}}
                  onPageChange={(i) => {
                  this.setState({
                    reviewSelected: RestaurantsStore.recommenders(restaurant.id)[i + 1]
                  });
                }}>
                  {_.map(RestaurantsStore.recommenders(restaurant.id), (userId) => {
                    var profil = ProfilStore.profil(userId);
                    var source = profil ? {uri: profil.picture} : {};

                    return <View style={styles.avatarWrapper}>
                      <Image style={styles.avatar} source={source} />
                    </View>;
                  })}
                </Carousel>
              </View>
            </View>
            :
            <Text style={styles.containerTitle}>Aucun ami ne l'a recommandé</Text>
          }
          {(RestaurantsStore.recommenders(restaurant.id).length  && _.keys(restaurant.reviews).length && restaurant.reviews[this.state.reviewSelected]) ?
            <View style={styles.reviewBox}>
              <View style={styles.triangleContainer}>
                <View style={styles.triangle} />
              </View>
              <Text style={styles.reviewText}>{restaurant.reviews[this.state.reviewSelected][0] || 'Je recommande !'}</Text>
              <Text style={styles.reviewAuthor}>{ProfilStore.profil(this.state.reviewSelected) && ProfilStore.profil(this.state.reviewSelected).name}</Text>
            </View>
            : null}

          {!_.contains(RestaurantsStore.recommenders(restaurant.id), MeStore.getState().me.id) ?
            <Option
              style={styles.recoButton}
              label={'Je recommande'}
              icon={require('../../assets/img/actions/icons/japprouve.png')}
              onPress={() => {this.approuve(false);}} />
            : null}
        </View>

        {RestaurantsStore.recommenders(restaurant.id).length && restaurant.ambiences && restaurant.ambiences.length ?
          <View style={styles.wishContainer}>
            <Text style={styles.containerTitle}>Ambiances</Text>
            <View style={styles.toggleBox}>
              {_.map(restaurant.ambiences.slice(0, 3), (ambiance) => {
                return this.getToggle(RestaurantsStore.MAP_AMBIANCES, ambiance, "#444444");
              })}
            </View>
            <View style={styles.toggleBox}>
              {_.map(restaurant.ambiences.slice(3), (ambiance) => {
                return this.getToggle(RestaurantsStore.MAP_AMBIANCES, ambiance, "#444444");
              })}
            </View>
          </View>
          : null}

        {RestaurantsStore.recommenders(restaurant.id).length && restaurant.strengths && restaurant.strengths.length ?
          <View style={styles.recoContainer}>
            <Text style={styles.containerTitle}>Points forts</Text>
            <View style={styles.toggleBox}>
              {_.map(restaurant.strengths.slice(0, 3), (strength) => {
              	return this.getToggle(RestaurantsStore.MAP_STRENGTHS, strength, "#444444");
              })}
            </View>
            <View style={styles.toggleBox}>
              {_.map(restaurant.strengths.slice(3), (strength) => {
								return this.getToggle(RestaurantsStore.MAP_STRENGTHS, strength, "#888888");
              })}
            </View>
             <View style={styles.toggleBox}>
              {_.map(restaurant.strengths.slice(6), (strength) => {
								return this.getToggle(RestaurantsStore.MAP_STRENGTHS, strength, "#444444");
              })}
            </View>
          </View>
          : null}

        <View style={styles.wishContainer}>
          {RestaurantsStore.wishers(restaurant.id).length ?
            <View style={{alignItems: 'center'}}>
              <Text style={styles.containerTitle}>Ils ont envie d'y aller</Text>
              <Carousel ref="carousel" style={{
                flexDirection: 'row',
                height: 80,
                width: 240,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent'
              }} elemSize={80} insetMargin={80} leftFlecheStyle={{marginLeft: -35}} rightFlecheStyle={{right: 0}}>
                {_.map(RestaurantsStore.wishers(restaurant.id), (userId) => {
                  var profil = ProfilStore.profil(userId);
                  var source = profil ? {uri: profil.picture} : {};

                  return <View style={styles.avatarWrapper}>
                    <Image style={styles.avatar} source={source} />
                  </View>;
                })}
              </Carousel>
            </View>
          : <Text style={styles.containerTitle}>Pas encore d'ami qui veut y aller</Text>}

          {(!_.contains(RestaurantsStore.wishers(restaurant.id), MeStore.getState().me.id) &&
                    !_.contains(RestaurantsStore.recommenders(restaurant.id), MeStore.getState().me.id)) ?
            <Option
            style={styles.recoButton}
            label={RestaurantsStore.addWishLoading(restaurant.id) ? 'Enregistrement...' : 'Sur ma wishlist'}
            icon={require('../../assets/img/actions/icons/aessayer.png')}
            onPress={() => {
              if (RestaurantsStore.addWishLoading(restaurant.id)) {
                return;
              }
              RestaurantsActions.addWish(restaurant);
            }} />
            : null}

        </View>

        {RestaurantsStore.hasMenu(restaurant.id) ?
          <View style={styles.recoContainer}>
            <Text style={styles.containerTitle}>Sélection du chef</Text>
            {RestaurantsStore.hasMenuEntree(restaurant.id) ?
              <View style={styles.menuInnerContainer}>
                <Text style={styles.menuTitle}>Entrées</Text>
                {restaurant.starter1 ? <Text style={styles.menuPlat}>{restaurant.starter1}</Text> : null}
                {restaurant.description_starter1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_starter1}</Text> : null}
                {restaurant.price_starter1 ? <Text style={styles.menuPlat}>{restaurant.price_starter1}€</Text> : null}
                
                {restaurant.starter2 ? <Text style={styles.menuPlat}>{restaurant.starter2}</Text> : null}
                {restaurant.description_starter2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_starter2}</Text> : null}
                {restaurant.price_starter2 ? <Text style={styles.menuPlat}>{restaurant.price_starter2}€</Text> : null}
              </View>
              : null}
            {RestaurantsStore.hasMenuMainCourse(restaurant.id) ?
              <View style={styles.menuInnerContainer}>
                <Text style={styles.menuTitle}>Plats</Text>
                {restaurant.main_course1 ? <Text style={styles.menuPlat}>{restaurant.main_course1}</Text> : null}
                {restaurant.description_main_course1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course1}</Text> : null}
                {restaurant.price_main_course1 ? <Text style={styles.menuPlat}>{restaurant.price_main_course1}€</Text> : null}

                {restaurant.main_course2 ? <Text style={styles.menuPlat}>{restaurant.main_course2}</Text> : null}
                {restaurant.description_main_course2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course2}</Text> : null}
                {restaurant.price_main_course2 ? <Text style={styles.menuPlat}>{restaurant.price_main_course2}€</Text> : null}

                {restaurant.main_course3 ? <Text style={styles.menuPlat}>{restaurant.main_course3}</Text> : null}
                {restaurant.description_main_course3 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course3}</Text> : null}
                {restaurant.price_main_course3 ? <Text style={styles.menuPlat}>{restaurant.price_main_course3}€</Text> : null}
              </View>
              : null}
            {RestaurantsStore.hasMenuDessert(restaurant.id) ?
              <View style={styles.menuInnerContainer}>
                <Text style={styles.menuTitle}>Desserts</Text>
                {restaurant.dessert1 ? <Text style={styles.menuPlat}>{restaurant.dessert1}</Text> : null}
                {restaurant.description_dessert1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_dessert1}</Text> : null}
                {restaurant.price_dessert1 ? <Text style={styles.menuPlat}>{restaurant.price_dessert1}€</Text> : null}

                {restaurant.dessert2 ? <Text style={styles.menuPlat}>{restaurant.dessert2}</Text> : null}
                {restaurant.description_dessert2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_dessert2}</Text> : null}
                {restaurant.price_dessert2 ? <Text style={styles.menuPlat}>{restaurant.price_dessert2}€</Text> : null}
              </View>
              : null}
          </View>
          : null}


        <View style={[styles.lieuContainer, RestaurantsStore.hasMenu(restaurant.id) ? {backgroundColor: 'transparent'} : {}]}>
          <Text style={styles.containerTitle}>Lieu</Text>
          <Text style={styles.address}>{restaurant.address}</Text>
          <View style={styles.metroContainer}>
            <Image source={require('../../assets/img/other/icons/metro.png')} style={styles.metroImage} />
            <Text style={styles.metroText}>{RestaurantsStore.closestSubwayName(restaurant.id)}</Text>
          </View>
        </View>

        <MapView style={styles.mapContainer}
          annotations={[
            {
              latitude: restaurant.latitude,
              longitude: restaurant.longitude
            }
          ]}
          region={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }} />

        <View style={styles.callContainer}>
          <Text style={styles.reservationText}>Réserver une table</Text>
          <Button style={styles.button} label="Appeler" onPress={this.call} />
        </View>

        {(_.contains(RestaurantsStore.wishers(restaurant.id), MeStore.getState().me.id) ||
                    _.contains(RestaurantsStore.recommenders(restaurant.id), MeStore.getState().me.id)) ?
          <Options>
            {_.contains(RestaurantsStore.wishers(restaurant.id), MeStore.getState().me.id) ?
            [
              <Option
                label={RestaurantsStore.removeWishLoading(restaurant.id) ? 'Suppression...' : 'Retirer de mes envies'}
                icon={require('../../assets/img/actions/icons/unlike.png')}
                onPress={() => {
                  if (RestaurantsStore.removeWishLoading(restaurant.id)) {
                    return;
                  }
                  RestaurantsActions.removeWish(restaurant, () => {
                    if (!RestaurantsStore.isSearchable(restaurant.id)) {
                      this.props.navigator.resetToTab(4);
                    }
                  });
                }} />
            ]
            :
            [
              <Option label="Modifier ma reco" icon={require('../../assets/img/actions/icons/modify.png')} onPress={() => {
                this.approuve(true);
              }} />,
              <Option
                label={RestaurantsStore.removeRecoLoading(restaurant.id) ? 'Suppression...' : 'Supprimer ma reco'}
                icon={require('../../assets/img/actions/icons/poubelle.png')}
                onPress={() => {
                  if (RestaurantsStore.removeRecoLoading(restaurant.id)) {
                    return;
                  }
                  RestaurantsActions.removeReco(restaurant, () => {
                    if (!RestaurantsStore.isSearchable(restaurant.id)) {
                      this.props.navigator.resetToTab(4);
                    }
                  });
                }} />
            ]
            }
          </Options>
          : null }
          
          {_.map(this.state.errors, (error, i) => {
            return <ErrorToast key={i} value={JSON.stringify(error)} appBar={true} />;
          })}
      </ScrollView>
    );
  }
}

var styles = StyleSheet.create({
  container: {
  },
  header: {
    height: 300
  },
  restaurantImage: {
    flex: 1,
  },
  restaurantInfos: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'    
  },
  restaurantName: {
    fontWeight: '900',
    fontSize: 15,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#FFFFFF',
    marginTop: 2,
    position: 'absolute',
    bottom: 40,
    left: 10
  },
  restaurantType: {
    flex: 1,
    fontWeight: '900',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#FFFFFF',
    marginTop: 2,
    position: 'absolute',
    bottom: 10,
    left: 10
  },
  restaurantPrice: {
    flex: 1,
    fontWeight: '900',
    fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    bottom: 5,
    right: 5,
    color: '#FFFFFF'
  },
  callContainer: {
    backgroundColor: '#E0E0E0',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  reservationText: {
    color: '#444444',
    fontSize: 16,
    alignSelf: 'center'
  },
  button: {
    alignSelf: 'center'
  },
  recoContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF'
  },
  wishContainer: {
    padding: 20,
    backgroundColor: '#E0E0E0'
  },
  containerTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center'
  },
  mapContainer: {
    height: 150
  },
  lieuContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center'
  },
  address: {
    color: '#444444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10
  },
  metroContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  metroImage: {
    height: 16,
    width: 16,
    marginRight: 5,
    marginTop: 1
  },
  metroText: {
    color: '#888888'
  },
  avatarWrapper: {
    height: 60,
    width: 60,
    margin: 10,
    borderRadius: 30
  },
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10
  },
  reviewBox: {
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center'
  },
  triangleContainer: {
    top: -10,
    position: 'relative'
  },
  triangle: {
    height: 15,
    width: 15,
    top: -7,
    left: -7,
    position: 'absolute',
    backgroundColor: '#E0E0E0',
    transform: [
      {rotate: '45deg'}
    ]
  },
  reviewText: {
    textAlign: 'center',
    color: '#000000'
  },
  reviewAuthor: {
    marginTop: 5,
    textAlign: 'center',
    color: '#444444'
  },
  recoButton: {
    backgroundColor: '#38E1B2'
  },
  toggleBox: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  toggle: {
    margin: 10,
    backgroundColor: "#38E1B2"
  },
  menuInnerContainer: {
    alignItems: 'center',
    margin: 10
  },
  menuTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5
  },
  menuPlat: {
    textAlign: 'center',
    color: '#444444',
    paddingTop: 2,
    paddingBottom: 2
  },
  menuDescription: {
    fontFamily: 'Quicksand-Italic'
  }
});

export default Restaurant;
