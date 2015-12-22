'use strict';

import React, {Component} from 'react-native';
import _ from 'lodash';

import Toggle from './Toggle';

function toggle (group) {
  return class ControllerToggle extends Component{
    render() {
      return <Toggle {...this.props}
        onSelect={group.onSelect}
        onUnselect={group.onUnselect}
        active={_.contains(group.getSelection(), this.props.value)} />;
    }
  };
}

class ToggleGroup extends Component {
  static defaultProps = {
    maxSelection: 1,
    fifo: false,
    selectedInitial: []
  }

  constructor(props) {
    super(props);

    this.state = {
      selected: props.selectedInitial
    };
  }

  onSelect = (v) => {
    var newSelected = _.clone(this.state.selected);

    if (this.state.selected.length >= this.props.maxSelection) {
      if (!this.props.fifo) {
        return false;
      }

      newSelected.shift();
    }

    newSelected.push(v);

    this.setState({selected: newSelected});

    if (this.props.onSelect) {
      this.props.onSelect(v, newSelected);
    }
  }

  onUnselect = (v) => {
    var newSelected = _.clone(this.state.selected);

    _.remove(newSelected, (value) => {
      return value === v;
    });

    this.setState({selected: newSelected});

    if (this.props.onUnselect) {
      this.props.onUnselect(v, newSelected);
    }
  }

  componentWillMount () {
    this.toggleComponent = toggle(this);
  }

  getSelection () {
    return this.state.selected;
  }

  render() {
    return this.props.children(this.toggleComponent);
  }
}

export default ToggleGroup;
