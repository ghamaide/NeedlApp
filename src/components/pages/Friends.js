'use strict';

import React, {Image, ListView, NativeModules, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';
import RefreshableListView from 'react-native-refreshable-listview';

import MenuIcon from '../ui/MenuIcon';
import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';

import FriendsActions from '../../actions/FriendsActions';
import ProfilActions from '../../actions/ProfilActions';

import FriendsStore from '../../stores/Friends';
import ProfilStore from '../../stores/Profil';

import Profil from './Profil';
import InviteFriend from './InviteFriend';
import SearchFriend from './SearchFriend';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Friends extends Page {
  static route() {
    return {
      component: Friends,
      title: 'Amis'
    };
  };

  constructor(props) {
    super(props);

    this.state = this.friendsState();
    this.state.friends_active = true;
    this.state.searched_text = '';
  };

  friendsState() {
    return {
      friends: ProfilStore.getFriends(),
      followings: ProfilStore.getFollowings(),
      filtered_friends: ProfilStore.getFriends(),
      filtered_followings: ProfilStore.getFollowings(),
      requests_received: ProfilStore.getRequestsReceived(),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
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

  // Remove to activate search bar for friends
  // searchFriends = (searched_text) => {
  //   this.setState({searched_text});
  //   var new_filtered_friends = _.filter(this.state.friends, function(friend) {
  //     return friend.name.toLowerCase().indexOf(searched_text.toLowerCase()) > -1;
  //   });

  //   this.setState({filtered_friends: new_filtered_friends});
  // };

  // Remove to activate search bar for followings
  // searchFollowings = (searched_text) => {
  //   this.setState({searched_text});
  //   var new_filtered_followings = _.filter(this.state.followings, function(following) {
  //     return following.name.toLowerCase().indexOf(searched_text.toLowerCase()) > -1;
  //   });

  //   this.setState({filtered_followings: new_filtered_followings});
  // };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  onRefresh = () => {
    ProfilActions.fetchFriends();
    ProfilActions.fetchFollowings();
  };

  onPressMenuFriends = () => {
    if (!this.state.friends_active) {
      this.setState({friends_active: true});
    }
  };

  onPressMenuFollowings = () => {
    if (this.state.friends_active) {
      this.setState({friends_active: false});
    }
  };

  renderFriend = (friend) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} underlayColor='#FFFFFF' onPress={() => {
        this.props.navigator.push(Profil.route({id: friend.id}, friend.name));
      }}>
        <View style={styles.friendRow}>
          <Image source={{uri: friend.picture}} style={styles.friendImage} />
          <View style={styles.friendInfos}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendRecos}>{friend.recommendations.length} reco{friend.recommendations.length > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderHeader = (refreshingIndicator) => {
    var friend_number = ProfilStore.getFriends().length;
    var following_number = ProfilStore.getFollowings().length;

    if (this.state.friends_active) {
      if (friend_number > 0) {
        return (
          <View>
            {refreshingIndicator}
          </View>
        );
      } else {
        return (
          <View style={styles.emptyContainer}>
            {refreshingIndicator}
            <Text style={styles.emptyText}>Invite tes amis sur Needl pour découvrir leurs coups de coeur !</Text>
          </View>
        );
      }
    } else {
      if (following_number > 0) {
        return (
          <View>
            {refreshingIndicator}
          </View>
        );
      } else {
        return (
          <View style={styles.emptyContainer}>
            {refreshingIndicator}
            <Text style={styles.emptyText}>Tu ne suis pas encore d'influenceurs. </Text>
            <Text style={[styles.emptyText, {marginTop: 10}]}>Ajoutes-en pour connaitre leurs coups de coeur !</Text>
          </View>
        );
      }
    }
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar 
          type='switch'
          active={this.state.friends_active}
          title_left={'Amis'}
          title_right={'Influenceurs'}
          onPressLeft={this.onPressMenuFriends}
          onPressRight={this.onPressMenuFollowings} />

        {/* Remove to activate search bar
        this.state.friends_active ? [
          Platform.OS === 'ios' ? [
            <SearchBar
              key='search'
              ref='searchBar'
              placeholder='Rechercher'
              hideBackground={true}
              textFieldBackgroundColor='#DDDDDD'
              onChangeText={this.state.friends_active ? this.searchFriends : this.searchFollowings} />
          ] : [
            <TextInput
              key='search'
              style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
              ref='searchBar'
              placeholder='Rechercher'
              placeholderTextColor='#333333'
              hideBackground={true}
              onChangeText={this.state.friends_active ? this.searchFriends : this.searchFollowings} />
          ]
        ] : null*/}

        {this.state.friends_active ? [
          <TouchableHighlight key='invite_friend' style={styles.invitationButton} onPress={() => this.props.navigator.push(SearchFriend.route())} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.invitationText}>Ajouter un nouvel ami</Text>
          </TouchableHighlight>
        ] : [
          <TouchableHighlight key='invite_following' style={styles.invitationButton} onPress={() => this.props.navigator.push(SearchFriend.route())} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.invitationText}>Ajouter un nouvel influenceur</Text>
          </TouchableHighlight>
        ]}

        {this.state.friends_active && this.state.requests_received.length > 0 ? [
          _.map(this.state.requests_received, (request) => {
            return (
              <View key={'request_received_' + request.friendship_id} style={styles.requestsContainer}>
                <Image source={{uri: request.picture}} style={{height: 60, width: 60, borderRadius: 30}} />
                <Text style={styles.requestName}>{request.fullname}</Text>
                <View style={styles.requestButtonsContainer}>
                  <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => FriendsActions.acceptFriendship(request.friendship_id)} style={styles.requestButtonAccept}>
                    <Text style={styles.requestButtonAcceptText}>Accepter</Text>
                  </TouchableHighlight>
                  <TouchableHighlight underlayColor='rgba(0, 0, 0, 0)' onPress={() => FriendsActions.refuseFriendship(request.friendship_id)} style={styles.requestButtonRefuse}>
                    <Text style={styles.requestButtonRefuseText}>Refuser</Text>
                  </TouchableHighlight>
                </View>
                <Text style={{position: 'absolute', top: 10, left: 10, color: '#555555', fontWeight: '500', fontSize: 12}}>On t'a invité !</Text>
              </View>
            );
          })
        ] : null}

        <RefreshableListView
          style={styles.friendsList}
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          dataSource={this.state.friends_active ? ds.cloneWithRows(this.state.filtered_friends) : ds.cloneWithRows(this.state.filtered_followings)}
          renderRow={this.renderFriend}
          renderHeaderWrapper={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          onScroll={this.closeKeyboard} />

        <MenuIcon pastille={this.props.pastille_notifications} has_shared={this.props.has_shared} onPress={this.props.toggle} />
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
    fontWeight: '500'
  },
  friendRecos: {
    color: '#444444',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    paddingTop: 20
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    color: '#EF582D'
  },
  requestsContainer: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5
  },
  requestName: {
    textAlign: 'center',
    color: '#555555',
    marginTop: 10,
    marginBottom: 5
  },
  requestButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonAccept: {
    backgroundColor: '#EF582D',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    margin: 5
  },
  requestButtonRefuse: {
    backgroundColor: '#FFFFFF',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    borderColor: '#888888',
    borderWidth: 1,
    margin: 5
  },
  requestButtonAcceptText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center'
  },
  requestButtonRefuseText: {
    color: '#555555',
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'center'
  },
  invitationButton: {
    margin: 5,
    borderColor: '#EF582D',
    borderRadius: 5,
    borderWidth: .5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
  },
  invitationText: {
    textAlign: 'center',
    color: '#EF582D',
    fontSize: 13
  }
});

export default Friends;
