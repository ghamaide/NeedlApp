'use strict';

import React, {Animated, StyleSheet, MapView, View, Text, PushNotificationIOS, TouchableHighlight, ListView, ScrollView} from 'react-native';
import _ from 'lodash';
import GridView from 'react-native-grid-view';

import Box from '../elements/Box';

import Page from '../ui/Page';

import Liste from './Liste';
import BoxesBars from './BoxesBars';

import RestaurantsActions from '../../actions/RestaurantsActions';
import RestaurantsStore from '../../stores/Restaurants';

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
          {id: "1", label: "Business", icon: require('../../assets/img/occasions/images/dej_business.jpg')},
          {id: "2", label: "En Couple", icon: require('../../assets/img/occasions/images/en_couple.jpg')},
          {id: "3", label: "En Famille", icon: require('../../assets/img/occasions/images/en_famille.jpg')},
          {id: "4", label: "Entre amis", icon: require('../../assets/img/occasions/images/entre_amis.jpg')},
          {id: "5", label: "Grandes tablees", icon: require('../../assets/img/occasions/images/grandes_tablees.jpg')},
          {id: "6", label: "Brunch", icon: require('../../assets/img/occasions/images/brunch.jpg')},
          {id: "7", label: "Autres", icon: require('../../assets/img/occasions/images/autre.jpg')},
        ],
        [
          {id: "1", label: "Chic", icon: require('../../assets/img/ambiances/images/chic.jpg')},
          {id: "2", label: "Festif", icon: require('../../assets/img/ambiances/images/festif.jpg')},
          {id: "3", label: "Terrasse", icon: require('../../assets/img/ambiances/images/terrasse.jpg')},
          {id: "4", label: "Bonne Franquette", icon: require('../../assets/img/ambiances/images/bonne_franquette.jpg')},
          {id: "5", label: "Fast", icon: require('../../assets/img/ambiances/images/fast.jpg')},
          {id: "6", label: "Traditionnel", icon: require('../../assets/img/ambiances/images/traditionnel.jpg')},
          {id: "7", label: "Romantique", icon: require('../../assets/img/ambiances/images/romantique.jpg')},
          {id: "8", label: "Autres", icon: require('../../assets/img/ambiances/images/autre.jpg')},
        ],
        [
          {label: "€", icon: require('../../assets/img/prix/images/prix_1.jpg')},
          {label: "€€", icon: require('../../assets/img/prix/images/prix_2.jpg')},
          {label: "€€€", icon: require('../../assets/img/prix/images/prix_3.jpg')},
          {label: "€€€+", icon: require('../../assets/img/prix/images/prix_4.jpg')},
        ]
      ],
      dataFilters: [
        {id: 0, name: "Occasions", label: "occasion"},
        {id: 1, name: "Ambiances", label: "ambiance"},/*
        {id: 2, name: "Prix", label: "prix"},
        {id: 3, name: "Points forts", label: "type"},*/
      ]
      
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
    // on unmount
  }

  clearFilters() {
    RestaurantsActions.setFilter('ambiance', {
      value: 'Tous',
      id: null
    });
    RestaurantsActions.setFilter('occasion', {
      value: 'Tous',
      id: null
    });
    RestaurantsActions.setFilter('friend', {
      value: 'Tous',
      id: null
    });
    RestaurantsActions.setFilter('metro', {
      value: 'Tous',
      id: null
    });
    RestaurantsActions.setFilter('food', {
      value: 'Tous',
      id: null
    });
    RestaurantsActions.setFilter('prix', {
      value: 'Tous',
      id: null
    });
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
        image={data.icon} 
        label={data.label} 
        onPress={
          () => {
            this.clearFilters();
            RestaurantsActions.setFilter(this.state.dataFilters[this.state.filterChosen].label, {value: data.label, id: data.id});
            this.props.navigator.push(Liste.route(data.label));
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
