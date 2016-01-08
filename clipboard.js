

(tab, navigator) => {
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

===============================================================================================================================================

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