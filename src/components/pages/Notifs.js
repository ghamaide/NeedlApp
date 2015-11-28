'use strict';

import React, {StyleSheet, Text, ListView, View, Image, TouchableHighlight} from 'react-native';
import _ from 'lodash';
import SGListView from 'react-native-sglistview';

import NotifsActions from '../../actions/NotifsActions';
import NotifsStore from '../../stores/Notifs';
import MeStore from '../../stores/Me';

import Page from '../ui/Page';
import RestaurantElement from '../elements/Restaurant';
import Restaurant from './Restaurant';
import Profil from './Profil';

let notifsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Notifs extends Page {
  static route() {
    return {
      component: Notifs,
      title: 'Notifs'
    };
  }

  static notifsState() {
    return {
      data: (NotifsStore.getState().notifs.length || !NotifsStore.loading()) && notifsSource.cloneWithRows(NotifsStore.getState().notifs),
      loading: NotifsStore.loading(),
      error: NotifsStore.error(),
      loggedIn: !!MeStore.getState().me.id
    };
  }

  state = Notifs.notifsState()

  onFocus = (event) => {
    if (event.data.route.component === Notifs && event.data.route.fromTabs) {
     NotifsActions.fetchNotifs();
     if (event.data.route.skipCache) {
      this.setState({data: null});
     }
     this.IS_FOCUS = true;
     return;
    }

    if (this.IS_FOCUS) {
      this.IS_FOCUS = false;
      NotifsActions.notifsSeen();
    }
  }

  componentWillMount() {
    NotifsStore.listen(this.onNotifsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  }

  componentWillUnmount() {
    NotifsStore.unlisten(this.onNotifsChange);
    if (!!MeStore.getState().me.id) {
      NotifsActions.notifsSeen();
    }
  }

  onNotifsChange = () => {
    this.setState(Notifs.notifsState);
  }

  renderHeader = () => {
    var nbPot = NotifsStore.getState().notifs.length;

    if (nbPot) {
      return null;
    }

    return <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Tu n'as pas de notifications pour l'instant</Text>
    </View>;
  }

  renderNotif = (notif) => {
    var textColor = !NotifsStore.isSeen(notif.restaurant_id, notif.user_id) ? {color: 'white'} : {};
    var blockColor = !NotifsStore.isSeen(notif.restaurant_id, notif.user_id) ? {backgroundColor: '#EF582D'} : {};

    return (
      <View style={styles.notifRow}>
        <RestaurantElement
          name={notif.restaurant_name}
          pictures={[notif.restaurant_picture]}
          type={notif.restaurant_food}
          budget={notif.restaurant_price_range}
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
  }

  renderPage() {

    return <SGListView
      style={styles.notifsList}
      dataSource={this.state.data}
      renderRow={this.renderNotif}
      renderHeader={this.renderHeader}
      contentInset={{top: 0}}
      scrollRenderAheadDistance={150}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false} />;
  }
}

var styles = StyleSheet.create({
  notifsList: {
    paddingTop: 20
  },
  notifRow: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  notifInfos: {
    backgroundColor: '#222',
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
    backgroundColor: '#F2F2F2',
    borderRadius: 5
  },
  friendQuoteText: {
    fontSize: 14
  },
  friendQuoteDate: {
    marginTop: 5,
    fontSize: 12,
    color: '#AAA'
  },
  triangle: {
    height: 15,
    width: 15,
    position: 'absolute',
    top: 17,
    left: -5,
    backgroundColor: '#F2F2F2',
    transform: [
      {rotate: '45deg'}
    ]
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }
});

export default Notifs;
