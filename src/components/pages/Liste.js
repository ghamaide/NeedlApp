'use strict';

import React, {StyleSheet, ListView, View, TouchableHighlight, Image, ScrollView, RefreshControl} from 'react-native';

import _ from 'lodash';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';

import RestaurantsActions from '../../actions/RestaurantsActions';
import MeActions from '../../actions/MeActions';

import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';

import Filtre from './Filtre';
import Carte from './Carte';
import Restaurant from './Restaurant';
import Help from './Help';

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
      // we want the map even if it is still loading
      data: RestaurantsStore.filteredRestaurants(),
      loading: RestaurantsStore.loading(),
      errors: RestaurantsStore.error()
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.showsUserLocation = false;
  };

  componentWillMount() {
  	if (!MeStore.getState().showTabBar) {
  		MeActions.displayTabBar(true);
  	}
    RestaurantsActions.fetchRestaurants.defer();
    RestaurantsStore.listen(this.onRestaurantsChange);
  };

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  };

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  onRefresh = () => {
  	RestaurantsActions.fetchRestaurants();
  };

  onPressText = () => {
  	this.props.navigator.push(Help.route("Aide", {from: "liste"}));
  };

	renderRestaurant = (restaurant) => {
    return (
      <RestaurantElement
        style={{overflow: 'hidden'}}
      	rank={_.findIndex(this.state.data, restaurant) + 1}
      	isNeedl={restaurant.score <= 5}
        name={restaurant.name}
        picture={restaurant.pictures[0]}
        subway={RestaurantsStore.closestSubwayName(restaurant.id)}
        type={restaurant.food[1]}
        budget={restaurant.price_range}
        height={200}
        marginTop={5}
        marginBottom={5}
        underlayColor={"#FFFFFF"}
        key={restaurant.id}
        onPress={() => {
          this.props.navigator.push(Restaurant.route({id: restaurant.id}, restaurant.name));
        }}/>
    );
  };

  renderHeaderWrapper = (refreshingIndicator) => {
  	if (!this.state.data.length) {
  		return(
  			<View>
	 				{refreshingIndicator}
	  			<View style={styles.emptyTextContainer}>
	  				<Text style={styles.emptyText}>Tu n'as pas de restaurants avec ces critères. Essaie de modifier les filtres ou de changer de lieu sur la carte.</Text>
	  			</View>
	  		</View>
  		);
  	} else {
  		return (
  			<View>
	   			{refreshingIndicator}
					<Text key="number_restaurants" style={styles.numberRestaurants} onPress={this.onPressText}>{this.state.data.length} {this.state.data.length > 1 ? "restaurants classés" : "restaurant classé"} par pertinence personnalisée via ton activité et celle de tes amis (+) </Text>
	   		</View>
  		);
  	}
  };

  renderPage() {
		return (
			<View style={{flex: 1, position: 'relative'}}>
        <NavigationBar image={require('../../assets/img/other/icons/map.png')} title="Restaurants" rightButtonTitle="Carte" onRightButtonPress={() => this.props.navigator.replace(Carte.route())} />
				<ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.onRefresh}
              tintColor="#ff0000"
              title="Chargement..."
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00" />
          }>
            <TouchableHighlight key="filter_button" style={styles.filterContainerWrapper} underlayColor="#FFFFFF" onPress={() => {
            	this.props.navigator.push(Filtre.route({navigator: this.props.navigator}));
    				}}>
    						<Text style={styles.filterMessageText}>
    							{RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
    						</Text>
    				</TouchableHighlight>
    				<ListView
              key="list_restaurants"
              renderToHardwareTextureAndroid={true} 
              initialListSize={1}
              pageSize={5}
              dataSource={ds.cloneWithRows(this.state.data)}
              renderRow={this.renderRestaurant}
              renderHeaderWrapper={this.renderHeaderWrapper}
              contentInset={{top: 0}}
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false} />
        </ScrollView>
			</View>
		);
  };
}

var styles = StyleSheet.create({
  restaurantRowWrapper: {
		marginTop: 5,
		marginBottom: 5,
		backgroundColor: '#555555'
	},
	restaurantRow: {
		flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
		height: 200,
  },
	restaurantImage: {
		flex: 1,
	},
	restaurantInfos: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0)'		
	},
	restaurantName: {
		fontWeight: '900',
		fontSize: 15,
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0)',
		color: 'white',
		marginTop: 2,
		position: 'absolute',
		bottom: 30,
		left: 5
	},
	restaurantSubway: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: 'rgba(0,0,0,0)',
		marginTop: 2,
		position: 'absolute',
		bottom: 5,
		right: 5
	},
	restaurantSubwayImage: {
		width: 15,
		height: 15,
		marginRight: 5
	},
	restaurantSubwayText: {
		fontWeight: '900',
		fontSize: 15,
		color: 'white',
		backgroundColor: 'rgba(0,0,0,0)',
	},
	restaurantBudget: {
		flex: 1,
		fontWeight: '900',
		fontSize: 15,
		backgroundColor: 'rgba(0,0,0,0)',
		color: 'white',
		marginTop: 2,
		position: 'absolute',
		bottom: 5,
		left: 45
	},
	restaurantType: {
		flex: 1,
		fontWeight: '900',
		fontSize: 15,
		backgroundColor: 'rgba(0,0,0,0)',
		color: 'white',
		marginTop: 2,
		position: 'absolute',
		bottom: 5,
		left: 5
	},
	filterMessageText: {
		color: '#EF582D',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
		backgroundColor: '#FFFFFF',
		paddingTop: 12,
		paddingBottom: 10
	},
	filterContainerWrapper: {
		backgroundColor: '#FFFFFF',
		borderColor: '#EF582D',
		borderWidth: 1,
		borderRadius: 1,
		margin: 5,
	},
	filterContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
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
  	padding: 10,
  	fontSize: 13,
  	textDecorationLine: 'underline'
  }
});

export default Liste;
