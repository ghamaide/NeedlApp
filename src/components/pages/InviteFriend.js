'use strict';

import React, {StyleSheet, ListView, View, Image, TouchableHighlight, AlertIOS, NativeModules, ActivityIndicatorIOS} from 'react-native';

import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';
import Contacts from 'react-native-contacts';
import SearchBar from 'react-native-search-bar';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
import Text from '../ui/Text';

import FriendCard from '../elements/FriendCard';

import MeStore from '../../stores/Me'

import MeActions from '../../actions/MeActions'

let contactsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});
let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

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
    this.state.errors = [];
    this.state.contacts = {};
    this.state.filteredContacts = {};
    this.state.data = {};
    this.state.switchList = {};
    this.state.hasUploadedContacts = MeStore.getState().hasUploadedContacts;
  };

  onMeChange = () => {
    var errors = this.state.errors;

    var uploadingContactsError = MeStore.uploadingContactsError();
    var sendingMessageError = MeStore.sendingMessageError();
    if (uploadingContactsError && !_.contains(errors, uploadingContactsError)) {
      errors.push(uploadingContactsError);
    }

    if (sendingMessageError && !_.contains(errors, sendingMessageError)) {
      errors.push(sendingMessageError);
    }

    this.setState({
      uploadingContacts: MeStore.uploadingContacts(),
      sendingMessage: MeStore.sendingMessage(),
      errors: errors,
    });
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  componentDidMount() {
    this.checkPermission();
  };

  checkPermission() {
    Contacts.checkPermission( (err, permission) => {
      if(permission === 'undefined'){
        Contacts.requestPermission( (err, permission) => {
          this.getContacts();
        })
      }
      if(permission === 'authorized'){
        this.getContacts();
      }
      if(permission === 'denied'){
        this.authorizeShowContacts();
      }
    });
  };

  getContacts() {
    Contacts.getAll((err, retrievedContacts) => {
      if(err && err.type === 'permissionDenied'){
        this.authorizeShowContacts();
      } else {
        retrievedContacts = _.map(retrievedContacts, (contact) => {
          if (!_.contains(MeStore.getState().uploadedContacts, contact.recordID)) {
            contact.invitationSent = false;
          } else {
            contact.invitationSent = true;
          }
          return contact;
        });
        this.setState({contacts : retrievedContacts});
        this.setState({filteredContacts : retrievedContacts});
        if (!this.state.hasUploadedContacts) {
          MeActions.uploadContacts(retrievedContacts);
        }
      }
    })
  };

  authorizeShowContacts() {
    AlertIOS.alert(
      "Vous n'avez pas autorisé Needl à avoir accès à vos contacts",
      "Vous pouvez changer ca dans 'Settings -> Privacy'",
      [
        {text: 'OK', onPress: () => this.props.navigator.pop()},
      ]
    );
  };

  searchContacts = (searchedText) => {
    var tempFilteredContacts = _.filter(this.state.contacts, function(contact) {
      if (typeof contact.familyName !== 'undefined' && typeof contact.givenName !== 'undefined') {
        return ((contact.givenName.indexOf(searchedText) > -1) || (contact.familyName.indexOf(searchedText) > -1));
      } else if (typeof contact.familyName !== 'undefined') {
        return contact.familyName.indexOf(searchedText) > -1;
      } else if (typeof contact.givenName !== 'undefined') {
        return  contact.givenName.indexOf(searchedText) > -1;
      } else {
        return false;
      }
    });
    this.setState({filteredContacts: tempFilteredContacts});
  };

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  };

  isEqual (a, b) {
    return (a === b);
  };

  renderContact = (contact) => {
    return (
      <View style={styles.contactWrapper}>
          <View style={styles.contactInfoWrapper}>
            <Text style={styles.contactName}>{contact.givenName} {contact.familyName}</Text>
            {this.state.contacts[_.findIndex(this.state.contacts, (row) => this.isEqual(row.recordID, contact.recordID))].invitationSent ? [
              <Image
                key={"check_" + contact.recordID}
                style={styles.imageCheck}
                source={require('../../assets/img/actions/icons/check.png')} />
            ] : [
              !this.state.uploadingContacts ? [
                <TouchableHighlight style={styles.imageWrapper} onPress={() => {
                  var updatedContacts = _.map(this.state.contacts, (row) => {
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
                  <ActivityIndicatorIOS
                  animating={true}
                  style={[{height: 40}]}
                  size="large" />
                </View>
              ]
            ]}
          </View>
      </View>
    );
  };

  onRefresh = () => {
    this.setState({hasUploadedContacts: false});
    this.checkPermission();
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <SearchBar
          ref='searchBar'
          placeholder='Search'
          hideBackground={true}
          textFieldBackgroundColor='#DDDDDD'
          onChangeText={this.searchContacts}
          onSearchButtonPress={this.closeKeyboard} />
        <RefreshableListView
          style={styles.contactsList}
          dataSource={contactsSource.cloneWithRows(this.state.filteredContacts)}
          renderRow={this.renderContact}
          contentInset={{top: 0}}
          onScroll={this.closeKeyboard}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          loadData={this.onRefresh}
          refreshDescription="Refreshing..." />
        {_.map(this.state.errors, (error, i) => {
          return <ErrorToast key={i} value={JSON.stringify(error)} appBar={true} />;
        })}
      </View>
    );
  };
}

var styles = StyleSheet.create({
  contactsList: {
    backgroundColor: '#FFFFFF'
  },
  contactWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
    alignItems: 'center'
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
  }
});

export default InviteFriend;
