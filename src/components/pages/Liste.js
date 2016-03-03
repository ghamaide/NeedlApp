'use strict';

import React, {Image, ListView, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import PushNotification from 'react-native-push-notification';
import RefreshableListView from 'react-native-refreshable-listview';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import RestaurantElement from '../elements/Restaurant';

import MeActions from '../../actions/MeActions';
import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import RestaurantsStore from '../../stores/Restaurants';

import Carte from './Carte';
import Filtre from './Filtre';
import Help from './Help';
import Restaurant from './Restaurant';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class Liste extends Page {
  static route() {
    return {
      component: Liste,
      title: 'Restaurants'
    };
  };

  restaurantsState() {
    return {
      restaurants: RestaurantsStore.filteredRestaurants(),
      loading: RestaurantsStore.loading(),
      errors: RestaurantsStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.renderPlaceholderOnly = true;
  };

  componentWillMount() {
    if (!MeStore.getState().showTabBar) {
      MeActions.displayTabBar(true);
    }
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  onRefresh = () => {
    RestaurantsActions.fetchRestaurants();
  };

  onPressText = () => {
  	this.props.navigator.push(Help.route({from: 'liste'}));
  };

	renderRestaurant = (restaurant) => {
    return (
      <RestaurantElement
      	rank={_.findIndex(this.state.restaurants, restaurant) + 1}
        name={restaurant.name}
        picture={restaurant.pictures[0]}
        subway={RestaurantsStore.closestSubwayName(restaurant.id)}
        type={restaurant.food[1]}
        budget={restaurant.price_range}
        height={200}
        marginTop={5}
        marginBottom={5}
        underlayColor={'#FFFFFF'}
        key={restaurant.id}
        onPress={() => {
          this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
        }}/>
    );
  };

  renderHeaderWrapper = (refreshingIndicator) => {
    var restaurantNumber = this.state.restaurants.length;
    if (restaurantNumber > 0) {
      return (
        <View>
          {refreshingIndicator}
          {
            //<Text key='number_restaurants' onPress={this.onPressText} style={styles.numberRestaurants}>{this.state.restaurants.length} {this.state.restaurants.length > 1 ? 'restaurants classés' : 'restaurant classé'} par pertinence personnalisée via ton activité et celle de tes amis (+) </Text>
          }
        </View>
      );
    } else {
      return(
        <View>
          {refreshingIndicator}
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>Tu n'as pas de restaurants avec ces critères. Essaie de modifier les filtres ou de changer de lieu sur la carte.</Text>
          </View>
        </View>
      );
    }
  };

  renderPage() {
    return (
      <View style={{flex: 1, position: 'relative'}}>
        <NavigationBar image={require('../../assets/img/other/icons/map.png')} title='Restaurants' rightButtonTitle='Carte' onRightButtonPress={() => this.props.navigator.replace(Carte.route())} />

        <TouchableHighlight key='filter_button' style={styles.filterContainerWrapper} underlayColor='#FFFFFF' onPress={() => {
        	this.props.navigator.push(Filtre.route({navigator: this.props.navigator}));
        }}>
            <Text style={styles.filterMessageText}>
              {RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
            </Text>
        </TouchableHighlight>
        <RefreshableListView
          key='list_restaurants'
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          dataSource={ds.cloneWithRows(this.state.restaurants.slice(0, 18))}
          renderRow={this.renderRestaurant}
          renderHeaderWrapper={this.renderHeaderWrapper}
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  filterMessageText: {
    color: '#EF582D',
    fontSize: 15,
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    fontFamily: 'test'
  },
  filterContainerWrapper: {
    borderColor: '#EF582D',
    borderWidth: 1,
    borderRadius: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7
  },
  emptyTextContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    padding: 20,
    fontSize: 15,
    fontWeight: '600'
  },
  numberRestaurants: {
    textAlign: 'center',
    color: '#444444',
    marginLeft: 10,
    marginRight: 10,
    fontSize: Platform.OS === 'ios' ? 13 : 11,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#444444'
  }
});

export default Liste;
