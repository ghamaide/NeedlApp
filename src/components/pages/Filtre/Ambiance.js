'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RestaurantsStore from '../../../stores/Restaurants';
import RestaurantsActions from '../../../actions/RestaurantsActions';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Ambiance extends Component {
  static route() {
    return {
      component: Ambiance,
      title: 'Ambiance'
    };
  }

  constructor(props) {
    super(props);

    this.state = this.ambianceState();
  }

  ambianceState() {
    var ambiances = _.map(RestaurantsStore.searchableAmbiances(), function(ambiance) {
      return {
        value: RestaurantsStore.MAP_AMBIANCES[ambiance].label,
        id: ambiance
      };
    });

    ambiances.unshift({
      value: 'Tous',
      id: null
    });

    return {
      ambiance: filtersSource.cloneWithRows(ambiances)
    };
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.ambianceState());
  }

  renderRow = (row) => {
    return <TouchableHighlight style={styles.rowWrapper} onPress={() => {
      RestaurantsActions.setFilter('ambiance', row);
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
      dataSource={this.state.ambiance}
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
    color: '#444444',
    fontSize: 13
  }
});

export default Ambiance;
