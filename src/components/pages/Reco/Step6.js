'use strict';

import React, {StyleSheet, Component, Text, View, TextInput, Dimensions} from 'react-native';
import KeyboardEvents from 'react-native-keyboardevents';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';

import StepSave from './StepSave';

var KeyboardEventEmitter = KeyboardEvents.Emitter;
var windowWidth = Dimensions.get('window').width;

class RecoStep6 extends Component {
  static route() {
    return {
      component: RecoStep6,
      title: 'Mot de la fin',
      rightButtonTitle: 'Valider',
      onRightButtonPress() {
        var reco = RecoStore.getReco();
        // hack pour le fucking title ..
        // because resetTo does not change title if only one page in the stack
        var title = MeStore.getState().me.HAS_SHARED ? reco.restaurant.name : 'Bienvenue sur Needl !';
        this.resetTo(StepSave.route(title));
      }
    };
  }

  state = {
    keyboardSpace: 0,
    characterNbRemaining: 140
  }

  updateKeyboardSpace = (frames) => {
    this.setState({keyboardSpace: frames.end.height});
  }

  resetKeyboardSpace = () => {
    this.setState({keyboardSpace: 0});
  }

  componentDidMount() {
    //KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    //KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  componentWillUnmount() {
    //KeyboardEventEmitter.off(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    //KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  handleChange(characterNb) {
    var temp = 140 - characterNb; 
    this.setState({characterNbRemaining: temp});
  }

  render() {
    var reco = RecoStore.getReco();
    return (
      <View style={styles.container}>
        <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center'}}>
          <Text style={styles.title}>Taille d'un tweet</Text>
          <Text style={styles.character}>{this.state.characterNbRemaining} caractère{this.state.characterNbRemaining > 1 ? 's' : ''}...</Text>
          <TextInput ref="review" placeholder="Un plat t'a particulièrement plu ?" style={styles.reviewInput}
            maxLength={140}
            multiline={true}
            value={reco.review}
            onChangeText={(review) => {
              reco.review = review;
              this.forceUpdate();
              this.handleChange(reco.review.length);
            }} />
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressBarCompleted} />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
 container: {
  backgroundColor: 'transparent',
  paddingTop: 30,
  paddingBottom: 10
 },
 title: {
  width: windowWidth,
  marginTop: 10,
  color: '#000000',
  fontSize: 15,
  textAlign: 'center'
 },
 character: {
  width: windowWidth,
  marginTop: 5,
  marginBottom: 15,
  color: '#000000',
  fontSize: 12,
  textAlign: 'center'
 },
 reviewInput: {
  padding: 10,
  margin: 5,
  height: 100,
  borderWidth: 1,
  borderColor: '#ccc',
  color: '#444444'
 },
progressBar: {
  top: 0,
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
  width: windowWidth,
  height: 10
 }
});

export default RecoStep6;
