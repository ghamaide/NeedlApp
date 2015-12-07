'use strict';

import React, {StyleSheet, ListView, View, Text, Image, TouchableHighlight, AlertIOS, NativeModules} from 'react-native';
import _ from 'lodash';
import Contacts from 'react-native-contacts';
import RNComm from 'react-native-communications';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
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
  }

  constructor(props) {
    super(props);

    this.state = {};
    this.state.errors = [];
    this.state.contacts = {};
    this.state.data = {};
  }

  onMeChange = () => {
    var errors = this.state.errors;

    var uploadContactsError = MeStore.uploadingContactsError();
    if (uploadContactsError && !_.contains(errors, uploadContactsError)) {
      errors.push(uploadContactsError);
    }

    this.setState({
      uploadingList: MeStore.uploadingContacts(),
      errors: errors
    });
  }

  componentWillMount() {
    MeStore.listen(this.onMeChange);
  }

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  }

  componentDidMount() {
    this.checkPermission();
  }

  sendSms = (phone_number) => {
    var message = "Hey, je viens de m'inscrire sur Needl, rejoins moi pour partager tes restos ! Télécharge l'application ici : https://itunes.apple.com/fr/app/id1027312535";

    NativeModules.RNMessageComposer.composeMessageWithArgs(
    {
      'messageText': message,
      'subject': "",
      'recipients':[phone_number]
    },
    (result) => {
      switch(result) {
        case NativeModules.RNMessageComposer.Sent:
            console.log('the message has been sent');
            break;
        case NativeModules.RNMessageComposer.Cancelled:
            console.log('user cancelled sending the message');
            break;
        case NativeModules.RNMessageComposer.Failed:
            console.log('failed to send the message');
            break;
        case NativeModules.RNMessageComposer.NotSupported:
            console.log('this device does not support sending texts');
            break;
        default:
            console.log('something unexpected happened');
            break;
      }
    });
  }

  sendMail = (adress) => {
    var message = "Hey, je viens de m'inscrire sur Needl, rejoins moi pour partager tes restos ! Télécharge l'application ici : https://itunes.apple.com/fr/app/id1027312535";
    var subject = "Viens partager tes restos sur Needl !";

    RNComm.email(adress, null, null, subject, message);
  }

  checkPermission() {
    Contacts.checkPermission( (err, permission) => {
      console.log(permission);
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
  }

  getContacts() {
    Contacts.getAll((err, retrievedContacts) => {
      if(err && err.type === 'permissionDenied'){
        this.authorizeShowContacts();
      } else {
        this.setState({contacts : retrievedContacts});
        MeActions.uploadContacts(retrievedContacts);
      }
    })
  }

  authorizeShowContacts() {
    AlertIOS.alert(
      "Vous n'avez pas autorisé Needl à avoir accès à vos contacts",
      "Vous pouvez changer ca dans 'Settings -> Privacy'",
      [
        {text: 'OK', onPress: () => this.props.navigator.pop()},
      ]
    );
  }

  renderContact = (contact) => {    
    return (
      <View style={styles.contactWrapper}>
        <View style={styles.contactInfoWrapper}>
          <Text style={styles.contactName}>{contact.givenName} {contact.familyName}</Text>
          <View style={styles.contactActionWrapper}>
            <Text style={styles.contactNumber}>{contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : ""}</Text>
            {contact.phoneNumbers[0] ? 
              [
                <TouchableHighlight underlayColor="rgba(0, 0, 0, 0)" onPress={() => this.sendSms(contact.phoneNumbers[0].number)}>
                  <Image
                    source={require('../../assets/img/actions/icons/send_sms.png')}
                    style={styles.imageSMS} />
                </TouchableHighlight>
              ] : [
              ]
            }
          </View>
          <View style={styles.contactActionWrapper}>
            <Text style={styles.contactMail}>{contact.emailAddresses[0] ? contact.emailAddresses[0].email : ""}</Text>          
            {contact.emailAddresses[0] ? 
              [
                <TouchableHighlight underlayColor="rgba(0, 0, 0, 0)" onPress={() => this.sendMail([contact.emailAddresses[0].email])}>
                  <Image
                    source={require('../../assets/img/actions/icons/send_mail.png')}
                    style={styles.imageMail} />
                </TouchableHighlight>
              ] : [
              ]
            }
          </View>
        </View>
      </View>
    );
  }

  renderEmptyState = () => {
    // if contacts is empty : return();

  }

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <ListView
          style={styles.contactsList}
          dataSource={contactsSource.cloneWithRows(this.state.contacts)}
          renderRow={this.renderContact}
          contentInset={{top: 0}}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }
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
    borderTopWidth: 0.5,
    borderColor: '#EF582D',
    alignItems: 'center'
  },
  contactInfoWrapper: {
    marginLeft: 10,
    marginRight: 5,
    flex: 1
  },
  contactName: {
    color: '#000000',
    fontSize: 13,
    paddingTop: 2,
    paddingBottom: 2,
    marginBottom: 10
  },
  contactNumber: {
    color: '#888888',
    fontSize: 12,
    flex: 1
  },
  contactMail: {
    color: '#888888',
    fontSize: 12,
    flex: 1
  },
  contactImage: {
    height: 50,
    width: 50,
    borderRadius: 25
  },
  contactActionWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 2,
    paddingBottom: 2,
    height: 30
  },
  imageSMS: {
    width: 20,
    height: 16.8,
    marginLeft: 5,
    marginTop: 2
  },
  imageMail: {
    width: 20,
    height: 12.8,
    marginLeft: 5,
    marginTop: 4
  }
});

export default InviteFriend;
