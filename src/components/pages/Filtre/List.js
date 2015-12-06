'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RestaurantsStore from '../../../stores/Restaurants';
import RestaurantsActions from '../../../actions/RestaurantsActions';
import Prix from './Prix';
import Type from './Type';
import Friends from './Friends';
import Metro from './Metro';
import Ambiance from './Ambiance';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Filtre extends Component {
  static route() {
    return {
      component: Filtre,
      title: 'Filtrer',
      rightButtonTitle: 'Valider',
      onRightButtonPress() {
        this.pop();
      }
    };
  }

  constructor(props) {
    super(props);

    this.state = this.filtersState();
  }

  filtersState() {
    return {
      filters: filtersSource.cloneWithRows([
        {
          title: 'Catégorie de prix',
          action: () => {
            this.props.navigator.push(Prix.route());
          },
          value: RestaurantsStore.getState().filters.prix.value
        },
        {
          title: 'Style de cuisine',
          action: () => {
            this.props.navigator.push(Type.route());
          },
          value: RestaurantsStore.getState().filters.food.value
        },
        {
          title: 'Amis',
          action: () => {
            this.props.navigator.push(Friends.route());
          },
          value: RestaurantsStore.getState().filters.friend.value
        },
        {
          title: 'Station de métro',
          action: () => {
            this.props.navigator.push(Metro.route());
          },
          value: RestaurantsStore.getState().filters.metro.value
        },
        {
          title: 'Ambiance',
          action: () => {
            this.props.navigator.push(Ambiance.route());
          },
          value: RestaurantsStore.getState().filters.ambiance.value
        }
      ])
    };
  }

  onRestaurantsChange = () => {
    this.setState(this.filtersState());
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  clearFilters() {
    RestaurantsActions.setFilter('ambiance', {
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
    // NOTE : see if we send back to the map or not (uncomment to send to map)
		//this.props.navigator.pop();
  }

  renderRow = (row) => {
    return (
      <TouchableHighlight style={styles.rowWrapper} underlayColor="#FFFFFF" onPress={row.action}>
        <View style={styles.row}>
          <Text style={styles.title}>{row.title}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      </TouchableHighlight>
    );
  }

	// TODO : change the style of the "Clear filters" button
  render() {
    return (
      <View>
        <ListView
          dataSource={this.state.filters}
          renderRow={this.renderRow}
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
        <TouchableHighlight style={styles.clearButton} underlayColor="#FFFFFF" onPress={() => this.clearFilters()}>
          <Text style={styles.clear}>Réinitialiser les filters</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  rowWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#EF582D'
  },
  row: {
    padding: 10,
  },
  title: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5
  },
  value: {
    color: '#777777',
    fontSize: 13
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#EF582D'
  },
  clear: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: 'black',
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#EF582D',
    fontWeight: 'bold'
  }
});

export default Filtre;
