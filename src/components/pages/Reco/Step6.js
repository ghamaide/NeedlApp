'use strict';

import React, {StyleSheet, Component, View, TextInput, Dimensions, ScrollView} from 'react-native';

import Text from '../../ui/Text';
import NavigationBar from '../../ui/NavigationBar';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';

import StepSave from './StepSave';

var windowWidth = Dimensions.get('window').width;

class RecoStep6 extends Component {
  static route() {
    return {
      component: RecoStep6,
      title: 'Mot de la fin',
      rightButtonTitle: 'Valider',
    };
  };

  state = {
    keyboardSpace: 0,
    characterNbRemaining: 140
  };

  handleChange(characterNb) {
    var temp = 140 - characterNb; 
    this.setState({characterNbRemaining: temp});
  };

  onRightButtonPress = () => {
    var reco = RecoStore.getReco();
    // hack pour le fucking title ..
    // because resetTo does not change title if only one page in the stack
    var title = MeStore.getState().me.HAS_SHARED ? reco.restaurant.name : 'Bienvenue sur Needl !';
    this.props.navigator.resetTo(StepSave.route(title));
  };

  render() {
    var reco = RecoStore.getReco();
    return (
      <View>
        <NavigationBar title="Occasions" rightButtonTitle="Valider" onRightButtonPress={this.onRightButtonPress} />      
        <ScrollView style={styles.container} scrollEnabled={false}>
          <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'center'}}>
            <Text style={styles.subtitle}>(Optionnel)</Text>
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
        </ScrollView>
      </View>
    );
  };
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
  subtitle: {
    width: windowWidth,
    marginTop: 2,
    color: '#000000',
    fontSize: 13,
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
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#444444'
  },
  progressBar: {
    top: -30,
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
