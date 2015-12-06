'use strict';

import React, {StyleSheet, Component, Image, View, Text, TouchableHighlight, processColor} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import _ from 'lodash';

import Carousel from '../ui/Carousel';

class Restaurant extends Component {
  render() {
    var budget = _.map(_.range(0, Math.min(3, this.props.budget)), function() {
      return '€';
    }).join('') + (this.props.budget > 3 ? '+' : '');

    var content = (
      <View style={[styles.restaurantImage, this.props.style, {height: this.props.height, marginTop: this.props.marginTop, marginBottom: this.props.marginBottom}]}>
        <Image key={this.props.pictures[0]} style={[styles.restaurantImage, this.props.style]} source={{uri: this.props.pictures[0]}}>
          <LinearGradient colors={[processColor('#FFFFFF'), processColor('#000000')]} style={styles.restaurantImageMask} />
          <View style={styles.restaurantInfos}>
            <Text style={styles.restaurantName}>{this.props.name}</Text>
            <Text style={styles.restaurantType}>{this.props.type}</Text>
            {budget ?
              <Text style={styles.restaurantPrice}>{budget}</Text>
              : null}
            {this.props.subway ?
              <View style={styles.restaurantSubway}>
                <Image
                  source={require('../../assets/img/subway.png')}
                  style={styles.restaurantSubwayImage} />
                <Text style={styles.restaurantSubwayText}>{this.props.subway}</Text>
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
  }
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
    opacity: 0.2
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
  }
});

export default Restaurant;
