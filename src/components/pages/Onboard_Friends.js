'use strict';

import React, {StyleSheet, ListView, View, Text, PushNotificationIOS, TouchableHighlight, Image, ScrollView, ImagePickerIOS, TextInput, ActivityIndicatorIOS} from 'react-native';
import _ from 'lodash';

import MeStore from '../../stores/Me';
import MeActions from '../../actions/MeActions';

import FriendsActions from '../../actions/FriendsActions';
import FriendsStore from '../../stores/Friends';

import Button from '../elements/Button';
import FriendCard from '../elements/FriendCard';

import ErrorToast from '../ui/ErrorToast';
import Page from '../ui/Page';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Onboard_Friends extends Page {
  static route() {
    return {
      component: Onboard_Friends,
      title: 'Add Friends (Onboard)',
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

    return <View style={styles.emptyContainerFriends}>
      <Text style={styles.emptyTextFriends}>Tu n'as pas d'autres amis connectés sur Needl, parles-en autour de toi !</Text>
    </View>;
  }

  renderPage() {
    return (
        <View style={styles.container}>
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
        </View>
    );
  }
}

var styles = StyleSheet.create({
  wrapper: {
  },
  swiper: {
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 50
  },
  emptyContainerFriends: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white'
  },
  emptyTextFriends: {
    textAlign: 'center',
    fontSize: 16
  }
});

export default Onboard_Friends;
