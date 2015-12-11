'use strict';

import React, {StyleSheet, Text, View, Image, ListView, TouchableHighlight} from 'react-native';
import _ from 'lodash';
import SGListView from 'react-native-sglistview';
import FriendsActions from '../../../actions/FriendsActions';
import FriendsStore from '../../../stores/Friends';
import MeStore from '../../../stores/Me';
import RestaurantsActions from '../../../actions/RestaurantsActions';

import Page from '../../ui/Page';

let friendsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Friends extends Page {
  static route() {
    return {
      component: Friends,
      title: 'Amis'
    };
  }

  static friendsState() {

    var friends;

    if (FriendsStore.getState().data.friends.length || !FriendsStore.loading()) {
      friends = _.clone(FriendsStore.getState().data.friends);
      friends.unshift(MeStore.getState().me);
      friends.unshift({
        id: null
      });
    }
    return {
      data: friends && {
        friends: friendsSource.cloneWithRows(friends)
      },
      loading: FriendsStore.loading(),
      error: FriendsStore.error()
    };
  }

  state = {}

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
    FriendsActions.fetchFriends();
  }

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
  }

  onFriendsChange = () => {
    this.setState(Friends.friendsState);
  }

  renderFriend = (friend) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} onPress={() => {
        RestaurantsActions.setFilter('friend', {
          value: friend.id ? friend.name : 'Tous',
          id: friend.id
        });
        this.props.navigator.pop();
      }}>
        <View style={styles.friendRow}>
          {friend.id === null ?

            <Text style={styles.friendName}>Tous</Text>
            :
            [<Image source={{uri: friend.picture}} style={styles.friendImage} />,
              <Text style={styles.friendName}>{friend.name}</Text>
            ]
          }
        </View>
      </TouchableHighlight>
    );
  }

  renderPage() {

    return <SGListView
      scrollRenderAheadDistance={150}
      style={styles.friendsList}
      dataSource={this.state.data.friends}
      renderRow={this.renderFriend}
      contentInset={{top: 0}}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false} />;
  }
}

var styles = StyleSheet.create({
  friendsList: {
    backgroundColor: '#FFFFFF'
  },
  friendRowWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
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
    marginRight: 20,
    borderRadius: 30
  },
  friendName: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default Friends;
