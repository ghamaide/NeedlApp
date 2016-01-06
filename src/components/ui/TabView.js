'use strict';

import React, {StyleSheet, View, Component, Image, Text, TouchableWithoutFeedback, NavigatorIOS, Navigator} from 'react-native';
import _ from 'lodash';
import TimerMixin from 'react-timer-mixin';
import MeStore from '../../stores/Me';

class PatchedNavigatorIOS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rerender: 0,
      index: props.index
    };
  }

  // hack
  resetToTab = (selected) => {
    this.props.tabsMaster.resetToTab(selected);
  }

  resetTo = (route) => {
    if (this.refs.nav.state.routeStack.length === 1) {
      if (this.refs.nav.state.routeStack[0].component === this.props.initialRoute.component) {
        return null;
      }
      if (route.component === this.props.initialRoute.component) {
        return this.setState({rerender: this.state.rerender + 1});
      }
    }
    this.refs.nav.replaceAtIndex(this.patchRoute(route), 0);
    this.refs.nav.popN(this.refs.nav.state.routeStack.length - 1);
  }

  push = (route) => {
    this.refs.nav.push(this.patchRoute(route));
  }

  replace = (route) => {
    this.refs.nav.replace(this.patchRoute(route));
  }

  patchRoute(route) {
    var newRoute = _.clone(route);
    if (route.onRightButtonPress) {
      newRoute.onRightButtonPress = () => {
        route.onRightButtonPress.apply(this.refs.nav.navigator, arguments);
      };
    }
    // if reseting to a route without rightbuttonpress when the first
    // view originally had a button press makes shit. NavigatorIOS bug
    if (!newRoute.onRightButtonPress) {
      newRoute.onRightButtonPress = () => {};
    }

    if (route.onLeftButtonPress) {
      newRoute.onLeftButtonPress = () => {
        route.onLeftButtonPress.apply(this.refs.nav.navigator, arguments);
      };
    }

    if (!newRoute.onLeftButtonPress) {
      newRoute.onLeftButtonPress = () => {};
    }
    return newRoute;
  }

  componentDidMount() {
    var ref = {};
    ref[this.props.index] = this.refs.nav.navigator;
    this.props.navigator.subnav = _.extend(this.props.navigator.subnav || {}, ref);
    this.refs.nav.navigator.resetTo = this.resetTo;
    this.refs.nav.navigator.push = this.push;
    this.refs.nav.navigator.replace = this.replace;
    this.refs.nav.navigator.resetToTab = this.resetToTab;
    this.refs.nav.navigator.parent = this.refs.nav;

    if (this.props.fireFromTabs) {
      this.refs.nav._emitDidFocus(_.extend({fromTabs: true, skipCache: this.props.initialSkipCache}, this.refs.nav.state.routeStack[this.refs.nav.state.observedTopOfStack]));
    }
  }

  componentDidUpdate() {
    this.refs.nav.navigator.resetTo = this.resetTo;
    this.refs.nav.navigator.replace = this.replace;
    this.refs.nav.navigator.push = this.push;
    this.refs.nav.navigator.resetToTab = this.resetToTab;
  }

  render() {
    return <NavigatorIOS
      ref="nav"
      barTintColor="#FFFFFF"
      tintColor="#000000"
      titleTextColor="#000000"
      key={this.state.index + 'n' + this.state.rerender}
      {...this.props}
      initialRoute={this.patchRoute(this.props.initialRoute)} />;
  }
}

class TabView extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
    var selected = this.state.selected;
    var nav = this.refs.tabs.subnav[selected];
    this.setState({selected: index});

    this.refs.tabs.jumpTo(this.refs.tabs.state.routeStack[index]);
    this.props.onTab(index);

    var newNav = this.refs.tabs.subnav[index];
    if (newNav) {
      newNav.parent._emitDidFocus(_.extend({fromTabs: true}, opts, newNav.parent.state.routeStack[newNav.parent.state.observedTopOfStack]));
    }

    TimerMixin.setTimeout(() => {
      if (nav) {
        nav.resetTo(this.props.tabs[selected].component.route());
      }
    }, 100);
  }

  render() {
    return (
     <View style={styles.tabbarContainer}>
      	<Navigator
          style={{backgroundColor: '#FFFFFF', paddingTop: 20}}
          initialRouteStack={this.props.tabs}
          initialRoute={this.props.tabs[this.props.initialSelected || 0]}
          ref="tabs"
          key="navigator"
          renderScene={(tab, navigator) => {
            var index = navigator.getCurrentRoutes().indexOf(tab);
            return (
              <PatchedNavigatorIOS
                style={styles.tabbarContent}
                navigator={navigator}
                tabsMaster={this}
                key={index}
                index={index}
                fireFromTabs={index === this.state.selected}
                translucent={false}
                titleStyle={{fontFamily: 'Quicksand-Bold', fontSize: 12}}
                itemWrapperStyle={styles.tabbarContentWrapper}
                initialRoute={tab.component.route()}
                initialSkipCache={this.props.initialSkipCache} />
              );
          }}
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
  }
});

export default TabView;
