'use strict';

import React, {ActivityIndicatorIOS, Component, Dimensions, Image, ListView, NativeModules, Platform, ProgressBarAndroid, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Animatable from 'react-native-animatable';
import SearchBar from 'react-native-search-bar';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';
import TextInput from '../../ui/TextInput';

import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import RecoStore from '../../../stores/Reco';

import Step2 from './Step2';
import Step3 from './Step3';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class RecoStep1 extends Component {
  static route() {
    return {
      component: RecoStep1,
      title: 'Sélection'
    };
  };

  getRecoState = () => {
    return {
      restaurants: RecoStore.getQueryRestaurants(),
      loading: RecoStore.loading(),
      error: RecoStore.error()
    };
  };

  constructor(props) {
    super(props);

    this.state = this.getRecoState();
  }

  componentWillMount() {
    RecoStore.listen(this.onRecoChange);
  };

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoChange);
  };

  onRecoChange = () => {
    this.setState(this.getRecoState());
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  renderRestaurant = (restaurant) => {
    return (
      <TouchableHighlight style={styles.restaurantRow} onPress={() => {
        // check if already reco or wish
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
  };

  renderRestaurants() {
    return (
      <ListView
        style={styles.restaurantsList}
        dataSource={ds.cloneWithRows(this.state.restaurants || [])}
        renderRow={this.renderRestaurant}
        contentInset={{top: 0}}
        onScroll={this.closeKeyboard}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false} />
    );
  };

  renderBlankScreen(content) {
    return (
      <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' style={[styles.viewContainer, {height: Dimensions.get('window').height - 50}]} onPress={this.closeKeyboard}>
        <View>
          {content}
        </View>
      </TouchableHighlight>
    );
  };

  render() {
    var content;

    if (!this.state.query) {
      content = this.renderBlankScreen();
    } else if(this.state.loading) {
      content = (Platform.OS === 'ios' ? this.renderBlankScreen(<ActivityIndicatorIOS animating={true} style={[{height: 80}]} size='large' />) : this.renderBlankScreen(<ProgressBarAndroid indeterminate />));
    } else if(this.state.error) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Votre requête a eu un problème d'exécution, veuillez réessayer</Text>);
    } else if (this.state.restaurants.length < 1) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Pas de résultat</Text>);
    } else {
      content = this.renderRestaurants();
    }

    return (
     <View style={styles.container}>
      <NavigationBar title='Séléction' />
      
      {Platform.OS === 'ios' ? [
        <SearchBar
          key='search'
          ref='searchBar'
          placeholder='Sélectionne ton restaurant'
          hideBackground={true}
          textFieldBackgroundColor='#DDDDDD'
          onChangeText={this.onRestaurantQuery} />
      ] : [
        <TextInput
          key='search'
          ref='searchBar'
          placeholderTextColor='#333333'
          placeholder='Sélectionne ton restaurant'
          style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5, color: '#333333'}}
          onChangeText={this.onRestaurantQuery} />
      ]}

      {!MeStore.getState().me.HAS_SHARED && !this.state.query ?
        <TouchableHighlight onPress={this.closeKeyboard} underlayColor='rgba(0, 0, 0, 0)' style={styles.firstMessage}>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 40}}>
            <Animatable.Image
              animation='slideInDown'
              iterationCount='infinite'
              direction='alternate'
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
  };

  onRestaurantQuery = (query) => {
    RecoActions.fetchRestaurants(query);
    this.setState({query: query});
  };
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
    padding: 10
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
