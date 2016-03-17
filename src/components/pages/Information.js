'use strict';

import React, {Component, Dimensions, Image, ListView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';

import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import FriendsActions from '../../actions/FriendsActions';
import FollowingsActions from '../../actions/FollowingsActions';

import FriendsStore from '../../stores/Friends';
import FollowingsStore from '../../stores/Followings';
import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import Profil from './Profil';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Information extends Component {
  static route(props) {
    return {
      component: Information,
      title: 'Information',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.informationState();
  }

  informationState() { 
    var requests_received = ProfilStore.getRequestsReceived();
    var requests_sent = ProfilStore.getRequestsSent();
    var friends = ProfilStore.getFriends();
    var requests_sent_ids = _.map(requests_sent, (request) => {
      return request.id;
    });
    var requests_received_ids = _.map(requests_received, (request) => {
      return request.id;
    });
    var friends_ids = _.map(friends, (friend) => {
      return friend.id;
    });

    return {
      loading: FriendsStore.loading() || FollowingsStore.loading(),
      error: FriendsStore.error() || FollowingsStore.error(),
      origin: this.props.origin,
      followings: ProfilStore.getFollowings(),
      information: {
        title: this.props.origin == 'users' ? 'Amis' : (this.props.origin == 'experts' ? 'Influenceurs' : 'Score'),
        data: this.props.origin == 'users' ? ProfilStore.getFriendsFromUser(this.props.id) : (this.props.origin == 'experts' ? ProfilStore.getFollowingsFromUser(this.props.id) : ProfilStore.getThanksFromUser(this.props.id)),
      },
      requests_received_ids: requests_received_ids,
      friends_ids: friends_ids,
      requests_sent_ids: requests_sent_ids,
    }
  };

  componentWillMount() {
    ProfilStore.listen(this.onChange);
    FriendsStore.listen(this.onChange);
    FollowingsStore.listen(this.onChange);
  }

  componentWillUnmount() {
    ProfilStore.unlisten(this.onChange);
    FriendsStore.unlisten(this.onChange);
    FollowingsStore.unlisten(this.onChange); 
  }

  onChange = () => {
    this.setState(this.informationState());
  };

  renderUser = (user) => {
    return (
      <View style={styles.rowWrapper}>
        <View style={styles.row}>
          <Image source={{uri: user.picture}} style={styles.profilPicture} />
          <View style={styles.infos}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.badge}>{user.badge.name}</Text>
          </View>
          {_.includes(_.concat(this.state.friends_ids, this.state.requests_sent_ids), user.id) ? [
            _.includes(this.state.requests_sent_ids, this.props.id) ? [
              <View key={'invited_friend_' + user.id} style={styles.invitedContainer}>
                <Text style={styles.invitedText}>Invité</Text>
              </View>
            ] : [
              <View key={'already_friend_' + user.id} style={[styles.invitedContainer, {borderWidth: 0}]}>
                <Icon
                  name='check'
                  size={25}
                  color='#FE3139' />
              </View>
            ]
          ] : [
            _.includes(this.state.requests_received_ids, user.id) ? [
              <TouchableHighlight
              key={'invite_friend_' + user.id}
              style={styles.buttonWrapper}
              underlayColor='rgba(0, 0, 0, 0)'
              onPress={() => {
                var user_request = ProfilStore.getRequestReceived(user.id);
                FriendsActions.acceptFriendship(user_request.friendship_id);
              }}>
                <Text style={styles.buttonText}>Accepter</Text>
              </TouchableHighlight>
            ] : [
              MeStore.getState().me.id !== user.id ? [
                <TouchableHighlight
                  key={'invite_friend_' + user.id}
                  style={styles.buttonWrapper}
                  onPress={() => FriendsActions.askFriendship(user.id)}
                  underlayColor='rgba(0, 0, 0, 0)'>
                  <Text style={styles.buttonText}>Inviter</Text>
                </TouchableHighlight>
              ] : null
            ]
          ]}
        </View>
      </View>
    );
  };

  renderExpert = (expert_id) => {
    var expert = ProfilStore.getProfil(expert_id);
    return (
      <View style={styles.rowWrapper}>
        <View style={styles.row}>
          <Image source={{uri: expert.picture}} style={styles.profilPicture} />
          <View style={styles.infos}>
            <Text style={styles.name}>{expert.fullname}</Text>
            <Text style={styles.badge}>{expert.number_of_followers} follower{expert.number_of_followers > 1 ? 's' : ''}</Text>
          </View>
          {_.includes(this.state.followings, expert.id) ? [
            <TouchableHighlight key={'follow_expert_' + expert.id} style={styles.buttonWrapper} onPress={() => FollowingsActions.followExpert(expert.id)} underlayColor='rgba(0, 0, 0, 0)'>
              <Text style={styles.buttonText}>Suivre</Text>
            </TouchableHighlight>
          ] : [
            <View key={'followed_expert_' + expert.id} style={styles.invitedContainer}>
              <Text style={styles.invitedText}>Suivi</Text>
            </View>
          ]}
        </View>
      </View>
    );
  };

  renderThanks = (thanks) => {
    var friend = ProfilStore.getProfil(thanks.friend);
    var restaurant = RestaurantsStore.getRestaurant(thanks.restaurant);

    return (
      <View style={styles.rowWrapper}>
        <View style={styles.row}>
          <Image source={{uri: friend.picture}} style={styles.profilPicture} />
          <Text style={styles.thanks}>{friend.name} t'a remercié de lui avoir fait découvrir {restaurant.name}</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title={this.state.information.title} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ListView
          style={styles.dataList}
          dataSource={ds.cloneWithRows(this.state.information.data)}
          renderRow={this.state.origin == 'users' ? this.renderUser : (this.state.origin == 'experts' ? this.renderExpert : this.renderThanks)}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  dataList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  rowWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderColor: '#DDDDDD',
  },
  row: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  infos: {
    padding: 5,
    marginLeft: 10,
    flex: 1
  },
  profilPicture: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  name: {
    color: '#3A325D',
    fontSize: 14,
    fontWeight: '500'
  },
  badge: {
    color: '#3A325D',
    fontSize: 14
  },
  thanks: {
    color: '#3A325D',
    fontSize: 13,
    marginLeft: 10,
    width: Dimensions.get('window').width - 100
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
  invitedContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderColor: '#FE3139',
    borderWidth: 1
  },
  invitedText: {
    color: '#FE3139',
    fontWeight: '400',
    fontSize: 13,
    textAlign: 'center'
  },
  buttonWrapper: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    backgroundColor: '#FE3139'
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center'
  },
});

export default Information;
