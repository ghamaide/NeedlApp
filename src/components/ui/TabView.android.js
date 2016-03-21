'use strict';

import React, {BackAndroid, Component, Dimensions, Image, Navigator, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';
import SideMenu from 'react-native-side-menu';

import Text from './Text';

import MeStore from '../../stores/Me';

import Menu from './Menu';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pressedOnce: false,
      lastPress: 0,
      menu_open: false
    };
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

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.hardwareBackPress);
    this.props.onTab(this.props.initialSelected || 0);
  };

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
  };

  resetToTab(index) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index], {passProps: {toggle: this.toggle}}));
    this.setState({menu_open: false});
    this.props.onTab(index);
  };

  renderScene = (tab, navigator) => {
    return React.createElement(tab.component, _.extend({navigator: navigator}, tab.passProps));
  };

  toggle = () => {
    this.setState({menu_open: !this.state.menu_open});
  };

  render() {
    return (
      <View style={styles.tabbarContainer}>
        <SideMenu 
          menu={
            <Menu tabs={this.props.tabs}
              tabsBlocked={this.props.tabsBlocked} 
              resetToTab={(index) => this.resetToTab(index)} />}
          openMenuOffset={.6 * Dimensions.get('window').width}
          bounceBackOnOverdraw={true}
          disableGestures={true}
          isOpen={this.state.menu_open}
          onChange={(is_open) => this.setState({menu_open: is_open})}>
          <Navigator
            ref='tabs'
            key='navigator'
            style={{backgroundColor: '#FFFFFF'}}
            initialRoute={_.extend(this.props.tabs[this.props.initialSelected || 0], {passProps: {toggle: this.toggle}})}
            renderScene={this.renderScene}
            configureScene={() => {
              return {
                ...Navigator.SceneConfigs.FadeAndroid,
                defaultTransitionVelocity: 1000,
                gestures: {}
              };
            }} />
        </SideMenu>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  tabbarContainer: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default TabView;
