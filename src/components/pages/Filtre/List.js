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
import Occasion from './Occasion';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Filtre extends Component {
  static route() {
    return {
      component: Filtre,
      title: 'Filtrer',
      leftButtonTitle: 'Annuler',
      onLeftButtonPress() {
        this.pop();
      },
      rightButtonTitle: 'Réinitialiser',
      onRightButtonPress() {
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
    };
  }

  constructor(props) {
    super(props);

    this.state = this.filtersState();
    this.arrivalState = this.filtersState();
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
          title: 'Ambiance',
          action: () => {
            this.props.navigator.push(Ambiance.route());
          },
          value: RestaurantsStore.getState().filters.ambiance.value
        },
        {
          title: 'Occasion',
          action: () => {
            this.props.navigator.push(Occasion.route());
          },
          value: RestaurantsStore.getState().filters.occasion.value
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
    // NOTE : see if we send back to the map or not (uncomment to send to map)
		//this.props.navigator.pop();
  }

  renderRow = (row) => {
    return (
      <TouchableHighlight style={styles.rowWrapper} underlayColor="#DDDDDD" onPress={row.action}>
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
        <TouchableHighlight underlayColor='rgba(0, 0, 0, 0.3)' style={styles.clearButton} onPress={() => this.props.navigator.pop()}>
          <Text style={styles.clear}>Valider</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  rowWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD'
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
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 30,
    marginRight: 30,
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 10,
    borderColor: '#EF582D'
  },
  clear: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});

export default Filtre;
