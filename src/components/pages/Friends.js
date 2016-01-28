'use strict';

import React, {StyleSheet, View, Image, ListView, TouchableHighlight, NativeModules} from 'react-native';

import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import FriendsActions from '../../actions/FriendsActions';

import FriendsStore from '../../stores/Friends';

import Profil from './Profil';
import InviteFriend from './InviteFriend';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Friends extends Page {
  static route() {
    return {
      component: Friends,
      title: 'Amis',
      rightButtonTitle: 'Inviter',
      onRightButtonPress() {
        this.push(InviteFriend.route());
      }
    };
  };

  friendsState() {
    return {
      data: (FriendsStore.getState().data.friends.length || !FriendsStore.loading()) && {
        friends: FriendsStore.getState().data.friends,
        filteredFriends : FriendsStore.getState().data.friends
      },
      loading: FriendsStore.loading(),
      error: FriendsStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.friendsState();
  };

  onFocus = (event) => {
    if (event.data.route.component === Friends && event.data.route.fromTabs) {
      FriendsActions.fetchFriends();
      if (event.data.route.skipCache) {
        this.setState({data: null});
       }
    }
  };

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  };

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
  };

  onFriendsChange = () => {
    this.setState(this.friendsState());
  };

  searchFriends = (searchedText) => {
    var newFilteredFriends = _.filter(this.state.data.friends, function(friend) {
      return friend.name.indexOf(searchedText) > -1;
    });

    var filteredData = {
      friends: this.state.data.friends,
      filteredFriends: newFilteredFriends
    }

    this.setState({data: filteredData});
  };

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  };

  onRefresh = () => {
    FriendsActions.fetchFriends();
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
        {_.map(this.state.errors, (err) => {
          return <ErrorToast key="error" value={JSON.stringify(err)} appBar={true} />;
        })}
        <NavigationBar title="Amis" rightButtonTitle="Inviter" onRightButtonPress={() => this.props.navigator.replace(InviteFriend.route())} />
        <SearchBar
          ref='searchBar'
          placeholder='Search'
          hideBackground={true}
          textFieldBackgroundColor='#DDDDDD'
          onChangeText={this.searchFriends} />
        <RefreshableListView
          style={styles.friendsList}
          dataSource={friendsSource.cloneWithRows(this.state.data.filteredFriends)}
          renderRow={this.renderFriend}
          renderHeaderWrapper={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          loadData={this.onRefresh}
          onScroll={this.closeKeyboard}
          refreshDescription="Refreshing..." />
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
  nbRequestsContainer: {
    backgroundColor: '#38E1B2',
    padding: 10
  },
  nbRequestsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
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
