'use strict';

import React, {StyleSheet, ListView, View, Text, PushNotificationIOS, TouchableHighlight, Image, NativeModules} from 'react-native';
import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';
import MeActions from '../../actions/MeActions';

import Page from '../ui/Page';
import RestaurantElement from '../elements/Restaurant';
//import Filtre from './Filtre/List';
import Filtre from './Filtre';
import Carte from './Carte';
import BoxesRestaurants from './BoxesRestaurants';
import Restaurant from './Restaurant';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class Liste extends Page {
  static route() {
    return {
      component: Liste,
      title: 'Restaurants',
      rightButtonIcon: require('../../assets/img/other/icons/map.png'),
      onRightButtonPress() {
				this.replace(Carte.route());
      }
    };
  }

  restaurantsState() {
    return {
      // we want the map even if it is still loading
      data: RestaurantsStore.filteredRestaurants(),
      loading: RestaurantsStore.loading(),
      error: RestaurantsStore.error(),
			dataSource: ds.cloneWithRows(RestaurantsStore.filteredRestaurants()),
    };
  }

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();
    this.state.showsUserLocation = false;
  }

  onFocus = (event) => {
    if (event.data.route.component === Liste) {
      RestaurantsActions.fetchRestaurants();
    }
  }

  componentWillMount() {
  	MeActions.displayTabBar(true);
    RestaurantsStore.listen(this.onRestaurantsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
    console.log(MeStore.getState().version < '1.4.0');
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  }

  onRefresh = () => {
  	RestaurantsActions.fetchRestaurants();
  }

	renderRestaurant = (restaurant) => {
    return (
      <RestaurantElement
        name={restaurant.name}
        pictures={restaurant.pictures}
        subway={restaurant.subways[1][0]}
        type={restaurant.food[1]}
        height={200}
        marginTop={5}
        marginBottom={5}
        underlayColor={"#FFFFFF"}
        onPress={() => {
          this.props.navigator.push(Restaurant.route({id: restaurant.id}));
        }}/>
    );
  }

  renderPage() {
		return (
			<View style={{flex: 1, position: 'relative'}}>
				<TouchableHighlight style={styles.filterContainerWrapper} underlayColor="#FFFFFF" onPress={() => {
        	this.props.navigator.push(Filtre.route());
				}}>
						<Text style={styles.filterMessageText}>
							{RestaurantsStore.filterActive() ? 'Modifiez les critères' : 'Aidez-moi à trouver !'}
						</Text>
				</TouchableHighlight>
				<RefreshableListView
					dataSource={this.state.dataSource}
					renderRow={this.renderRestaurant}
					contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          loadData={this.onRefresh}
          refreshDescription="Refreshing..." />
			</View>
		);
  }
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
		alignItems: 'stretch'
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
  }
});

export default Liste;
