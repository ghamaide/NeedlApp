'use strict';

import React, {View, Component, StyleSheet, TouchableHighlight} from 'react-native';

import NavBar from 'react-native-navbar';

class NavigationBar extends Component {
  render() {
    const rightButtonConfig = {
      title: this.props.rightButtonTitle,
      handler: this.props.onRightButtonPress
    };

    const titleConfig = {
      title: this.props.title,
    };
       
    const leftButtonConfig = {
      title: this.props.leftButtonTitle,
      handler: () => this.props.onLeftButtonPress
    };

    return (
      <NavBar 
        title={titleConfig}
        rightButton={rightButtonConfig}
        leftButton={leftButtonConfig} />
    );
  };
}

export default NavigationBar;
