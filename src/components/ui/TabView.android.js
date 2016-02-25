'use strict';

import React, {BackAndroid, Component, Image, Navigator, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import _ from 'lodash';

import Text from './Text';

import MeStore from '../../stores/Me';

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: this.props.initialSelected || 0,
      lastPress: 0
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
    // this.setState({showTabBar: MeStore.getState().showTabBar});
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
    MeStore.listen(this.onMeChange);
    BackAndroid.addEventListener('hardwareBackPress', this.hardwareBackPress);
    this.setState({showTabBar: MeStore.getState().showTabBar});
    this.props.onTab(this.state.selected);

  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    BackAndroid.removeEventListener('hardwareBackPress', this.hardwareBackPress);
  };

  resetToTab(index, opts) {
    this.setState({selected: index});

    this.refs.tabs.resetTo(this.props.tabs[index]);

    this.props.onTab(index);
  };

  renderScene = (tab, navigator) => {
    return React.createElement(tab.component, _.extend({navigator: navigator}, tab.passProps));
  };

  render() {
    return (
     <View style={styles.tabbarContainer}>
      	<Navigator
          style={{backgroundColor: '#FFFFFF'}}
          initialRoute={this.props.tabs[this.props.initialSelected || 0]}
          ref="tabs"
          key="navigator"
          renderScene={this.renderScene}
          configureScene={() => {
            return {
              ...Navigator.SceneConfigs.FadeAndroid,
              defaultTransitionVelocity: 1000,
              gestures: {}
            };
          }} />

        {this.state.showTabBar ? [
					<View key="tabBar" style={styles.tabbarTabs}>
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
