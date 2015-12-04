'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RestaurantsStore from '../../../stores/Restaurants';
import RestaurantsActions from '../../../actions/RestaurantsActions';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Prix extends Component {
  static route() {
    return {
      component: Prix,
      title: 'Prix'
    };
  }

  constructor(props) {
    super(props);

    this.state = this.prixState();
  }

  prixState() {
    var prices = _.map(RestaurantsStore.searchablePrix(), function(prix) {
      return {
        value: _.map(_.range(0, Math.min(3, prix)), function() {
          return '€';
        }).join('') + (prix > 3 ? '+' : ''),
        id: prix
      };
    });

    prices.unshift({
      value: 'Tous',
      id: null
    });

    return {
      prix: filtersSource.cloneWithRows(prices)
    };
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.prixState());
  }

  renderRow = (row) => {
    return <TouchableHighlight style={styles.rowWrapper} onPress={() => {
      RestaurantsActions.setFilter('prix', row);
      this.props.navigator.pop();
    }}>
      <View style={styles.row}>
        <Text style={styles.title}>{row.value}</Text>
      </View>
    </TouchableHighlight>;
  }

  render() {
    return <ListView
      style={{backgroundColor: '#FFFFFF'}}
      dataSource={this.state.prix}
      renderRow={this.renderRow}
      contentInset={{top: 0}}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false} />;
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
    fontSize: 18,
    marginBottom: 5
  },
  value: {
    color: '#444444',
    fontSize: 14
  }
});

export default Prix;
