'use strict';

import React, {StyleSheet, View, Image, ListView, TouchableHighlight, NativeModules, ScrollView, Platform} from 'react-native';

import _ from 'lodash';
import SearchBar from 'react-native-search-bar';
import Animatable from 'react-native-animatable';
import RefreshableListView from 'react-native-refreshable-listview';

import Page from '../ui/Page';
import Text from '../ui/Text';
import TextInput from '../ui/TextInput';
import NavigationBar from '../ui/NavigationBar';

import ProfilActions from '../../actions/ProfilActions';

import FriendsStore from '../../stores/Friends';
import ProfilStore from '../../stores/Profil';

import Profil from './Profil';
import InviteFriend from './InviteFriend';
import InviteFriendTemp from './InviteFriendTemp';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class Friends extends Page {
  static route() {
    return {
      component: Friends,
      title: 'Amis'
    };
  };

  friendsState() {
    return {
      friends: ProfilStore.getFriends(),
      experts: ProfilStore.getFriends(),
      filteredFriends: ProfilStore.getFriends(),
      filteredExperts: ProfilStore.getFriends(),
      loading: ProfilStore.loading(),
      error: ProfilStore.error(),
    };
  };

  constructor(props) {
    super(props);

    this.state = this.friendsState();
    this.state.friendsActive = true;
    this.state.expertsActive = false;
  };

  componentWillMount() {
    FriendsStore.listen(this.onFriendsChange);
  };

  componentWillUnmount() {
    FriendsStore.unlisten(this.onFriendsChange);
  };

  onFriendsChange = () => {
    this.setState(this.friendsState());
  };

  searchFriends = (searchedText) => {
    var newFilteredFriends = _.filter(this.state.friends, function(friend) {
      return friend.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });

    this.setState({filteredFriends: newFilteredFriends});
  };

  searchExperts = (searchedText) => {
    var newFilteredExperts = _.filter(this.state.experts, function(expert) {
      return expert.name.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });

    this.setState({filteredExperts: newFilteredExperts});
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios') {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  onRefresh = () => {
    ProfilActions.fetchProfils();
  };

  onPressFriend = (from) => {
    if (from === 'friends') {
      this.setState({friendsActive: true});
      this.setState({expertsActive: false});
    }

    if (from === 'experts') {
      this.setState({expertsActive: true});
      this.setState({friendsActive: false});
    }
  };

  renderFriend = (friend) => {
    return (
      <TouchableHighlight style={styles.friendRowWrapper} underlayColor="#FFFFFF" onPress={() => {
        this.props.navigator.push(Profil.route({id: friend.id}, friend.name));
      }}>
        <View style={styles.friendRow}>
          <Image source={{uri: friend.picture}} style={styles.friendImage} />
          <View style={styles.friendInfos}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendRecos}>{friend.number_of_recos} reco{friend.number_of_recos > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  };

  renderHeader = (refreshingIndicator) => {
    var nbPot = ProfilStore.getFriends().length;

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
          <TouchableHighlight style={styles.textContainer} underlayColor='rgba(239, 88, 45, 0.1)' onPress={() => this.props.navigator.push(InviteFriendTemp.route())}>
            <Text style={styles.emptyText}>Tu n'as pas d'amis sur Needl pour l'instant, invites en !</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title="Amis" rightButtonTitle="Inviter" onRightButtonPress={() => this.props.navigator.push(InviteFriendTemp.route())} />
        {Platform.OS === 'ios' ? [
          <SearchBar
            key="search"
            ref='searchBar'
            placeholder='Rechercher'
            hideBackground={true}
            textFieldBackgroundColor='#DDDDDD'
            onChangeText={this.searchFriends} />
        ] : [
          <TextInput
            key="search"
            style={{backgroundColor: '#DDDDDD', margin: 10, padding: 5}}
            ref='searchBar'
            placeholder='Rechercher'
            placeholderTextColor='#333333'
            hideBackground={true}
            onChangeText={this.state.friendsActive ? this.searchFriends : this.searchExperts} />
        ]}
        { /*
        <View style={styles.friendsButtonContainer}>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0)'
            style={[styles.friendsButton, {backgroundColor: this.state.friendsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressFriend('friends')}>
            <Text style={{color: this.state.friendsActive ? '#FFFFFF' : '#EF582D'}}>Amis</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor='rgba(0, 0, 0, 0)'
            style={[styles.friendsButton, {backgroundColor: this.state.expertsActive ? '#EF582D' : 'transparent'}]}
            onPress={() => this.onPressFriend('experts')}>
            <Text style={{color: this.state.expertsActive ? '#FFFFFF' : '#EF582D'}}>Influenceurs</Text>
          </TouchableHighlight>
        </View>
        */}
        <RefreshableListView
          style={styles.friendsList}
          refreshDescription="Chargement..."
          loadData={this.onRefresh}
          dataSource={this.state.friendsActive ? ds.cloneWithRows(this.state.filteredFriends) : ds.cloneWithRows(this.state.filteredExperts)}
          renderRow={this.renderFriend}
          renderHeaderWrapper={this.renderHeader}
          contentInset={{top: 0}}
          scrollRenderAheadDistance={150}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          onScroll={this.closeKeyboard} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  friendsList: {
    backgroundColor: 'white',
    flex: 1
  },
  friendRowWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
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
    borderRadius: 30
  },
  friendInfos: {
    flex: 1,
    marginLeft: 20,
    paddingTop: 4
  },
  friendName: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500'
  },
  friendRecos: {
    color: '#444444',
    fontSize: 14
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
  },
  friendsButtonContainer: {
    flexDirection: 'row',
    margin: 10,
    borderWidth: 1,
    borderColor: '#EF582D',
    borderRadius: 5
  },
  friendsButton: {
    flex: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Friends;
