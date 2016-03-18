'use strict';

import React, {Component, Dimensions, Image, Navigator, NavigatorIOS, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

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
    };
  };

  componentDidMount() {
    this.props.onTab(this.props.initialSelected || 0);
  };

  resetToTab(index) {
    this.refs.tabs.resetTo(_.extend(this.props.tabs[index], {passProps: {toggle: this.toggle}}));
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
          openMenuOffset={.6 * Dimensions.get('window').width}
          bounceBackOnOverdraw={true}
          disableGestures={true}
          isOpen={this.state.menu_open}
          onChange={(is_open) => this.setState({menu_open: is_open})}>
          <NavigatorIOS
            key='navigator'
            ref='tabs'
            style={styles.tabbarContent}
            initialRoute={_.extend(this.props.tabs[this.props.initialSelected || 0], {passProps: {toggle: this.toggle}})}
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
  }
});

export default TabView;
