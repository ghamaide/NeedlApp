'use strict';

import React from "react";
import {TextInput} from "react-native";

import _ from 'lodash';

var OldTextInput = TextInput;

class NewTextInput extends OldTextInput {
  defaultProps = {};
  render() {
    var props = _.clone(this.props);

    if (_.isArray(this.props.style)){
      props.style.push({fontFamily: 'Quicksand-Regular'});
    } else if (props.style) {
      props.style = [props.style, {fontFamily: 'Quicksand-Regular'}];
    } else {
      props.style = {fontFamily: 'Quicksand-Regular'};
    }

    this.props = props;

    return super.render();
  };
}

export default NewTextInput;