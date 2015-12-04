'use strict';

import React, {Component, Image, Text, View, Animated, Easing, TouchableHighlight} from 'react-native';

class Toggle extends Component {
  static defaultProps = {
    active: false,
    onSelect() {},
    onUnselect() {}
  }

  state = {
    bounceValue: new Animated.Value(1)
  }

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
  }

  render() {

    var content;

    if (this.props.text) {
      content = <Text style={{color: 'white'}}>{this.props.text}</Text>;
    }

    if (this.props.icon) {
      content = <Image source={this.props.icon} />;
    }
    return (
      <View style={{alignItems: 'center'}}>
        <TouchableHighlight style={[{
          width: this.props.size,
          height: this.props.size,
          borderRadius: this.props.size / 2,
          alignItems: 'center',
          justifyContent: 'center'
        }, this.props.style]} onPress={() => {
          if (this.props.active) {
            this.props.onUnselect(this.props.value);
          } else {
            this.props.onSelect(this.props.value);
          }
        }}>
          <Animated.View style={[{
            width: this.props.size,
            height: this.props.size,
            borderRadius: this.props.size / 2,
            backgroundColor: this.props.active ? '#38E1B2' : '#888888',
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {scale: this.state.bounceValue}
            ]
          }, this.props.style]}>
            {content}
          </Animated.View>
        </TouchableHighlight>
        <Text style={{
          margin: 10,
          color: this.props.labelColor ? this.props.labelColor : (this.props.active ? '#38E1B2' : '#888888'),
          textAlign: 'center'
        }}>{this.props.label}</Text>
      </View>
    );
  }
}

export default Toggle;
