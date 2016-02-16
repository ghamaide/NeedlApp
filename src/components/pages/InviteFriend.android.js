'use strict';

import React, {StyleSheet, ListView, View, Image, TouchableHighlight, AlertIOS, TextInput, ScrollView} from 'react-native';

import _ from 'lodash';
import Contacts from 'react-native-contacts';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import FriendCard from '../elements/FriendCard';

import MeStore from '../../stores/Me'

import MeActions from '../../actions/MeActions'

import Friends from './Friends';

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
    this.state.hasUploadedContacts = MeStore.getState().hasUploadedContacts;
  };

  onMeChange = () => {
    this.setState({
      loading: MeStore.loading(),
      error: MeStore.error(),
    });
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    this.getContacts();
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  getContacts() {
    Contacts.getAll((err, retrievedContacts) => {
      retrievedContacts = _.map(retrievedContacts, (contact) => {
        if (!_.includes(MeStore.getState().uploadedContacts, contact.recordID)) {
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
    });
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
        return ((contact.givenName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1) || (contact.familyName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1));
      } else if (typeof contact.familyName !== 'undefined') {
        return contact.familyName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
      } else if (typeof contact.givenName !== 'undefined') {
        return  contact.givenName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
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
              !this.state.loading ? [
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
                  <ProgressBarAndroid indeterminate />
                </View>
              ]
            ]}
          </View>
      </View>
    );
  };

  onRefresh = () => {
    this.setState({hasUploadedContacts: false});
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title="Inviter" leftButtonTitle="Retour" onLeftButtonPress={() => this.props.navigator.pop()} />
        <TextInput
          ref='searchBar'
          placeholder='Rechercher'
          style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
          onChangeText={this.searchContacts}
          placeholderTextColor='#333333'
          onSearchButtonPress={this.closeKeyboard} />
        <RefreshableListView
          refreshDescription="Chargement..."
          loadData={this.onRefresh}
          style={styles.contactsList}
          dataSource={contactsSource.cloneWithRows(this.state.filteredContacts)}
          renderRow={this.renderContact}
          contentInset={{top: 0}}
          onScroll={this.closeKeyboard}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}/>
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
