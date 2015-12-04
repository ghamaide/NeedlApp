'use strict';

import React, {StyleSheet, ImagePickerIOS, Dimensions, Text, ScrollView, View, Image, NativeModules} from 'react-native';
import _ from 'lodash';

import LoginActions from '../../actions/LoginActions';
import MeActions from '../../actions/MeActions';
import ProfilActions from '../../actions/ProfilActions';
import FriendsActions from '../../actions/FriendsActions';
import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import FriendsStore from '../../stores/Friends';

import Carousel from '../ui/Carousel';
import ErrorToast from '../ui/ErrorToast';
import Page from '../ui/Page';
import RestaurantElement from '../elements/Restaurant';
import Restaurant from './Restaurant';
import Options from '../elements/Options';
import Option from '../elements/Option';
import EditMe from './EditMe';
import Friends from './Friends';

import Overlay from 'react-native-overlay';

class Profil extends Page {
  static route(props, title) {
    return {
      component: Profil,
      title: title || 'Profil',
      passProps: props
    };
  }

  currentProfil() {
    return this.props.id || MeStore.getState().me.id;
  }

  getProfilState() {
    var errors = this.state.errors;

    var maskErr = ProfilStore.maskProfilError(this.currentProfil());
    if (maskErr && !_.contains(errors, maskErr)) {
      errors.push(maskErr);
    }

    var displayErr = ProfilStore.displayProfilError(this.currentProfil());
    if (displayErr && !_.contains(errors, displayErr)) {
      errors.push(displayErr);
    }

    var removeErr = FriendsStore.removeFriendshipError(this.currentProfil());
    if (removeErr && !_.contains(errors, removeErr)) {
      errors.push(removeErr);
    }

    return {
      data: ProfilStore.getState().profils[this.currentProfil()],
      nbProfilMasking: ProfilStore.getState().status.profilMasking.length,
      nbProfilDisplaying: ProfilStore.getState().status.profilDisplaying.length,
      loading: ProfilStore.loading(this.currentProfil()),
      error: ProfilStore.error(this.currentProfil()),
      errors: errors
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      errors: [],
    };
    this.state = this.getProfilState();
  }

  onFocus = (event) => {
    if (event.data.route.component === Profil) {
      ProfilActions.fetchProfil(this.currentProfil());
    }
  }

  componentWillMount() {
    ProfilStore.listen(this.onProfilsChange);
    FriendsStore.listen(this.onProfilsChange);
    // it can be a tab view or a pushed view
    if (!this.props.id) {
      this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
    } else {
      ProfilActions.fetchProfil(this.currentProfil());
    }
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.onProfilsChange);
    ProfilStore.unlisten(this.onProfilsChange);
  }

  onProfilsChange = () => {
    this.setState(this.getProfilState());
  }

  renderRestaurants(title, restaurants, backgroundColor) {
    restaurants = _.uniq(restaurants, (restaurant) => {
      return restaurant.id;
    });
    return (
      <View style={[styles.restaurantsWrapper, {backgroundColor: backgroundColor}]}>
        <Text style={styles.restaurantsWrapperTitle}>{title}</Text>
        <Carousel style={styles.restaurantsCarousel}>
          {_.map(restaurants, (restaurant) => {
            return <RestaurantElement
                    key={restaurant.id}
                    name={restaurant.name}
                    pictures={[restaurant.picture]}
                    type={restaurant.type}
                    budget={restaurant.price_range}
                    onPress={() => {
                      this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
                    }}/>;
          })}
        </Carousel>
      </View>
    );
  }

  pickImage = () => {
    var options = {
      title: 'Choisis ta photo', // specify null or empty string to remove the title
      cancelButtonTitle: 'Annuler',
      takePhotoButtonTitle: 'Prendre une photo...', // specify null or empty string to remove this button
      chooseFromLibraryButtonTitle: 'Choisir une photo de tes albums...', // specify null or empty string to remove this button
      quality: 0.2,
      allowsEditing: false, // Built in iOS functionality to resize/reposition the image
      noData: false // Disables the base64 `data` field from being generated (greatly improves performance on large photos)
    }
    
    NativeModules.UIImagePickerManager.showImagePicker(options, (didCancel, response) => {
      console.log('Response = ', response);

      if (didCancel) {
        console.log('User cancelled image picker');
      }

      else {
        var uri = 'data:image/jpeg;base64,' + response.data;
        MeActions.uploadList(uri, () => {
          this.setState({showUploadConfirmation: true});
          setTimeout(() => {
            this.setState({showUploadConfirmation: false});
          }, 4000);
        });
      }
    });
  }

  renderPage() {
    var profil = this.state.data;

    return (
      <ScrollView
      	onFocus={(e) => {
        	console.log('coucou', e.nativeEvent);
      	}}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false}>

        <Overlay isVisible={this.state.showUploadConfirmation}>
          <View style={styles.uploadConfirmationContainer}>
            <Text style={styles.uploadConfirmationText}>Ta liste a bien été récupérée et sera ajoutée à ta wishlist d'ici 24h</Text>
          </View>
        </Overlay>

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
          this.renderRestaurants((MeStore.getState().me.id === profil.id ? 'M' : 'S') + 'es Envies', profil.wishes, 'transparent')
          : null}

        <Options>
          {MeStore.getState().me.id === profil.id ?
            [	
              <Option 
					 			label="Envoyer une liste"
					 			key={"list send " + profil.id}
					 			onPress={this.pickImage}
								icon={require('../../assets/img/import_list.png')} />,
              <Option
					 			key={"edit " + profil.id}
								label="Modifier"
								icon={require('../../assets/img/modify.png')}
								onPress={() => {
                	this.props.navigator.push(EditMe.route());
              	}} />,
              <Option
					 			key={"logout " + profil.id}
								label="Me Déconnecter"
								icon={require('../../assets/img/signout.png')}
								onPress={LoginActions.logout} />
            ]
            :
            [
              !profil.invisible ?
                <Option
									key={profil.id}
                  label={ProfilStore.maskProfilLoading(profil.id) ? 'Masque...' : 'Masquer ses recos'}
                  icon={require('../../assets/img/masquer.png')}
                  onPress={() => {
                    if (ProfilStore.maskProfilLoading(profil.id)) {
                      return;
                    }
                    ProfilActions.maskProfil(profil.id);
                  }} /> :
                <Option
									key={'showReco' + profil.id}
                  label={ProfilStore.displayProfilLoading(profil.id) ? 'Affichage...' : 'Afficher ses recos'}
                  icon={require('../../assets/img/afficher.png')}
                  onPress={() => {
                    if (ProfilStore.displayProfilLoading(profil.id)) {
                      return;
                    }
                    ProfilActions.displayProfil(profil.id);
                  }} />,
              <Option
								key={'deleteFriend' + profil.id}
                label={FriendsStore.removeFriendshipLoading(profil.id) ? 'Suppression...' : 'Retirer de mes amis'}
                icon={require('../../assets/img/retirer.png')}
                onPress={() => {
                  if (FriendsStore.removeFriendshipLoading(profil.id)) {
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

        {_.map(this.state.errors, (error, i) => {
          return <ErrorToast key={i} value={JSON.stringify(error)} appBar={true} />;
        })}
      </ScrollView>);
  }
}

var styles = StyleSheet.create({
  imageWrapper: {
    flexDirection: 'row'
  },
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
    fontSize: 20,
    backgroundColor: 'transparent',
    marginBottom: 5
  },
  profilNbRecos: {
    color: '#444444',
    fontSize: 16,
    backgroundColor: 'transparent'
  },
  restaurantsWrapper: {
    padding: 20
  },
  restaurantsWrapperTitle: {
    marginBottom: 10,
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#000000'
  },
  restaurantsCarousel: {
    height: 150,
    flexDirection: 'row'
  },
  uploadConfirmationContainer: {
    backgroundColor: '#38E1B2',
    padding: 12,
    marginTop: 60
  },
  uploadConfirmationText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center'
  }
});

export default Profil;
