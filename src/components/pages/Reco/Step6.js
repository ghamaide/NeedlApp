'use strict';

import React, {Component, Dimensions, Image, NativeModules, Platform, ScrollView, StyleSheet, Switch, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mixpanel from 'react-native-mixpanel';
import SendIntentAndroid from 'react-native-send-intent';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';
import TextInput from '../../ui/TextInput';

import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import ProfilStore from '../../../stores/Profil';
import RecoStore from '../../../stores/Reco';
import RestaurantsStore from '../../../stores/Restaurants';

import StepSave from './StepSave';

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
    this.state.public_recommendation = ProfilStore.getProfil(MeStore.getState().me.id).score >= 20;
  }

  stepState() {
    var recommendation = RecoStore.getReco();
    return {
      recommendation: recommendation,
      review: recommendation.review,
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
    recommendation.public = this.state.public_recommendation;
    RecoActions.setReco(recommendation);
    this.props.navigator.resetTo(StepSave.route({toggle: this.props.toggle}));
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
            <Text style={[styles.recommenderName, {color: active ? '#3A325D' : '#AAAAAA'}]}>{recommender.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  inviteFriend = () => {
    if (Platform.OS === 'android') {
      SendIntentAndroid.sendSms('', 'Merci de m\'avoir fait découvrir ' + this.state.recommendation.restaurant.name + '. Tu as gagné un point d\'expertise sur Needl ! Tu peux venir le récupérer ici : http://download.needl-app.com/invitation');
      Mixpanel.trackWithProperties('Thanks sent', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, type: 'Text', user_type: 'contact'});
    } else if (Platform.OS === 'ios') {
      NativeModules.RNMessageComposer.composeMessageWithArgs({
        'messageText': 'Merci de m\'avoir fait découvrir ' + this.state.recommendation.restaurant.name + '. Tu as gagné un point d\'expertise sur Needl ! Tu peux venir le récupérer ici : http://download.needl-app.com/invitation',
      }, (result) => {
        switch(result) {
          case NativeModules.RNMessageComposer.Sent:
            Mixpanel.trackWithProperties('Thanks sent', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, type: 'Text', user_type: 'contact'});
            break;
          case NativeModules.RNMessageComposer.Cancelled:
            // User cancelled sending the message
            break;
          case NativeModules.RNMessageComposer.Failed:
            // Message failed to send
            break;
          case NativeModules.RNMessageComposer.NotSupported:
            // The device does not support sending text messages
            break;
          default:
            // Something unexpected happened
            break;
        }
      });
    }
  };

  render() {
    var recommenders = _.remove(RestaurantsStore.getRecommenders(this.state.recommendation.restaurant.id), (id) => {return id !== MeStore.getState().me.id});
    return (
      <View>
        <NavigationBar type='back' title='Publier' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView onScroll={this.closeKeyboard} scrollEventThrottle={16} style={styles.container} scrollEnabled={true} keyboardShouldPersistTaps={true}>
          <View style={styles.recoContainer}>
            <TextInput 
              ref='review'
              placeholder='Le mot de la fin ? Un plat à ne pas manquer ?'
              placeholderTextColor='#555555'
              style={styles.reviewInput}
              maxLength={140}
              multiline={true}
              value={this.state.review}
              onChangeText={(review) => {
                this.setState({review: review});
                this.handleChange(review.length);
              }} />
              <Text style={styles.character}>{this.state.characterNbRemaining} car.</Text>
          </View>
          
          {ProfilStore.getProfil(MeStore.getState().me.id).score >= 20 ? [
            <View key='public_recommendation' style={{paddingLeft: 10, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <Switch
                onValueChange={(value) => this.setState({public_recommendation: value})}
                value={this.state.public_recommendation} />
              <Text style={{marginLeft: 10, fontSize: 12, color: '#3A325D'}}>Recommandation {this.state.public_recommendation ? 'publique' : 'privée'}</Text>
            </View>
          ] : null}
          
          <View key='recommenders' style={styles.thanksContainer}>
            <Text style={styles.thanksTitle}>Quelqu'un à remercier ?</Text>
            <ScrollView 
              style={styles.thanksScroller}
              alignItems='center'
              horizontal={true}>
              <View style={styles.recommendersContainer}>
                <View style={styles.recommenderContainer}>
                  <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.inviteFriend} style={styles.recommenderButton}>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                      <View style={{borderColor: '#C1BFCC', borderWidth: 4, width: IMAGE_WIDTH, height: IMAGE_WIDTH, borderRadius: IMAGE_WIDTH / 2, alignItems: 'center', justifyContent: 'center'}}>
                        <Icon
                          name='plus'
                          size={IMAGE_WIDTH / 2}
                          color='#C1BFCC' 
                          style={{marginTop: 5}} />
                      </View>
                      <Text style={[styles.recommenderName, {color: '#C1BFCC'}]}>Contacts</Text>
                    </View>
                  </TouchableHighlight>
                </View>
                {_.map(recommenders, (recommenderId) => {
                  return this.renderRecommender(recommenderId);
                })}
              </View>
            </ScrollView>
          </View>

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
    marginLeft: 10,
    marginRight: 10,
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
  }
});

export default RecoStep6;
