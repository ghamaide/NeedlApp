'use strict';

import React, {NativeModules, View, Component, Text, StyleSheet, ListView, ActivityIndicatorIOS, TouchableHighlight, Image} from 'react-native';
import _ from 'lodash';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';

import RecoActions from '../../../actions/RecoActions';
import RecoStore from '../../../stores/Reco';
import MeStore from '../../../stores/Me';
import Step2 from './Step2';
import Step3 from './Step3';

let restaurantsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class RecoStep1 extends Component {
  static route() {
    return {
      component: RecoStep1,
      title: 'Sélection'
    };
  }

  static getRecoState() {
    var state = RecoStore.getState();
    state.nb = state.restaurants && state.restaurants.length;
    state.restaurants = restaurantsSource.cloneWithRows(state.restaurants || []);
    return state;
  }

  state = RecoStep1.getRecoState()

  componentWillMount() {
    RecoStore.listen(this.onRecoChange);
  }

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoChange);
  }

  onRecoChange = () => {
    this.setState(RecoStep1.getRecoState());
  }

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  }

  renderRestaurant = (restaurant) => {
    return (
      <TouchableHighlight style={styles.restaurantRow} onPress={() => {
        RecoActions.setReco({restaurant: restaurant});
        this.closeKeyboard();
        this.props.navigator.push(Step2.route());
      }}>
        <View style={styles.restaurantRowInner}>
          <Text style={{color: '#000000'}}>{restaurant.name_and_address.split(': ')[0]}</Text>
          <Text style={{color: '#444444'}}>{restaurant.name_and_address.split(': ')[1]}</Text>
        </View>
      </TouchableHighlight> 
    );
  }

  renderRestaurants() {
    return (
      <ListView
        style={styles.restaurantsList}
        dataSource={this.state.restaurants}
        renderRow={this.renderRestaurant}
        contentInset={{top: 0}}
        onScroll={this.closeKeyboard}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false} />
    );
  }

  renderBlankScreen(content) {
    return (
      <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' style={styles.viewContainer} onPress={this.closeKeyboard}>
        <View>
          {content}
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    var content;

    if (!this.state.query) {
      content = this.renderBlankScreen();
    } else if(this.state.status.restaurantsLoading) {
      content = this.renderBlankScreen(<ActivityIndicatorIOS
        animating={true}
        style={[{height: 80}]}
        size="large" />
        );
    } else if(this.state.status.restaurantsLoadingError) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Votre requête a eu un problème d'exécution, veuillez réessayer</Text>);
    } else if (!this.state.nb) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Pas de résultat</Text>);
    } else {
      content = this.renderRestaurants();
    }

    return (
     <View style={styles.container}>
      <SearchBar
        ref='searchBar'
        placeholder='Sélectionne ton restaurant'
        hideBackground={true}
        textFieldBackgroundColor='#DDDDDD'
        onChangeText={this.onRestaurantQuery} />

      {!MeStore.getState().me.HAS_SHARED && !this.state.query ?
        <TouchableHighlight onPress={this.closeKeyboard} underlayColor='rgba(0, 0, 0, 0)' style={styles.firstMessage}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 40}}>
            <Animatable.Image
              animation="slideInDown"
              iterationCount="infinite"
              direction="alternate"
              duration={1000}
              style={styles.arrowUp}
              source={require('../../../assets/img/other/icons/arrow_up.png')} />
            <Text style={[styles.firstMessageText, {marginTop: 20}]}>Recommande ton premier restaurant à tes amis !</Text>
            <Text style={[styles.firstMessageText, {marginTop: 25}]}>Chaque interaction nous permet de personnaliser plus finement la pertinence des restaurants qui te sont conseillés.</Text>
          </View>
        </TouchableHighlight>
      : null}

        {content}

     </View>
    );
  }

  onRestaurantQuery = (query) => {
    RecoActions.fetchRestaurants(query);
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10
  },
  restaurantQueryInput: {
    height: 50,
    backgroundColor: '#DDDDDD',
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 15,
    margin: 10,
    fontSize: 14,
    color: '#222222'
  },
  restaurantsList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  restaurantRowInner: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD'
  },
  viewContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 10,
  },
  noResultText: {
    fontWeight: 'bold',
    color: '#000000'
  },
  firstMessage: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstMessageText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    paddingLeft: 15,
    paddingRight: 15
  },
  arrowUp: {
    width: 50,
    height: 50,
    margin: 5
  }
});

export default RecoStep1;
