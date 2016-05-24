'use strict';

import React, {Component} from 'react';
import {Animated, Easing, Image, TouchableHighlight, View} from 'react-native';

import Text from '../../ui/Text';

class Toggle extends Component {
  static defaultProps = {
    active: false,
    onSelect() {},
    onUnselect() {}
  };

  state = {
    bounceValue: new Animated.Value(1)
  };

  componentWillUpdate(nextProps) {
    if (!this.props.active && nextProps.active) {
      this.state.bounceValue.setValue(1);
      Animated.sequence([
        Animated.timing(this.state.bounceValue, {
          toValue: 1.2,
          easing: Easing.ease,
          duration: 200
        }),
        Animated.timing(this.state.bounceValue, {
          toValue: 1,
          easing: Easing.ease,
          duration: 200
        })
      ]).start();
    }
  };

  render() {
    var content;

    if (this.props.text) {
      content = <Text style={{color: 'white'}}>{this.props.text}</Text>;
    }

    if (this.props.icon) {
      content = <Image source={this.props.icon} style={{tintColor : this.props.active ? (this.props.tintColorActive ? this.props.tintColorActive : '#FFFFFF') : (this.props.tintColor ? this.props.tintColor : '#FFFFFF')}} />;
    }

    return (
      <View style={{alignItems: 'center', width: this.props.width}}>
        <TouchableHighlight key='toggle_button' style={[{
          width: this.props.size,
          height: this.props.size,
          borderRadius: this.props.size / 2,
          alignItems: 'center',
          justifyContent: 'center'
        }, this.props.style]} onPress={() => {
          if (!this.props.disabled) {
            if (this.props.active) {
              this.props.onUnselect(this.props.value);
            } else {
              this.props.onSelect(this.props.value);
            }
          }
        }}>
          <Animated.View style={[{
            width: this.props.size,
            height: this.props.size,
            borderRadius: this.props.size / 2,
            backgroundColor: this.props.active ? (this.props.backgroundColorActive ? this.props.backgroundColorActive : '#9CE62A') : (this.props.backgroundColor ? this.props.backgroundColor : '#C1BFCC'),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {scale: this.state.bounceValue}
            ]
          }, this.props.style]}>
            {content}
          </Animated.View>
        </TouchableHighlight>
        {this.props.label ? [
          <Text key='toggle_text' style={{
            fontSize: this.props.fontSize ? this.props.fontSize : 13,
            marginLeft: this.props.marginLeft ? this.props.marginLeft : 5,
            marginTop: 0,
            marginBottom: this.props.marginBottom ? this.props.marginBottom : 5,
            marginRight: this.props.marginRight ? this.props.marginRight : 5,
            color: this.props.active ? (this.props.labelColorActive ? this.props.labelColorActive : '#9CE62A') : (this.props.labelColor ? this.props.labelColor : '#C1BFCC'),
            textAlign: 'center'
          }}>{this.props.label}</Text>
        ] : []}
      </View>
    );
  };
}

export default Toggle;
