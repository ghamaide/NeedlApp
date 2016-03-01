'use strict';

import React, {Dimensions, Image, ListView, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';

import NotifsActions from '../../actions/NotifsActions';

import NotifsStore from '../../stores/Notifs';
import MeStore from '../../stores/Me';

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

  notifsState() {
    return {
      notifs: NotifsStore.getState().notifs,
      loading: NotifsStore.loading(),
      error: NotifsStore.error()
    };
  };

  constructor(props) {
    super(props);
    
    this.state = this.notifsState();
  }

  componentWillMount() {
    NotifsStore.listen(this.onNotifsChange);
  }

  componentWillUnmount() {
    NotifsStore.unlisten(this.onNotifsChange);
    NotifsActions.notifsSeen();
  };

  componentDidMount() {
    NotifsActions.notifsSeen();
  }

  onNotifsChange = () => {
    this.setState(this.notifsState());
  };

  onRefresh() {
    NotifsActions.notifsSeen();
    NotifsActions.fetchNotifs();
  };

  renderHeaderWrapper = (refreshingIndicator) => {
    var notificationNumber = NotifsStore.getState().notifs.length;

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
          <Text style={styles.emptyText}>Invite tes amis sur Needl pour découvrir leur séléction de restaurants !</Text>
        </View>
      );
    }
  };

  renderNotif = (notif) => {
    var textColor = !NotifsStore.isSeen(notif.restaurant_id, notif.user_id) ? {color: 'white'} : {color: '#333333'};
    var blockColor = !NotifsStore.isSeen(notif.restaurant_id, notif.user_id) ? {backgroundColor: '#EF582D'} : {};

    return (
      <View style={styles.notifRow}>
        <RestaurantElement
          name={notif.restaurant_name}
          picture={notif.restaurant_picture}
          type={notif.restaurant_food}
          budget={notif.restaurant_price_range}
          height={180}
          onPress={() => {
            this.props.navigator.push(Restaurant.route({id: notif.restaurant_id}, notif.restaurant_name));
          }}/>

        <View style={[styles.notifInfos]}>
          <TouchableHighlight style={styles.friendImage} onPress={() => {
            this.props.navigator.push(Profil.route({id: notif.user_id}, notif.user));
          }}>
            <Image source={{uri: notif.user_picture}} style={styles.friendImage} />
          </TouchableHighlight>
          <View style={[styles.friendQuote, blockColor]}>
            <Text style={[styles.friendQuoteText, textColor]}>{notif.review || 'Sur ma Wishlist !'}</Text>
            <Text style={[styles.friendQuoteDate, textColor]}>{notif.user}, le {notif.date}</Text>
            <View style={[styles.triangle,  blockColor]} />
          </View>
        </View>
      </View>
    );
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title='Notifs' />
        <RefreshableListView
          key='notifs'
          refreshDescription='Chargement...'
          loadData={this.onRefresh}
          style={styles.notifsList}
          dataSource={ds.cloneWithRows(this.state.notifs)}
          renderRow={this.renderNotif}
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: Dimensions.get('window').height - 140
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
