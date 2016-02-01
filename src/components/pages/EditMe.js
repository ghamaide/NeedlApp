'use strict';

import React, {StyleSheet, TouchableHighlight, Component, TextInput, View} from 'react-native';

import _ from 'lodash';
import NavigationBar from '../ui/NavigationBar';

import Text from '../ui/Text';

import MeStore from '../../stores/Me';

import MeActions from '../../actions/MeActions';

import Profil from './Profil';

class EditMe extends Component {
  static route() {
    return {
      component: EditMe,
      title: 'Modification'
    };
  };

  getEditState() {
    var err = MeStore.getState().status.editingError;

    if (err && !_.contains(this.state.errors, err)) {
      this.state.errors.push(err);
    }

    return {
      me: _.clone(MeStore.getState()),
      nom: (this.state && this.state.nom) || MeStore.getState().me.name,
      email: (this.state && this.state.email) || MeStore.getState().me.email,
      errors: this.state.errors
    };
  };

  constructor() {
    super();

    this.state = {
      errors: []
    };
    this.state = this.getEditState();
  };

  componentDidMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    MeActions.cleanEditError();
  };

  onMeChange = () => {
    this.setState(this.getEditState());
  };

  onSubmit = () => {
    if (this.state.me.status.editing) {
      return;
    }
    // aie... mais j'arrive pas à utiliser componentDidUpdate
    MeActions.edit(this.state.nom, this.state.email, () => {
      this.props.navigator.resetTo(Profil.route());
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title="Modification" leftButtonTitle="Retour" onLeftButtonPress={() => this.props.navigator.pop()} />
        <View style={styles.editContainer}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            ref="nom"
            textAlign="center"
            onChangeText={(nom) => this.setState({nom})}
            value={this.state.nom} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            ref="email"
            textAlign="center"
            onChangeText={(email) => this.setState({email})}
            value={this.state.email} />
          <TouchableHighlight style={styles.submitWrapper} onPress={this.onSubmit}>
            <View style={styles.submit}>
              <Text style={styles.submitText}>{this.state.me.status.editing ? 'Validation...' : 'Valider'}</Text>
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
    backgroundColor: '#38E1B2',
    borderColor: '#22DEA9',
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
