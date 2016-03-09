'use strict';

import React, {Component, Dimensions, Image, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

class Menu extends Component {
  constructor(props) {
    super(props);
  }

  renderItem = (index, name, icon, pastille, has_shared) => {
    return (
      <View key={index} style={styles.itemContainer}>
        <TouchableWithoutFeedback onPress={() => {
          if (this.props.tabsBlocked) {
            return;
          }
          this.props.resetToTab(index);
        }}>
          <View style={styles.itemInnerContainer}>
            <Image source={icon} style={styles.icons} />

            {name ?
              <Text style={styles.itemText}>{name}</Text>
            : null}

            {pastille ?
              <View style={styles.pastilleContainer}>
                <Text style={styles.pastilleText}>{pastille}</Text>
              </View>
              : null}

            {!has_shared && typeof has_shared !== 'undefined' ?
              <View style={styles.pastilleContainer}>
                <Text style={styles.pastilleText}>!</Text>
              </View>
              : null}
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.menuContainer}>
        {_.map(this.props.tabs, (tab, index) => {
          return this.renderItem(index, tab.title, tab.icon, tab.pastille, tab.has_shared);
        })}
      </View>
    );
  }
}

var styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: 2 * Dimensions.get('window').width / 3,
    paddingTop: 60,
    backgroundColor: '#EF582D',
  },
  itemContainer: {
    margin: 10,
  },
  itemInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemText: {
    color: '#FFFFFF',
    fontWeight: '400',
    marginLeft: 15
  },
  icons: {
    tintColor:'#FFFFFF',
    width: 25,
    height: 25
  },
  pastilleContainer: {
    position: 'absolute',
    left: 18,
    top: -10,
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pastilleText: {
    color: '#EF582D',
    fontWeight: 'bold',
    fontSize: 10
  }
});

export default Menu;
