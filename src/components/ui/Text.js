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
      props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
    } else if (props.style) {
      props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
    } else {
      props.style = {fontFamily: 'Quicksand-Regular'};
    }

    this.props = props;

    return super.render();
  }
};

export default NewText;