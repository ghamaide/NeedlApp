'use strict';

import React, {ActivityIndicatorIOS, Animated, Dimensions, Image, NativeModules, Platform, ProgressBarAndroid, RefreshControl, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Collapsible from 'react-native-collapsible';
import CustomActionSheet from 'react-native-custom-action-sheet';
import RNComm from 'react-native-communications';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import RestaurantElement from '../elements/Restaurant';
import Overlay from '../elements/Overlay';

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
let MARGIN_LEFT = 10;
let MARGIN_TOP = 20;
let TEXT_INFO_WIDTH = Dimensions.get('window').width - IMAGE_HEIGHT - BADGE_IMAGE_HEIGHT / 2 + 10;

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
      followingsLoading: FollowingsStore.loading(),
      friendsLoading: FriendsStore.loading(),
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
    this.state.confirmation_opened = false;
  };

  componentWillMount() {
    FollowingsStore.listen(this.onProfilsChange);
    ProfilStore.listen(this.onProfilsChange);
  };

  componentWillUnmount() {
    FollowingsStore.unlisten(this.onProfilsChange);
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
    this.setState({confirmation_opened: false});
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
              tintColor='#FE3139'
              title='Chargement...'
              colors={['#FFFFFF']}
              progressBackgroundColor='rgba(0, 0, 0, 0.5)' />
          }>

          <View style={styles.infoContainer}>
            <View style={styles.infoInnerContainer}>
              <View style={styles.textInfoContainer}>
                <View style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                  <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                    {profil.recommendations.length}
                  </Text>
                  <Text style={[styles.textInfoText, {top: 20}]}>
                    ami{profil.recommendations.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                  <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                    {profil.followings.length}
                  </Text>
                  <Text style={[styles.textInfoText, {top: 20}]}>
                    influenceur{profil.followings.length > 1 ? 's' : ''}
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

            {/* Container for badge information */}
            <View style={styles.badgeInfoContainer}>
              <Text style={styles.badgeName}>{profil.badge.name}</Text>
              <Text style={styles.badgeDescription} numberOfLines={3}>Tu es créateur d'inspirations, tu peux faire ci et faire ca et puis ci et puis ca et puis tout ci et puis tout ca</Text>
            </View>

            {/* Profile Image */}
            <Image source={{uri: profil.picture}} style={styles.image} />

            {/* Badge Image */}
            <Image source={profil.badge.image} style={styles.badgeImage} />

            {/* Container for actions on profile */}
            <View style={styles.actionContainer}>
              {MeStore.getState().me.id === profil.id ? [
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  key={'edit_' + profil.id}
                  style={[styles.actionButton, {borderColor: '#AAAAAA'}]}
                  onPress={() => this.setState({confirmation_opened: true})}>
                  <Text style={[styles.buttonText, {marginTop: 0}]}>Modifier</Text>
                </TouchableHighlight>
              ] : [
                !is_following ? [
                  !profil.invisible ? [
                    <TouchableHighlight
                      key={'hide_reco_' + profil.id}
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#9EE43E'}]}
                      onPress={() => this.setState({confirmation_opened: true})}>
                      <Text style={[styles.buttonText, {color: '#9EE43E'}]}>{this.state.loading ? 'Masque...' : 'Visible'}</Text>
                    </TouchableHighlight>
                  ] : [
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#FE3139'}]}
                      key={'show_reco_' + profil.id}
                      onPress={() => this.setState({confirmation_opened: true})}>
                      <Text style={[styles.buttonText, {color: '#FE3139'}]}>{this.state.loading ? 'Affichage...' : 'Invisible'}</Text>
                    </TouchableHighlight>
                  ]
                ] : [
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#9EE43E'}]}
                    key={'unfollow_' + profil.id}
                    onPress={() => this.setState({confirmation_opened: true})}>
                    <Text style={[styles.buttonText, {color: '#9EE43E'}]}>Suivi</Text>
                  </TouchableHighlight>
                ]
              ]}
            </View>
          </View>

          {!is_following ? [ 
            <View key='switch_buttons' style={styles.restaurantButtonsContainer}>
              <TouchableHighlight 
                style={[styles.restaurantButton, {backgroundColor: this.state.recommendationActive ? '#FE3139' : 'transparent'}]}
                onPress={() => this.onPressRestaurant('recommendation')}>
                <Text style={{color: this.state.recommendationActive ? '#FFFFFF' : '#FE3139'}}>Recommendation{profil.recommendations.length > 1 ? 's' : ''}</Text>
              </TouchableHighlight>
              <TouchableHighlight 
                style={[styles.restaurantButton, {backgroundColor: this.state.wishlistActive ? '#FE3139' : 'transparent'}]}
                onPress={() => this.onPressRestaurant('wishlist')}>
                <Text style={{color: this.state.wishlistActive ? '#FFFFFF' : '#FE3139'}}>Wishlist</Text>
              </TouchableHighlight>
            </View>
          ] : [
            <View key='recommendation_title_container' style={{margin: 15, alignItems: 'center', justifyContent: 'center', flex: 1}}>
              <Text style={{textAlign: 'center', fontSize: 15, color: '#FE3139', fontWeight: '500'}}>Ses recommendations</Text>
            </View>
          ]}

          <View style={styles.restaurantsContainer}>
            {this.state.recommendationActive ? [
              profil.recommendations.length ? [
                _.map(profil.recommendations, (id) => {
                  var restaurant = RestaurantsStore.getRestaurant(id);
                  return (
                    <RestaurantElement
                      height={205}
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
          <MenuIcon key='menu_icon' onPress={this.props.toggle} />
        ] : null}

        <View>
          <CustomActionSheet modalVisible={this.state.confirmation_opened} onCancel={() => {this.setState({confirmation_opened: false})}}>
            {MeStore.getState().me.id == profil.id ? [
              <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.95)', marginBottom: 8}}>
                <TouchableHighlight 
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#AAAAAA', borderBottomWidth: .5}]}
                  onPress={() => this.props.navigator.push(EditMe.route())}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Modifier mon profil</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderColor: '#AAAAAA', borderBottomWidth: .5}]}
                  onPress={this.contactUs}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Nous contacter</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderBottomLeftRadius: 5, borderBottomRightRadius: 5}]}
                  onPress={() => LoginActions.logout()}>
                  <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Me déconnecter</Text>
                </TouchableHighlight>
              </View>
            ] : [
              !is_following ? [
                !profil.invisible ? [
                  <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.95)', marginBottom: 8}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#AAAAAA', borderBottomWidth: .5}]}
                      onPress={() => {
                        this.setState({confirmation_opened: false});
                        if (this.state.loading) {
                          return;
                        }
                        FriendsActions.maskProfil(profil.friendship_id);
                      }}>
                      <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Masquer ses recos</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderBottomLeftRadius: 5, borderBottomRightRadius: 5}]}
                      onPress={() => {
                        this.setState({confirmation_opened: false});
                        if (this.state.friendsLoading) {
                          return;
                        }
                        FriendsActions.removeFriendship(profil.friendship_id, () => {
                          this.props.navigator.pop();
                        });
                      }}>
                      <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Retirer de mes amis</Text>
                    </TouchableHighlight>
                  </View>
                ] : [
                  <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.95)', marginBottom: 8}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#AAAAAA', borderBottomWidth: .5}]}
                      onPress={() => {
                        this.setState({confirmation_opened: false});
                        if (this.state.loading) {
                          return;
                        }
                        FriendsActions.displayProfil(profil.friendship_id);
                      }}>
                      <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Afficher ses recos</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderBottomLeftRadius: 5, borderBottomRightRadius: 5}]}
                      onPress={() => {
                        this.setState({confirmation_opened: false});
                        if (this.state.friendsLoading) {
                          return;
                        }
                        FriendsActions.removeFriendship(profil.friendship_id, () => {
                          this.props.navigator.pop();
                        });
                      }}>
                      <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Retirer de mes amis</Text>
                    </TouchableHighlight>
                  </View>
                ]
              ] : [
                <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.95)', marginBottom: 8}}>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={[styles.confirmationContainer, {borderRadius: 5}]}
                    onPress={() => {
                      this.setState({confirmation_opened: false});
                      if (this.state.followingsLoading) {
                        return;
                      }
                      FollowingsActions.unfollowExpert(profil.followership_id, () => {
                        this.props.navigator.pop();
                      });
                    }}>
                    <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Ne plus suivre</Text>
                  </TouchableHighlight>
                </View>
              ]
            ]}
          </CustomActionSheet>
        </View>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    padding: 0,
    alignItems: 'flex-end',
    marginBottom: 10
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
    color: '#3A325D',
    fontSize: 11,
    textAlign: 'center',
  },
  badgeInfoContainer: {
    width: TEXT_INFO_WIDTH - BADGE_IMAGE_HEIGHT / 2 + MARGIN_LEFT / 2,
    height: 70,
    backgroundColor: 'transparent',
    padding: 5
  },
  badgeName: {
    fontWeight: '500',
    fontSize: 13,
    color: '#3A325D'
  },
  badgeDescription: {
    fontSize: 12,
    marginTop: 3,
    color: '#3A325D'
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
    top: IMAGE_HEIGHT - BADGE_IMAGE_HEIGHT / 2,
    left: IMAGE_HEIGHT + MARGIN_LEFT - BADGE_IMAGE_HEIGHT / 2,
    height: BADGE_IMAGE_HEIGHT,
    width: BADGE_IMAGE_HEIGHT,
    borderRadius: BADGE_IMAGE_HEIGHT / 2
  },
  actionContainer: {
    position: 'absolute',
    top: IMAGE_HEIGHT + MARGIN_TOP + 5,
    left: MARGIN_LEFT + 7.5,
    width: IMAGE_HEIGHT - 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent'
  },
  actionButton: {
    width: IMAGE_HEIGHT - 15,
    height: 25,
    borderRadius: 5,
    borderWidth: .5,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  restaurantButtonsContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#FE3139',
    borderRadius: 5
  },
  restaurantButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#FE3139',
    textAlign: 'center',
    padding: 20,
    fontSize: 14
  },
  confirmationContainer: {
    height: windowWidth / 6.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  confirmationText: {
    textAlign: 'center',
    margin: 10,
  }
});

export default Profil;
