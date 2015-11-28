'use strict';

import React, {StyleSheet, ListView, View, Text, Image, TouchableHighlight, AlertIOS} from 'react-native';
import _ from 'lodash';
import Contacts from 'react-native-contacts';
import RNComm from 'react-native-communications';
//import RNMessageComposer from 'react-native-message-composer';

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

  sendMail = (to, subject, body) => {
    //RNComm.email([to], null, null, subject, body)
  }

  sendSms = (phone_number, subject, message) => {
    /*RNMessageComposer.composeMessageWithArgs(
    {
      'messageText': message,
      'subject': subject,
      'recipients':[phone_number]
    },
    (result) => {
      switch(result) {
        case Composer.Sent:
            console.log('the message has been sent');
            break;
        case Composer.Cancelled:
            console.log('user cancelled sending the message');
            break;
        case Composer.Failed:
            console.log('failed to send the message');
            break;
        case Composer.NotSupported:
            console.log('this device does not support sending texts');
            break;
        default:
            console.log('something unexpected happened');
            break;
      }
    });*/
  }

  checkPermission() {
    Contacts.checkPermission( (err, permission) => {
      console.log(permission);
      if(permission === 'undefined'){
        Contacts.requestPermission( (err, permission) => {
          console.log(err);
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
       // message avec indication sur comment authoriser les contacts
      } else {
        this.setState({contacts : retrievedContacts});
        MeActions.uploadContacts(retrievedContacts);
      }
    })
  }

  authorizeShowContacts() {
    AlertIOS.alert(
      "Vous n'avez pas autorisé Needl à avoir accès à vos contacts",
      "Vous pouvez changer ca dans 'Settings -> Privacy'"
    );
  }

  renderContact = (contact) => {
    return (
      <View style={styles.contactWrapper}>
        <Image
          source={(contact.thumbnailPath === "") ? require('../../assets/img/default_profile.png') : {uri: contact.thumbnailPath}}
          style={styles.contactImage} />
        <View style={styles.contactInfoWrapper}>
          <Text style={styles.contactName}>{contact.givenName} {contact.familyName}</Text>
          <View style={styles.contactActionWrapper}>
            <Text style={styles.contactNumber}>{contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : ""}</Text>
            {contact.phoneNumbers[0] ? 
              [
                <Image
                  source={require('../../assets/img/send_sms.png')}
                  style={styles.imageSMS} />
              ] : [
              ]
            }
          </View>
          <View style={styles.contactActionWrapper}>
            <Text style={styles.contactMail}>{contact.emailAddresses[0] ? contact.emailAddresses[0].email : ""}</Text>          
            {contact.emailAddresses[0] ? 
              [
                <TouchableHighlight onPress={this.sendMail([contact.emailAddresses[0].email], "lol", "lol lol")}>
                  <Image
                    source={require('../../assets/img/send_mail.png')}
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
    backgroundColor: 'black'
  },
  contactWrapper: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'black',
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
    color: 'white',
    fontSize: 11,
    paddingTop: 2,
    paddingBottom: 2
  },
  contactNumber: {
    color: 'white',
    fontSize: 11,
    flex: 1
  },
  contactMail: {
    color: 'white',
    fontSize: 11,
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
    paddingBottom: 2
  },
  imageSMS: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginLeft: 5,
  },
  imageMail: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginLeft: 5
  }
});

export default InviteFriend;
