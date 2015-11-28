'use strict';

import React, {StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, ListView, ScrollView} from 'react-native';
import _ from 'lodash';

import Box from '../elements/Box';

import Page from '../ui/Page';

import Carte from './Carte';
import Liste from './Liste';
import BoxesRestaurants from './BoxesRestaurants';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class BoxesBars extends Page {
  static route() {
    return {
      component: BoxesBars,
      title: 'Bars',
      leftButtonTitle: "Restaurants",
      onLeftButtonPress() {
        this.replace(BoxesRestaurants.route());
      }
    };
  }

  occasionsState() {
    return {
      // we want the map even if it is still loading
      dataOccasions: ds.cloneWithRows([
        {name: "Brunch", image: require('../../assets/img/brunch.jpg')},
        {name: "Business", image: require('../../assets/img/dej_business.jpg')},
        {name: "En Couple", image: require('../../assets/img/en_couple.jpg')},
        {name: "En Famille", image: require('../../assets/img/en_famille.jpg')},
        {name: "Entre amis", image: require('../../assets/img/entre_amis.jpg')},
        {name: "Grandes tablees", image: require('../../assets/img/grandes_tablees.jpg')},
        {name: "Pour un date", image: require('../../assets/img/date.jpg')},
      ]),
      data: ds.cloneWithRows([
        {name: "Terrasse", image: require('../../assets/img/brunch.jpg')},
        {name: "Bonne Franquette", image: require('../../assets/img/dej_business.jpg')},
        {name: "Festif", image: require('../../assets/img/en_couple.jpg')},
        {name: "Chic", image: require('../../assets/img/en_famille.jpg')},
        {name: "Traditionnel", image: require('../../assets/img/entre_amis.jpg')},
        {name: "Fast", image: require('../../assets/img/grandes_tablees.jpg')},
        {name: "Romantique", image: require('../../assets/img/date.jpg')},
      ])
      // Images to change
      // Put the list in restaurants stores
    };
  }

  constructor(props) {
    super(props);

    this.state = this.occasionsState();
  }
  
  componentWillMount() {
    
  }

  componentWillUnmount() {
    
  }

  renderData = (data) => {
  	return (
      <Box 
        image={data.image} 
        label={data.name} 
        occasion={data.page} 
        onPress={
          () => {
            // RestaurantsActions.setFilter('ambiance', {value: "Typique", id: "3"});
            this.props.navigator.push(Liste.route());
          }
        } />
  	);
  }
	
  renderPage() {
    return (
				<View style={styles.container}>
					<TouchableHighlight style={styles.filterButton}>
						<Text style={styles.filterButtonMessage}>
							Occasions
						</Text>
					</TouchableHighlight>
          <ScrollView
            automaticallyAdjustContentInsets={false}>
  					<ListView contentContainerStyle={styles.list}
              dataSource={this.state.dataOccasions}
              renderRow={this.renderData} />
          </ScrollView>
				</View>
		);
  }
}

var styles = StyleSheet.create({
	container: {
		flex: 1
	},
  list: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  filterButton: {
  	backgroundColor: 'black',
  	paddingTop: 10,
    paddingBottom: 0,
  	height: 30
  },
  filterButtonMessage: {
    color: 'white',
    fontSize: 28,
    fontWeight: '500',
    textAlign: 'center'
  }
});

export default BoxesBars;
