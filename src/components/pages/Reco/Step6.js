'use strict';

import React, {StyleSheet, Component, Text, View, TextInput} from 'react-native';
import KeyboardEvents from 'react-native-keyboardevents';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';

import StepSave from './StepSave';

var KeyboardEventEmitter = KeyboardEvents.Emitter;

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
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.title}>En {this.state.characterNbRemaining} caractères... </Text>
          <TextInput ref="review" placeholder="Un plat t'a particulièrement plu ?" style={[styles.reviewInput, {marginBottom: Math.max(0, /*this.state.keyboardSpace - 60*/)}]}
            maxLength={140}
            multiline={true}
            value={reco.review}
            onChangeText={(review) => {
              reco.review = review;
              this.forceUpdate();
              this.handleChange(reco.review.length);
            }} />
        </View>
        <View style={{flex: 1}} />
      </View>
    );
  }
}

var styles = StyleSheet.create({
 container: {
  backgroundColor: 'transparent',
  padding: 10,
  flex: 1
 },
 title: {
  marginTop: 10,
  marginBottom: 20,
  color: '#000000',
  fontSize: 16,
  textAlign: 'center'
 },
 reviewInput: {
  flex: 1,
  padding: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  color: '#444444'
 }
});

export default RecoStep6;
