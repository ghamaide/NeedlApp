'use strict';

import React from 'react';
import {ActivityIndicatorIOS, Animated, Dimensions, Image, NativeModules, Platform, ProgressBarAndroid, RefreshControl, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import CustomActionSheet from 'react-native-custom-action-sheet';
import Modal from 'react-native-modalbox';
import RNComm from 'react-native-communications';
import TimerMixin from 'react-timer-mixin';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import Onboard from '../elements/Onboard';
import Overlay from '../elements/Overlay';
import RestaurantHeader from '../elements/RestaurantHeader';

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

import Badges from './Badges';
import CarteProfil from './CarteProfil';
import EditMe from './EditMe';
import Friends from './Friends';
import Information from './Information';
import Restaurant from './Restaurant';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

let IMAGE_HEIGHT = 90;
let BADGE_IMAGE_HEIGHT = 50;
let INNER_BANNER_HEIGHT = IMAGE_HEIGHT - 40;
let MARGIN_LEFT = 10;
let MARGIN_TOP = 20;
let TEXT_INFO_WIDTH = Dimensions.get('window').width - IMAGE_HEIGHT - BADGE_IMAGE_HEIGHT / 2 + 10;

let buttonSize = 45;
let buttonMargin = 10;

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
      hasNewBadge: MeStore.hasNewBadge()
    };
  };

  constructor(props) {
    super(props);

    this.state = this.profilState();

    var isMeAndPublic = MeStore.getState().me.id == this.state.profile.id && this.state.profile.public;
    
    this.state.recommendationActive = true;
    this.state.wishlistActive = false;
    if (isMeAndPublic) {
      this.state.index = this.props.index || 2;
    } else {
      this.state.index = this.props.index || 1;
    }
    this.state.confirmation_opened = false;

    // Onboarding overlay
    this.state.onboardingOverlay = !MeStore.getState().me.profile_onboarding;
  };

  componentWillMount() {
    FollowingsStore.listen(this.onProfilsChange);
    MeStore.listen(this.onProfilsChange);
    ProfilStore.listen(this.onProfilsChange);
  };

  componentWillUnmount() {
    FollowingsStore.unlisten(this.onProfilsChange);
    MeStore.unlisten(this.onProfilsChange);
    ProfilStore.unlisten(this.onProfilsChange);
  };

  onProfilsChange = () => {
    this.setState(this.profilState());
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

  changePicture = () => {
    var options = {
    };

    NativeModules.ImagePickerManager.launchImageLibrary(options, (response)  => {
      if (response.didCancel) {
        if (__DEV__) {
          console.log('User cancelled image picker');
        }
      } else if (response.error) {
        if (__DEV__) {
          console.log('ImagePickerManager Error: ', response.error);
        }
      } else {
        // You can display the image using either data:
        var uri = 'data:image/jpeg;base64,' + response.data;

        this.setState({avatarSource: uri});

        MeActions.uploadPicture(uri);
      }
    });
  }

  closeOverlay = () => {
    if (this.state.onboardingOverlay && this.state.loadingDone) {
      this.setState({onboardingOverlay: false});
      MeActions.updateOnboardingStatus('profile');
    }
  }

  onScroll = () => {
    this.closeOverlay();

    if (!this.state.loading) {
      this.setState({loadingDone: true});
    }
  }

  renderPage() {
    var profil = this.state.profile;

    var friendsIds = _.map(ProfilStore.getFriends(), (friend) => {
      return friend.id
    });

    var followingsIds =  _.map(ProfilStore.getFollowings(), (following) => {
      return following.id
    });

    var picture = this.state.avatarSource || profil.picture;

    var isFollowing = (!_.includes(friendsIds, profil.id) && MeStore.getState().me.id !== profil.id) || (MeStore.getState().me.id === profil.id && profil.public && this.state.index == 2);

    var isMeAndPublic = MeStore.getState().me.id === profil.id && profil.public;

    var hasNewBadge = MeStore.getState().me.id === profil.id && this.state.hasNewBadge;
    var hasInvitations = MeStore.getState().me.id === profil.id && ProfilStore.getRequestsReceived().length > 0 && MeStore.getState().showInvitations;

    if (this.state.index == 1) {
      var image = require('../../assets/img/icons/public.png');
    } else if (this.state.index == 2) {
      var image = require('../../assets/img/icons/private.png');
    }

    return (
      <View style={{flex: 1, paddingTop: !this.props.id ? 20 : 0}}>
        {!this.props.id ? [
          null
        ] : [
          MeStore.getState().me.id !== profil.id ? [
            <NavigationBar 
              key='navbar_from_push'
              type='back'
              title={profil.fullname || profil.name}
              leftButtonTitle='Retour'
              onLeftButtonPress={() => {
                this.props.navigator.pop();
              }} />
          ] : [
            <NavigationBar 
              key='navbar_from_push_and_is_me'
              type='back'
              titles={profil.fullname || profil.name}
              leftButtonTitle='Retour'
              onLeftButtonPress={() => {
                this.props.navigator.pop()
              }} />
          ]
        ]}

        {MeStore.getState().me.id === profil.id && !isFollowing && this.state.index == 2 ? [
          <Text key='no_public_profile' style={{margin: 20, textAlign: 'center', color: '#FE3139', fontSize: 14, fontWeight: Platform.OS === 'ios' ? '500' : '400'}}>Ton profil n'est pas encore public. Pour le rendre public, il te faut au moins 20 remerciements. Pour en obtenir, recommande tes restaurants préférés.</Text>
        ] : [
          <ScrollView
            key='private_profile_container'
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

            {/* Show notification if badge updated */}
            {hasNewBadge ? [
              <View key='new_badge_container' style={styles.newBadgeContainer}>
                <Text style={{fontWeight: '400', color: '#FFFFFF', textAlign: 'center', fontSize: 12}}>Félicitations, tu as débloqué un nouveau badge : '{profil.badge.name}'</Text>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.newBadgeButton}
                  onPress={() => {
                    MeActions.hideNewBadge();
                    this.forceUpdate();
                  }}>
                  <Text style={{color: '#FE3139', textAlign: 'center', fontSize: 11}}>Masquer</Text>
                </TouchableHighlight>
              </View>
            ] : null}

            {/* Show notification if invitation received */}
            {hasInvitations ? [
              <View key='invitation_container' style={styles.invitationContainer}>
                <Text style={{fontWeight: '400', color: '#FFFFFF', textAlign: 'center', fontSize: 12}}>Tu as reçu {ProfilStore.getRequestsReceived().length} invitation{ProfilStore.getRequestsReceived().length > 1 ? 's' : ''}</Text>
                <View style={{flexDirection: 'row'}}>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.invitationButton}
                    onPress={() => {
                      this.props.navigator.push(Friends.route({index: 1}));
                    }}>
                    <Text style={{color: '#3A325D', textAlign: 'center', fontSize: 11}}>Voir {ProfilStore.getRequestsReceived().length > 1 ? 'mes invitations' : 'mon invitation'}</Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.invitationButton}
                    onPress={() => {
                      MeActions.hideInvitations();
                      this.forceUpdate();
                    }}>
                    <Text style={{color: '#3A325D', textAlign: 'center', fontSize: 11}}>Masquer</Text>
                  </TouchableHighlight>
                </View>
              </View>
            ] : null}

            <View style={styles.infoContainer}>
              <View style={styles.infoInnerContainer}>
                <View style={styles.textInfoContainer}>
                  {/* Nombre d'amis (amis) ou de recommendations (followings) */}
                  {!isFollowing ? [
                    <TouchableHighlight
                      key='friends'
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.textInfo, {borderRightWidth: 1.5}]}
                      onPress={() => {
                        // fetch info on friends
                        if (profil.id !== MeStore.getState().me.id) {
                          this.props.navigator.push(Information.route({id: profil.id, origin: 'users'}));
                        } else {
                          this.props.navigator.push(Friends.route({index: 1}));
                        }
                      }}>
                      <View>
                        <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                          {profil.friends.length /* à remplacer par le nombre d'amis */}
                        </Text>
                        <Text style={[styles.textInfoText, {top: 20}]}>
                          ami{profil.friends.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  ] : [ // Nombre de recommendations pour un profil public
                    <View key='recommendations' style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                      <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                        {profil.public_recommendations.length}
                      </Text>
                      <Text style={[styles.textInfoText, {top: 20}]}>
                        resto{profil.public_recommendations.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  ]}

                  {/* Nombre de followings (amis) ou followers (followings) */}
                  {!isFollowing ? [
                    <TouchableHighlight
                      key='followings'
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.textInfo, {borderRightWidth: 1.5}]}
                      onPress={() => {
                        if (profil.id !== MeStore.getState().me.id) {
                          this.props.navigator.push(Information.route({id: profil.id, origin: 'experts'}));
                        } else {
                          this.props.navigator.push(Friends.route({index: 2}));
                        }
                      }}>
                      <View>
                        <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                          {profil.followings.length}
                        </Text>
                        <Text style={[styles.textInfoText, {top: 20}]}>
                          influenceur{profil.followings.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  ] : [
                    <View key='followers' style={[styles.textInfo, {borderRightWidth: 1.5}]}>
                      <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                        {profil.number_of_followers}
                      </Text>
                      <Text style={[styles.textInfoText, {top: 20}]}>
                        follower{profil.number_of_followers > 1 ? 's' : ''}
                      </Text>
                    </View>
                  ]}

                  {/* Nombre de remerciements */}
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.textInfo}
                    onPress={() => {
                      if (!isFollowing && MeStore.getState().me.id === profil.id && profil.score >= 1) {
                        this.props.navigator.push(Information.route({id: profil.id, origin: 'score'}));
                      } else {
                        return ;
                      }
                    }}>
                    <View>
                      <Text style={[styles.textInfoText, {fontWeight: '500', top: 5}]}>
                        {!isFollowing ? profil.score : profil.public_score}
                      </Text>
                      <Text style={[styles.textInfoText, {top: 20}]}>
                        merci{!isFollowing ? (profil.score > 1 ? 's' : '') : (profil.public_score > 1 ? 's' : '')}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>

              {/* Container for badge information or public description */}
              {!isFollowing ? [
                <TouchableHighlight
                  key='badge_container'
                  underlayColor='rgba(0, 0, 0, 0)'
                  onPress={() => {
                    if (MeStore.getState().me.id === profil.id) {
                      this.props.navigator.push(Badges.route());
                    } else {
                      return ;
                    }
                  }}>
                  <View style={styles.badgeInfoContainer}>
                    <Text style={styles.badgeName}>{profil.badge.name}</Text>
                    <Text style={styles.badgeDescription} numberOfLines={3}>{profil.badge.description}</Text>
                  </View>
                </TouchableHighlight>
              ] : [
                <View key='description_container' style={styles.descriptionContainer}>
                  <Text style={styles.description} numberOfLines={3}>{profil.description}</Text>
                  <Text style={styles.tags}>
                    {_.map(profil.tags, (tag, key) => {
                      return <Text style={{color: '#FE3139'}} key={'tag_' + key}>#{tag.replace(" ", "")} </Text>; 
                    })}
                  </Text>
                </View>
              ]}

              {/* Profile Image */}
              <Image source={{uri: picture}} style={styles.image} />

              {/* Badge Image */}
              {!isFollowing ? [
                <TouchableHighlight
                  key='badge_image'
                  style={styles.badgeImageContainer} 
                  underlayColor='rgba(0, 0, 0, 0)'
                  onPress={() => {
                    if (MeStore.getState().me.id === profil.id) {
                      this.props.navigator.push(Badges.route());
                    } else {
                      return ;
                    }
                  }}>
                  <Image source={profil.badge.image} style={styles.badgeImage} />
                </TouchableHighlight>
              ] : null}

              {/* Container for actions on profile */}
              <View style={styles.actionContainer}>
                {MeStore.getState().me.id === profil.id ? [
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    key={'edit_' + profil.id}
                    style={[styles.actionButton, {borderColor: '#837D9B'}]}
                    onPress={() => {
                      this.setState({confirmation_opened: true});
                    }}>
                    <Text style={[styles.buttonText, {marginTop: 0}]}>Modifier</Text>
                  </TouchableHighlight>
                ] : [
                  !isFollowing ? [
                    !profil.invisible ? [
                      <TouchableHighlight
                        key={'hide_reco_' + profil.id}
                        underlayColor='rgba(0, 0, 0, 0)'
                        style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#9CE62A'}]}
                        onPress={() => {
                          this.setState({confirmation_opened: true});
                        }}>
                        <Text style={[styles.buttonText, {color: '#9CE62A'}]}>{this.state.loading ? 'Masque...' : 'Visible'}</Text>
                      </TouchableHighlight>
                    ] : [
                      <TouchableHighlight
                        underlayColor='rgba(0, 0, 0, 0)'
                        style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#FE3139'}]}
                        key={'show_reco_' + profil.id}
                        onPress={() => {
                          this.setState({confirmation_opened: true});
                        }}>
                        <Text style={[styles.buttonText, {color: '#FE3139'}]}>{this.state.loading ? 'Affichage...' : 'Invisible'}</Text>
                      </TouchableHighlight>
                    ]
                  ] : [
                    MeStore.getState().me.id !== profil.id ? [
                      _.includes(followingsIds, profil.id) ? [
                        <TouchableHighlight
                          key={'unfollow_' + profil.id}
                          underlayColor='rgba(0, 0, 0, 0)'
                          style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#9CE62A'}]}
                          onPress={() => {
                            this.setState({confirmation_opened: true});
                          }}>
                          <Text style={[styles.buttonText, {color: '#9CE62A'}]}>Suivi</Text>
                        </TouchableHighlight>
                      ] : [
                        <TouchableHighlight
                          key={'unfollow_' + profil.id}
                          underlayColor='rgba(0, 0, 0, 0)'
                          style={[styles.actionButton, {backgroundColor: '#FFFFFF', borderColor: '#C1BFCC'}]}
                          onPress={() => FollowingsActions.followExpert(profil.id)}>
                          <Text style={[styles.buttonText, {color: '#C1BFCC'}]}>Suivre</Text>
                        </TouchableHighlight>
                      ]
                    ] : []
                  ]
                ]}
              </View>
            </View>

            {!isFollowing ? [ 
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
                <Text style={{textAlign: 'center', fontSize: 15, color: '#FE3139', fontWeight: '500'}}>Ses recommandations</Text>
              </View>
            ]}

            <View style={styles.restaurantsContainer}>
              {/* Recommendations */}
              {this.state.recommendationActive ? [
                !isFollowing ? [
                  profil.recommendations.length ? [
                    _.map(profil.recommendations, (id) => {
                      var restaurant = RestaurantsStore.getRestaurant(id);
                      return (
                        <RestaurantHeader
                          key={restaurant.id}
                          style={{backgroundColor: 'transparent', borderBottomWidth: .5, borderColor: '#FFFFFF'}}
                          height={250}
                          name={restaurant.name}
                          picture={restaurant.pictures[0]}
                          type={restaurant.food[1]}
                          budget={restaurant.price_range}
                          subway={RestaurantsStore.closestSubwayName(restaurant.id)}
                          underlayColor='#EEEDF1'
                          onPress={() => {
                            this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                          }}/>
                      );
                    })
                  ] : [
                    <Text style={styles.emptyText}>Recommande les restaurants que tu as aimés et bénéficie d'une suggestion de restaurants personnalisée !</Text>
                  ]
                ] : [
                  profil.public_recommendations.length ? [
                    _.map(profil.public_recommendations, (id) => {
                      var restaurant = RestaurantsStore.getRestaurant(id);
                      return (
                        <RestaurantHeader
                          height={250}
                          style={{backgroundColor: 'transparent', borderBottomWidth: .5, borderColor: '#FFFFFF'}}
                          key={restaurant.id}
                          name={restaurant.name}
                          picture={restaurant.pictures[0]}
                          type={restaurant.food[1]}
                          budget={restaurant.price_range}
                          subway={RestaurantsStore.closestSubwayName(restaurant.id)}
                          underlayColor='#EEEDF1'
                          onPress={() => {
                            this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                          }}/>
                      );
                    })
                  ] : [
                    <Text style={styles.emptyText}>Recommande les restaurants que tu as aimés et bénéficie d'une suggestion de restaurants personnalisée !</Text>
                  ]
                ]
              ] : null}

              {/* Wishlist */}
              {this.state.wishlistActive ? [
                profil.wishes.length ? [
                  _.map(profil.wishes, (id) => {
                    var restaurant = RestaurantsStore.getRestaurant(id);
                    return (
                      <RestaurantHeader
                        height={250}
                        style={{backgroundColor: 'transparent', borderBottomWidth: .5, borderColor: '#FFFFFF'}}
                        key={restaurant.id}
                        name={restaurant.name}
                        picture={restaurant.pictures[0]}
                        type={restaurant.food[1]}
                        budget={restaurant.price_range}
                        subway={RestaurantsStore.closestSubwayName(restaurant.id)}
                        underlayColor='#EEEDF1'
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
        ]}

        {/* Button to switch to map */}
        <TouchableHighlight
          key='switch_profile_map'
          underlayColor='rgba(0, 0, 0, 0)'
          style={styles.submitButton}
          onPress={() => {
            if (!this.props.id) {
              this.props.navigator.replace(CarteProfil.route())
            } else {
              this.props.navigator.replace(CarteProfil.route({id: this.props.id}));
            }
          }}>
          <Image source={require('../../assets/img/other/icons/map.png')} style={styles.submitIcon} />
        </TouchableHighlight>

        {/* Button to switch to public profile */}
        {isMeAndPublic ? [
          <TouchableHighlight
            key='switch_public_private'
            underlayColor='rgba(0, 0, 0, 0)'
            style={styles.switchButton}
            onPress={() => {
              if (this.state.index == 1) {
                this.setState({index: 2});
              } else if (this.state.index == 2) {
                this.setState({index: 1});
              }
            }}>
              <Image key='private_image' source={image} style={styles.switchIcon} />
          </TouchableHighlight>
        ] : null}

        {/* ActionSheet for iOS */}
        <View>
          <CustomActionSheet modalVisible={this.state.confirmation_opened && Platform.OS === 'ios'} onCancel={() => {this.setState({confirmation_opened: false})}}>
            {MeStore.getState().me.id == profil.id ? [
              <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(238, 237, 241, 0.95)', marginBottom: 8}}>
                <TouchableHighlight 
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#837D9B', borderBottomWidth: .5}]}
                  onPress={() => {
                    this.props.navigator.push(EditMe.route());
                    this.setState({confirmation_opened: false});
                  }}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Modifier mon profil</Text>
                </TouchableHighlight>
                <TouchableHighlight 
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderColor: '#837D9B', borderBottomWidth: .5}]}
                  onPress={() => {
                    this.setState({confirmation_opened: false});
                    setTimeout(() => this.changePicture(), 500);
                  }}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Changer ma photo</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderColor: '#837D9B', borderBottomWidth: .5}]}
                  onPress={this.contactUs}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Nous contacter</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={[styles.confirmationContainer, {borderBottomLeftRadius: 5, borderBottomRightRadius: 5}]}
                  onPress={() => {
                    this.setState({confirmation_opened: false});
                    LoginActions.logout();
                  }}>
                  <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Me déconnecter</Text>
                </TouchableHighlight>
              </View>
            ] : [
              !isFollowing ? [
                !profil.invisible ? [
                  <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(238, 237, 241, 0.95)', marginBottom: 8}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#837D9B', borderBottomWidth: .5}]}
                      onPress={() => {
                        if (this.state.loading) {
                          return;
                        }
                        FriendsActions.maskProfil(profil.friendship_id);
                        this.setState({confirmation_opened: false});
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
                  <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(238, 237, 241, 0.95)', marginBottom: 8}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={[styles.confirmationContainer, {borderTopLeftRadius: 5, borderTopRightRadius: 5, borderColor: '#837D9B', borderBottomWidth: .5}]}
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
                <View key='my_buttons' style={{borderRadius: 5, backgroundColor: 'rgba(238, 237, 241, 0.95)', marginBottom: 8}}>
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

        {/* Modal View for Android */}
        <Modal
          ref='android_modal'
          style={styles.modal}
          position='bottom'
          onRequestClose={() => this.setState({confirmation_opened: false})}
          isOpen={this.state.confirmation_opened && Platform.OS === 'android'}
          onClosed={() => this.setState({confirmation_opened: false})}>
          <View style={{width: windowWidth, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(238, 237, 241, 0.95)'}}>
            {MeStore.getState().me.id == profil.id ? [
              <View key='my_buttons' style={{flex: 1}}>
                <TouchableHighlight 
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.confirmationContainer}
                  onPress={() => {
                    this.props.navigator.push(EditMe.route());
                    this.setState({confirmation_opened: false});
                  }}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Modifier mon profil</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.confirmationContainer}
                  onPress={this.contactUs}>
                  <Text style={[styles.confirmationText, {color: '#3A325D'}]}>Nous contacter</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={styles.confirmationContainer}
                  onPress={() => {
                    this.setState({confirmation_opened: false});
                    LoginActions.logout();
                  }}>
                  <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Me déconnecter</Text>
                </TouchableHighlight>
              </View>
            ] : [
              !isFollowing ? [
                !profil.invisible ? [
                  <View key='my_buttons' style={{flex: 1}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={styles.confirmationContainer}
                      onPress={() => {
                        if (this.state.loading) {
                          return;
                        }
                        FriendsActions.maskProfil(profil.friendship_id);
                        this.setState({confirmation_opened: false});
                      }}>
                      <Text style={[styles.confirmationText, {color: '#FE3139'}]}>Masquer ses recos</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={styles.confirmationContainer}
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
                  <View key='my_buttons' style={{flex: 1}}>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0)'
                      style={styles.confirmationContainer}
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
                      style={styles.confirmationContainer}
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
                <View key='my_buttons' style={{flex: 1}}>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0)'
                    style={styles.confirmationContainer}
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
          </View>
        </Modal>

        {this.state.onboardingOverlay ? [
          <Onboard onPress={this.closeOverlay} key='onboarding_profil' style={{top: hasNewBadge && hasInvitations ? 330 : (hasNewBadge || hasInvitations ? 250 : 170)}} top={-25} right={windowWidth - 120}>
            <Text style={styles.onboardingText}>Ton <Text style={{color: '#FE3139'}}>badge</Text> évolue dès qu’un de tes amis te <Text style={{color: '#FE3139'}}>remercie</Text> pour une de tes recommandations.</Text>
          </Onboard>
        ] : null}
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
  descriptionContainer: {
    width: TEXT_INFO_WIDTH,
    backgroundColor: 'transparent',
    padding: 8,
    marginTop: 5
  },
  tags: {
    marginTop: 5,
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
  badgeImageContainer: {
    position: 'absolute',
    top: IMAGE_HEIGHT - BADGE_IMAGE_HEIGHT / 2,
    left: IMAGE_HEIGHT + MARGIN_LEFT - BADGE_IMAGE_HEIGHT / 2,
    height: BADGE_IMAGE_HEIGHT,
    width: BADGE_IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeImage: {
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
    borderWidth: 1,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#837D9B',
    fontSize: 11,
    fontWeight: '500'
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
  },
  newBadgeContainer: {
    flex: 1,
    backgroundColor: '#FE3139',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  newBadgeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5
  },
  invitationContainer: {
    flex: 1,
    backgroundColor: '#3A325D',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  invitationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5
  },
  modal: {
    width: windowWidth,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'transparent'
  },
  onboardingText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#EEEDF1',
    margin: 10
  },
  submitButton : {
    backgroundColor: '#FE3139',
    borderColor: '#FE3139',
    position: 'absolute',
    bottom: buttonMargin,
    right: buttonMargin,
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitIcon: {
    tintColor: '#FFFFFF',
    height: buttonSize - 20,
    width: buttonSize - 20
  },
  switchButton: {
    backgroundColor: '#FE3139',
    borderColor: '#FE3139',
    position: 'absolute',
    bottom: buttonMargin,
    left: buttonMargin,
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  switchIcon: {
    tintColor: '#FFFFFF',
    height: buttonSize - 20,
    width: (buttonSize - 20) / 1.26
  }
});

export default Profil;
