'use strict';

import React, {Animated, StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, ListView, ScrollView} from 'react-native';
import _ from 'lodash';
import GridView from 'react-native-grid-view';

import Box from '../elements/Box';

import Page from '../ui/Page';

import Liste from './Liste';
import BoxesBars from './BoxesBars';

import RestaurantsActions from '../../actions/RestaurantsActions';

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

class BoxesRestaurants extends Page {
  static route() {
    return {
      component: BoxesRestaurants,
      title: 'Restaurants',
      /*leftButtonTitle: 'Bars',
      onLeftButtonPress() {
        this.replace(BoxesBars.route());
      }*/
    };
  }

  occasionsState() {
    return {
      // we want the map even if it is still loading
      data: [
        [
          {name: "Brunch", image: require('../../assets/img/brunch.jpg')},
          {name: "Business", image: require('../../assets/img/dej_business.jpg')},
          {name: "En Couple", image: require('../../assets/img/en_couple.jpg')},
          {name: "En Famille", image: require('../../assets/img/en_famille.jpg')},
          {name: "Entre amis", image: require('../../assets/img/entre_amis.jpg')},
          {name: "Grandes tablees", image: require('../../assets/img/grandes_tablees.jpg')},
          {name: "Pour un date", image: require('../../assets/img/date.jpg')},
          {name: "Autres", image: require('../../assets/img/autre.jpg')},
        ],
        [
          {name: "Terrasse", image: require('../../assets/img/terrasse.jpg')},
          {name: "Bonne Franquette", image: require('../../assets/img/bonne_franquette.jpg')},
          {name: "Festif", image: require('../../assets/img/festif.jpg')},
          {name: "Chic", image: require('../../assets/img/chic.jpg')},
          {name: "Traditionnel", image: require('../../assets/img/traditionnel.jpg')},
          {name: "Fast", image: require('../../assets/img/fast.jpg')},
          {name: "Romantique", image: require('../../assets/img/romantique.jpg')},
          {name: "Autres", image: require('../../assets/img/autre.jpg')},
        ],
        [
          {name: "€", image: require('../../assets/img/prix_1.jpg')},
          {name: "€€", image: require('../../assets/img/prix_2.jpg')},
          {name: "€€€", image: require('../../assets/img/prix_3.jpg')},
          {name: "€€€+", image: require('../../assets/img/prix_4.jpg')},
        ]
      ],
      dataFilters: [
        {id: 0, name: "Occasions"},
        {id: 1, name: "Ambiances"},
        {id: 2, name: "Prix"},
        {id: 3, name: "Points forts"},
      ],
      
      // Images to change
      // Put the list in restaurants stores
    };
  }

  constructor(props) {
    super(props);

    this.state = this.occasionsState();
    this.state.isOpened = false;
    this.state.heightFiltersList = new Animated.Value(0);
    this.state.filterChosen = 0;
  }
  
  componentWillMount() {
    // on mount    
  }

  componentWillUnmount() {
    console.log('1');
    // on unmount
  }

  showFilters = () => {
    if (this.state.isOpened) {
      Animated.timing(this.state.heightFiltersList, {
        toValue: 0,
        duration: 500
      }).start(() => {
      this.setState({isOpened: false})
      });
    } else {
      this.setState({isOpened: true});
      Animated.timing(
        this.state.heightFiltersList,
        {toValue: this.state.dataFilters.length * 35, duration: 500}
      ).start();
    } 
  }

  renderData = (data) => {
  	return (
      <Box 
        image={data.image} 
        label={data.name} 
        occasion={data.page} 
        onPress={
          () => {
            //RestaurantsActions.setFilter('ambiance', {value: "Typique", id: "3"});
            this.props.navigator.push(Liste.route(data.name));
          }
        } />
  	);
  }

  renderDataFilter = (data) => {
    return (
      <TouchableHighlight 
        underlayColor='rgba(255, 255, 255, 0.85)' 
        onPress={() => {
          this.setState({filterChosen: data.id})
          this.showFilters();
        }}>
        <Text style={styles.filtersText}>{data.name}</Text>
      </TouchableHighlight>
    );
  }

  renderPage() {
    return (
				<View style={styles.container}>
					<TouchableHighlight style={styles.filterButton} onPress={this.showFilters} underlayColor='#DDDDDD'>
            <View style={styles.filterContainer}>
              {this.state.isOpened ? 
                [
                  <View key={'opened'} style={styles.triangleDown} />
                ] : [
                  <View key={'closed'} style={styles.triangleRight} />
                ]
              }
  						<Text style={styles.filterButtonMessage}>
  							{this.state.dataFilters[this.state.filterChosen].name}
  						</Text>
            </View>
					</TouchableHighlight>
          <ScrollView
            automaticallyAdjustContentInsets={false}>
            <GridView
              style={styles.list}
              items={this.state.data[this.state.filterChosen]}
              itemsPerRow={2}
              renderItem={this.renderData} />
          </ScrollView>
          {this.state.isOpened ? 
            [
              <Animated.View style={[styles.filtersList, {height: this.state.heightFiltersList}]}>
                <ListView
                  dataSource={ds.cloneWithRows(this.state.dataFilters)}
                  renderRow={this.renderDataFilter}
                  contentInset={{top: 0}}
                  automaticallyAdjustContentInsets={false}
                  showsVerticalScrollIndicator={false} />
              </Animated.View>
            ] : [
              null
            ]}
				</View>
		);
  }
}

var styles = StyleSheet.create({
	container: {
		flex: 1,
	},
  filtersList: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)'
  },
  list: {
    padding: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    marginTop: 5
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButton: {
  	backgroundColor: '#FFFFFF',
  	paddingTop: 10,
    paddingBottom: 5,
  	height: 30,
  },
  filterButtonMessage: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center'
  },
  filtersText: {
    fontSize: 13,
    padding: 10,
    height: 35,
    borderBottomWidth: 0.5,
    borderColor: '#EF582D',
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

export default BoxesRestaurants;
