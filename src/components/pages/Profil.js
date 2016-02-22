'use strict';

import React, {ActivityIndicatorIOS, Animated, Dimensions, Image, NativeModules, Platform, ProgressBarAndroid, RefreshControl, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Collapsible from 'react-native-collapsible';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';
import Options from '../elements/Options';
import Option from '../elements/Option';

import LoginActions from '../../actions/LoginActions';
import MeActions from '../../actions/MeActions';
import ProfilActions from '../../actions/ProfilActions';
import FriendsActions from '../../actions/FriendsActions';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import FriendsStore from '../../stores/Friends';
import RestaurantsStore from '../../stores/Restaurants';

import Restaurant from './Restaurant';
import EditMe from './EditMe';
import Friends from './Friends';
import CarteProfil from './CarteProfil';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

let BUTTON_HEIGHT = 40;

class Profil extends Page {
  static route(props) {
    return {
      component: Profil,
      title: 'Profil',
      passProps: props,
    };
  };

  currentProfil() {
    return this.props.id || MeStore.getState().me.id;
  };

  profilState() {
    return {
      profile: ProfilStore.getProfil(this.currentProfil()),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.profilState();
    this.state.isOpened = false;
    this.state.recommendationActive = true;
    this.state.wishlistActive = false;
  };

  componentWillMount() {
    ProfilStore.listen(this.onProfilsChange);
  };

  componentWillUnmount() {
    ProfilStore.unlisten(this.onProfilsChange);
  };

  onProfilsChange = () => {
    this.setState(this.profilState());
  };

  showButtons = () => {
    if (this.state.isOpened) {
      this.setState({isOpened: false})
    } else {
      this.setState({isOpened: true});
    } 
  };

  onPressRestaurant = (from) => {
    if (from === 'wishlist') {
      this.setState({wishlistActive: true});
      this.setState({recommendationActive: false});
    }

    if (from === 'recommendation') {
      this.setState({recommendationActive: true});
      this.setState({wishlistActive: false});
    }
  };

  renderPage() {
    var profil = this.state.profile;

    return (
      <View style={{flex: 1}}>
        {!this.props.id ? [
          <NavigationBar key='navbarfromtab' image={require('../../assets/img/other/icons/map.png')} title={profil.fullname} rightButtonTitle='Carte' onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: MeStore.getState().me.id}))} />
        ] : [
          <NavigationBar key='navbarfrompush' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} image={require('../../assets/img/other/icons/map.png')} title={profil.fullname} rightButtonTitle='Carte' onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: this.props.id}))} />
        ]}
        <ScrollView
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          onScroll={this.onScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.onRefresh}
              tintColor='#EF582D'
              title='Chargement...'
              colors={['#FFFFFF']}
              progressBackgroundColor='rgba(0, 0, 0, 0.5)' />
          }>

          <View style={styles.infoContainer}>
            <Image source={{uri: profil.picture}} style={styles.image} />
            <View style={styles.textInfoContainer}>
              <Text style={styles.profilBadge}>{profil.name}</Text>
              <Text style={styles.profilRemerciements}>{profil.recommendations.length} recommendation{profil.recommendations.length > 1 ? 's' : ''}</Text>
            </View>
            {/* <Image source={{uri: profil.picture}} style={styles.badgeImage} /> */}
          </View>

          <View style={styles.actionContainer}>
            {MeStore.getState().me.id === profil.id ? [
              <TouchableHighlight
                underlayColor='rgba(0, 0, 0, 0)'
                key={'edit_' + profil.id}
                style={[styles.leftButtonContainer, {borderColor: '#AAAAAA'}]}
                onPress={() => this.props.navigator.push(EditMe.route())}>
                <Text style={[styles.buttonText, {marginTop: 0}]}>Modifier mon profil</Text>
              </TouchableHighlight>
            ] : [
              !profil.invisible ? [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.leftButtonContainer, {backgroundColor: '#38E1B2', borderColor: '#38E1B2'}]}
                  key={'hide_reco_' + profil.id}
                  onPress={() => {
                    if (ProfilStore.loading()) {
                      return;
                    }
                    ProfilActions.maskProfil(profil.id);
                  }}>
                  <Text style={styles.buttonText}>{ProfilStore.loading() ? 'Masque...' : 'Apparait dans mes recos'}</Text>
                </TouchableHighlight>
              ] : [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.leftButtonContainer, {backgroundColor: 'red', borderColor: 'red'}]}
                  key={'show_reco_' + profil.id}
                  onPress={() => {
                    if (ProfilStore.loading()) {
                      return;
                    }
                    ProfilActions.displayProfil(profil.id);
                  }}>
                  <Text style={[styles.buttonText, {color: '#FFFFFF'}]}>{ProfilStore.loading() ? 'Affichage...' : 'N\'apparait pas dans mes recos'}</Text>
                </TouchableHighlight>
              ]
            ]}
            <TouchableHighlight
              underlayColor='rgba(0, 0, 0, 0)'
              style={styles.rightButtonContainer}
              key={'dropdown_' + profil.id}
              onPress={this.showButtons}>
              <View style={styles.triangle} />
            </TouchableHighlight>
          </View>

          <Collapsible duration={500} align='center' collapsed={!this.state.isOpened}>
            {MeStore.getState().me.id === profil.id ? [
              <View key={'buttons_' + profil.id}>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.dropdownButton}
                  key={"contact" + profil.id}
                  onPress={this.contactUs}>
                  <View style={{flexDirection: 'row'}}>
                    <Image source={require('../../assets/img/actions/icons/chat.png')} style={{tintColor: '#555555', height: 20, width: 20, marginLeft: 5, marginRight: 20}} />
                    <Text style={[styles.buttonText, {marginTop: 3}]}>Nous contacter</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.dropdownButton}
                  key={"logout_" + profil.id}
                  onPress={() => LoginActions.logout}>
                  <View style={{flexDirection: 'row'}}>
                    <Image source={require('../../assets/img/actions/icons/signout.png')} style={{tintColor: '#555555', height: 20, width: 20, marginLeft: 5, marginRight: 20}} />
                    <Text style={[styles.buttonText, {marginTop: 3}]}>Me Déconnecter</Text>
                  </View>
                </TouchableHighlight>
              </View>
            ] : [
              <View key={'buttons_' + profil.id}>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.dropdownButton}
                  key={'delete_friend_' + profil.id}
                  onPress={() => {
                    if (FriendsStore.loading()) {
                      return;
                    }
                    FriendsActions.removeFriendship(profil.id, () => {
                      this.props.navigator.resetTo(Friends.route());
                    });
                    this.forceUpdate();
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Image source={require('../../assets/img/actions/icons/retirer.png')} style={{tintColor: '#555555', height: 20, width: 20, marginLeft: 5, marginRight: 20}} />
                    <Text style={[styles.buttonText, {marginTop: 3}]}>{FriendsStore.loading() ? 'Suppression...' : 'Retirer de mes amis'}</Text>
                  </View>
                </TouchableHighlight>
              </View>
            ]}
          </Collapsible>
         
          <View style={styles.restaurantButtonsContainer}>
            <TouchableHighlight 
              style={[styles.restaurantButton, {backgroundColor: this.state.recommendationActive ? '#EF582D' : 'transparent'}]}
              onPress={() => this.onPressRestaurant('recommendation')}>
              <Text style={{color: this.state.recommendationActive ? '#FFFFFF' : '#EF582D'}}>Recommendation{profil.recommendations.length > 1 ? 's' : ''}</Text>
            </TouchableHighlight>
            <TouchableHighlight 
              style={[styles.restaurantButton, {backgroundColor: this.state.wishlistActive ? '#EF582D' : 'transparent'}]}
              onPress={() => this.onPressRestaurant('wishlist')}>
              <Text style={{color: this.state.wishlistActive ? '#FFFFFF' : '#EF582D'}}>Wishlist</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.restaurantsContainer}>
            {profil.recommendations.length && this.state.recommendationActive ?
              _.map(profil.recommendations, (id) => {
                var restaurant = RestaurantsStore.getRestaurant(id);
                return (
                  <RestaurantElement
                    height={200}
                    style={{marginBottom: 5, backgroundColor: 'transparent'}}
                    key={restaurant.id}
                    name={restaurant.name}
                    picture={restaurant.pictures[0]}
                    type={restaurant.food[1]}
                    budget={restaurant.price_range}
                    underlayColor='#EEEEEE'
                    onPress={() => {
                      this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                    }}/>
                  );
              })
            : null}

            {profil.wishes.length && this.state.wishlistActive ?
              _.map(profil.wishes, (id) => {
                var restaurant = RestaurantsStore.getRestaurant(id);
                return (
                  <RestaurantElement
                    height={200}
                    style={{marginBottom: 5, backgroundColor: 'transparent'}}
                    key={restaurant.id}
                    name={restaurant.name}
                    picture={restaurant.pictures[0]}
                    type={restaurant.food[1]}
                    budget={restaurant.price_range}
                    underlayColor='#EEEEEE'
                    onPress={() => {
                      this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                    }}/>
                  );
              })
            : null}
          </View>

        </ScrollView>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInfoContainer: {
    flex: 1,
    marginLeft: 15
  },
  image: {
    height: 70,
    width: 70,
  },
  badgeImage: {
    height: 70,
    width: 70,
    borderRadius: 35
  },
  profilBadge: {
    color: '#000000',
    fontSize: 15,
    backgroundColor: 'transparent',
    marginBottom: 5
  },
  profilRemerciements: {
    color: '#444444',
    fontSize: 12,
    backgroundColor: 'transparent'
  },
  actionContainer: {
    flexDirection: 'row'
  },
  leftButtonContainer: {
    flex: 1,
    height: 25,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    marginRight: 5,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightButtonContainer: {
    width: 25,
    height: 25,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 5,
    borderRadius: 5,
    borderColor: '#AAAAAA',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
   triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#AAAAAA',
    transform: [
      {rotate: '180deg'}
    ]
  },
  buttonContainer: {
    flex: 1
  },
  buttonText: {
    color: '#555555',
    fontSize: 13,
  },
  dropdownButton: {
    padding: 10,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  restaurantButtonsContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#EF582D',
    borderRadius: 5
  },
  restaurantButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Profil;
