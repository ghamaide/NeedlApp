'use strict';

import React, {Component, Image, Navigator, NavigatorIOS, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';
import SideMenu from 'react-native-side-menu';

import Text from './Text';

import MeStore from '../../stores/Me';

import Menu from './Menu';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menu_open: false,
      pastille_notifications: this.props.tabs[3].pastille,
      has_shared: this.props.tabs[2].has_shared
    };
  };

  componentDidMount() {
    this.setState({showTabBar: MeStore.getState().showTabBar});
    this.props.onTab(this.props.initialSelected || 0);
  };

  resetToTab(index, opts) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index], {passProps: {has_shared: this.state.has_shared, pastille_notifications: this.state.pastille_notifications, toggle: this.toggle}}));
    this.setState({menu_open: false});
    this.props.onTab(index);
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
          <NavigatorIOS
            key='navigator'
            ref='tabs'
            style={styles.tabbarContent}
            initialRoute={_.extend(this.props.tabs[this.props.initialSelected || 0], {passProps: {has_shared: this.state.has_shared, pastille_notifications: this.state.pastille_notifications, toggle: () => this.toggle()}})}
            navigationBarHidden={true}
            initialSkipCache={this.props.initialSkipCache} />
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
