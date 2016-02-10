'use strict';

import React, {StyleSheet, Component, Image, View, TouchableHighlight, processColor} from 'react-native';

import _ from 'lodash';

import Carousel from '../ui/Carousel';
import Text from '../ui/Text';

class Restaurant extends Component {
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
      <View renderToHardwareTextureAndroid={true} key={this.props.key} style={[styles.restaurantImage, this.props.style, {height: this.props.height, marginTop: this.props.marginTop, marginBottom: this.props.marginBottom}]}>
        <Image key={this.props.picture} style={[styles.restaurantImage, this.props.style]} source={{uri: this.props.picture}}>
          <View style={styles.restaurantInfos}>
            <Text key="restaurant_name" style={styles.restaurantName}>{this.props.name}</Text>
            {budget ? [
              <Text key="restaurant_budget" style={styles.restaurantType}>
                {this.props.type}
                <Text style={{color: '#FFFFFF'}}>
                   , {budget}
                </Text>
                <Text style={{color: '#999999'}}>
                  {emptyBudget}
                </Text>
              </Text>
            ] : [
              <Text key="restaurant_budget" style={styles.restaurantType}>{this.props.type}</Text>
            ]}
            {this.props.subway ?
              <View style={styles.restaurantSubway}>
                <Image
                  source={require('../../assets/img/other/icons/subway.png')}
                  style={styles.restaurantSubwayImage} />
                <Text style={styles.restaurantSubwayText}>{this.props.subway}</Text>
              </View>
              : null}
            {this.props.isNeedl ?
              <View style={styles.imageNeedlContainer}>
                <Image style={styles.imageNeedl} source={require('../../assets/img/tabs/icons/home.png')} />
              </View>
             : null}
            {!this.props.isNeedl && this.props.rank === 1 ?
              <View style={styles.imageRank}>
                <Text style={[styles.imageRankText, {marginLeft: 1}]}>#1</Text>
              </View>
             : null}
            {!this.props.isNeedl && this.props.rank === 2 ?
              <View style={styles.imageRank}>
                <Text style={styles.imageRankText}>#2</Text>
              </View>
             : null}
            {!this.props.isNeedl && this.props.rank === 3 ?
              <View style={styles.imageRank}>
                <Text style={styles.imageRankText}>#3</Text>
              </View>
             : null}
          </View>
        </Image>
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
  restaurantImageMask: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    top: 0,
    opacity: 0.3
  },
  restaurantInfos: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)'    
  },
  restaurantName: {
    fontSize: 14,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#FFFFFF',
    marginTop: 2,
    position: 'absolute',
    bottom: 32,
    left: 10,
    fontWeight: '500'
  },
  restaurantType: {
    flex: 1,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0)',
    color: '#FFFFFF',
    marginTop: 2,
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontWeight: '500'
  },
  restaurantPrice: {
    flex: 1,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: '#FFFFFF',
    fontWeight: '400'
  },
  restaurantSubway: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0)',
    marginTop: 2,
    position: 'absolute',
    bottom: 10,
    right: 5
  },
  restaurantSubwayImage: {
    width: 15,
    height: 15,
    marginRight: 5
  },
  restaurantSubwayText: {
    fontWeight: '900',
    fontSize: 14,
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  imageNeedlContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5
  },
  imageNeedl: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF'
  },
  imageRank: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 15,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    padding: 6.1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  imageRankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  }
});

export default Restaurant;
