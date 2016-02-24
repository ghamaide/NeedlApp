'use strict';

import React, {ActivityIndicatorIOS, AlertIOS, Image, ListView, NativeModules, Platform, ProgressBarAndroid, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Contacts from 'react-native-contacts';
import SearchBar from 'react-native-search-bar';

import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';
import NavigationBar from '../ui/NavigationBar';

import FriendsStore from '../../stores/Friends'
import MeStore from '../../stores/Me'

import FriendsActions from '../../actions/FriendsActions'
import MeActions from '../../actions/MeActions'

import Friends from './Friends';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class InviteFriend extends Page {
  static route() {
    return {
      component: InviteFriend,
      title: 'Inviter des amis'
    };
  };

  constructor(props) {
    super(props);

    this.state = {};
    this.state.query = '';
    this.state.errors = [];
    this.state.needlContacts = [];
    this.state.phoneContacts = [];
    this.state.filteredPhoneContacts = [];
    this.state.needlActive = true;
    this.state.phoneActive = false;
    this.state.retrievedContacts = false;
    this.state.hasUploadedContacts = MeStore.getState().hasUploadedContacts;
  };

  onMeChange = () => {
    this.setState({
      loading: MeStore.loading(),
      error: MeStore.error(),
      hasUploadedContacts: MeStore.getState().hasUploadedContacts
    });
  };

  onFriendsChange = () => {
    this.setState({
      needlContacts: FriendsStore.getSearchedContacts()
    });
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    FriendsStore.listen(this.onFriendsChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    FriendsStore.unlisten(this.onFriendsChange);
  };

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  };

  checkPermission() {
    Contacts.checkPermission( (err, permission) => {
      if(permission === 'undefined'){
        Contacts.requestPermission( (err, permission) => {
          this.retrieveContacts();
        })
      }
      if(permission === 'authorized'){
        this.retrieveContacts();
      }
      if(permission === 'denied'){
        this.authorizeShowContacts();
      }
    });
  };

  retrieveContacts() {
    Contacts.getAll((err, retrievedContacts) => {
      if(Platform.OS === 'ios' && err && err.type === 'permissionDenied'){
        this.authorizeShowContacts();
      } else {
        retrievedContacts = _.map(retrievedContacts, (contact) => {
          if (!_.includes(MeStore.getState().uploadedContacts, contact.recordID)) {
            contact.invitationSent = false;
          } else {
            contact.invitationSent = true;
          }
          return contact;
        });
        this.setState({phoneContacts : retrievedContacts});
        this.searchContactsPhone(this.state.query);
        this.setState({retrievedContacts: true});
        if (!this.state.hasUploadedContacts) {
          MeActions.uploadContacts(retrievedContacts);
        }
      }
    })
  };

  authorizeShowContacts() {
    AlertIOS.alert(
      "Vous n'avez pas autorisé Needl à avoir accès à vos contacts",
      "Vous pouvez changer ca dans 'Réglages -> Confidentialité'",
      [
        {text: 'OK', onPress: () => this.props.navigator.pop()},
      ]
    );
  };

  getContactsPhone = () => {
    if (Platform.OS === 'ios') {
      this.checkPermission();
    } else if (Platform.OS === 'android') {
      this.retrieveContacts();
    }
  };

  searchContactsNeedl = (query) => {
    this.setState({query: query});
    FriendsActions.searchContacts(query);
  };

  searchContactsPhone = (query) => {
    this.setState({query: query});
    var tempFilteredContacts = _.filter(this.state.phoneContacts, function(contact) {
      if (typeof contact.familyName !== 'undefined' && typeof contact.givenName !== 'undefined') {
        return ((contact.givenName.toLowerCase().indexOf(query.toLowerCase()) > -1) || (contact.familyName.toLowerCase().indexOf(query.toLowerCase()) > -1));
      } else if (typeof contact.familyName !== 'undefined') {
        return contact.familyName.toLowerCase().indexOf(query.toLowerCase()) > -1;
      } else if (typeof contact.givenName !== 'undefined') {
        return  contact.givenName.toLowerCase().indexOf(query.toLowerCase()) > -1;
      } else {
        return false;
      }
    });

    this.setState({filteredPhoneContacts: tempFilteredContacts});
  };

  isEqual (a, b) {
    return (a === b);
  };

  onPressContactButton = (from) => {
    if (from === 'phone') {
      this.setState({phoneActive: true});
      this.setState({needlActive: false});
    }

    if (from === 'needl') {
      this.setState({needlActive: true});
      this.setState({phoneActive: false});
    }
  };

  renderContactNeedl = (contact) => {
    return (
      <View>
      </View>
    );
  };

  renderContactPhone = (contact) => {
    return (
      <View style={styles.contactWrapper}>
          <View style={styles.contactInfoWrapper}>
            <Text style={styles.contactName}>{contact.givenName} {contact.familyName}</Text>
            {this.state.phoneContacts[_.findIndex(this.state.phoneContacts, (row) => this.isEqual(row.recordID, contact.recordID))].invitationSent ? [
              <Image
                key={"check_" + contact.recordID}
                style={styles.imageCheck}
                source={require('../../assets/img/actions/icons/check.png')} />
            ] : [
              !this.state.loading ? [
                <TouchableHighlight style={styles.imageWrapper} onPress={() => {
                  var updatedContacts = _.map(this.state.phoneContacts, (row) => {
                    if (contact.recordID === row.recordID) {
                      row.invitationSent = true;
                      return row;
                    } else {
                      return row;
                    }
                  });
                  this.setState({contacts: updatedContacts});
                  MeActions.sendMessageContact(contact);
                }}>
                  <Image
                    source={require('../../assets/img/actions/icons/send_mail.png')}
                    style={styles.imageMail} />
                </TouchableHighlight>
              ] : [
                <View style={styles.loadingWrapper}>
                  {Platform.OS === 'ios' ? [
                    <ActivityIndicatorIOS
                      animating={true}
                      style={[{height: 40}]}
                      size="large" />
                  ] : [
                    <ProgressBarAndroid indeterminate />
                  ]}
                </View>
              ]
            ]}
          </View>
      </View>
    );
  };

  renderHeaderWrapperNeedl = () => {
    if (this.state.query) {
      if (!this.state.needlContacts.length) {
        return(
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>Pas de résultats trouvés pour '{this.state.query}'</Text>
          </View>
        );
      }
    } else {
      return (
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyText}>Recherchez vos contacts sur Needl</Text>
        </View>
      );
    }
  };

  renderHeaderWrapperPhone = () => {
    if (this.state.retrievedContacts) {
      if (!this.state.filteredPhoneContacts.length) {
        if (!this.state.query.length) {
          return (
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>Aucun contact trouvé sur votre téléphone</Text>
            </View>
          );
        } else {
          return (
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>Aucun contact trouvé pour '{this.state.query}'</Text>
            </View>
          );
        }
      }
    } else {
      return (
        <View>
          <TouchableHighlight style={styles.searchContactsButton} onPress={this.getContactsPhone} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.searchContactsText}>Afficher les résultats de mes contacts {Platform.OS === 'ios' ? 'iPhone' : ''}</Text>
          </TouchableHighlight>
        </View>
      );
    }
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title='Inviter' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />

        <View style={styles.contactsButtonContainer}>
          <TouchableHighlight 
            style={[styles.contactButton, {backgroundColor: this.state.needlActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressContactButton('needl')}>
            <Text style={{color: this.state.needlActive ? '#FFFFFF' : '#EF582D'}}>Needl</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            style={[styles.contactButton, {backgroundColor: this.state.phoneActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressContactButton('phone')}>
            <Text style={{color: this.state.phoneActive ? '#FFFFFF' : '#EF582D'}}>Téléphone</Text>
          </TouchableHighlight>
        </View>

        {Platform.OS === 'ios' ? [
          <SearchBar
            ref='searchBar'
            key='search_ios'
            placeholder='Rechercher'
            hideBackground={true}
            textFieldBackgroundColor='#DDDDDD'
            onChangeText={(text) => {
              if (this.state.needlActive) {
                this.searchContactsNeedl(text);
              } else {
                this.searchContactsPhone(text);
              }
            }}
            onSearchButtonPress={this.closeKeyboard} />
        ] : [
          <TextInput
            ref='searchBar'
            key='search_android'
            placeholder='Rechercher'
            style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
            onChangeText={(text) => {
              if (this.state.needlActive) {
                this.searchContactsNeedl(text);
              } else {
                this.searchContactsPhone(text);
              }
            }}
            placeholderTextColor='#333333' />
        ]}

        <ListView
          style={styles.contactsList}
          dataSource={ds.cloneWithRows(this.state.needlActive ? this.state.needlContacts : this.state.filteredPhoneContacts)}
          renderRow={this.state.needlActive ? this.renderContactNeedl : this.renderContactPhone}
          contentInset={{top: 0}}
          onScroll={Platform.OS === 'ios' ? this.closeKeyboard : null}
          renderHeader={this.state.needlActive ? this.renderHeaderWrapperNeedl : this.renderHeaderWrapperPhone}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  contactsList: {
    backgroundColor: '#FFFFFF'
  },
  emptyTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#DDDDDD',
    padding: 10
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 15,
  },
  searchContactsButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  searchContactsText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    color: '#EF582D'
  },
    contactInfoWrapper: {
    marginLeft: 10,
    marginRight: 5,
    marginTop: 10,
    marginBottom: 10,
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  contactName: {
    flex: 1,
    color: '#000000',
    fontSize: 13,
    paddingTop: 12,
    paddingBottom: 5
  },
  imageWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EF582D'
  },
  imageMail: {
    width: 20,
    height: 12.8,
    marginLeft: 10,
    marginTop: 13.5
  },
  imageCheck: {
    width: 20,
    height: 20,
    marginLeft: 5,
    marginRight: 10,
    marginTop: 7
  },
  loadingWrapper: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactsButtonContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#EF582D',
    borderRadius: 5
  },
  contactButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default InviteFriend;
