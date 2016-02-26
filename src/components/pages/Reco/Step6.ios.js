'use strict';

import React, {Component, Dimensions, Image, NativeModules, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import Mixpanel from 'react-native-mixpanel';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';
import TextInput from '../../ui/TextInput';

import MeStore from '../../../stores/Me';
import ProfilStore from '../../../stores/Profil';
import RecoStore from '../../../stores/Reco';
import RestaurantsStore from '../../../stores/Restaurants';

import StepSave from './StepSave';

let IMAGE_WIDTH = 70; 

class RecoStep6 extends Component {
  static route() {
    return {
      component: RecoStep6,
      title: 'Mot de la fin',
    };
  };

  state = {
    keyboardSpace: 0,
    characterNbRemaining: 140,
    thanksIds: []
  };

  componentDidMount() {
    Mixpanel.sharedInstanceWithToken('1637bf7dde195b7909f4c3efd151e26d');
  };

  handleChange = (characterNb) => {
    var temp = 140 - characterNb; 
    this.setState({characterNbRemaining: temp});
  };

  closeKeyboard = () => {
    this.refs.review.blur();
  };

  onRightButtonPress = () => {
    var reco = RecoStore.getReco();
    reco.friends_thanking = this.state.thanksIds;
    this.props.navigator.resetTo(StepSave.route());
  };

  thankRecommender = (recommenderId) => {
    var thanksIds = this.state.thanksIds;
    if (!_.includes(thanksIds, recommenderId)) {
      thanksIds.push(recommenderId);
      this.setState({thanksIds: thanksIds});
    } else {
      thanksIds = _.filter(thanksIds, (id) => {
        return id !== recommenderId;
      });
      this.setState({thanksIds: thanksIds});
    }
  };

  renderRecommender = (recommenderId) => {
    var recommender = ProfilStore.getProfil(recommenderId);
    var active = _.includes(this.state.thanksIds, recommenderId);
    return (
      <View key={'recommender_' + recommenderId} style={styles.recommenderContainer}>
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => this.thankRecommender(recommenderId)} style={styles.recommenderButton}>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Image style={styles.recommenderImage} source={{uri: recommender.picture}} />
            {!active ? [
              <View key={'active_' + recommenderId} style={styles.grayImage} />
            ] : null}
            <Text style={[styles.recommenderName, {color: active ? '#333333' : '#AAAAAA'}]}>{recommender.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  };

  inviteFriend = () => {
    var reco = RecoStore.getReco();
    NativeModules.RNMessageComposer.composeMessageWithArgs({
      'messageText': 'Merci de m\'avoir fait découvrir ' + reco.restaurant.name + '. Tu as gagné un point d\'expertise sur Needl ! Tu peux venir le récupérer ici : http://download.needl-app.com/invitation',
    }, (result) => {
      switch(result) {
        case NativeModules.RNMessageComposer.Sent:
          Mixpanel.trackWithProperties('Thanks sent', {id: MeStore.getState().me.id, user: MeStore.getState().me.name, type: 'Text', user_type: 'contact'});
          break;
        case NativeModules.RNMessageComposer.Cancelled:
          // console.log('user cancelled sending the message');
          break;
        case NativeModules.RNMessageComposer.Failed:
          // console.log('failed to send the message');
          break;
        case NativeModules.RNMessageComposer.NotSupported:
          // console.log('this device does not support sending texts');
          break;
        default:
          // console.log('something unexpected happened');
          break;
      }
    });
  };

  render() {
    var reco = RecoStore.getReco();
    var recommenders = _.remove(RestaurantsStore.getRecommenders(reco.restaurant.id), (id) => {return id !== 553});
    return (
      <View>
        <NavigationBar title='Publier' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView onScroll={this.closeKeyboard} style={styles.container} scrollEnabled={true}>
          <View style={styles.recoContainer}>
            <TextInput 
              ref='review'
              placeholder='Un mot de la fin ? Un plat à ne pas manquer ?'
              placeholderTextColor='#555555'
              style={styles.reviewInput}
              maxLength={140}
              multiline={true}
              value={reco.review}
              onChangeText={(review) => {
                reco.review = review;
                this.forceUpdate();
                this.handleChange(reco.review.length);
              }} />
              <Text style={styles.character}>{this.state.characterNbRemaining} car.</Text>
          </View>
          
          {false ? [ // on update, remove
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
                        <View style={{borderColor: '#AAAAAA', borderWidth: 4, width: IMAGE_WIDTH, height: IMAGE_WIDTH, borderRadius: IMAGE_WIDTH / 2, alignItems: 'center', justifyContent: 'center'}}>
                          <Icon
                            name='plus'
                            size={IMAGE_WIDTH / 2}
                            color='#AAAAAA' 
                            style={{marginTop: 5}} />
                        </View>
                        <Text style={[styles.recommenderName, {color: '#AAAAAA'}]}>Contacts</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                  {_.map(recommenders, (recommenderId) => {
                    return this.renderRecommender(recommenderId);
                  })}
                </View>
              </ScrollView>
            </View>
          ] : null}
          <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20}}>
            <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={this.onRightButtonPress} style={styles.submitButton}>
              <Text style={{color: '#FFFFFF', fontSize: 15, textAlign: 'center', fontWeight: '500'}}>Publier</Text>
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
    height: Dimensions.get('window').height
  },
  recoContainer: {
    margin: 8
  },
  character: {
    color: '#555555',
    fontSize: 10,
    textAlign: 'right'
  },
  reviewInput: {
    padding: 10,
    marginBottom: 5,
    height: 100,
    backgroundColor: '#EEEEEE',
    textAlignVertical: 'top',
    color: '#555555',
    borderColor: '#CCCCCC',
    borderWidth: 0.5,
    marginTop: Platform.OS === 'android' ? 20 : 0
  },
  thanksContainer: {
    margin: 8
  },
  thanksTitle: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20
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
    fontSize: 15
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
    backgroundColor: '#EF582D'
  },
  progressBar: {
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    height: 10,
    position: 'absolute',
    backgroundColor: '#DDDDDD'
  },
  progressBarCompleted: {
    backgroundColor: '#38E1B2',
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: 10
  }
});

export default RecoStep6;
