'use strict';

import React, {StyleSheet, Component, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import _ from 'lodash';

class Carousel extends Component{
  defaultProps = {
    insetMargin: 0
  }

  state = {
    width: 0,
    offset: 0,
    page: 0
  }

  setNativeProps() {
    this.refs.view.setNativeProps.apply(null, arguments);
  }

  pageChange(i) {
    this.setState({page: i});
    if (this.props.onPageChange) {
      this.props.onPageChange(i);
    }
  }

  render() {
    var children = !_.isArray(this.props.children) ? [this.props.children] : _.without(_.flatten(this.props.children), null);
    var nbChildren = children.length;

    var content;

    if (this.props.insetMargin) {
      content = children;
    } else if (this.state.width) {
      content = _.map(children, (child, index) => {
        if (Math.abs(index - this.state.page) <= 1) {
          return child;
        }
        return <View key={index} style={{width: this.state.width}} />;
      });
    }

    var canGoBack;
    if ((this.props.insetMargin && this.state.page >= 0) || (!this.props.insetMargin && this.state.page > 0)) {
      canGoBack = true;
    }

    var canGoForward;
    if ((this.props.insetMargin && this.state.page < nbChildren - 2) || (!this.props.insetMargin && this.state.page < nbChildren - 1)) {
      canGoForward = true;
    }

    return (
      <View ref="view" style={[{position: 'relative'}, this.props.style]} onLayout={(e) => {
        this.setState({width: e.nativeEvent.layout.width});
      }}>
        {this.state.width ?
          <ScrollView ref="scrollview"
            contentContainerStyle={[styles.container, {width: (this.props.elemSize || this.state.width) * nbChildren}]}
            automaticallyAdjustContentInsets={false}
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            bounces={true}
            onLayout={() => {
              if (this.props.insetMargin && nbChildren === 1) {
                return this.pageChange(-1);
              }
              return this.pageChange(0);
            }}
            onMomentumScrollEnd={this.onAnimationEnd}
            contentInset={{top: 0, left: this.props.insetMargin, bottom: 0, right: this.props.insetMargin}}
            onScroll={this.onScroll}
            contentOffset={{
              x: this.state.offset,
              y: 0
            }}
            scrollEnabled={!this.props.insetMargin} /* insetMargin is not the good way
            to get custom page paging. need to use https://github.com/facebook/react-native/pull/1532 */
          >
            {content}
          </ScrollView>
         : null}
         {canGoBack ?
          <TouchableOpacity style={[styles.flecheWrapper, styles.flecheWrapperLeft, this.props.leftFlecheStyle]}
          onPress={() => {
            var size = this.state.width - ((this.props.insetMargin || 0) * 2);
            this.setState({
              offset: this.state.offset - size
            });
            this.pageChange(this.state.page - 1);
          }}>
              <Image style={[styles.fleche, styles.flecheLeft]} source={require('../../assets/img/arrow.png')} />
          </TouchableOpacity>
          : null}

        {canGoForward ?
          <TouchableOpacity style={[styles.flecheWrapper, styles.flecheWrapperRight, this.props.rightFlecheStyle]}
          onPress={() => {
            var size = this.state.width - ((this.props.insetMargin || 0) * 2);
            this.setState({
              offset: this.state.offset + size
            });
            this.pageChange(this.state.page + 1);
          }}>
              <Image style={[styles.fleche]} source={require('../../assets/img/arrow.png')} />
          </TouchableOpacity>
          : null}
      </View>
    );
  }

  isScrolling () {
    return this.state.scrolling;
  }

  shouldComponentUpdate (props, state) {
    return state.scrolling !== true;
  }

  onAnimationEnd = (e) => {
    this.setState({
      scrolling: false,
      offset: e.nativeEvent.contentOffset.x
    });

    var size = this.state.width - ((this.props.insetMargin || 0) * 2);
    var page = Math.round((e.nativeEvent.contentOffset.x) / (size));

    this.pageChange(page);
  }

  onScroll = (e) => {
    this.setState({
      scrolling: true,
      offset: e.nativeEvent.contentOffset.x
    });
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  flecheWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  flecheWrapperLeft: {
    left: 10
  },
  flecheWrapperRight: {
    right: 35
  },
  fleche: {
    position: 'absolute',
    height: 25,
    width: 25,
    marginTop: -12,
    opacity: 0.5
  },
  flecheLeft: {
    transform: [
      {rotate: '180deg'}
    ]
  }
});

export default Carousel;
