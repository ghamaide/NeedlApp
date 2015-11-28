'use strict';

import React, {StyleSheet, Component, Image, View, Text, TouchableHighlight, processColor} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import _ from 'lodash';

import Carousel from '../ui/Carousel';

class Restaurant extends Component {
  renderImage(picture) {
    return <Image key={picture} style={[styles.restaurantImage, this.props.style]} source={{uri: picture}}>
      <LinearGradient colors={[processColor('#ffffff'), processColor('#000000')]} style={styles.restaurantImageMask}/>
    </Image>;
  }

  render() {
    var budget = _.map(_.range(0, Math.min(3, this.props.budget)), function() {
      return '€';
    }).join('') + (this.props.budget > 3 ? '+' : '');

    var content = (
      <View style={[styles.restaurantImage, this.props.style]}>
        {this.props.pictures.length === 1 ?
          this.renderImage(this.props.pictures[0])
          :
          <Carousel style={[{flexDirection: 'row'}, styles.restaurantImage, this.props.style]}>
            {_.map(this.props.pictures, (picture) => {
              return this.renderImage(picture);
            })}
          </Carousel>
        }
        <View style={styles.restaurantInfos}>
          <Text style={styles.restaurantName}>{this.props.name}</Text>
          <Text style={styles.restaurantType}>{this.props.type}</Text>
        </View>
        {budget ?
          <View style={styles.restaurantBudgetBox}>
            <Text style={{color: 'white'}}>{budget}</Text>
          </View>
          : null}
      </View>
    );

    if (this.props.onPress) {
      return <TouchableHighlight style={[styles.restaurantImage, this.props.style]} onPress={this.props.onPress}>
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
    height: 150
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
    position: 'absolute',
    backgroundColor: 'transparent',
    left: 20,
    bottom: 20,
    right: 80
  },
  restaurantName: {
    color: '#f2f2f2',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5
  },
  restaurantType: {
    color: '#f2f2f2',
    fontSize: 16,
    fontWeight: 'bold'
  },
  restaurantBudgetBox: {
    position: 'absolute',
    'backgroundColor': '#38E1B2',
    bottom: 20,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    'justifyContent': 'center'
  }
});

export default Restaurant;
