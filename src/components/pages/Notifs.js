'use strict';

import React, {StyleSheet, ListView, View, Image, TouchableHighlight, ScrollView, RefreshControl, InteractionManager, Platform, ActivityIndicatorIOS, ProgressBarAndroid} from 'react-native';

import _ from 'lodash';

import Page from '../ui/Page';
import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import RestaurantElement from '../elements/Restaurant';

import NotifsActions from '../../actions/NotifsActions';

import NotifsStore from '../../stores/Notifs';
import MeStore from '../../stores/Me';

import Restaurant from './Restaurant';
import Profil from './Profil';
import InviteFriend from './InviteFriend';

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
      data: NotifsStore.getState().notifs,
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
    var nbPot = NotifsStore.getState().notifs.length;

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
          <TouchableHighlight style={styles.textContainer} underlayColor='#FFFFFF' onPress={() => this.props.navigator.push(InviteFriend.route())}>
            <Text style={styles.emptyText}>Tu n'as pas d'amis sur Needl pour l'instant, invites en !</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };

  renderNotif = (notif) => {
    var textColor = !NotifsStore.isSeen(notif.restaurant_id, notif.user_id) ? {color: 'white'} : {};
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
        <NavigationBar title="Notifs" />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.onRefresh}
              tintColor="#EF582D"
              title="Chargement..."
              colors={['#FFFFFF']}
              progressBackgroundColor="rgba(0, 0, 0, 0.5)" />
          }>
          <ListView
            key='notifs'
            initialListSize={10}
            pageSize={5}
            style={styles.notifsList}
            dataSource={ds.cloneWithRows(this.state.data)}
            renderHeaderWrapper={this.renderHeaderWrapper}
            renderRow={this.renderNotif}
            contentInset={{top: 0}}
            scrollRenderAheadDistance={150}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false} />

          {this.state.loading ? [
            <View key='loading' style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', alignItems: 'center', justifyContent: 'center'}}>
              {Platform.OS === 'ios' ? [
                <ActivityIndicatorIOS
                  key='loading_ios'
                  color='#333333'
                  animating={true}
                  style={[{height: 80}]}
                  size='large' />
              ] : [
                <ProgressBarAndroid key='loading_android' indeterminate />
              ]}
            </View>
          ] : null}
        </ScrollView>
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

export default Notifs;
