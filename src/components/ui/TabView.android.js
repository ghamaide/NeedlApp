'use strict';

import React, {BackAndroid, Component, Image, Navigator, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';
import SideMenu from 'react-native-side-menu';

import Text from './Text';

import MeStore from '../../stores/Me';

import Menu from './Menu';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: 
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
    } else {
      this.setState({
        lastPress: new Date().getTime()
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

  resetToTab(index, opts) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index], {passProps: {toggle: this.toggle}}));
    this.setState({menu_open: false});
    this.props.onTab(index);
  };

  renderScene = (tab, navigator) => {
    return React.createElement(tab.component, _.extend({navigator: navigator, toggle: this.toggle}, tab.passProps));
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
          isOpen={this.state.menu_open}
          onChange={(is_open) => this.setState({menu_open: is_open})}>
          <Navigator
            ref='tabs'
            key='navigator'
            style={{backgroundColor: '#FFFFFF'}}
            initialRoute={_.extend(this.props.tabs[this.props.initialSelected || 0], {passProps: {toggle: () => this.toggle()}})}
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
  },
  tabbarContent: {
    flex: 1
  },
  tabbarContentWrapper: {
    marginTop: 0,
    paddingBottom: 44,
    backgroundColor: '#FFFFFF'
  },
  tabbarTabs: {
    height: 60,
    backgroundColor: '#EF582D',
    flexDirection: 'row'
  },
  tabbarTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  tabbarTabText: {
    marginTop: 5,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  pastilleContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    top: 2,
    right: 2
  },
  pastilleText: {
    color: '#EF582D',
    fontWeight: 'bold',
    fontSize: 11
  }
});

export default TabView;
