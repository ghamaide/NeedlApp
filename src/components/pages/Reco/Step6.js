'use strict';

import React, {Component} from 'react';
import {Dimensions, Image, NativeModules, Platform, ScrollView, StyleSheet, Switch, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Branch from 'react-native-branch';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mixpanel from 'react-native-mixpanel';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';
import TextInput from '../../ui/TextInput';

import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import ProfilStore from '../../../stores/Profil';
import RecoStore from '../../../stores/Reco';
import RestaurantsStore from '../../../stores/Restaurants';

import StepSave from './StepSave';

var windowWidth = Dimensions.get('window').width;

let IMAGE_WIDTH = 60;

class RecoStep6 extends Component {
  static route(props) {
    return {
      component: RecoStep6,
      title: 'Mot de la fin',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.stepState();
    this.state.characterNbRemaining = 140;
    this.state.public_recommendation = ProfilStore.getProfil(MeStore.getState().me.id).public;
    this.state.recommendationPictures = [];
  }

  stepState() {
    var recommendation = RecoStore.getReco();
    return {
      recommendation: recommendation,
      review: recommendation.review,
      url: recommendation.url,
      friendsThanksIds: recommendation.friends_thanking ? recommendation.friends_thanking : [],
      expertsThanksIds: recommendation.experts_thanking ? recommendation.experts_thanking : []
    }
  };

  componentDidMount() {
    Mixpanel.sharedInstanceWithToken('1637bf7dde195b7909f4c3efd151e26d');
  };

  handleChange = (characterNb) => {
    var temp = 140 - characterNb; 
    this.setState({characterNbRemaining: temp});
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      this.refs.review.blur();
    }
  };

  onRightButtonPress = () => {
    var recommendation = this.state.recommendation;
    recommendation.friends_thanking = this.state.friendsThanksIds;
    recommendation.experts_thanking = this.state.expertsThanksIds;
    recommendation.review = this.state.review;
    recommendation.url = this.state.url;
    recommendation.public = this.state.public_recommendation;
    recommendation.pictures = this.state.recommendationPictures;
    RecoActions.setReco(recommendation);
    this.props.navigator.resetTo(StepSave.route());
  };

  thankRecommender = (recommenderId) => {
    var friendsThanksIds = this.state.friendsThanksIds;
    var expertsThanksIds = this.state.expertsThanksIds;

    var friends = _.map(ProfilStore.getFriends(), (friend) => {
      return friend.id;
    });
    var isExpert = !_.includes(friends, recommenderId);
    if (isExpert) {
      if (!_.includes(expertsThanksIds, recommenderId)) {
        expertsThanksIds.push(recommenderId);
        this.setState({expertsThanksIds: expertsThanksIds});
      } else {
        expertsThanksIds = _.filter(expertsThanksIds, (id) => {
          return id !== recommenderId;
        });
        this.setState({expertsThanksIds: expertsThanksIds});
      }
    } else {
      if (!_.includes(friendsThanksIds, recommenderId)) {
        friendsThanksIds.push(recommenderId);
        this.setState({friendsThanksIds: friendsThanksIds});
      } else {
        friendsThanksIds = _.filter(friendsThanksIds, (id) => {
          return id !== recommenderId;
        });
        this.setState({friendsThanksIds: friendsThanksIds});
      }
    }
  };

  renderRecommender = (recommenderId) => {
    var recommender = ProfilStore.getProfil(recommenderId);
    var active = _.includes(this.state.friendsThanksIds, recommenderId) || _.includes(this.state.expertsThanksIds, recommenderId);
    return (
      <View key={'recommender_' + recommenderId} style={styles.recommenderContainer}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.thankRecommender(recommenderId)} style={styles.recommenderButton}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Image style={styles.recommenderImage} source={{uri: recommender.picture}} />
            {!active ? [
              <View key={'active_' + recommenderId} style={styles.grayImage} />
            ] : null}
            <Text style={[styles.recommenderName, {color: active ? '#3A325D' : '#837D9B'}]}>{recommender.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  inviteFriend = () => {
    var me = ProfilStore.getProfil(MeStore.getState().me.id);
    var shareOptions = {messageHeader: 'Merci !', messageBody: 'Merci de m\'avoir fait découvrir ' + this.state.recommendation.restaurant.name + '. Viens découvrir mes recommandations sur Needl:'};
    var branchUniversalObject = {metadata: {friend_id: me.id, friend_name: me.name, restaurant_id: this.state.recommendation.restaurant.id, from: 'invitation'}, canonicalIdentifier: 'RNBranchSharedObjectId', contentTitle: 'Merci !', contentDescription: 'Merci de m\'avoir fait découvrir ' + this.state.recommendation.restaurant.name, contentImageUrl: me.picture};
    var linkProperties = {feature: 'invitation', channel: 'in-app'};
    Branch.showShareSheet(shareOptions, branchUniversalObject, linkProperties, ({channel, completed, error}) => {
      if (completed) {
        // do something here if completed
        Mixpanel.trackWithProperties('Thanks sent', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, type: 'Text', user_type: 'contact'});
      }
    });
  };

  choosePicture = () => {
    var options = {
      title: 'Choisis une photo du restaurant',
      cancelButtonTitle: 'Annuler',
      takePhotoButtonTitle: 'Prendre une photo',
      chooseFromLibraryButtonTitle: 'Choisir depuis la librairie',
    };

    NativeModules.ImagePickerManager.showImagePicker(options, (response)  => {
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
        var newRecommendationPictures = this.state.recommendationPictures;
        newRecommendationPictures.push(uri);

        this.setState({recommendationPictures: newRecommendationPictures});
      }
    });
  };

  capitalize = (text) => {
    return text.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  }

  toHashtag = (name) => {
    var output = this.capitalize(name);
        
    var output2 = output.replace(/['"]+/g, '')
    
    var output3 = output2.replace(' ', '');

    return '#' + output3;
  };

  tweet = () => {
    var restaurant = RestaurantsStore.getRestaurant(this.state.recommendation.restaurant.id);

    if (typeof restaurant == 'undefined') {
      restaurant = this.state.recommendation.restaurant;
      var options = {
        'text':'Mon dernier resto coup de coeur : ' + this.toHashtag(this.state.recommendation.restaurant.name) + ' ! Tous les autres sont sur Needl.',
        'link':'http://www.needl.fr/'
      };

      options.imagelink = 'https://s3-eu-west-1.amazonaws.com/needl/production/supports/image+needl.jpg';
    } else {
      var options = {
        'text':'Mon dernier resto coup de coeur : ' + this.toHashtag(restaurant.name) + ' ! Tous les autres sont sur Needl.',
        'link':'http://www.needl.fr/'
      };

      var hasPicture = false;
      
      if (restaurant.pictures.length > 0) {
        _.forEach(restaurant.pictures, (picture, key) => {
          if (picture.substr(0, 29) == 'http://needl.s3.amazonaws.com' && !hasPicture) {
            options.imagelink = picture;
            hasPicture = true;
          }

          if (key == restaurant.pictures.length - 1 && !hasPicture) {
            options.imagelink = 'https://s3-eu-west-1.amazonaws.com/needl/production/supports/image+needl.jpg';
          }
        })
      }
    }

    NativeModules.KDSocialShare.tweet(options, (results) => {
      if (__DEV__) {
        console.log(results);
      }

      if (results == 'success') {
        Mixpanel.trackWithProperties('Twitter Share Reco', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, restaurant: restaurant.name});
      }
    });
  };

  shareOnFacebook = () => {
    var restaurant = RestaurantsStore.getRestaurant(this.state.recommendation.restaurant.id);

    if (typeof restaurant == 'undefined') {
      restaurant = this.state.recommendation.restaurant;
      var options = {
        'text':'Mon dernier resto coup de coeur : ' + restaurant.name + ' ! Tous les autres sont sur Needl.',
        'link':'http://www.needl.fr/'
      };

      options.imagelink = 'https://s3-eu-west-1.amazonaws.com/needl/production/supports/image+needl.jpg';
    } else {
      var options = {
        'text':'Mon dernier resto coup de coeur : ' + restaurant.name + ' ! Tous les autres sont sur Needl.',
        'link':'http://www.needl.fr/'
      };

      var hasPicture = false;

      if (restaurant.pictures.length > 0) {
        _.forEach(restaurant.pictures, (picture, key) => {
          if (picture.substr(0, 29) == 'http://needl.s3.amazonaws.com' && !hasPicture) {
            options.imagelink = picture;
            hasPicture = true;
          }

          if (key == restaurant.pictures.length - 1 && !hasPicture) {
            options.imagelink = 'https://s3-eu-west-1.amazonaws.com/needl/production/supports/image+needl.jpg';
          }
        })
      }
    }

    NativeModules.KDSocialShare.shareOnFacebook(options, (results) => {
      if (__DEV__) {
        console.log(results);
      }

      if (results == 'success') {
        Mixpanel.trackWithProperties('Facebook Share Reco', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, restaurant: restaurant.name});
      }
    });
  };

  removePicture = (key) => {
    var newRecommendationPictures = this.state.recommendationPictures;
    _.pullAt(newRecommendationPictures, key);

    this.setState({recommendationPictures: newRecommendationPictures});
  }

  render() {
    var me = ProfilStore.getProfil(MeStore.getState().me.id);
    var recommenders = _.remove(RestaurantsStore.getRecommenders(this.state.recommendation.restaurant.id), (id) => {return id !== MeStore.getState().me.id});
    return (
      <View>
        <NavigationBar type='back' title='Publier' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView onScroll={this.closeKeyboard} scrollEventThrottle={16} style={styles.container} scrollEnabled={true} keyboardShouldPersistTaps={true}>
          <View style={styles.recoContainer}>
            <TextInput 
              ref='review'
              placeholder='Le mot de la fin ? Un plat à ne pas manquer ?'
              placeholderTextColor='#837D9B'
              style={styles.reviewInput}
              maxLength={140}
              multiline={true}
              value={this.state.review}
              returnKeyType={ProfilStore.getProfil(MeStore.getState().me.id).public ? 'next' : 'done'}
              onChangeText={(review) => {
                this.setState({review: review});
                this.handleChange(review.length);
              }} />
              <Text style={styles.character}>{this.state.characterNbRemaining} car.</Text>
          </View>

          {/* Add an URL to the recommendation */}
          {ProfilStore.getProfil(MeStore.getState().me.id).public ? [
            <View key='public_url' style={{alignItems: 'flex-start', justifyContent: 'center', margin: 10}}>
              <TextInput
               style={styles.urlInput}
               keyboardType='url'
               returnKeyType='done'
               autoCorrect={false}
               autoCapitalize='none'
               placeholder='URL'
               placeholderTextColor='#837D9B'
               multiline={false}
               onChangeText={(url) => {
                 this.setState({url: url});
               }} />
            </View>
          ] : null}

          {/* Private or public recommendation */}
          {ProfilStore.getProfil(MeStore.getState().me.id).public ? [
            <View key='public_recommendation' style={{paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <Switch
                onValueChange={(value) => this.setState({public_recommendation: value})}
                value={this.state.public_recommendation} />
              <Text style={{marginLeft: 10, fontSize: 12, color: '#3A325D'}}>Recommandation {this.state.public_recommendation ? 'publique' : 'privée'}</Text>
            </View>
          ] : null}

          {/* Add a picture if your profile is public */}
          {ProfilStore.getProfil(MeStore.getState().me.id).public ? [
            <View key='public_pictures' style={{alignItems: 'center', justifyContent: 'center', margin: 10}}>
              <Text style={styles.thanksTitle}>Une photo à ajouter ?</Text>
              <ScrollView 
                style={styles.thanksScroller}
                alignItems='flex-start'
                horizontal={true}>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={{height: IMAGE_WIDTH, width: IMAGE_WIDTH, margin: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEEDF1'}}
                  onPress={this.choosePicture}>
                  <Icon
                    key='icon'
                    name='plus'
                    size={IMAGE_WIDTH / 2}
                    color='#837D9B' />
                </TouchableHighlight>
                {_.map(this.state.recommendationPictures, (picture, key) => {
                  return (
                    <TouchableHighlight
                      key={'photo_' + key}
                      underlayColor='rgba(0, 0, 0, 0)'
                      onPress={() => this.removePicture(key)}>
                      <Image style={{margin: 5, height: IMAGE_WIDTH, width: IMAGE_WIDTH}} source={{uri: picture}} />
                    </TouchableHighlight>
                  );
                })}
              </ScrollView>
            </View>
          ] : null}

          
          <View key='recommenders' style={styles.thanksContainer}>
            <Text style={styles.thanksTitle}>Quelqu'un à remercier ?</Text>
            <ScrollView 
              style={styles.thanksScroller}
              alignItems='flex-start'
              horizontal={true}>
              <View style={styles.recommendersContainer}>
                <View style={styles.recommenderContainer}>
                  <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.inviteFriend} style={styles.recommenderButton}>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                      <View style={{backgroundColor: '#EEEDF1', width: IMAGE_WIDTH, height: IMAGE_WIDTH, borderRadius: IMAGE_WIDTH / 2, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon
                          name='plus'
                          size={IMAGE_WIDTH / 2}
                          color='#837D9B' 
                          style={{marginTop: 5}} />
                      </View>
                      <Text style={[styles.recommenderName, {color: '#837D9B'}]}>Contacts</Text>
                    </View>
                  </TouchableHighlight>
                </View>
                {_.map(recommenders, (recommenderId) => {
                  return this.renderRecommender(recommenderId);
                })}
              </View>
            </ScrollView>
          </View>

          {/* Social sharing nly on iOS at the moment */}
          {Platform.OS == 'ios' ? [
            <View key='social_sharing' style={styles.shareContainer}>
              <Text style={styles.thanksTitle}>Partager au-delà des frontières</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  onPress={this.shareOnFacebook}
                  style={[styles.shareButton, {borderColor: '#3B5998'}]}>
                  <Icon
                    name='facebook'
                    size={25}
                    color='#3B5998' />
                </TouchableHighlight>

                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  onPress={this.tweet}
                  style={[styles.shareButton, {borderColor: '#4099FF'}]}>
                  <Icon
                    name='twitter'
                    size={30}
                    color='#4099FF' />
                </TouchableHighlight>
              </View>
            </View>
          ] : null}

          <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20}}>
            <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.onRightButtonPress} style={styles.submitButton}>
              <Text style={{color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontWeight: '500'}}>Publier</Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
        <View style={styles.progressBar}>
          <View style={styles.progressBarCompleted} />
        </View>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    margin: 0,
    flex: 1,
    paddingTop: 10,
    height: Platform.OS == 'ios' ? Dimensions.get('window').height - 60 : Dimensions.get('window').height - 40
  },
  recoContainer: {
    margin: 10
  },
  character: {
    color: '#3A325D',
    fontSize: 10,
    textAlign: 'right'
  },
  reviewInput: {
    padding: 10,
    marginBottom: 5,
    height: 100,
    backgroundColor: '#EEEDF1',
    textAlignVertical: 'top',
    color: '#3A325D',
    borderColor: '#C1BFCC',
    borderWidth: 0.5,
    marginTop: Platform.OS === 'android' ? 20 : 0,
    fontSize: 12
  },
  thanksContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
  thanksTitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    color: '#3A325D'
  },
  recommendersContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  recommenderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: IMAGE_WIDTH + 10,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
  },
  recommenderImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    borderRadius: IMAGE_WIDTH / 2
  },
  recommenderName: {
    textAlign: 'center',
    width: IMAGE_WIDTH,
    marginTop: 10,
    fontWeight: '500',
    fontSize: 12
  },
  grayImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    borderRadius: IMAGE_WIDTH / 2,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(178, 190, 181, 0.7)'
  },
  submitButton: {
    width: 150,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FE3139'
  },
  progressBar: {
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    height: 10,
    position: 'absolute',
    backgroundColor: '#C1BFCC'
  },
  progressBarCompleted: {
    backgroundColor: '#9CE62A',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: 10
  },
  urlInput: {
    padding: 10,
    marginBottom: 5,
    height: 40,
    backgroundColor: '#EEEDF1',
    textAlignVertical: 'top',
    color: '#3A325D',
    borderColor: '#C1BFCC',
    borderWidth: 0.5,
    fontSize: 12
  },
  thanksScroller: {
    width: windowWidth - 20
  },
  shareContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  shareButton: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    width: 50,
    height: 50,
    borderRadius: 25
  }
});

export default RecoStep6;
