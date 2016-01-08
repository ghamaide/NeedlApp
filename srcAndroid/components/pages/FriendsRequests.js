'use strict';

import React, {StyleSheet, ListView, View} from 'react-native';
import _ from 'lodash';

import FriendsActions from '../../actions/FriendsActions';
import FriendsStore from '../../stores/Friends';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
import FriendCard from '../elements/FriendCard';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class FriendsRequests extends Page {
  static route() {
    return {
      component: FriendsRequests,
      title: 'Demandes'
    };
  }

  friendsState() {
    var friends = _.filter(FriendsStore.getState().data.requests, (friend) => {
      if (friend.accepted && friend.accepted < this.state.DISPLAY_REPLIED_SINCE) {
        return false;
      }

      if (friend.refused && friend.refused < this.state.DISPLAY_REPLIED_SINCE) {
        return false;
      }

      return true;
    });

    var errors = this.state.errors;

    _.each(friends, (friend) => {
      var acceptErr = FriendsStore.acceptFriendshipError(friend.id);
      if (acceptErr && !_.contains(errors, acceptErr)) {
        errors.push(acceptErr);
      }

      var removeErr = FriendsStore.removeFriendshipError(friend.id);
      if (removeErr && !_.contains(errors, removeErr)) {
        errors.push(removeErr);
      }
    });

    return {
      data: (FriendsStore.getState().data.requests.length || !FriendsStore.loading()) && {
        friends: friendsSource.cloneWithRows(friends)
      },
      errors: errors,
      loading: FriendsStore.loading(),
      error: FriendsStore.error()
    };
  }

  constructor(props) {
    super(props);

    this.state = {};
    this.state.errors = [];
    this.state.DISPLAY_REPLIED_SINCE = Date.now();
    this.state = _.extend(this.state, this.friendsState());
  }

  componentWillMount() {
    FriendsStore.listen(this.FriendsChange);
    FriendsActions.fetchFriends();
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.FriendsChange);
    FriendsActions.requestsSeen();
  }

  FriendsChange = () => {
    this.setState(this.friendsState());
  }

  renderFriend = (friend) => {
    return <FriendCard
      {...friend}
      acceptText={FriendsStore.acceptFriendshipLoading(friend.id) ? 'Ajout...' : 'Accepter'}
      ignoreText={FriendsStore.removeFriendshipLoading(friend.id) ? 'Suppression...' : 'Refuser'}
      onAccept={() => {
        if (FriendsStore.acceptFriendshipLoading(friend.id)) {
          return;
        }
        FriendsActions.acceptFriendship(friend.id);
      }}
      onIgnore={() => {
        if (FriendsStore.removeFriendshipLoading(friend.id)) {
          return;
        }
        FriendsActions.removeFriendship(friend.id);
      }}
      accepted={!!friend.accepted}
      ignored={!!friend.refused}
    />;
  }

  renderPage() {

    return <View style={styles.viewContainer}>
      <ListView
        style={styles.friendsList}
        dataSource={this.state.data.friends}
        renderRow={this.renderFriend}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        showsVerticalScrollIndicator={false} />
      {_.map(this.state.errors, (error, i) => {
        return <ErrorToast key={i} value={JSON.stringify(error)} appBar={true} />;
      })}
    </View>;
  }
}

var styles = StyleSheet.create({
  friendsList: {
  },
  friendRowWrapper: {
  },
  viewContainer: {
    flex: 1
  }
});

export default FriendsRequests;
