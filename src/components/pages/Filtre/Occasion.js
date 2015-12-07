'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RestaurantsStore from '../../../stores/Restaurants';
import RestaurantsActions from '../../../actions/RestaurantsActions';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Occasion extends Component {
  static route() {
    return {
      component: Occasion,
      title: 'Occasion'
    };
  }

  constructor(props) {
    super(props);

    this.state = this.occasionState();
  }

  occasionState() {
    console.log(RestaurantsStore.searchableOccasions());
    var occasions = _.map(RestaurantsStore.searchableOccasions(), function(occasion) {
      return {
        value: RestaurantsStore.MAP_OCCASIONS[occasion].label,
        id: occasion
      };
    });

    occasions.unshift({
      value: 'Tous',
      id: null
    });

    return {
      occasion: filtersSource.cloneWithRows(occasions)
    };
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.occasionState());
  }

  renderRow = (row) => {
    return <TouchableHighlight style={styles.rowWrapper} onPress={() => {
      RestaurantsActions.setFilter('occasion', row);
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
      dataSource={this.state.occasion}
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
    fontSize: 14,
    marginBottom: 5
  },
  value: {
    color: '#444444',
    fontSize: 13
  }
});

export default Occasion;
