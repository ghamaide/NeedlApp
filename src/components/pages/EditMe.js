'use strict';

import React, {Component, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import NavigationBar from '../ui/NavigationBar';

import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import MeStore from '../../stores/Me';

import MeActions from '../../actions/MeActions';

class EditMe extends Component {
  static route() {
    return {
      component: EditMe,
      title: 'Modification'
    };
  };

  getEditState() {
    return {
      me: MeStore.getMe(),
      loading: MeStore.loading(),
      error: MeStore.error()
    };
  };

  constructor() {
    super();

    this.state = this.getEditState();
    this.state.name = MeStore.getMe().name;
    this.state.email = MeStore.getMe().email;
  };

  componentDidMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  onMeChange = () => {
    this.setState(this.getEditState());
  };

  onSubmit = () => {
    if (this.state.loading) {
      return;
    }
    // aie... mais j'arrive pas à utiliser componentDidUpdate
    MeActions.edit(this.state.name, this.state.email, () => {
      this.props.navigator.pop();
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Modification' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <View style={styles.editContainer}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            ref='nom'
            textAlign='center'
            onChangeText={(name) => this.setState({name: name})}
            value={this.state.name} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            ref='email'
            textAlign='center'
            onChangeText={(email) => this.setState({email: email})}
            value={this.state.email} />
          <TouchableHighlight style={styles.submitWrapper} onPress={this.onSubmit}>
            <View style={styles.submit}>
              <Text style={styles.submitText}>{this.state.loading ? 'Validation...' : 'Valider'}</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  editContainer: {
    alignItems: 'center',
    padding: 20
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#515151'
  },
  input: {
    height: 34,
    borderRadius: 4,
    padding: 5,
    backgroundColor: '#DDDDDD',
    marginBottom: 15
  },
  submitWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2
  },
  submit: {
    backgroundColor: '#9EE43E',
    borderColor: '#9EE43E',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    padding: 6,
    width: 130
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  }
});

export default EditMe;
