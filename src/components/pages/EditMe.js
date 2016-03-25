'use strict';

import React, {ActivityIndicatorIOS, Component, Dimensions, Platform, ProgressBarAndroid, ScrollView, StyleSheet, Switch, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import NavigationBar from '../ui/NavigationBar';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import Overlay from '../elements/Overlay';

import MeActions from '../../actions/MeActions';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';

var windowWidth = Dimensions.get('window').width;

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
    this.state.description = MeStore.getMe().description;
    this.state.public = MeStore.getMe().public;
    this.state.tags = MeStore.getMe().tags;
    this.state.characters_remaining = 90;
    this.state.password = '';
    this.state.password_confirmation = '';
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

  closeKeyboard = () => {
    if (Platform.OS === 'ios' && ProfilStore.getProfil(this.state.me.id).score >= 20) {
      this.refs.description.blur();
    }
  };

  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  onSubmit = () => {
    if (this.state.loading) {
      return;
    }

    var totalTagLength = 0;

    _.forEach(this.state.tags, (tag) => {
      totalTagLength += tag.length;
    });

    if (!this.validateEmail(this.state.email)) {
      var error = {error_message: 'incorrect_mail'};
      this.setState({error: error});
    } else if (this.state.public && this.state.description.length == 0) {
      var error = {error_message: 'empty_description'};
      this.setState({error: error});
    } else if (this.state.public && totalTagLength == 0) {
      var error = {error_message: 'empty_tags'};
      this.setState({error: error});
    // Uncomment to add password change
    // } else if (this.state.password.length > 0 && this.state.password != this.state.password_confirmation) {
    //   var error = {error_message: 'different_passwords'};
    //   this.setState({error: error});
    // } else if (this.state.password.length > 0 && this.state.password.length < 6) {
    //   var error = {error_message: 'password_too_short'};
    //   this.setState({error: error});
    } else {
      var infos = {
        name: this.state.name,
        email: this.state.email,
        description: this.state.description,
        is_public: this.state.public,
        tags: this.state.tags,
        // update_password : this.state.password.length > 5,
        // password: this.state.password
      }

      MeActions.edit(infos, () => {
        this.props.navigator.pop();
      });
    }
  };

  render() {
    var can_be_public = ProfilStore.getProfil(this.state.me.id).score >= 20;
    if (!_.isEmpty(this.state.error)) {
      var showError = false;
      var message = '';

      switch (this.state.error.error_message) {
        case 'incorrect_mail':
          message = 'L\'adresse mail entrée n\'est pas valide';
          showError = true;
          break;
        case 'empty_description':
          message = 'Ton profil ne peut pas être public et ne pas avoir de description';
          showError = true;
          break;
        case 'empty_tags':
          message = 'Ton profil ne peut pas être public et ne pas avoir de tag';
          showError = true;
          break;
        case 'different_passwords':
          message = 'Les mots de passe ne correspondent pas';
          showError = true;
          break;
        case'password_too_short':
          message = 'Le mot de passe doit compter au minimum 6 caractères';
          showError = true;
          break;
        default:
          showError = false;
          break;
      }
    }

    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Modification' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView key='container' keyboardShouldPersistTaps={true} style={styles.editContainer} onScroll={this.closeKeyboard} scrollEventThrottle={16}>
          {showError ? [
            <View key='error' style={styles.error}>
              <Text style={{fontSize: 11, color: '#FFFFFF'}}>{message}</Text>
            </View>
          ] : null}
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            ref='nom'
            onChangeText={(name) => this.setState({name: name})}
            value={this.state.name} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            ref='email'
            onChangeText={(email) => this.setState({email: email})}
            value={this.state.email} />

          {/* If the user can be public (score above 20), show him the public informations */}
          {can_be_public ? [
            <View key='public_informations' style={{flex: 1}}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                ref='description'
                maxLength={90}
                multiline={true}
                placeholder='Description de ton profil public'
                placeholderTextColor='#3A325D'
                style={[styles.input, {height: 75, marginBottom: 5}]}
                value={this.state.description}
                onChangeText={(description) => {
                  this.setState({description: description});
                  this.setState({characters_remaining: 90 - description.length});
                }} />
              <Text style={styles.character}>{this.state.characters_remaining} car.</Text>
              <Text style={styles.label}>Tags</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: windowWidth - 40, marginBottom: 15}}>
                <TextInput
                  placeholder={'Tag #1'}
                  placeholderTextColor='#3A325D'
                  style={[styles.tagInput, {marginRight: 5}]}
                  value={this.state.tags[0]}
                  onChangeText={(text) => {
                    var tags = this.state.tags;
                    tags[0] = text;
                    this.setState({tags: tags});
                  }} />
                <TextInput
                  placeholder={'Tag #2'}
                  placeholderTextColor='#3A325D'
                  style={[styles.tagInput, {marginLeft: 5}]}
                  value={this.state.tags[1]}
                  onChangeText={(text) => {
                    var tags = this.state.tags;
                    tags[1] = text;
                    this.setState({tags: tags});
                  }} />
                <TextInput
                  placeholder={'Tag #3'}
                  placeholderTextColor='#3A325D'
                  style={[styles.tagInput, {marginRight: 5}]}
                  value={this.state.tags[2]}
                  onChangeText={(text) => {
                    var tags = this.state.tags;
                    tags[2] = text;
                    this.setState({tags: tags});
                  }} />
              </View>
              <Text style={styles.label}>Public</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                <Switch
                  onValueChange={(value) => this.setState({public: value})}
                  value={this.state.public} />
                <Text style={{marginLeft: 10, fontSize: 13, color: '#3A325D'}}>Ton profil sera {this.state.public ? 'public' : 'privé'}</Text>
              </View>
            </View>
          ] : null}
          <TouchableHighlight style={styles.submitWrapper} onPress={this.onSubmit}>
            <View style={styles.submit}>
              <Text style={styles.submitText}>Valider</Text>
            </View>
          </TouchableHighlight>
        </ScrollView>
        
        {/* Loading overlay */}
        {this.state.loading ? [
          <Overlay key='loading_overlay'>
            <ScrollView
              style={{flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)'}}
              contentInset={{top: 0}}
              alignItems='center'
              justifyContent='center'
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.container}>
              {Platform.OS === 'ios' ? [
                <ActivityIndicatorIOS
                  key='loading_ios'
                  animating={true}
                  color='#FE3139'
                  style={[{height: 80}]}
                  size='large' />
              ] : [
                <ProgressBarAndroid key='loading_android' indeterminate />
              ]}
            </ScrollView>
          </Overlay>
        ] : null}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  editContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1
  },
  label: {
    marginBottom: 5,
    fontWeight: '400',
    fontSize: 13,
    color: '#FE3139'
  },
  input: {
    height: 25,
    borderRadius: 4,
    padding: 5,
    fontSize: 13,
    backgroundColor: '#C1BFCC',
    marginBottom: 15,
    color: '#3A325D'
  },
  tagInput: {
    height: 25,
    borderRadius: 4,
    padding: 5,
    fontSize: 13,
    width: (windowWidth - 40) / 2 - 5,
    backgroundColor: '#C1BFCC',
    marginBottom: 5
  },
  submitWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2
  },
  submit: {
    backgroundColor: '#9CE62A',
    borderColor: '#9CE62A',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    padding: 7,
    width: 130,
    marginTop: 10,
    marginBottom: 10
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '400'
  },
  character: {
    color: '#3A325D',
    fontSize: 10,
    marginBottom: 10,
    textAlign: 'right'
  },
  error: {
    width: Dimensions.get('window').width - 40,
    borderRadius: 5,
    backgroundColor: '#FE3139',
    padding: 10,
    marginBottom: 10
  }
});

export default EditMe;
