'use strict';

import React, {StyleSheet, View, Component, Image, Text, TouchableWithoutFeedback, TouchableOpacity, Navigator} from 'react-native';
import _ from 'lodash';
import MeStore from '../../stores/Me';

var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    if (index === 0) {
      return null;
    }

    var previousRoute = navState.routeStack[index - 1];
    return (
      <TouchableOpacity
        onPress={() => navigator.pop()}
        style={styles.navBarLeftButton}>
        <Text style={[styles.navBarText, styles.navBarButtonText]}>
          {previousRoute.title}
        </Text>
      </TouchableOpacity>
    );
  },

  RightButton: function(route, navigator, index, navState) {
    return null;
  },

  Title: function(route, navigator, index, navState) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 11, height: 44}}>
        <Text style={[styles.navBarText, styles.navBarTitleText]}>
          {route.title}
        </Text>
      </View>
    );
  },
};

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      routes: this.props.tabs,
      selected: this.props.initialSelected || 0,
      rerender: 0
    };
  }

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
  }

  onMeChange = () => {
    this.setState({showTabBar: MeStore.getState().showTabBar});
  }

  componentDidMount() {
    MeStore.listen(this.onMeChange);
    this.setState({showTabBar: MeStore.getState().showTabBar});
    this.props.onTab(this.state.selected);
  }

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  }

  resetToTab(index, opts) {
    console.log("reset to tab");
    //console.log(this.refs.tabs.state.routeStack[index]);
    var selected = this.state.selected;
    this.setState({selected: index});

    console.log(this.refs);//views.resetTo(this.refs.tabs.state.routeStack[selected])
    this.refs.tabs.jumpTo(this.refs.tabs.state.routeStack[index]);

    this.props.onTab(index);

    //this.refs.tabs.resetTo(this.props.tabs[this.state.selected].component.route());

    // console.log('reset to tab');
    // console.log(index);
    // var selected = this.state.selected;

    // // var nav = this.refs.tabs.subnav[selected];

    // this.setState({selected: index});

    // this.refs.tabs.jumpTo(this.refs.tabs.state.routeStack[index]);
    // this.props.onTab(index);

    // var newNav = this.refs.tabs.subnav[index];
    // if (newNav) {
    //   newNav.parent._emitDidFocus(_.extend({fromTabs: true}, opts, newNav.parent.state.routeStack[newNav.parent.state.observedTopOfStack]));
    // }

    // TimerMixin.setTimeout(() => {
    //   if (nav) {
    //     nav.resetTo(this.props.tabs[selected].component.route());
    //   }
    // }, 100);
  }

  renderScene = (tab, navigator) => {
    // console.log("render scene");
    var temp = (typeof this.refs.tabs !== 'undefined' ? this.refs.tabs.state.routeStack : [0, 0, 0, 0,0]);
    // console.log(temp[0].name + '---' + temp[1].name + '---' + temp[2].name + '---' + temp[3].name + '---' + temp[4].name);
    return (
      <Navigator
        style={{backgroundColor: '#FFFFFF', paddingTop: 44}}
        initialRoute={tab.component.route()}
        ref="views"
        renderScene={(route, nav) => {
          // console.log("render scene 2");
          return React.createElement(route.component, _.extend({navigator: nav}, route.passProps));
        }}
        configureScene={(route) => Navigator.SceneConfigs.FloatFromLeft}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.navBar} />
        } />
    );
  }

  render() {
    return (
      <View style={styles.tabbarContainer}>
      	<Navigator
          style={{backgroundColor: '#FFFFFF'}}
          initialRouteStack={this.props.tabs}
          initialRoute={this.props.tabs[this.props.initialSelected || 0]}
          ref="tabs"
          key="navigator"
          renderScene={this.renderScene}
          configureScene={() => {
            return {
              ...Navigator.SceneConfigs.FadeAndroid,
              defaultTransitionVelocity: 10000,
              gestures: {}
            };
          }} />

        {this.state.showTabBar ? [
					<View key="tabBar" style={styles.tabbarTabs}>
          	{_.map(this.props.tabs, (tab, index) => {
            	return this.renderTab(index, tab.name, tab.icon, tab.pastille, tab.hasShared);
          	})}
        	</View>
        ] : []}
    	</View>
    );
  }
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
  },
  navBar: {
    backgroundColor: '#DDDDDD',
    height: 44
  },
  navBarText: {
    fontSize: 14,
  },
  navBarTitleText: {
    color: '#000000',
    fontWeight: '500',
    marginLeft: 50
  },
  navBarLeftButton: {
    paddingLeft: 10,
    marginTop: 12
  },
  navBarRightButton: {
    paddingRight: 10,
  },
  navBarButtonText: {
    color: '#000000',
  },
});

export default TabView;
