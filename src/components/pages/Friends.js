'use strict';

import React, {StyleSheet, Text, View, Image, ListView, TouchableHighlight} from 'react-native';
import _ from 'lodash';
import SGListView from 'react-native-sglistview';
import SearchBar from 'react-native-search-bar';

import FriendsActions from '../../actions/FriendsActions';
import FriendsStore from '../../stores/Friends';

import Page from '../ui/Page';
import Profil from './Profil';
import AddFriend from './AddFriend';
import InviteFriend from './InviteFriend';
import FriendsRequests from './FriendsRequests';

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
  }

  friendsState() {
    return {
      data: (FriendsStore.getState().data.friends.length || !FriendsStore.loading()) && {
        friends: FriendsStore.getState().data.friends,
        filteredFriends : FriendsStore.getState().data.friends
      },
      loading: FriendsStore.loading(),
      error: FriendsStore.error(),
      nbRequests: _.filter(FriendsStore.getState().data.requests, (friend) => {
        return !friend.accepted && !friend.refused;
      }).length
    };
  }

  constructor(props) {
    super(props);

    this.state = this.friendsState();
  }

  onFocus = (event) => {
    if (event.data.route.component === Friends && event.data.route.fromTabs) {
      FriendsActions.fetchFriends();
      if (event.data.route.skipCache) {
        this.setState({data: null});
       }
    }
  }

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
  }

  onFriendsChange = () => {
    this.setState(this.friendsState());
  }

  searchFriends = (searchedText) => {
    var newFilteredFriends = _.filter(this.state.data.friends, function(friend) {
      return friend.name.indexOf(searchedText) > -1;
    });

    var filteredData = {
      friends: this.state.data.friends,
      filteredFriends: newFilteredFriends
    }

    this.setState({data: filteredData});
  }

  closeKeyboard = () => {
    NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
  }

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
  }

  renderHeader = () => {
    var nbPot = FriendsStore.getState().data.friends.length;

    if (nbPot) {
      return null;
    }

    return <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Tu n'as pas d'amis sur Needl pour l'instant, ajoutes en !</Text>
    </View>;
  }

  renderPage() {
    return (
      <View style={{flex: 1}}>
        {this.state.nbRequests ?
          <TouchableHighlight onPress={() => {
            this.props.navigator.push(FriendsRequests.route());
          }}>
            <View style={styles.nbRequestsContainer}>
              <Text style={styles.nbRequestsText}>{this.state.nbRequests} demande{this.state.nbRequests > 1 ? 's' : ''} en attente</Text>
            </View>
          </TouchableHighlight>
          : null}
        <SearchBar
          ref='searchBar'
          placeholder='Search'
          hideBackground={true}
          textFieldBackgroundColor='#DDDDDD'
          onChangeText={this.searchFriends} />
        <SGListView
          style={styles.friendsList}
          dataSource={friendsSource.cloneWithRows(this.state.data.filteredFriends)}
          renderRow={this.renderFriend}
          renderHeader={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          onScroll={this.closeKeyboard}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }
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
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white'
  }
});

export default Friends;
