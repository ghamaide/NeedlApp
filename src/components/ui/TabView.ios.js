'use strict';

import React, {StyleSheet, View, Component, Image, TouchableWithoutFeedback, NavigatorIOS, Navigator} from 'react-native';

import _ from 'lodash';

import Text from './Text';

import MeStore from '../../stores/Me';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.initialSelected || 0,
    };
  };

  renderTab(index, name, icon, pastille, hasShared) {
    var opacityStyle = {opacity: index === this.state.selected ? 1 : 0.3};

    return (
      <TouchableWithoutFeedback key={index} style={styles.tabbarTab} onPress={() => {
        if (this.props.tabsBlocked) {
          return;
        }
        this.resetToTab(index);
      }}>
        <View style={styles.tabbarTab}>
          <Image source={icon} style={opacityStyle} />

          {name ?
            <Text style={[styles.tabbarTabText, opacityStyle]}>{name}</Text>
          : null}

          {pastille && this.state.selected !== index ?
            <View style={styles.pastilleContainer}>
              <Text style={styles.pastilleText}>{pastille}</Text>
            </View>
            : null}

          {!hasShared && typeof hasShared !== 'undefined' ?
            <View style={styles.pastilleContainer}>
              <Text style={styles.pastilleText}>!</Text>
            </View>
            : null}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  onMeChange = () => {
    this.setState({showTabBar: MeStore.getState().showTabBar});
  };

  componentDidMount() {
    MeStore.listen(this.onMeChange);
    this.setState({showTabBar: MeStore.getState().showTabBar});
    this.props.onTab(this.state.selected);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  resetToTab(index, opts) {
    var selected = this.state.selected;

    this.setState({selected: index});
    this.refs.tabs.resetTo(this.props.tabs[index]);
    this.props.onTab(index);
  };

  render() {
    return (
     <View style={styles.tabbarContainer}>
        <NavigatorIOS
          style={styles.tabbarContent}
          navigator={navigator}
          initialRoute={this.props.tabs[this.props.initialSelected || 0]}
          ref='tabs'
          navigationBarHidden={true}
          key='navigator'
          initialSkipCache={this.props.initialSkipCache} />

        {this.state.showTabBar ? [
          <View key='tabBar' style={styles.tabbarTabs}>
            {_.map(this.props.tabs, (tab, index) => {
              return this.renderTab(index, tab.title, tab.icon, tab.pastille, tab.hasShared);
            })}
          </View>
        ] : []}
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
