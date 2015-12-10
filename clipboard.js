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





<View key="areaIndicator" style={styles.areaIndicator}>
  <Image
    source={require('../../assets/img/area.png')}
    style={styles.areaIndicatorImage} />
</View>


<SwitchIOS
            style={styles.contactSwitch}
            ref={() => {return "switch" + contact.recordId}}
            value={(typeof this.state.contacts[_.findIndex(this.state.contacts, (row) => this.isEqual(row.recordID, contact.recordID))] === 'undefined') ? false : this.state.contacts[_.findIndex(this.state.contacts, (row) => this.isEqual(row.recordID, contact.recordID))].switchIsOn}
            onValueChange={(value) => {
              var updatedContacts = _.map(this.state.contacts, (row) => {
                if (contact.recordID === row.recordID) {
                  row.switchIsOn = value
                  return row;
                } else {
                  return row;
                }
              });
              this.setState({contacts: updatedContacts});
              MeActions.updateContact(contact.recordID, this.state.contacts[_.findIndex(this.state.contacts, (row) => this.isEqual(row.recordID, contact.recordID))].switchIsOn);
            }} />