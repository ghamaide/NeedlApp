'use strict';

import React, {Image, ListView, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import PushNotification from 'react-native-push-notification';
import RefreshableListView from 'react-native-refreshable-listview';

import MenuIcon from '../ui/MenuIcon';
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
  static route(props) {
    return {
      component: Liste,
      title: 'Restaurants',
      passProps: props
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
        <NavigationBar type='default' rightImage={require('../../assets/img/other/icons/map.png')} title='Restaurants' rightButtonTitle='Carte' onRightButtonPress={() => this.props.navigator.replace(Carte.route({has_shared: this.props.has_shared, pastille_notifications: this.props.pastille_notifications, toggle: this.props.toggle}))} />

        <TouchableHighlight style={styles.filterContainerWrapper} underlayColor='#FFFFFF' onPress={() => {
          this.props.navigator.push(Filtre.route());
        }}>
            <Text style={styles.filterMessageText}>
              {RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Besoin d\'aide ?'}
            </Text>
        </TouchableHighlight>
        <RefreshableListView
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          dataSource={ds.cloneWithRows(this.state.restaurants.slice(0, 18))}
          renderRow={this.renderRestaurant}
          renderHeaderWrapper={this.renderHeaderWrapper}
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />

        <MenuIcon onPress={this.props.toggle} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  filterMessageText: {
    color: '#FE3139',
    fontSize: 15,
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    fontFamily: 'test'
  },
  filterContainerWrapper: {
    borderColor: '#FE3139',
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
  }
});

export default Liste;
