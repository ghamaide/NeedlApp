'use strict';

import React, {BackAndroid, Component, Navigator, StyleSheet, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

import MeStore from '../../stores/Me';

import Menu from './Menu';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: this.props.initialSelected || 0,
      pressedOnce: false,
      lastPress: 0,
    };
  };

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.hardwareBackPress);
    this.props.onTab(this.props.initialSelected || 0);
  };

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
  };

  hardwareBackPress = () => {
    var delta = new Date().getTime() - this.state.lastPress;

    if (delta < 500) {
      return false;
    } else if (this.refs.tabs.getCurrentRoutes().length > 1) {
      this.refs.tabs.pop();
      this.setState({
        lastPress: new Date().getTime()
      });
      return true;
    } else if (this.state.pressedOnce) {
      return false;
    } else {
      this.setState({
        lastPress: new Date().getTime(),
        pressedOnce: true
      });
      return true;
    }
  };

  resetToTab(index) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index]));
    this.setState({active: index});
    this.props.onTab(index);
  };

  renderScene = (tab, navigator) => {
    return (
      <View style={{flex: 1}}>
        {React.createElement(tab.component, _.extend({navigator: navigator}, tab.passProps))}
        {navigator.getCurrentRoutes().length == 1 ? [
          <Menu
            key='menu'
            style={styles.menu}
            active={this.state.active}
            tabs={this.props.tabs}
            tabsBlocked={this.props.tabsBlocked} 
            resetToTab={(index) => this.resetToTab(index)} />
        ] : null}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.tabbarContainer}>
        <Navigator
          ref='tabs'
          key='navigator'
          style={{backgroundColor: '#FFFFFF', flex: 1}}
          initialRoute={_.extend(this.props.tabs[this.props.initialSelected || 0])}
          renderScene={this.renderScene}
          configureScene={() => {
            return {
              ...Navigator.SceneConfigs.FadeAndroid,
              defaultTransitionVelocity: 1000,
              gestures: {}
            };
          }} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  tabbarContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tabbarContent: {
    flex: 1,
  },
  menu: {
    flex: 1,
    height: 60
  }
});

export default TabView;
