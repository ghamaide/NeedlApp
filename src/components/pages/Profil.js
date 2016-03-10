'use strict';

import React, {ActivityIndicatorIOS, Animated, Dimensions, Image, NativeModules, Platform, ProgressBarAndroid, RefreshControl, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Collapsible from 'react-native-collapsible';
import RNComm from 'react-native-communications';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import RestaurantElement from '../elements/Restaurant';

import FollowingsActions from '../../actions/FollowingsActions';
import FriendsActions from '../../actions/FriendsActions';
import LoginActions from '../../actions/LoginActions';
import MeActions from '../../actions/MeActions';
import ProfilActions from '../../actions/ProfilActions';

import FollowingsStore from '../../stores/Followings';
import FriendsStore from '../../stores/Friends';
import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import CarteProfil from './CarteProfil';
import EditMe from './EditMe';
import Friends from './Friends';
import Restaurant from './Restaurant';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

let IMAGE_HEIGHT = 90;
let BADGE_IMAGE_HEIGHT = 50;
let INNER_BANNER_HEIGHT = IMAGE_HEIGHT - 40;
let MARGIN_LEFT = 15;
let MARGIN_TOP = 20;
let TEXT_INFO_WIDTH = Dimensions.get('window').width - IMAGE_HEIGHT - BADGE_IMAGE_HEIGHT / 2;

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
    this.state.private = true;
    this.state.menu_opened = false;
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

  onRefresh = () => {
    ProfilActions.fetchProfil(this.currentProfil());
  };

  contactUs = () => {
    RNComm.email(['contact@needl-app.com'], '', '', 'J\'ai une question !', '');
  };

  onPressMenuPublic = () => {
    if (this.state.private) {
      this.setState({private: false});
    }
  };

  onPressMenuPrivate = () => {
    if (!this.state.private) {
      this.setState({private: true});
    }
  };

  renderPage() {
    var profil = this.state.profile;

    var first_name = profil.fullname.split(" ")[0];
    var last_name = profil.fullname.split(" ")[1] || '';

    var friendsIds = _.map(ProfilStore.getFriends(), (friend) => {
      return friend.id
    });

    var is_following = !_.includes(friendsIds, profil.id) && MeStore.getState().me.id !== profil.id;

    return (
      <View style={{flex: 1}}>
        {!this.props.id ? [
          <NavigationBar 
            key='navbarfromtab'
            type='switch'
            active={this.state.private}
            title_left={'Privé'}
            title_right={'Public'}
            onPressLeft={this.onPressMenuPrivate}
            onPressRight={this.onPressMenuPublic}
            rightImage={require('../../assets/img/other/icons/map.png')}
            rightButtonTitle='Carte'
            onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({toggle: this.props.toggle, has_shared: this.props.has_shared, pastille_notifications: this.props.pastille_notifications}))} />
        ] : [
          <NavigationBar 
            key='navbarfrompush'
            type='back'
            title={profil.fullname || profil.name}
            leftButtonTitle='Retour'
            onLeftButtonPress={() => this.props.navigator.pop()}
            rightImage={require('../../assets/img/other/icons/map.png')}
            rightButtonTitle='Carte'
            onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: this.props.id}))} />
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
            <View style={styles.infoInnerContainer}>
              <View style={styles.textInfoContainer}>
                <View style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                  <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                    {ProfilStore.getFriends().length}
                  </Text>
                  <Text style={[styles.textInfoText, {top: 20}]}>
                    ami{ProfilStore.getFriends().length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                  <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                    {profil.followings.length}
                  </Text>
                  <Text style={[styles.textInfoText, {top: 20}]}>
                    expert{profil.followings.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.textInfo}>
                  <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                    {profil.score}
                  </Text>
                  <Text style={[styles.textInfoText, {top: 20}]}>
                    merci{profil.score > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.badgeInfoContainer}>
              <Text style={styles.badgeName}>Créateur</Text>
              <Text style={styles.badgeDescription} numberOfLines={3}>Tu es créateur d'inspirations, tu peux faire ci et faire ca et puis ci et puis ca et puis tout ci et puis tout ca</Text>
            </View>
            <Image source={{uri: profil.picture}} style={styles.image} />
            <Image source={{uri: profil.picture}} style={styles.badgeImage} />
            <View style={styles.profileNameContainer}>
              <Text style={[styles.profileName, {top: 10}]}>
                {first_name}
              </Text>
              <Text style={[styles.profileName, {top: 25, fontWeight: '500'}]}>
                {last_name}
              </Text>
            </View>
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
              !is_following ? [
                !profil.invisible ? [
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={[styles.leftButtonContainer, {backgroundColor: '#38E1B2', borderColor: '#38E1B2'}]}
                    key={'hide_reco_' + profil.id}
                    onPress={() => {
                      if (ProfilStore.loading()) {
                        return;
                      }
                      FriendsActions.maskProfil(profil.friendship_id);
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
                      FriendsActions.displayProfil(profil.friendship_id);
                    }}>
                    <Text style={[styles.buttonText, {color: '#FFFFFF'}]}>{ProfilStore.loading() ? 'Affichage...' : 'N\'apparait pas dans mes recos'}</Text>
                  </TouchableHighlight>
                ]
              ] : [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.leftButtonContainer, {backgroundColor: 'white', borderColor: '#38E1B2'}]}
                  key={'unfollow_' + profil.id}
                  onPress={() => {
                    if (FollowingsStore.loading()) {
                      return;
                    }
                    FollowingsActions.unfollowExpert(profil.followership_id, () => {
                      this.props.navigator.pop();
                    });
                    this.forceUpdate();
                  }}>
                  <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Image source={require('../../assets/img/actions/icons/check.png')} style={{tintColor: '#38E1B2', width: 20, height: 20, marginRight: 10}} />
                    <Text style={[styles.buttonText, {fontWeight: '500', fontSize: 13, color: '#38E1B2'}]}>Suivi</Text>
                  </View>
                </TouchableHighlight>
              ]
            ]}
            {!is_following ? [
              Platform.OS === 'ios' ? [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.rightButtonContainer, {backgroundColor: MeStore.getState().me.id === profil.id ? 'transparent' : (profil.invisible ? 'red' : '#38E1B2')}]}
                  key={'dropdown_' + profil.id}
                  onPress={this.showButtons}>
                    <View style={styles.triangle} />
                </TouchableHighlight>
              ] : [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.rightButtonContainer, {backgroundColor: MeStore.getState().me.id === profil.id ? 'transparent' : (profil.invisible ? 'red' : '#38E1B2')}]}
                  key={'dropdown_' + profil.id}
                  onPress={this.showButtons}>
                  <Image source={require('../../assets/img/other/icons/triangle_down.png')} style={{transform: [{rotate: '180deg'}], height: 10, width: 10, tintColor: '#AAAAAA'}} />              
                </TouchableHighlight>
              ]
            ] : null}
          </View>

          {!is_following ? [
            <Collapsible key='dropdown_menu' duration={500} align='center' collapsed={!this.state.isOpened}>
              {MeStore.getState().me.id === profil.id ? [
                <View key={'buttons_' + profil.id}>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.dropdownButton}
                    key={'contact' + profil.id}
                    onPress={this.contactUs}>
                    <View style={{flexDirection: 'row'}}>
                      <Image source={require('../../assets/img/actions/icons/chat.png')} style={{tintColor: '#555555', height: 20, width: 20, marginLeft: 5, marginRight: 20}} />
                      <Text style={[styles.buttonText, {marginTop: 3}]}>Nous contacter</Text>
                    </View>
                  </TouchableHighlight>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.dropdownButton}
                    key={'logout_' + profil.id}
                    onPress={() => LoginActions.logout()}>
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
                      FriendsActions.removeFriendship(profil.friendship_id, () => {
                        this.props.navigator.pop();
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
          ] : null}
         
          {!is_following ? [ 
            <View key='switch_buttons' style={styles.restaurantButtonsContainer}>
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
          ] : [
            <View key='recommendation_title_container' style={{margin: 15, alignItems: 'center', justifyContent: 'center', flex: 1}}>
              <Text style={{textAlign: 'center', fontSize: 15, color: '#EF582D', fontWeight: '500'}}>Ses recommendations</Text>
            </View>
          ]}

          <View style={styles.restaurantsContainer}>
            {this.state.recommendationActive ? [
              profil.recommendations.length ? [
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
              ] : [
                <Text style={styles.emptyText}>Recommande les restaurants que tu as aimés et bénéficie d'une suggestion de restaurants personnalisée !</Text>
              ]
            ] : null}

            {this.state.wishlistActive ? [
              profil.wishes.length ? [
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
              ] : [
                <Text style={styles.emptyText}>Construis ta propre liste de restaurants en les ajoutant à ta wishlist !</Text>
              ]
            ] : null}
          </View>

        </ScrollView>

        {!this.props.id ? [
          <MenuIcon key='menu_icon' pastille={this.props.pastille_notifications} has_shared={this.props.has_shared} onPress={this.props.toggle} />
        ] : null}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    padding: 0,
    alignItems: 'flex-end' 
  },
  infoInnerContainer: {
    width: Dimensions.get('window').width,
    height: INNER_BANNER_HEIGHT,
    marginTop: MARGIN_TOP,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(254, 48, 57, 0.1)',
  },
  textInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: TEXT_INFO_WIDTH,
    marginTop: 5,
    height: INNER_BANNER_HEIGHT - 10,
  },
  textInfo: {
    width: TEXT_INFO_WIDTH / 3,
    height: INNER_BANNER_HEIGHT - 10,
    borderColor: '#FFFFFF',
  },
  textInfoText: {
    flex: 1,
    position: 'absolute',
    left: 1,
    right: 1,
    color: '#000000',
    fontSize: 12,
    textAlign: 'center',
  },
  badgeInfoContainer: {
    width: TEXT_INFO_WIDTH - BADGE_IMAGE_HEIGHT / 2 - 5,
    height: 70,
    marginTop: 5,
    backgroundColor: 'transparent',
    padding: 5
  },
  badgeName: {
    fontWeight: '500',
    fontSize: 13
  },
  badgeDescription: {
    fontSize: 12,
    marginTop: 3
  },
  image: {
    position: 'absolute',
    top: MARGIN_TOP / 2,
    left: MARGIN_LEFT,
    height: IMAGE_HEIGHT,
    width: IMAGE_HEIGHT,
    borderRadius: 12
  },
  badgeImage: {
    position: 'absolute',
    top: IMAGE_HEIGHT + MARGIN_TOP / 2 - BADGE_IMAGE_HEIGHT / 2,
    left: IMAGE_HEIGHT + MARGIN_LEFT - BADGE_IMAGE_HEIGHT / 2 + 10,
    height: BADGE_IMAGE_HEIGHT,
    width: BADGE_IMAGE_HEIGHT,
    borderRadius: BADGE_IMAGE_HEIGHT / 2
  },
  profileNameContainer: {
    position: 'absolute',
    top: IMAGE_HEIGHT + MARGIN_TOP / 2,
    left: MARGIN_LEFT,
    width: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  profileName: {
    position: 'absolute',
    left: 0,
    width: IMAGE_HEIGHT,
    color: '#000000',
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingLeft: 5,
    paddingRight: 5
  },
  leftButtonContainer: {
    flex: 1,
    height: 25,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightButtonContainer: {
    width: 25,
    height: 25,
    margin: 5,
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
  },
  emptyText: {
    color: '#EF582D',
    textAlign: 'center',
    padding: 20,
    fontSize: 14
  }
});

export default Profil;
