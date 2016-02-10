'use strict';

import React, {StyleSheet, View, ScrollView, Image, TouchableHighlight, RefreshControl, Dimensions, Platform, ActivityIndicatorIOS, ProgressBarAndroid} from 'react-native';

import _ from 'lodash';
import RNComm from 'react-native-communications';
import Mixpanel from 'react-native-mixpanel';
import MapView from 'react-native-maps';

import RestaurantElement from '../elements/Restaurant';
import Button from '../elements/Button';
import Options from '../elements/Options';
import Option from '../elements/Option';

import Page from '../ui/Page';
import Carousel from '../ui/Carousel';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantsActions from '../../actions/RestaurantsActions';
import ProfilActions from '../../actions/ProfilActions';
import RecoActions from '../../actions/RecoActions';

import ProfilStore from '../../stores/Profil';
import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Toggle from './Reco/Toggle';
import RecoStep3 from './Reco/Step3';
import Help from './Help';

var windowHeight = Dimensions.get('window').height;

class Restaurant extends Page {
  static route(props, title) {
    return {
      component: Restaurant,
      title: title,
      passProps: props
    };
  };

  restaurantsState() {
    return {
      id: this.props.id,
      data: RestaurantsStore.getRestaurant(this.props.id),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  componentWillMount() {
    if (Platform.OS === 'ios') { 
      Mixpanel.sharedInstanceWithToken('1637bf7dde195b7909f4c3efd151e26d');
    }
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  getToggle (map, v, color) {
    if (v <= map.length && v != 0) {
      return <Toggle
        key={map[v - 1].label}
        style={styles.toggle}
        labelColor={color}
        label={map[v - 1].label}
        icon={map[v - 1].icon}
        active={false}
        size={60}/>;
    } else {
      return ;
    }
  };

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
  };

  call = () => {
    if (Platform.OS === 'ios') { 
      Mixpanel.trackWithProperties('Call restaurant', {id: MeStore.getState().me.id, user: MeStore.getState().me.id, restaurantID: this.state.data.id, restaurantName: this.state.data.name});
    }
    RNComm.phonecall(this.state.data.phone_number, false);
  };

  centerReco = () => {
    this.refs.carouselReco.goToPage(-1);
  };

  onPressText = () => {
    this.props.navigator.push(Help.route("Aide", {from: "restaurant"}));
  };

  renderPage() {
    var restaurant = this.state.data;
    var budget = _.map(_.range(0, Math.min(3, restaurant.price_range)), function() {
      return '€';
    }).join('') + (restaurant.price_range > 3 ? '+' : '');
    return (
      <View>
        {this.props.fromReco ? [
          <NavigationBar key="navbar" title={restaurant.name} />
        ] : [
          <NavigationBar key="navbar" title={restaurant.name} leftButtonTitle="Retour" onLeftButtonPress={() => this.props.navigator.pop()} />
        ]}
        <ScrollView
          style={{flex: 1, height: windowHeight - 120}}
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={() => {
                this.componentDidUpdate();
              }}
              tintColor="#ff0000"
              title="Chargement..."
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00" />
          }>

          <View key="restaurant_image" style={styles.header}>
            <Carousel
              key="carouselRestaurant"
              ref="carouselRestaurant" 
              style={{
                flexDirection: 'row',
                flex: 1,
                position: 'relative'
              }}>
              {_.map(restaurant.pictures, (picture) => {
                return (
                  <RestaurantElement
                    key={picture}
                    name={restaurant.name}
                    picture={picture}
                    type={restaurant.food[1]}
                    height={250}
                    budget={restaurant.price_range} />
                );
              })}
            </Carousel>
          </View>

          <View key="restaurant_call_top" style={[styles.callContainer]}>
            <Text key="call_text" style={styles.reservationText}>Réserver une table</Text>
            <Button key="call_button" style={styles.button} label="Appeler" onPress={this.call} />
          </View>

          <View key="restaurant_recommenders" style={styles.recoContainer}>
            {_.remove(RestaurantsStore.getRecommenders(restaurant.id), function(id) {return id !== 553;}).length ?
              <View key="restaurant_recommenders_wrapper" >
                <Text key="recommnders_text" style={styles.containerTitle}>Ils l'ont recommandé</Text>
                <View key="carousel_container" style={{alignItems: 'center'}}>
                  {_.remove(RestaurantsStore.getRecommenders(restaurant.id), function(id) {return id !== 553;}).length === 1 ?
                    [
                      <Carousel
                        key="carouselReco"
                        ref="carouselReco" 
                        style={{
                          flexDirection: 'row',
                          height: 80,
                          width: 80,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent'
                        }} 
                        elemSize={80}
                        insetMargin={0} 
                        onPageChange={(i) => {
                          this.setState({
                            reviewSelected: RestaurantsStore.getRecommenders(restaurant.id)[0]
                          });
                      }}>
                        {_.map(_.remove(RestaurantsStore.getRecommenders(restaurant.id), function(id) {return id !== 553;}), (userId) => {
                          var profil = ProfilStore.getProfil(userId);
                          var source = profil ? {uri: profil.picture} : {};

                          return (
                            <View key={"profile_container_" + userId} style={styles.avatarWrapper}>
                              <Image key={"profile_" + userId} style={styles.avatar} source={source} />
                            </View>
                          );
                        })}
                      </Carousel>
                    ] : [
                      <Carousel
                        key="carouselReco"
                        ref="carouselReco"
                        style={{
                          flexDirection: 'row',
                          height: 80,
                          width: 240,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent'
                        }}
                        elemSize={80}
                        insetMargin={80}
                        leftFlecheStyle={{marginLeft: -35}}
                        rightFlecheStyle={{right: 0}}
                        onPageChange={(i) => {
                          this.setState({
                            reviewSelected: _.remove(RestaurantsStore.getRecommenders(restaurant.id), function(id) {return id !== 553;})[i + 1]
                          });
                      }}>
                        {_.map(_.remove(RestaurantsStore.getRecommenders(restaurant.id), function(id) {return id !== 553;}), (userId) => {
                          var profil = ProfilStore.getProfil(userId);
                          var source = profil ? {uri: profil.picture} : {};

                          return (
                            <View key={"profile_container_" + userId} style={styles.avatarWrapper}>
                              <Image key={"profile_" + userId} style={styles.avatar} source={source} />
                            </View>
                          );
                        })}
                      </Carousel>
                    ]
                  }
                </View>
              </View>
              : [ restaurant.score <= 5 ?
                <View key="review_needl" style={{alignItems: 'center', marginBottom: 10}}>
                  <View key="profile_container_553" style={[styles.avatarWrapper, {backgroundColor: '#EF582D'}]}>
                    <TouchableHighlight onPress={this.onPressText} underlayColor='rgba(0, 0, 0, 0)'>
                      <Image key="profile_553" style={styles.avatarNeedl} source={require('../../assets/img/tabs/icons/home.png')} />
                    </TouchableHighlight>
                  </View>
                  <View key="needl_review" style={styles.reviewNeedl}>
                    <Text key="recommendation_text" style={[styles.reviewText, {textDecorationLine: 'underline'}]} onPress={this.onPressText}>Labellisé valeur sûre par Needl (+)</Text>
                  </View>
                </View>
                : <Text key="no_recommenders" style={styles.containerTitle}>Aucun ami ne l'a recommandé</Text>
              ]
            }
            {(RestaurantsStore.getRecommenders(restaurant.id).length  && _.keys(restaurant.reviews).length && restaurant.reviews[this.state.reviewSelected]) ?
              <View key="restaurant_recommenders_reviews" style={styles.reviewBox}>
                <View style={styles.triangleContainer}>
                  <View style={styles.triangle} />
                </View>
                <Text key="recommendation_text" style={styles.reviewText}>{restaurant.reviews[this.state.reviewSelected][0] || 'Je recommande !'}</Text>
                <Text key="recommendation_author" style={styles.reviewAuthor}>{ProfilStore.getProfil(this.state.reviewSelected) && ProfilStore.getProfil(this.state.reviewSelected).name}</Text>
              </View>
              : null}

            {!_.contains(RestaurantsStore.getRecommenders(restaurant.id), MeStore.getState().me.id) ?
              <Option
                key="recommandation_button"
                style={styles.recoButton}
                label={'Je recommande'}
                icon={require('../../assets/img/actions/icons/japprouve.png')}
                onPress={() => {this.approuve(false);}} />
              : null}
          </View>

          {RestaurantsStore.getRecommenders(restaurant.id).length && restaurant.ambiences && restaurant.ambiences.length ?
            <View key="restaurant_ambiences" style={styles.wishContainer}>
              <Text key="restaurant_ambiences_text" style={styles.containerTitle}>Ambiances</Text>
              <View key="restaurant_ambiences_slice1" style={styles.toggleBox}>
                {_.map(restaurant.ambiences.slice(0, 3), (ambiance) => {
                  return this.getToggle(RestaurantsStore.MAP_AMBIENCES, ambiance, "#444444");
                })}
              </View>
            </View>
            : null
          }

          {RestaurantsStore.getRecommenders(restaurant.id).length && restaurant.strengths && restaurant.strengths.length ?
            <View key="restaurant_strengths" style={styles.recoContainer}>
              <Text key="restaurant_strengths_text" style={styles.containerTitle}>Points forts</Text>
              <View key="restaurant_strengths_slice1" style={styles.toggleBox}>
                {_.map(restaurant.strengths.slice(0, 3), (strength) => {
                	return this.getToggle(RestaurantsStore.MAP_STRENGTHS, strength, "#444444");
                })}
              </View>
            </View>
            : null}
          
          <View key="restaurant_wishlist" style={styles.wishContainer}>
            {_.remove(RestaurantsStore.getWishers(restaurant.id), function(id) {return id !== MeStore.getState().me.id;}).length ?
              <View key="restaurant_wishlist_wrapper" style={{alignItems: 'center'}}>
                <Text key="restaurant_wishlist_text" style={styles.containerTitle}>Ils ont envie d'y aller</Text>        
                {_.remove(RestaurantsStore.getWishers(restaurant.id), function(id) {return id !== MeStore.getState().me.id;}).length === 1 ?
                  [
                    <Carousel 
                      key="carouselWish"
                      ref="carouselWish"
                      style={{
                        flexDirection: 'row',
                        height: 80,
                        width: 80,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent'
                      }}
                      elemSize={80}
                      insetMargin={0}>
                      {_.map(_.remove(RestaurantsStore.getWishers(restaurant.id), function(id) {return id !== MeStore.getState().me.id;}), (userId) => {
                        var profil = ProfilStore.getProfil(userId);
                        var source = profil ? {uri: profil.picture} : {};

                        return (
                          <View key={"profile_container_" + userId} style={styles.avatarWrapper}>
                            <Image key={"profile_" + userId} style={styles.avatar} source={source} />
                          </View>
                        );
                      })}
                    </Carousel>
                  ] : [
                    <Carousel 
                      key="carouselWish"
                      ref="carouselWish"
                      style={{
                        flexDirection: 'row',
                        height: 80,
                        width: 240,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent'
                      }}
                      elemSize={80}
                      insetMargin={80}
                      leftFlecheStyle={{marginLeft: -35}}
                      rightFlecheStyle={{right: 0}}>
                      {_.map(_.remove(RestaurantsStore.getWishers(restaurant.id), function(id) {return id !== MeStore.getState().me.id;}), (userId) => {
                        var profil = ProfilStore.getProfil(userId);
                        var source = profil ? {uri: profil.picture} : {};

                        return (
                          <View key={"profile_container_" + userId} style={styles.avatarWrapper}>
                            <Image key={"profile_" + userId} style={styles.avatar} source={source} />
                          </View>
                        );
                      })}
                    </Carousel>
                  ]
                }
              </View>
            : <Text key="no_wishlist" style={styles.containerTitle}>Pas encore d'ami qui veut y aller</Text>}

            {(!_.contains(RestaurantsStore.getWishers(restaurant.id), MeStore.getState().me.id) &&
                      !_.contains(RestaurantsStore.getRecommenders(restaurant.id), MeStore.getState().me.id)) ?
              <View>
                <Text key="no_wishlist" style={styles.containerTitle}>Ajouter sur votre wishlist</Text>
                <Option
                  key="wihlist_button"
                  style={styles.recoButton}
                  label={RestaurantsStore.loading() ? 'Enregistrement...' : 'Sur ma wishlist'}
                  icon={require('../../assets/img/actions/icons/aessayer.png')}
                  onPress={() => {
                    if (RestaurantsStore.loading()) {
                      return;
                    }
                    RestaurantsActions.addWish(restaurant);
                  }} />
              </View>
            : null}
          </View>

          {RestaurantsStore.hasMenu(restaurant.id) ?
            <View key="restaurant_menu" style={styles.recoContainer}>
              <Text style={styles.containerTitle}>Sélection du chef</Text>
              {RestaurantsStore.hasMenuEntree(restaurant.id) ?
                <View key="menu_starter" style={styles.menuInnerContainer}>
                  <Text style={styles.menuTitle}>Entrées</Text>
                  {restaurant.starter1 ? <Text style={styles.menuPlat}>{restaurant.starter1}</Text> : null}
                  {restaurant.description_starter1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_starter1}</Text> : null}
                  {restaurant.price_starter1 ? <Text style={[styles.menuPlat, {marginBottom: 5}]}>{restaurant.price_starter1}€</Text> : null}
                  
                  {restaurant.starter2 ? <Text style={styles.menuPlat}>{restaurant.starter2}</Text> : null}
                  {restaurant.description_starter2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_starter2}</Text> : null}
                  {restaurant.price_starter2 ? <Text style={styles.menuPlat}>{restaurant.price_starter2}€</Text> : null}
                </View>
                : null}
              {RestaurantsStore.hasMenuMainCourse(restaurant.id) ?
                <View key="menu_main_course" style={styles.menuInnerContainer}>
                  <Text style={styles.menuTitle}>Plats</Text>
                  {restaurant.main_course1 ? <Text style={styles.menuPlat}>{restaurant.main_course1}</Text> : null}
                  {restaurant.description_main_course1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course1}</Text> : null}
                  {restaurant.price_main_course1 ? <Text style={[styles.menuPlat, {marginBottom: 5}]}>{restaurant.price_main_course1}€</Text> : null}

                  {restaurant.main_course2 ? <Text style={styles.menuPlat}>{restaurant.main_course2}</Text> : null}
                  {restaurant.description_main_course2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course2}</Text> : null}
                  {restaurant.price_main_course2 ? <Text style={[styles.menuPlat, {marginBottom: 5}]}>{restaurant.price_main_course2}€</Text> : null}

                  {restaurant.main_course3 ? <Text style={styles.menuPlat}>{restaurant.main_course3}</Text> : null}
                  {restaurant.description_main_course3 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_main_course3}</Text> : null}
                  {restaurant.price_main_course3 ? <Text style={styles.menuPlat}>{restaurant.price_main_course3}€</Text> : null}
                </View>
                : null}
              {RestaurantsStore.hasMenuDessert(restaurant.id) ?
                <View key="menu_dessert" style={styles.menuInnerContainer}>
                  <Text style={styles.menuTitle}>Desserts</Text>
                  {restaurant.dessert1 ? <Text style={styles.menuPlat}>{restaurant.dessert1}</Text> : null}
                  {restaurant.description_dessert1 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_dessert1}</Text> : null}
                  {restaurant.price_dessert1 ? <Text style={[styles.menuPlat, {marginBottom: 5}]}>{restaurant.price_dessert1}€</Text> : null}

                  {restaurant.dessert2 ? <Text style={styles.menuPlat}>{restaurant.dessert2}</Text> : null}
                  {restaurant.description_dessert2 ? <Text style={[styles.menuPlat, styles.menuDescription]} customFont={true}>{restaurant.description_dessert2}</Text> : null}
                  {restaurant.price_dessert2 ? <Text style={styles.menuPlat}>{restaurant.price_dessert2}€</Text> : null}
                </View>
                : null}
            </View>
            : null
          }

          <View key="restaurant_infos" style={[styles.lieuContainer, RestaurantsStore.hasMenu(restaurant.id) ? {backgroundColor: '#E0E0E0'} : {}]}>
            <Text key="restaurant_location" style={styles.containerTitle}>Lieu</Text>
            <Text key="restaurant_adress" style={styles.address}>{restaurant.address}</Text>
            <View key="restaurant_subway_wrapper" style={styles.metroContainer}>
              <Image key="subway_image" source={require('../../assets/img/other/icons/metro.png')} style={styles.metroImage} />
              <Text key="restaurant_subway" style={styles.metroText}>{RestaurantsStore.closestSubwayName(restaurant.id)}</Text>
            </View>
          </View>

          <MapView
            key="restaurant_map"
            ref="mapview"
            style={styles.mapContainer} 
            region={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            }}>
              <MapView.Marker
                ref={restaurant.id}
                key={restaurant.id}
                coordinate={{latitude: restaurant.latitude, longitude: restaurant.longitude}}
                pinColor='red'>
                <MapView.Callout>
                  <View>
                    <Text>{restaurant.name}</Text>
                  </View>
                </MapView.Callout>
              </MapView.Marker>
          </MapView>

          <View key="restaurant_call_bottom" style={styles.callContainer}>
            <Text key="call_text" style={styles.reservationText}>Réserver une table</Text>
            <Button key="call_button" style={styles.button} label="Appeler" onPress={this.call} />
          </View>

          {(_.contains(RestaurantsStore.getWishers(restaurant.id), MeStore.getState().me.id) ||
                      _.contains(RestaurantsStore.getRecommenders(restaurant.id), MeStore.getState().me.id)) ?
            <Options key="restaurant_buttons" >
              {_.contains(RestaurantsStore.getWishers(restaurant.id), MeStore.getState().me.id) ?
              [
                <Option
                  key="wihlist_remove"
                  label={RestaurantsStore.loading() ? 'Suppression...' : 'Retirer de ma wishlist'}
                  icon={require('../../assets/img/actions/icons/unlike.png')}
                  onPress={() => {
                    if (RestaurantsStore.loading()) {
                      return;
                    }
                    RestaurantsActions.removeWish(restaurant, () => {
                      if (!RestaurantsStore.isSearchable(restaurant.id)) {
                        this.props.navigator.pop();
                      }
                    });
                  }} />
              ]
              :
              [
                <Option key="reco_modification" label="Modifier ma reco" icon={require('../../assets/img/actions/icons/modify.png')} onPress={() => {
                  this.approuve(true);
                }} />,
                <Option
                  key="reco_remove"
                  label={RestaurantsStore.loading() ? 'Suppression...' : 'Supprimer ma reco'}
                  icon={require('../../assets/img/actions/icons/poubelle.png')}
                  onPress={() => {
                    if (RestaurantsStore.loading()) {
                      return;
                    }
                    RestaurantsActions.removeReco(restaurant, () => {
                      if (!RestaurantsStore.isSearchable(restaurant.id)) {
                        this.props.navigator.pop();
                      }
                    });
                  }} />
              ]
              }
            </Options>
            : null }
        </ScrollView>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  header: {
    flex: 1,
    position: 'relative',
    height: 250
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
    marginBottom: 15,
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
    color: '#444444'
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
  avatarNeedl: {
    height: 40,
    width: 40,
    margin: 10
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
