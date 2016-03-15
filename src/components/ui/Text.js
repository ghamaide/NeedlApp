'use strict';

import React, {Text} from 'react-native';

import _ from 'lodash';

var OldText = Text;

class NewText extends OldText {
  defaultProps = {
    customFont: false
  };

  render() {
    var props = _.clone(this.props);
    if (this.props.customFont) {
      return super.render();
    }

    if (_.isArray(this.props.style)){
      if (!_.some(this.props.style, (style) => {return !_.includes(_.keys(style), 'color')})) {
        props.style.push({color: '#3A325D', fontFamily: 'Quicksand-Regular'});
      } else {
        props.style.push({fontFamily: 'Quicksand-Regular'});
      }
    } else if (props.style) {
      if (_.includes(_.keys(props.style), 'color')) {
        props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
      } else if (!_.isEmpty(props.style)) {
        props.style = [props.style, {color: '#3A325D', fontFamily: 'Quicksand-Regular'}];
      } else {
        props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
      }
    } else {
      props.style = {color: '#3A325D', fontFamily: 'Quicksand-Regular'};
    }

    this.props = props;

    return super.render();
  }
};

export default NewText;