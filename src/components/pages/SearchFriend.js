'use strict';

import React, {ActivityIndicatorIOS, AlertIOS, Dimensions, Image, ListView, NativeModules, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Contacts from 'react-native-contacts';
import Icon from 'react-native-vector-icons/FontAwesome';
import SearchBar from 'react-native-search-bar';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import FriendsStore from '../../stores/Friends'
import MeStore from '../../stores/Me'
import ProfilStore from '../../stores/Profil'

import FriendsActions from '../../actions/FriendsActions'
import MeActions from '../../actions/MeActions'

import Friends from './Friends';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class SearchFriend extends Page {
  static route(props) {
    return {
      component: SearchFriend,
      title: 'Inviter des amis',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.searchFriendState();
    this.state.query = '';
    this.state.errors = [];
    this.state.filteredContacts = [];
    this.state.needlActive = true;
    this.state.phoneActive = false;
    this.state.retrievedContacts = false;
    this.state.hasUploadedContacts = MeStore.getState().hasUploadedContacts;
  };

  searchFriendState() {
    var requests_received = ProfilStore.getRequestsReceived();
    var requests_sent = ProfilStore.getRequestsSent();
    var friends = ProfilStore.getFriends();
    var requests_sent_ids = _.map(requests_sent, (request) => {
      return request.id;
    });
    var requests_received_ids = _.map(requests_received, (request) => {
      return request.id;
    });
    var friends_ids = _.map(friends, (friend) => {
      return friend.id;
    });
    return {
      loading: FriendsStore.loading(),
      error: FriendsStore.error(),
      hasUploadedContacts: MeStore.getState().hasUploadedContacts,
      users: FriendsStore.getSearchedUsers(),
      requests_received_ids: requests_received_ids,
      friends_ids: friends_ids,
      requests_sent_ids: requests_sent_ids
    };
  };

  onMeChange = () => {
    this.setState(this.searchFriendState());
  };

  onFriendsChange = () => {
    this.setState(this.searchFriendState());
  };

  onProfilsChange = () => {
    this.setState(this.searchFriendState());
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
    ProfilStore.listen(this.onProfilsChange);
    FriendsStore.listen(this.onFriendsChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
    ProfilStore.unlisten(this.onProfilsChange);
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
        this.setState({contacts : retrievedContacts});
        this.searchContacts(this.state.query);
        this.setState({retrievedContacts: true});
        if (!this.state.hasUploadedContacts) {
          MeActions.uploadContacts(retrievedContacts);
        }
      }
    })
  };

  authorizeShowContacts() {
    AlertIOS.alert(
      'Vous n\'avez pas autorisé Needl à avoir accès à vos contacts',
      'Vous pouvez changer ca dans \'Réglages -> Confidentialité\'',
      [
        {text: 'OK', onPress: () => this.props.navigator.pop()},
      ]
    );
  };

  getContacts = () => {
    if (Platform.OS === 'ios') {
      this.checkPermission();
    } else if (Platform.OS === 'android') {
      this.retrieveContacts();
    }
  };

  searchUsers = (query) => {
    this.setState({query: query});
    if (query.length > 0) {
      FriendsActions.searchUsers(query);
    }
  };

  searchContacts = (query) => {
    this.setState({query: query});
    var tempFilteredContacts = _.filter(this.state.contacts, function(contact) {
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

    this.setState({filteredContacts: tempFilteredContacts});
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

  inviteUser = (user_id) => {
    FriendsActions.askFriendship(user_id);
  };

  renderUser = (user) => {
    return (
      <View style={styles.contactContainer}>
        <Image style={styles.profileImage} source={{uri: user.picture}} />
        <Text style={styles.profileName}>{user.fullname}</Text>
        {_.includes(_.concat(this.state.friends_ids, this.state.requests_sent_ids), user.id) ? [
          _.includes(this.state.requests_sent_ids, this.props.id) ? [
            <View key={'invited_friend_' + user.id} style={styles.invitedContainer}>
              <Text style={styles.invitedText}>Invité</Text>
            </View>
          ] : [
            <View key={'already_friend_' + user.id} style={[styles.invitedContainer, {borderWidth: 0}]}>
              <Icon
                name='check'
                size={25}
                color='#FE3139' />
            </View>
          ]
        ] : [
          _.includes(this.state.requests_received_ids, user.id) ? [
            <TouchableHighlight
            key={'invite_friend_' + user.id}
            style={styles.buttonWrapper}
            underlayColor='rgba(0, 0, 0, 0)'
            onPress={() => {
              var user_request = ProfilStore.getRequestReceived(user.id);
              FriendsActions.acceptFriendship(user_request.friendship_id);
            }}>
              <Text style={styles.buttonText}>Accepter</Text>
            </TouchableHighlight>
          ] : [
            <TouchableHighlight
              key={'invite_friend_' + user.id}
              style={styles.buttonWrapper}
              onPress={() => FriendsActions.askFriendship(user.id)}
              underlayColor='rgba(0, 0, 0, 0)'>
              <Text style={styles.buttonText}>Inviter</Text>
            </TouchableHighlight>
          ]
        ]}
      </View>
    );
  };

  renderContact = (contact) => {
    return (
      <View style={styles.contactWrapper}>
          <View style={styles.contactInfoWrapper}>
            <Text style={styles.contactName}>{contact.givenName} {contact.familyName}</Text>
            {this.state.contacts[_.findIndex(this.state.contacts, (row) => this.isEqual(row.recordID, contact.recordID))].invitationSent ? [
              <Image
                key={'check_' + contact.recordID}
                style={styles.imageCheck}
                source={require('../../assets/img/actions/icons/check.png')} />
            ] : [
              !this.state.loading ? [
                <TouchableHighlight key={'send_invitation_' + contact.recordID} style={styles.imageWrapper} onPress={() => {
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
                <View key='loading' style={styles.loadingWrapper}>
                  {Platform.OS === 'ios' ? [
                    <ActivityIndicatorIOS
                      animating={true}
                      color='#FE3139'
                      style={[{height: 40}]}
                      size='large' />
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


  renderHeaderWrapperUsers = () => {
    if (!this.state.users.length) {
      return(
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyText}>Pas de résultats trouvés pour '{this.state.query}'</Text>
        </View>
      );
    }
  };

  renderHeaderWrapperContacts = () => {
    if (this.state.retrievedContacts) {
      if (!this.state.filteredContacts.length) {
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
          <TouchableHighlight style={styles.searchContactsButton} onPress={this.getContacts} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.searchContactsText}>Afficher les résultats de mes contacts {Platform.OS === 'ios' ? 'iPhone' : ''}</Text>
          </TouchableHighlight>
        </View>
      );
    }
  };

  renderBlankScreen(content) {
    return (
      <ScrollView keyboardShouldPersistTaps={true} scrollEnabled={false}>
        <TouchableHighlight style={{padding: 10, height: Dimensions.get('window').height - 160}} onPress={this.closeKeyboard} underlayColor='rgba(0, 0, 0, 0)'>
          <View>
            {content}
          </View>
        </TouchableHighlight>
      </ScrollView>
    );
  };

  renderList = () => {
    return (
      <ListView
        style={styles.contactsList}
        dataSource={ds.cloneWithRows(this.state.needlActive ? this.state.users : this.state.filteredContacts)}
        renderRow={this.state.needlActive ? this.renderUser : this.renderContact}
        contentInset={{top: 0}}
        onScroll={Platform.OS === 'ios' ? this.closeKeyboard : null}
        renderHeader={this.state.needlActive ? this.renderHeaderWrapperUsers : this.renderHeaderWrapperContacts}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false} />
    );
  };

  renderPage() {
    var content;

    if (!this.state.query) {
      if (this.state.needlActive) {
        content = (
          <View>
            <TouchableHighlight style={styles.searchContactsButton} onPress={this.getContacts} underlayColor='rgba(0, 0, 0, 0)'>
              <Text style={styles.searchContactsText}>Rechercher vos contacts sur Needl</Text>
            </TouchableHighlight>
          </View>
        );
      } else {
        content = this.renderList();
      }
    } else if (this.state.loading) {
      content = (Platform.OS === 'ios' ? this.renderBlankScreen(<ActivityIndicatorIOS animating={true} color='#FE3139' style={[{height: 80}]} size='large' />) : this.renderBlankScreen(<ProgressBarAndroid indeterminate />));
    } else if (!_.isEmpty(this.state.error)) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Votre requête a eu un problème d'exécution, veuillez réessayer</Text>);
    } else {
      content = this.renderList();
    }

    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Inviter un ami' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />

        <View key='switch_buttons' style={styles.contactsButtonContainer}>
          <TouchableHighlight 
            style={[styles.contactButton, {backgroundColor: this.state.needlActive ? '#FE3139' : 'transparent'}]}
            onPress={() => this.onPressContactButton('needl')}>
            <Text style={{color: this.state.needlActive ? '#FFFFFF' : '#FE3139'}}>Needl</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            style={[styles.contactButton, {backgroundColor: this.state.phoneActive ? '#FE3139' : 'transparent'}]}
            onPress={() => this.onPressContactButton('phone')}>
            <Text style={{color: this.state.phoneActive ? '#FFFFFF' : '#FE3139'}}>Téléphone</Text>
          </TouchableHighlight>
        </View>

        {Platform.OS === 'ios' ? [
          <SearchBar
            ref='searchBar'
            key='search_ios'
            placeholder='Rechercher'
            hideBackground={true}
            textFieldBackgroundColor='#EEEDF1'
            onChangeText={(text) => {
              if (this.state.needlActive) {
                this.searchUsers(text);
              } else {
                this.searchContacts(text);
              }
            }}
            onSearchButtonPress={this.closeKeyboard} />
        ] : [
          <TextInput
            ref='searchBar'
            key='search_android'
            placeholder='Rechercher'
            style={{backgroundColor: '#EEEDF1', margin: 10, padding: 5, color: '#3A325D'}}
            onChangeText={(text) => {
              if (this.state.needlActive) {
                this.searchUsers(text);
              } else {
                this.searchContacts(text);
              }
            }}
            placeholderTextColor='#3A325D' />
        ]}

        {content}

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
    borderColor: '#EEEDF1',
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
    color: '#FE3139'
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
    backgroundColor: '#FE3139'
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
  imageCheckUser: {
    width: 20,
    height: 20,
    marginLeft: 5,
    marginRight: 25,
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
    borderColor: '#FE3139',
    borderRadius: 5
  },
  contactButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactContainer: {
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 20
  },
  profileName: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
    marginRight: 10,
    flex: 1
  },
  noResultText: {
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center'
  },
  invitedContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderColor: '#FE3139',
    borderWidth: 1
  },
  invitedText: {
    color: '#FE3139',
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'center'
  },
  buttonWrapper: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    backgroundColor: '#FE3139'
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center'
  },
});

export default SearchFriend;
