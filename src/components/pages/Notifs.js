'use strict';

import React, {Dimensions, Image, ListView, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';

import NotifsActions from '../../actions/NotifsActions';

import MeStore from '../../stores/Me';
import NotifsStore from '../../stores/Notifs';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

import Restaurant from './Restaurant';
import Profil from './Profil';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Notifs extends Page {
  static route() {
    return {
      component: Notifs,
      title: 'Notifs'
    };
  };

  constructor(props) {
    super(props);
    
    this.state = this.notificationsState();
    this.state.friendsActive = true;
    this.state.followingsActive = false;
  }

  notificationsState() {
    return {
      friendsNotifications: NotifsStore.getFriendsNotifications(),
      followingsNotifications: NotifsStore.getFollowingsNotifications(),
      loading: NotifsStore.loading(),
      error: NotifsStore.error()
    };
  };

  componentWillMount() {
    NotifsStore.listen(this.onNotificationsChange);
  }

  componentWillUnmount() {
    NotifsStore.unlisten(this.onNotificationsChange);
    NotifsActions.notificationsSeen();
  };

  componentDidMount() {
    NotifsActions.notificationsSeen();
  }

  onNotificationsChange = () => {
    this.setState(this.notificationsState());
  };

  onRefresh() {
    NotifsActions.notificationsSeen();
    NotifsActions.fetchNotifications();
  };

  onPressNotification = (from) => {
    if (from === 'friends') {
      this.setState({friendsActive: true});
      this.setState({followingsActive: false});
    }

    if (from === 'followings') {
      this.setState({followingsActive: true});
      this.setState({friendsActive: false});
    }
  };

  renderHeaderWrapper = (refreshingIndicator) => {
    if (this.state.friendsActive) {
      var notificationNumber = this.state.friendsNotifications.length;
    } else if (this.state.followingsActive) {
      var notificationNumber = this.state.followingsNotifications.length;
    }

    if (notificationNumber > 0) {
      return (
        <View>
          {refreshingIndicator}
        </View>
      );
    } else {
      return (
        <View style={styles.emptyContainer}>
          {refreshingIndicator}
          <Text style={styles.emptyText}>Tu n'as pas encore de notification.</Text>
          {this.state.friendsActive ? [
            <Text key='invite_friends' style={styles.emptyText}>Invite tes amis sur Needl pour découvrir leur séléction de restaurants !</Text>
          ] : [
            <Text key='invite_experts' style={styles.emptyText}>Invite tes amis sur Needl pour découvrir leur séléction de restaurants !</Text>
          ]}
        </View>
      );
    }
  };

  renderNotification = (notification) => {
    var is_recommendation = false;
    var textColor = !NotifsStore.isSeen(notification.restaurant_id, notification.user_id) ? {color: 'white'} : {color: '#333333'};
    var blockColor = !NotifsStore.isSeen(notification.restaurant_id, notification.user_id) ? {backgroundColor: '#EF582D'} : {};

    var user = ProfilStore.getProfil(notification.user_id);
    var restaurant = RestaurantsStore.getRestaurant(notification.restaurant_id);

    if (notification.notification_type === 'recommendation') {
      is_recommendation = true;
      var recommendation = NotifsStore.getRecommendation(notification.restaurant_id, notification.user_id);
    }

    return (
      <View style={styles.notifRow}>
        <RestaurantElement
          name={restaurant.name}
          picture={restaurant.pictures[0]}
          type={restaurant.food[1]}
          budget={restaurant.price_range}
          height={180}
          onPress={() => {
            this.props.navigator.push(Restaurant.route({id: notification.restaurant_id}, restaurant.name));
          }}/>

        <View style={[styles.notifInfos]}>
          <TouchableHighlight style={styles.friendImage} onPress={() => {
            this.props.navigator.push(Profil.route({id: notification.user_id}, user.name));
          }}>
            <Image source={{uri: user.picture}} style={styles.friendImage} />
          </TouchableHighlight>
          <View style={[styles.friendQuote, blockColor]}>
            <Text style={[styles.friendQuoteText, textColor]}>{is_recommendation ? recommendation.review : 'Sur ma Wishlist !'}</Text>
            <Text style={[styles.friendQuoteDate, textColor]}>{user.name}, le {notification.formatted_date}</Text>
            <View style={[styles.triangle,  blockColor]} />
          </View>
        </View>
      </View>
    );
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title='Feed' />

        <View key='switch_buttons' style={styles.notificationsButtonContainer}>
          <TouchableHighlight 
            style={[styles.notificationsButton, {backgroundColor: this.state.friendsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressNotification('friends')}>
            <Text style={{color: this.state.friendsActive ? '#FFFFFF' : '#EF582D'}}>Amis</Text>
          </TouchableHighlight>
          <TouchableHighlight 
            style={[styles.notificationsButton, {backgroundColor: this.state.followingsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressNotification('followings')}>
            <Text style={{color: this.state.followingsActive ? '#FFFFFF' : '#EF582D'}}>Influenceurs</Text>
          </TouchableHighlight>
        </View>

        <RefreshableListView
          key='notifications'
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          style={styles.notifsList}
          dataSource={ds.cloneWithRows(this.state.friendsActive ? this.state.friendsNotifications : this.state.followingsNotifications)}
          renderRow={this.renderNotification}
          contentInset={{top: 0}}
          renderHeaderWrapper={this.renderHeaderWrapper}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  notifsList: {
    backgroundColor: '#FFFFFF',
  },
  notifRow: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  notifInfos: {
    backgroundColor: '#EEEEEE',
    padding: 20,
    flexDirection: 'row'
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  friendQuote: {
    flex: 1,
    marginLeft: 15,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5
  },
  friendQuoteText: {
    fontSize: 14
  },
  friendQuoteDate: {
    marginTop: 5,
    fontSize: 12,
    color: '#888888'
  },
  triangle: {
    height: 15,
    width: 15,
    position: 'absolute',
    top: 17,
    left: -5,
    backgroundColor: '#FFFFFF',
    transform: [
      {rotate: '45deg'}
    ]
  },
  notificationsButtonContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#EF582D',
    borderRadius: 5
  },
  notificationsButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').height - 150
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '400',
    color: '#EF582D',
  }
});

export default Notifs;
