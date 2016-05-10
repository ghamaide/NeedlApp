'use strict';

import React, {Component, Navigator, StyleSheet, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

import MeStore from '../../stores/Me';

import Menu from './Menu';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: this.props.initialSelected || 0,
      displayMenu: true
    };
  };

  componentDidMount() {
    this.props.onTab(this.props.initialSelected || 0);
  };

  resetToTab(index) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index]));
    this.setState({active: index});
    this.showMenu();
    this.props.onTab(index);
  };

  hideMenu = () => {
    this.setState({displayMenu: false});
  };

  showMenu = () => {
    this.setState({displayMenu: true});
  };

  renderScene = (tab, navigator) => {
    // if (navigator.getCurrentRoutes().length > 1) {
    //   this.hideMenu();
    // } else {
    //   if (!this.state.displayMenu) {
    //     this.showMenu();
    //   }
    // }
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
    height: 60,
  }
});

export default TabView;
