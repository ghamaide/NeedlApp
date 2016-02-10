'use strict';

import React, {StyleSheet, Dimensions, ScrollView, View, Image, NativeModules, RefreshControl, Platform, ProgressBarAndroid, ActivityIndicatorIOS} from 'react-native';

import _ from 'lodash';

import Carousel from '../ui/Carousel';
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

import Restaurant from './Restaurant';
import EditMe from './EditMe';
import Friends from './Friends';
import CarteProfil from './CarteProfil';

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

class Profil extends Page {
  static route(props, title) {
    return {
      component: Profil,
      title: title || 'Profil',
      passProps: props,
    };
  };

  currentProfil() {
    return this.props.id || MeStore.getState().me.id;
  };

  profilState() {
    return {
      profile: ProfilStore.getProfil(40),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.profilState();
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

  renderRestaurants(title, restaurants, backgroundColor) {
    restaurants = _.uniq(restaurants, (restaurant) => {
      return restaurant.id;
    });
    return (
      <View style={[styles.restaurantsWrapper, {backgroundColor: backgroundColor}]}>
        <Text style={styles.restaurantsWrapperTitle}>{title}</Text>
        <ScrollView 
          style={styles.restaurantsCarousel} 
          scrollEnabled={true}
          automaticallyAdjustContentInsets={false}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          {_.map(restaurants, (restaurant) => {
            return (
              <RestaurantElement
                height={150}
                style={{marginLeft: 5, marginRight: 5, backgroundColor: 'transparent', width: windowWidth - 65}}
                key={restaurant.id}
                name={restaurant.name}
                picture={restaurant.picture}
                type={restaurant.type}
                budget={restaurant.price_range}
                underlayColor='#EEEEEE'
                onPress={() => {
                  this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                }}/>
              );
          })}
        </ScrollView>
      </View>
    );
  };

  renderPage() {
    var profil = this.state.profile;
    console.log(profil);
    return (
      <View style={{flex: 1}}>
        {!this.props.id ? [
          <NavigationBar key="navbarfromtab" image={require('../../assets/img/other/icons/map.png')} title="Profil" rightButtonTitle="Carte" onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: MeStore.getState().me.id}))} />
        ] : [
          <NavigationBar key="navbarfrompush" leftButtonTitle="Retour" onLeftButtonPress={() => this.props.navigator.pop()} image={require('../../assets/img/other/icons/map.png')} title="Profil" rightButtonTitle="Carte" onRightButtonPress={() => this.props.navigator.replace(CarteProfil.route({id: this.props.id}))} />
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
              tintColor="#ff0000"
              title="Chargement..."
              colors={['#FFFFFF']}
              progressBackgroundColor="rgba(0, 0, 0, 0.5)" />
          }>

          <View style={styles.infoContainer}>
            <Image source={{uri: profil.picture}} style={styles.image} />
            <View style={styles.textInfoContainer}>
              <Text style={styles.profilName}>{profil.name}</Text>
              <Text style={styles.profilNbRecos}>{profil.recommendations.length} reco{profil.recommendations.length > 1 && 's'}</Text>
            </View>
          </View>

          {profil.recommendations.length ?
            this.renderRestaurants((MeStore.getState().me.id === profil.id ? 'M' : 'S') + 'es Recos', profil.recommendations, '#FFFFFF')
            : null}

          {profil.wishes.length ?
            this.renderRestaurants((MeStore.getState().me.id === profil.id ? 'M' : 'S') + 'a Wishlist', profil.wishes, 'transparent')
            : null}

          <Options>
            {MeStore.getState().me.id === profil.id ?
              [
                <Option
  					 			key={"edit " + profil.id}
  								label="Modifier"
  								icon={require('../../assets/img/actions/icons/modify.png')}
  								onPress={() => {
                  	this.props.navigator.push(EditMe.route());
                	}} />,
                <Option
  					 			key={"logout " + profil.id}
  								label="Me Déconnecter"
  								icon={require('../../assets/img/actions/icons/signout.png')}
  								onPress={LoginActions.logout} />
              ]
              :
              [
                !profil.invisible ?
                  <Option
                    key={'hide_reco_' + profil.id}
                    label={ProfilStore.loading() ? 'Masque...' : 'Masquer ses recos'}
                    icon={require('../../assets/img/actions/icons/masquer.png')}
                    onPress={() => {
                      if (ProfilStore.loading()) {
                        return;
                      }
                      ProfilActions.maskProfil(profil.id);
                    }} /> :
                  <Option
                    key={'show_reco_' + profil.id}
                    label={ProfilStore.loading() ? 'Affichage...' : 'Afficher ses recos'}
                    icon={require('../../assets/img/actions/icons/afficher.png')}
                    onPress={() => {
                      if (ProfilStore.loading()) {
                        return;
                      }
                      ProfilActions.displayProfil(profil.id);
                    }} />,
                <Option
                  key={'delete_friend_' + profil.id}
                  label={FriendsStore.loading() ? 'Suppression...' : 'Retirer de mes amis'}
                  icon={require('../../assets/img/actions/icons/retirer.png')}
                  onPress={() => {
                    if (FriendsStore.loading()) {
                      return;
                    }
                    FriendsActions.removeFriendship(profil.id, () => {
                      this.props.navigator.resetTo(Friends.route());
                    });
                    this.forceUpdate();
                  }} />
              ]
            }
          </Options>
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#CCCCCC'
  },
  textInfoContainer: {
    flex: 1,
    marginLeft: 15
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 40
  },
  profilName: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    marginBottom: 5
  },
  profilNbRecos: {
    color: '#444444',
    fontSize: 16,
    backgroundColor: 'transparent'
  },
  restaurantsWrapper: {
    padding: 10
  },
  restaurantsWrapperTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#000000'
  },
  restaurantsCarousel: {
    height: 150,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: windowWidth - 30,
    margin: 5
  }
});

export default Profil;
