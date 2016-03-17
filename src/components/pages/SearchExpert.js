'use strict';

import React, {ActivityIndicatorIOS, Dimensions, Image, ListView, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';

import NavigationBar from '../ui/NavigationBar';
import Page from '../ui/Page';
import Text from '../ui/Text';

import FollowingsActions from '../../actions/FollowingsActions'

import FollowingsStore from '../../stores/Followings'
import ProfilStore from '../../stores/Profil'

import Profil from './Profil';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class SearchExpert extends Page {
  static route(props) {
    return {
      component: SearchExpert,
      title: 'Inviter des experts',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.searchExpertState();
    this.state.query = '';
  };

  searchExpertState() {
    return {
      error: ProfilStore.error(),
      experts: ProfilStore.getAllExperts()
    };
  };

  followExpertsState() {
    return {
      loading: FollowingsStore.loading()
    }
  }

  onFollowingsChange = () => {
    this.setState(this.followExpertsState());
  };

  onProfilsChange = () => {
    this.setState(this.searchExpertState());
  };

  componentWillMount() {
    FollowingsStore.listen(this.onFollowingsChange);
    ProfilStore.listen(this.onProfilsChange);
  };

  componentWillUnmount() {
    FollowingsStore.unlisten(this.onFollowingsChange);
    ProfilStore.unlisten(this.onProfilsChange);
  };

  renderExpert = (expert) => {
    return (
      <TouchableHighlight
        underlayColor='rgba(0, 0, 0, 0)'
        onPress={() => {
          this.props.navigator.push(Profil.route({id: expert.id}));
        }}>
          <View style={styles.contactContainer}>
            <Image style={styles.profileImage} source={{uri: expert.picture}} />
            <View style={styles.friendInfos}>
              <Text style={styles.friendName}>{expert.fullname}</Text>
              <Text style={styles.friendFollowers}>{expert.number_of_followers} follower{expert.number_of_followers > 1 ? 's' : ''}</Text>
              <Text style={styles.tags}>
                {_.map(expert.tags, (tag, key) => {
                  return <Text key={'tag_' + key} style={{color: '#FE3139'}}>#{tag.replace(" ", "")} </Text>
                })}
              </Text>
            </View>
            {!this.state.loading ? [
              <TouchableHighlight key={'follow_expert_' + expert.id} style={styles.buttonWrapper} onPress={() => FollowingsActions.followExpert(expert.id)} underlayColor='rgba(0, 0, 0, 0)'>
                <Text style={styles.buttonText}>Suivre</Text>
              </TouchableHighlight>
            ] : [
              Platform.OS === 'ios' ? [
                <ActivityIndicatorIOS key={'loading_' + expert.id} animating={true} style={[{height: 40}]} size='small' />
              ] : [
                <ProgressBarAndroid key={'loading_' + expert.id} indeterminate /> 
              ]
            ]}
        </View>
      </TouchableHighlight>
    );
  };

  renderHeaderWrapperExperts = () => {
    if (!this.state.experts.length) {
      return(
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyText}>Tu n'as pas de nouvel influenceur à suivre pour l'instant !</Text>
        </View>
      );
    }
  };

  renderPage() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Ajouter un expert' leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ListView
          style={styles.expertsList}
          dataSource={ds.cloneWithRows(this.state.experts)}
          renderRow={this.renderExpert}
          contentInset={{top: 0}}
          onScroll={Platform.OS === 'ios' ? this.closeKeyboard : null}
          renderHeader={this.renderHeaderWrapperExperts}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} />
      </View>
    );
  };
}

var styles = StyleSheet.create({
  expertsList: {
    backgroundColor: '#FFFFFF'
  },
  emptyTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#EEEDF1',
    padding: 10
  },
  emptyText: {
    flex: 1,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 15,
    fontWeight: '500',
    color: '#FE3139'
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
  contactContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30
  },
  profileName: {
    fontSize: 14,
    color: '#555555',
    marginLeft: 10,
    marginRight: 10,
    flex: 1
  },
  friendInfos: {
    flex: 1,
    marginLeft: 20,
    paddingTop: 4
  },
  friendName: {
    color: '#3A325D',
    fontSize: 14,
    fontWeight: '500'
  },
  friendFollowers: {
    color: '#3A325D',
    marginTop: 2,
    fontSize: 14
  },
  tags: {
    marginTop: 2
  },
});

export default SearchExpert;
