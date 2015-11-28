'use strict';

import React, {StyleSheet, ListView, View, Text, Image} from 'react-native';
import _ from 'lodash';

import FriendsActions from '../../actions/FriendsActions';
import FriendsStore from '../../stores/Friends';

import InviteFriend from './InviteFriend';

import Page from '../ui/Page';
import ErrorToast from '../ui/ErrorToast';
import FriendCard from '../elements/FriendCard';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class PotentialFriends extends Page {
  static route() {
    return {
      component: PotentialFriends,
      title: 'Ajouter',
      rightButtonTitle: 'Inviter',
      onRightButtonPress() {
        this.push(InviteFriend.route());
      }
    };
  }

  friendsState() {
    var friends = _.filter(FriendsStore.getState().data.potential_friends, (friend) => {
      if (friend.added && friend.added < this.state.DISPLAY_REPLIED_SINCE) {
        return false;
      }

      if (friend.ignored && friend.ignored < this.state.DISPLAY_REPLIED_SINCE) {
        return false;
      }

      return true;
    });

    var errors = this.state.errors;

    _.each(friends, (friend) => {
      var proposeErr = FriendsStore.proposeFriendshipError(friend.id);
      if (proposeErr && !_.contains(errors, proposeErr)) {
        errors.push(proposeErr);
      }

      var ignoreErr = FriendsStore.ignoreFriendshipError(friend.id);
      if (ignoreErr && !_.contains(errors, ignoreErr)) {
        errors.push(ignoreErr);
      }
    });

    return {
      data: FriendsStore.getState().data && FriendsStore.getState().data.potential_friends && {
        friends: friendsSource.cloneWithRows(friends)
      },
      errors: errors,
      loading: FriendsStore.potentialFriendsLoading(),
      error: FriendsStore.potentialFriendsError()
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
    FriendsActions.fetchPotentialFriends();
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.FriendsChange);
  }

  FriendsChange = () => {
    this.setState(this.friendsState());
  }

  renderFriend = (friend) => {
    return <FriendCard
      {...friend}
      acceptText={FriendsStore.proposeFriendshipLoading(friend.id) ? 'Ajout...' : 'Ajouter'}
      ignoreText={FriendsStore.ignoreFriendshipLoading(friend.id) ? 'Suppression...' : 'Ignorer'}
      onAccept={() => {
        if (FriendsStore.proposeFriendshipLoading(friend.id)) {
          return;
        }
        FriendsActions.proposeFriendship(friend.id);
      }}
      onIgnore={() => {
        if (FriendsStore.ignoreFriendshipLoading(friend.id)) {
          return;
        }
        FriendsActions.ignoreFriendship(friend.id);
      }}
      accepted={!!friend.added}
      ignored={!!friend.ignored} />;
  }

  renderEmptyState = () => {
    var nbPot = FriendsStore.getState().data.potential_friends && FriendsStore.getState().data.potential_friends.length;

    if (nbPot) {
      return null;
    }

    /*<Image source={{uri: 'http://www.needl.fr/assets/come_in-6c4bfafbeaa1513293f0f51ac9aecb0aaecc3ae4a729c65dabfddf1c6d5ea62f.gif'}}
        style={styles.emptyImage} /> fixed in 0.10 */

    return <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Tu n'as pas d'autres amis connectés sur Needl, parles-en autour de toi !</Text>
    </View>;
  }

  renderPage() {

    return <View style={{flex: 1}}>
      <ListView
        style={styles.friendsList}
        dataSource={this.state.data.friends}
        renderRow={this.renderFriend}
        contentInset={{top: 0}}
        automaticallyAdjustContentInsets={false}
        renderHeader={this.renderEmptyState}
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
  emptyContainer: {
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16
  },
  emptyImage: {
    width: 200,
    height: 200,
    borderRadius: 100
  }
});

export default PotentialFriends;
