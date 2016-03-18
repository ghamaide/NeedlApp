'use strict';

import React, {ActivityIndicatorIOS, Image, ListView, NativeModules, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

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
import MeActions from '../../actions/MeActions';
import ProfilActions from '../../actions/ProfilActions';

import FriendsStore from '../../stores/Friends';
import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';

import Profil from './Profil';
import SearchFriend from './SearchFriend';
import SearchExpert from './SearchExpert';

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
    this.state.index = 1;
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
      facebook_loading: MeStore.loading(),
      friendsLoading: FriendsStore.loading(),
      error: ProfilStore.error(),
    };
  };

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
    MeStore.listen(this.onFriendsChange);
    ProfilStore.listen(this.onFriendsChange);
  };

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
    MeStore.unlisten(this.onFriendsChange);
    ProfilStore.unlisten(this.onFriendsChange);
  };

  onFriendsChange = () => {
    this.setState(this.friendsState());
  };

  // Remove to activate search bar for friends
  /* 
  searchFriends = (searched_text) => {
    this.setState({searched_text});
    var new_filtered_friends = _.filter(this.state.friends, function(friend) {
      return friend.name.toLowerCase().indexOf(searched_text.toLowerCase()) > -1;
    });

    this.setState({filtered_friends: new_filtered_friends});
  };
  */

  // Remove to activate search bar for followings
  
  /*
  searchFollowings = (searched_text) => {
    this.setState({searched_text});
    var new_filtered_followings = _.filter(this.state.followings, function(following) {
      return following.name.toLowerCase().indexOf(searched_text.toLowerCase()) > -1;
    });

    this.setState({filtered_followings: new_filtered_followings});
  };
  */


  // Remove to activate search bar closing
  /*
  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };
  */

  onRefresh = () => {
    ProfilActions.fetchFriends();
    ProfilActions.fetchFollowings();
  };

  onPressMenu = (index) => {
    if (this.state.index != index) {
      this.setState({index: index});
    }
  };

  renderFriend = (friend) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} underlayColor='#FFFFFF' onPress={() => {
        this.props.navigator.push(Profil.route({id: friend.id}));
      }}>
        <View style={styles.friendRow}>
          <Image source={{uri: friend.picture}} style={styles.friendImage} />
          <View style={styles.friendInfos}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendBadge}>{friend.badge.name}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderFollowing = (following) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} underlayColor='#FFFFFF' onPress={() => {
        this.props.navigator.push(Profil.route({id: following.id}));
      }}>
        <View style={styles.friendRow}>
          <Image source={{uri: following.picture}} style={styles.friendImage} />
          <View style={styles.friendInfos}>
            <Text style={styles.friendName}>{following.fullname}</Text>
            <Text style={styles.friendFollowers}>{following.number_of_followers} follower{following.number_of_followers > 1 ? 's' : ''}</Text>
            <Text style={styles.tags}>
              {_.map(following.tags, (tag, key) => {
                return <Text key={'tag_' + key} style={{color: '#FE3139'}}>#{tag.replace(" ", "")} </Text>
              })}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderHeader = (refreshingIndicator) => {
    var friend_number = ProfilStore.getFriends().length;
    var following_number = ProfilStore.getFollowings().length;

    if (this.state.index == 1) {
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
          active={this.state.index}
          titles={['Amis', 'Influenceurs']}
          onPress={this.onPressMenu} />

        {/* Remove to activate search bar
        this.state.index == 1 ? [
          Platform.OS === 'ios' ? [
            <SearchBar
              key='search'
              ref='searchBar'
              placeholder='Rechercher'
              hideBackground={true}
              textFieldBackgroundColor='#DDDDDD'
              onChangeText={this.state.index == 1 ? this.searchFriends : this.searchFollowings} />
          ] : [
            <TextInput
              key='search'
              style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
              ref='searchBar'
              placeholder='Rechercher'
              placeholderTextColor='#3A325D'
              hideBackground={true}
              onChangeText={this.state.index == 1 ? this.searchFriends : this.searchFollowings} />
          ]
        ] : null */}

        {!ProfilStore.getProfil(MeStore.getState().me.id).facebook_linked ? [
          !this.state.facebook_loading || true ? [
            <TouchableHighlight
              key='link_to_facebook'
              underlayColor='rgba(0, 0, 0, 0)'
              style={styles.linkFacebookButton}
              onPress={() => MeActions.linkFacebookAccount()}>
              <Text style={[styles.linkFacebookButtonText, {marginTop: 3}]}>Lier mon compte Facebook</Text>
            </TouchableHighlight>
          ] : [
            <View style={styles.linkFacebookButton}>
              {Platform.OS === 'ios' ? <ActivityIndicatorIOS animating={true} color='#FE3139' style={[{height: 80}]} size='large' /> : <ProgressBarAndroid indeterminate />}
            </View>
          ]
        ] : null}

        {this.state.index == 1 ? [
          <TouchableHighlight key='invite_friend' style={styles.invitationButton} onPress={() => this.props.navigator.push(SearchFriend.route())} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.invitationText}>Ajouter un nouvel ami</Text>
          </TouchableHighlight>
        ] : [
          <TouchableHighlight key='invite_following' style={styles.invitationButton} onPress={() => this.props.navigator.push(SearchExpert.route())} underlayColor='rgba(0, 0, 0, 0)'>
            <Text style={styles.invitationText}>Ajouter un nouvel influenceur</Text>
          </TouchableHighlight>
        ]}

        {this.state.index == 1 && this.state.requests_received.length > 0 ? [
          _.map(this.state.requests_received, (request) => {
            if (!this.state.friendsLoading) {
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
                  <Text style={{position: 'absolute', top: 10, left: 10, color: '#3A325D', fontWeight: '500', fontSize: 12}}>On t'a invité !</Text>
                </View>
              );
            } else {
              if (Platform.OS === 'ios') {
                return (<ActivityIndicatorIOS animating={true} color='#FE3139' style={[{height: 80}]} size='large' />);
              } else {
                return (<ProgressBarAndroid indeterminate />);
              }
            }
          })
        ] : null}

        <RefreshableListView
          style={styles.friendsList}
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          dataSource={this.state.index == 1 ? ds.cloneWithRows(this.state.filtered_friends) : ds.cloneWithRows(this.state.filtered_followings)}
          renderRow={this.state.index == 1 ? this.renderFriend : this.renderFollowing}
          renderHeaderWrapper={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          onScroll={this.closeKeyboard} />

        <MenuIcon onPress={this.props.toggle} />
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
    color: '#3A325D',
    fontSize: 14,
    fontWeight: '500'
  },
  friendBadge: {
    color: '#3A325D',
    fontSize: 14
  },
  friendFollowers: {
    color: '#3A325D',
    marginTop: 2,
    fontSize: 14
  },
  tags: {
    marginTop: 2
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
    color: '#FE3139'
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
    color: '#3A325D',
    marginTop: 10,
    marginBottom: 5
  },
  requestButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButtonAccept: {
    backgroundColor: '#FE3139',
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
    borderColor: '#C1BFCC',
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
    color: '#3A325D',
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'center'
  },
  invitationButton: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20,
    borderColor: '#FE3139',
    borderRadius: 5,
    borderWidth: 1,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
  },
  invitationText: {
    textAlign: 'center',
    color: '#FE3139',
    fontSize: 13,
    fontWeight: '500'
  },
  linkFacebookButton: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#3B5998',
    justifyContent: 'center',
    alignItems: 'center'
  },
  linkFacebookButtonText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF'
  }
});

export default Friends;
