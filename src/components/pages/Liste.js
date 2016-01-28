'use strict';

import React, {StyleSheet, ListView, View, TouchableHighlight, Image, NativeModules} from 'react-native';

import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
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
      title: 'Restaurants',
    //   rightButtonIcon: require('../../assets/img/other/icons/map.png'),
    //   onRightButtonPress() {
				// this.replace(Carte.route());
    //   }
    };
  };

  restaurantsState() {
    return {
      // we want the map even if it is still loading
      data: RestaurantsStore.filteredRestaurants(),
      loading: RestaurantsStore.loading(),
      errors: RestaurantsStore.error(),
			dataSource: ds.cloneWithRows(RestaurantsStore.filteredRestaurants()),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.showsUserLocation = false;
  };

  onFocus = (event) => {
    if (event.data.route.component === Liste) {
      RestaurantsActions.fetchRestaurants();
    }
  };

  componentWillMount() {
  	if (!MeStore.getState().showTabBar) {
  		MeActions.displayTabBar(true);
  	}
    RestaurantsStore.listen(this.onRestaurantsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
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

  onRightButtonPress = () => {
    console.log('lol');
     
  };

	renderRestaurant = (restaurant) => {
    return (
      <RestaurantElement
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
        <NavigationBar title="Restaurants" rightButtonTitle="Map" onRightButtonPress={() => this.props.navigator.replace(Carte.route())} />
				<TouchableHighlight key="filter_button" style={styles.filterContainerWrapper} underlayColor="#FFFFFF" onPress={() => {
        	this.props.navigator.push(Filtre.route({navigator: this.props.navigator}));
				}}>
						<Text style={styles.filterMessageText}>
							{RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
						</Text>
				</TouchableHighlight>
				<RefreshableListView
					key="list_restaurants"
					dataSource={this.state.dataSource}
					renderRow={this.renderRestaurant}
					renderHeaderWrapper={this.renderHeaderWrapper}
					contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          loadData={this.onRefresh}
          refreshDescription="Refreshing..." />

        {_.map(this.state.errors, (err) => {
          // return <ErrorToast key="error" value={JSON.stringify(err)} appBar={true} />;
        })}
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
