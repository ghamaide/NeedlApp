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

let notifsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Notifs extends Page {
  static route() {
    return {
      component: Notifs,
      title: 'Notifs'
    };
  };

  notifsState() {
    return {
      data: (NotifsStore.getState().notifs.length || !NotifsStore.loading()) && notifsSource.cloneWithRows(NotifsStore.getState().notifs.slice(0, 3)),
      loading: NotifsStore.loading(),
      error: NotifsStore.error()
    };
  };

  constructor(props) {
    super(props);
    
    this.state = this.notifsState();
    this.state.renderPlaceholderOnly = true;
  }

  onFocus = (event) => {
    if (event.data.route.component === Notifs) {
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
  };

  componentWillMount() {
    NotifsStore.listen(this.onNotifsChange);
    this.props.navigator.navigationContext.addListener('didfocus', this.onFocus);
  };

  componentWillUnmount() {
    NotifsStore.unlisten(this.onNotifsChange);
    if (!!MeStore.getState().me.id) {
      NotifsActions.notifsSeen();
    }
  };

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({renderPlaceholderOnly: false});
    });
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

  _renderPlaceholderView() {
    var content;

    if (Platform.OS === 'ios') {
      content = <ActivityIndicatorIOS animating={true} style={[{height: 80}]} size="large" />;
    } else {
      content = <ProgressBarAndroid indeterminate />;
    }
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        {content}
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
              tintColor="#ff0000"
              title="Chargement..."
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00" />
          }>
          <ListView
            initialListSize={1}
            pageSize={5}
            style={styles.notifsList}
            dataSource={this.state.data}
            renderHeaderWrapper={this.renderHeaderWrapper}
            renderRow={this.renderNotif}
            contentInset={{top: 0}}
            scrollRenderAheadDistance={150}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false} />
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
