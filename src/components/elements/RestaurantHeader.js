'use strict';

import React, {Component, Image, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import Text from '../ui/Text';

class RestaurantHeader extends Component {
  render() {
    var budget = _.map(_.range(0, Math.min(3, this.props.budget)), function() {
      return '€';
    }).join('') + (this.props.budget > 3 ? '+' : '');

    if (budget === '€') {
      var emptyBudget = '€€+';
    } else if (budget === '€€') {
      var emptyBudget = '€+';
    } else if (budget ==='€€€') {
      var emptyBudget = '+';
    } else if (budget === '€€€+') {
      var emptyBudget = '';
    }

    var content = (
      <View key={this.props.key} style={[this.props.style, {height: this.props.height, marginTop: this.props.marginTop, marginBottom: this.props.marginBottom}]}>
        <Image key={this.props.picture} style={styles.restaurantImage} source={{uri: this.props.picture}} />
        <View style={styles.restaurantBanner}>
          <Text style={styles.restaurantName}>{this.props.name}</Text>
          <View style={styles.restaurantInfos}>
            {this.props.type ? [
              <Text key='restaurant_type' style={styles.restaurantType}>{this.props.type}</Text>
            ] : null}
            {budget ? [
              <Text key='restaurant_budget' style={styles.restaurantType}>
                <Text style={{color: '#FFFFFF'}}>
                   {budget}
                </Text>
                <Text style={{color: '#837D9B'}}>
                  {emptyBudget}
                </Text>
              </Text>
            ] : null}
            {this.props.subway ? [
              <View key='restaurant_subway' style={styles.restaurantSubway}>
                <Image
                  source={require('../../assets/img/other/icons/subway.png')}
                  style={styles.restaurantSubwayImage} />
                <Text style={styles.restaurantSubwayText}>{this.props.subway}</Text>
              </View>
            ] : null}
          </View>
        </View>
        {this.props.rank ?
          <View style={styles.imageRank}>
            <Text style={styles.imageRankText}>#{this.props.rank}</Text>
          </View>
         : null}
      </View>
    );

    if (this.props.onPress) {
      return <TouchableHighlight style={[styles.restaurantImage, this.props.style]} onPress={this.props.onPress} underlayColor={this.props.underlayColor}>
        {content}
      </TouchableHighlight>;
    }

    return content;
  };
}

var styles = StyleSheet.create({
  restaurantImage: {
    flex: 1,
    position: 'relative',
  },
  restaurantBanner: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(58, 50, 93, 0.7)',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  restaurantName: {
    fontSize: 14,
    flex: 1,
    color: '#FFFFFF',
    padding: 5
  },
  restaurantInfos: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 5,
  },
  restaurantType: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '400',
    margin: 1
  },
  restaurantPrice: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '400',
    margin: 1
  },
  restaurantSubway: {
    flexDirection: 'row',
    margin: 1
  },
  restaurantSubwayImage: {
    width: 12,
    height: 12,
    marginRight: 3,
    marginTop: 1
  },
  restaurantSubwayText: {
    fontWeight: '400',
    fontSize: 11,
    color: 'white',
  },
  imageRank: {
    width: 32,
    height: 32,
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 16,
    borderColor: '#FFFFFF',
    borderWidth: .5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  imageRankText: {
    color: '#FFFFFF',
    fontSize: 12,
  }
});

export default RestaurantHeader;
