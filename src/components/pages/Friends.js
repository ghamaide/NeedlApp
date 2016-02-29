'use strict';

import React, {Image, ListView, NativeModules, Platform, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';
import NavigationBar from '../ui/NavigationBar';

import ProfilActions from '../../actions/ProfilActions';

import FriendsStore from '../../stores/Friends';
import ProfilStore from '../../stores/Profil';

import Profil from './Profil';
import InviteFriend from './InviteFriend';
import InviteFriendTemp from './InviteFriendTemp';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

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
      followings: ProfilStore.getFollowings(),
      filteredFriends: ProfilStore.getFriends(),
      filteredFollowings: ProfilStore.getFollowings(),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.friendsState();
    this.state.friendsActive = true;
    this.state.followingsActive = false;
    this.state.searchedText = '';
    this.state.title = 'Amis';
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
    this.setState({searchedText});
    var newFilteredFriends = _.filter(this.state.friends, function(friend) {
      return friend.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });

    this.setState({filteredFriends: newFilteredFriends});
  };

  searchFollowings = (searchedText) => {
    this.setState({searchedText});
    var newFilteredFollowings = _.filter(this.state.followings, function(following) {
      return following.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });

    this.setState({filteredFollowings: newFilteredFollowings});
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  onRefresh = () => {
    ProfilActions.fetchFriends();
  };

  onPressFriend = (from) => {
    if (from === 'friends') {
      this.setState({friendsActive: true});
      this.setState({followingsActive: false});
      this.searchFriends(this.state.searchedText);
    }

    if (from === 'followings') {
      this.setState({followingsActive: true});
      this.setState({friendsActive: false});
      this.searchFollowings(this.state.searchedText);
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
            <Text style={styles.friendRecos}>{friend.number_of_recos} reco{friend.number_of_recos > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderHeader = (refreshingIndicator) => {
    var friendNumber = ProfilStore.getFriends().length;
    var followingNumber = ProfilStore.getFollowings().length;

    if (this.state.friendsActive) {
      if (friendNumber > 0) {
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
      if (followingNumber > 0) {
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
        {this.state.friendsActive ? [
          <NavigationBar key='navbar_friends' title='Amis' rightButtonTitle='Inviter' onRightButtonPress={() => this.props.navigator.push(InviteFriendTemp.route())} />
        ] : [
          <NavigationBar key='navbar_followings' title='Influenceurs' rightButtonTitle='Rechercher' onRightButtonPress={() => this.props.navigator.push(InviteFriendTemp.route())} />
        ]}
        <View style={styles.friendsButtonContainer}>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0)'
            style={[styles.friendsButton, {backgroundColor: this.state.friendsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressFriend('friends')}>
            <Text style={{color: this.state.friendsActive ? '#FFFFFF' : '#EF582D'}}>Amis</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0)'
            style={[styles.friendsButton, {backgroundColor: this.state.followingsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressFriend('followings')}>
            <Text style={{color: this.state.followingsActive ? '#FFFFFF' : '#EF582D'}}>Influenceurs</Text>
          </TouchableHighlight>
        </View>

        {Platform.OS === 'ios' ? [
          <SearchBar
            key='search'
            ref='searchBar'
            placeholder='Rechercher'
            hideBackground={true}
            textFieldBackgroundColor='#DDDDDD'
            onChangeText={this.state.friendsActive ? this.searchFriends : this.searchFollowings} />
        ] : [
          <TextInput
            key='search'
            style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
            ref='searchBar'
            placeholder='Rechercher'
            placeholderTextColor='#333333'
            hideBackground={true}
            onChangeText={this.state.friendsActive ? this.searchFriends : this.searchFollowings} />
        ]}
        <RefreshableListView
          style={styles.friendsList}
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          dataSource={this.state.friendsActive ? ds.cloneWithRows(this.state.filteredFriends) : ds.cloneWithRows(this.state.filteredFollowings)}
          renderRow={this.renderFriend}
          renderHeaderWrapper={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          onScroll={this.closeKeyboard} />
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
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '400',
    color: '#EF582D',
  },
  friendsButtonContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#EF582D',
    borderRadius: 5
  },
  friendsButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Friends;
