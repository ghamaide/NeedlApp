'use strict';

import React, {View, Component, StyleSheet, TouchableHighlight, TouchableOpacity, Image} from 'react-native';

import NavBar from 'react-native-navbar';
import {Icon} from 'react-native-icons';

import Text from '../ui/Text';

class BackButton extends Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent'}, this.props.style]}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 1, marginLeft: 7}}>
          <Icon
            name='fontawesome|angle-left'
            size={25}
            color='#000000'
            style={[{width: 17, height: 17, marginRight: 5}, this.props.style]}/>
          <Text style={{fontSize: 14, marginTop: 1}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class NavBarButton extends Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent', position: 'absolute', right: 0, top: 0}, this.props.style]}>
        <View style={{alignItems: 'center', justifyContent: 'center', marginRight: 7}}>
          <Image source={this.props.image} style={{height: 20, width: 20, tintColor: '#000000'}} />
          <Text style={{fontSize: 11}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class NavigationBar extends Component {
  render() {
    const rightButtonConfig = {
      title: this.props.rightButtonTitle,
      handler: this.props.onRightButtonPress,
      image: this.props.image,
      tintColor: '#000000'
    };

    const titleConfig = {
      title: this.props.title
    };
       
    const leftButtonConfig = {
      title: this.props.leftButtonTitle,
      handler: this.props.onLeftButtonPress,
      tintColor: '#000000'
    };

    return (
      <NavBar
        style={[{borderBottomWidth: 1, borderColor: '#CCCCCC', paddingBottom: 40, margin: 0}, this.props.style]}
        title={titleConfig}
        rightButton={rightButtonConfig.title ? (rightButtonConfig.image ? <NavBarButton title={rightButtonConfig.title} onPress={rightButtonConfig.handler} image={this.props.image} /> : rightButtonConfig) : []}
        leftButton={leftButtonConfig.title ? <BackButton icon={leftButtonConfig.icon} title={leftButtonConfig.title} onPress={this.props.onLeftButtonPress} /> : []} />
    );
  };
}

export default NavigationBar;
