'use strict';

import React, {StyleSheet, ListView, View, Text, PushNotificationIOS, TouchableHighlight, Image} from 'react-native';
import _ from 'lodash';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';
import MeStore from '../../stores/Me';

import Page from '../ui/Page';
import Filtre from './Filtre/List';
import Carte from './Carte';
import BoxesRestaurants from './BoxesRestaurants';
import Restaurant from './Restaurant';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class Liste extends Page {
  static route() {
    return {
      component: Liste,
      title: 'Liste',
      rightButtonIcon: require('../../assets/img/home.png'),
      onRightButtonPress() {
				this.replace(Carte.route("Carte"));
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
    console.log(this.state.data);
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
    RestaurantsStore.listen(this.onRestaurantsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  }

	renderRestaurant = (restaurant) => {
    return (
      <TouchableHighlight style={styles.restaurantRowWrapper} onPress={() => {
        this.props.navigator.push(Restaurant.route({id: restaurant.id}));
      }}>
        <View style={styles.restaurantRow}>
					<Image 
						source={{uri: restaurant.pictures[0]}} 
						style={styles.restaurantImage}>
          	<View style={styles.restaurantInfos}>
							<Text style={styles.restaurantName}>{restaurant.name}</Text>
          		<View style={styles.restaurantSubway}>
          			<Image
          				source={require('../../assets/img/subway.png')}
          				style={styles.restaurantSubwayImage} />
          			<Text style={styles.restaurantSubwayText}>{restaurant.subways[1][0]}</Text>
          		</View>
          		<Text style={styles.restaurantType}>{restaurant.food[1]}</Text>
						</View>
					</Image>
        </View>
      </TouchableHighlight>
    );
  }

  renderPage() {
		// TODO : change the style of the "Filtrer" button
		return (
			<View style={{flex: 1, position: 'relative'}}>
				<TouchableHighlight style={styles.filterContainerWrapper} underlayColor="#FFFFFF" onPress={() => {
        	this.props.navigator.push(Filtre.route());
				}}>
					<View style={styles.filterContainer}>
						{RestaurantsStore.filterActive() ? 
							[
								<View key={'opened'} style={styles.triangleDown} />
							] : [
								<View key={'closed'} style={styles.triangleRight} />
							]
						}
						<Text style={styles.filterMessageText}>
							{RestaurantsStore.filterActive() ? 'Filtre activé - ' + this.state.data.length + ' résultat' + (this.state.data.length > 1 ? 's' : '') : 'Filtre désactivé'}
						</Text>
					</View>
				</TouchableHighlight>
				<ListView
					dataSource={this.state.dataSource}
					renderRow={this.renderRestaurant}
					contentInset={{top: 0}}
					automaticallyAdjustContentInsets={false}
					showsVerticalScrollIndicator={false} />
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
		color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
		backgroundColor: '#FFFFFF',
		paddingTop: 12,
		paddingBottom: 10
	},
	filterContainerWrapper: {
		backgroundColor: '#FFFFFF',
	},
	filterContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	triangleRight: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000000',
    transform: [
      {rotate: '90deg'}
    ]
  },
  	triangleDown: {
    width: 0,
    height: 0,
    marginRight: 5,
    marginTop: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000000',
    transform: [
      {rotate: '180deg'}
    ]
  }
});

export default Liste;
