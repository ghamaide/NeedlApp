'use strict';

import React, {StyleSheet, View, Image, ListView, TouchableHighlight, NativeModules, ScrollView, RefreshControl, Platform} from 'react-native';

import _ from 'lodash';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';

import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';
import NavigationBar from '../ui/NavigationBar';

import ProfilActions from '../../actions/ProfilActions';

import FriendsStore from '../../stores/Friends';
import ProfilStore from '../../stores/Profil';

import Profil from './Profil';
import InviteFriend from './InviteFriend';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Friends extends Page {
  static route() {
    return {
      component: Friends,
      title: 'Amis'
    };
  };

  friendsState() {
    return {
      friends: ProfilStore.getFriends(),
      filteredFriends: ProfilStore.getFriends(),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.friendsState();
  };

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
  };

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
  };

  onFriendsChange = () => {
    this.setState(this.friendsState());
  };

  searchFriends = (searchedText) => {
    var newFilteredFriends = _.filter(this.state.friends, function(friend) {
      return friend.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });

    this.setState({filteredFriends: newFilteredFriends});
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  onRefresh = () => {
    ProfilActions.fetchProfils();
  };

  renderFriend = (friend) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} underlayColor="#FFFFFF" onPress={() => {
        this.props.navigator.push(Profil.route({id: friend.id}, friend.name));
      }}>
        <View style={styles.friendRow}>
          <Image source={{uri: friend.picture}} style={styles.friendImage} />
          <View style={styles.friendInfos}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendRecos}>{friend.number_of_recos} reco{friend.number_of_recos > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderHeader = (refreshingIndicator) => {
    var nbPot = FriendsStore.getState().data.friends.length;

    if (nbPot) {
      return (
        <View>
          {refreshingIndicator}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        {refreshingIndicator}
        <View style={styles.textContainerWrapper}>
          <TouchableHighlight style={styles.textContainer} underlayColor='rgba(239, 88, 45, 0.1)' onPress={() => this.props.navigator.push(InviteFriend.route())}>
            <Text style={styles.emptyText}>Tu n'as pas d'amis sur Needl pour l'instant, invites en !</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title="Amis" rightButtonTitle="Inviter" onRightButtonPress={() => this.props.navigator.push(InviteFriend.route())} />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.onRefresh}
              tintColor="#EF582D"
              title="Chargement..."
              colors={['#FFFFFF']}
              progressBackgroundColor="rgba(0, 0, 0, 0.5)" />
          }>
          {Platform.OS === 'ios' ? [
            <SearchBar
              key="search"
              ref='searchBar'
              placeholder='Rechercher'
              hideBackground={true}
              textFieldBackgroundColor='#DDDDDD'
              onChangeText={this.searchFriends} />
          ] : [
            <TextInput
              key="search"
              style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
              ref='searchBar'
              placeholder='Rechercher'
              hideBackground={true}
              onChangeText={this.searchFriends} />
          ]}
          <ListView
            style={styles.friendsList}
            dataSource={friendsSource.cloneWithRows(this.state.filteredFriends)}
            renderRow={this.renderFriend}
            renderHeaderWrapper={this.renderHeader}
            contentInset={{top: 0}}
            scrollRenderAheadDistance={150}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false}
            onScroll={this.closeKeyboard} />
        </ScrollView>
      </View>
    );
  };
}

var styles = StyleSheet.create({
  friendsList: {
    backgroundColor: 'white',
    flex: 1
  },
  friendRowWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  friendRow: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  friendInfos: {
    flex: 1,
    marginLeft: 20,
    paddingTop: 4
  },
  friendName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold'
  },
  friendRecos: {
    color: '#444444',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF'
  },
  textContainerWrapper: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: '#EF582D',
    borderWidth: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: '#EF582D',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    width: 175,
    textAlign: 'center',
    fontSize: 15,
    color: '#EF582D',
  }
});

export default Friends;
