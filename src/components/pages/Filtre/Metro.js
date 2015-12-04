'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight} from 'react-native';
import SGListView from 'react-native-sglistview';
import _ from 'lodash';

import RestaurantsStore from '../../../stores/Restaurants';
import RestaurantsActions from '../../../actions/RestaurantsActions';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Metro extends Component {
  static route() {
    return {
      component: Metro,
      title: 'Metro'
    };
  }

  constructor(props) {
    super(props);

    this.state = this.metroState();
  }

  metroState() {
    var metros = RestaurantsStore.metroFilters();

    metros.unshift({
      value: 'Tous',
      id: null
    });

    return {
      metro: filtersSource.cloneWithRows(metros)
    };
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.metroState());
  }

  renderRow = (row) => {
    return <TouchableHighlight style={styles.rowWrapper} onPress={() => {
      RestaurantsActions.setFilter('metro', row);
      this.props.navigator.pop();
    }}>
      <View style={styles.row}>
        <Text style={styles.title}>{row.value}</Text>
      </View>
    </TouchableHighlight>;
  }

  render() {
    return <SGListView
      style={{backgroundColor: '#FFFFFF'}}
      dataSource={this.state.metro}
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

export default Metro;
