'use strict';

import React, {AlertIOS, Image, ListView, NativeModules, Platform, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Contacts from 'react-native-contacts';
import SearchBar from 'react-native-search-bar';

import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';
import NavigationBar from '../ui/NavigationBar';

import MeStore from '../../stores/Me'

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
    this.state.errors = [];
    this.state.contacts = {};
    this.state.filteredContacts = {};
  };

  onMeChange = () => {
    this.setState({
      loading: MeStore.loading(),
      error: MeStore.error(),
    });
  };

  componentWillMount() {
    MeStore.listen(this.onMeChange);
  };

  componentWillUnmount() {
    MeStore.unlisten(this.onMeChange);
  };

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  };

  renderContact = (contact) => {
    return (
      <View style={styles.contactWrapper}>
          
      </View>
    );
  };

  renderHeaderWrapper = (refreshingIndicator) => {
    console.log(this.state.filteredContacts.length);
    if (!this.state.filteredContacts.length) {
      return(
        <View>
          {refreshingIndicator}
          <View style={styles.emptyTextContainer}>
            <Text style={styles.emptyText}>Pas de résultats trouvés pour 'Greg'</Text>
          </View>
          <TouchableHighlight style={styles.searchContactsButton} onPress={this.searchContactsPhone} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.searchContactsText}>Afficher les résultats de mes contacts {Platform.OS === 'ios' ? 'iPhone' : ''}</Text>
          </TouchableHighlight>
        </View>
      );
    } else {
      return (
        <View>
          {refreshingIndicator}
        </View>
      );
    }
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title='Inviter' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        {Platform.OS === 'ios' ? [
          <SearchBar
            ref='searchBar'
            key='search_ios'
            placeholder='Rechercher'
            hideBackground={true}
            textFieldBackgroundColor='#DDDDDD'
            onChangeText={this.searchContacts}
            onSearchButtonPress={this.closeKeyboard} />
        ] : [
          <TextInput
            ref='searchBar'
            key='search_android'
            placeholder='Rechercher'
            style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
            onChangeText={this.searchContacts}
            placeholderTextColor='#333333' />
        ]}
        <ListView
          style={styles.contactsList}
          dataSource={ds.cloneWithRows(this.state.filteredContacts)}
          renderRow={this.renderContact}
          contentInset={{top: 0}}
          onScroll={Platform.OS === 'ios' ? this.closeKeyboard : null}
          renderHeader={this.renderHeaderWrapper}
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
  }
});

export default InviteFriend;
