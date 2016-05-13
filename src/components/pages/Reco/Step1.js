'use strict';

import React, {ActivityIndicatorIOS, Component, Dimensions, Image, ListView, NativeModules, Platform, ProgressBarAndroid, ScrollView, StyleSheet, TouchableHighlight, View} from 'react-native';

import _ from 'lodash';
import SearchBar from 'react-native-search-bar';

import ToggleGroup from './ToggleGroup';

import NavigationBar from '../../ui/NavigationBar';
import Text from '../../ui/Text';
import TextInput from '../../ui/TextInput';

import Onboard from '../../elements/Onboard';

import MeActions from '../../../actions/MeActions';
import RecoActions from '../../../actions/RecoActions';

import MeStore from '../../../stores/Me';
import NotifsStore from '../../../stores/Notifs';
import RecoStore from '../../../stores/Reco';

import Restaurant from '../Restaurant';
import Step4 from './Step4';
import StepSave from './StepSave';

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var triangleWidth = 25;

class RecoStep1 extends Component {
  static route(props) {
    return {
      component: RecoStep1,
      title: 'Sélection',
      passProps: props
    };
  };

  getRecoState = () => {
    return {
      restaurants: RecoStore.getQueryRestaurants(),
      loading: RecoStore.loading(),
      error: RecoStore.error()
    };
  };

  constructor(props) {
    super(props);

    this.state = this.getRecoState();

    this.state.chosenRestaurant = {};
    this.state.onboarding_overlay = !MeStore.getState().me.recommendation_onboarding;
  }

  componentWillMount() {
    RecoStore.listen(this.onRecoChange);
    RecoActions.setReco({});
  };

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoChange);
  };

  onRecoChange = () => {
    this.setState(this.getRecoState());
  };

  closeKeyboard = () => {
    if (Platform.OS === 'ios' && _.isEmpty(this.state.chosenRestaurant)) {
      NativeModules.RNSearchBarManager.blur(React.findNodeHandle(this.refs['searchBar']));
    }
  };

  closeOnboarding = () => {
    if (this.state.onboarding_overlay) {
      this.setState({onboarding_overlay: false});
      MeActions.updateOnboardingStatus('recommendation');
    }
  }

  onScroll = () => {
    this.closeKeyboard();
    this.closeOnboarding();
  }

  onFocus = () => {
    this.closeOnboarding();
  }

  goToNextStep = () => {
    var reco = RecoStore.getReco();

    if (!_.isEmpty(this.state.chosenRestaurant)) {
      var activity = NotifsStore.getRecommendation(reco.restaurant.id, MeStore.getState().me.id);

      if (typeof activity == 'undefined') {
        if (reco.type === 'recommendation') {
          return this.props.navigator.push(Step4.route());
        } else {
          return this.props.navigator.push(StepSave.route());
        }
      } else {
        if (reco.type === 'recommendation') {
          if (activity.notification_type == 'recommendation') {
            return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_recommended'}, reco.restaurant.name));
          } else {
            return this.props.navigator.push(Step4.route());
          }
        } else {
          if (activity.notification_type == 'wish') {
            return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_wishlisted'}, reco.restaurant.name));
          } else if (activity.notification_type == 'recommendation') {
            return this.props.navigator.resetTo(Restaurant.route({id: reco.restaurant.id, fromReco: true, note: 'already_recommended'}, reco.restaurant.name));
          }
        }
      }
    } else {
      // treat error cases here
    }
  }

  renderRestaurant = (restaurant) => {
    var reco = RecoStore.getReco();

    return (
      <TouchableHighlight style={styles.restaurantRow} onPress={() => {
        // check if already reco or wish
        RecoActions.setReco(_.extend(reco, {restaurant: restaurant}));
        this.closeKeyboard();
        this.setState({chosenRestaurant: restaurant});
        this.setState({query: ''});

        if (reco.type == 'recommendation' || reco.type == 'wish') {
          this.goToNextStep();
        }
      }}>
        <View style={styles.restaurantRowInner}>
          <Text style={{color: '#3A325D', fontSize: 13}}>{restaurant.name_and_address.split(': ')[0]}</Text>
          <Text style={{color: '#3A325D', fontSize: 11, marginTop: 2}}>{restaurant.name_and_address.split(': ')[1]}</Text>
        </View>
      </TouchableHighlight> 
    );
  };

  render() {
    var reco = RecoStore.getReco();

    return (
      <View style={styles.container}>
        <ScrollView onScroll={this.onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps={true} justifyContent={!this.state.query ? 'center' : 'flex-start'}>
          <View style={{marginBottom: !this.state.query ? 80 : 0}}>
            {_.isEmpty(this.state.chosenRestaurant) ? [
              Platform.OS == 'ios' ? [
                <SearchBar
                  key='search'
                  ref='searchBar'
                  placeholder='Sélectionne ton restaurant'
                  hideBackground={true}
                  textFieldBackgroundColor='#EEEDF1'
                  tintColor='#3A325D'
                  onFocus={this.onFocus}
                  onSearchButtonPress={this.closeKeyboard}
                  onChangeText={this.onRestaurantQuery} />
              ] : [
                <TextInput
                  key='search'
                  ref='searchBar'
                  returnKeyType='done'
                  onFocus={this.onFocus}
                  placeholderTextColor='#3A325D'
                  placeholder='Sélectionne ton restaurant'
                  style={{backgroundColor: '#EEEDF1', margin: 10, padding: 5, color: '#3A325D'}}
                  onChangeText={this.onRestaurantQuery} />
              ]
            ] : null}
            {!_.isEmpty(this.state.chosenRestaurant) ? [
              <View key='chosen_restaurant' style={{margin: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#837D9B', padding: 10}}>
                <Text style={{flex: 1, textAlign: 'left', color: '#FFFFFF'}}>{this.state.chosenRestaurant.name}</Text>
                <TouchableHighlight
                  underlayColor='rgba(0, 0, 0, 0)'
                  style={{padding: 10}}
                  onPress={() => {
                    this.setState({chosenRestaurant: {}});
                  }}>
                  <Image source={require('../../../assets/img/icons/close.png')} style={{tintColor: '#FFFFFF', width: 10, height: 10}} />
                </TouchableHighlight>
              </View>
            ] : null}
          </View>

          {/* If the input is open, do not display the buttons */}
          {!this.state.query ? [
            <ToggleGroup
              key='buttons'
              maxSelection={1}
              fifo={true}
              onSelect={(value) => {
                reco.type = value;
                this.closeOnboarding();
                this.goToNextStep();
              }}
              onUnselect={() => {
                delete reco.type;
              }}>
              {(Toggle) => {
                return (
                  <View style={styles.pastilleContainer}>
                    <Toggle
                      size={60}
                      width={140}
                      style={styles.pastille}
                      icon={require('../../../assets/img/actions/icons/japprouve.png')}
                      activeInitial={false}
                      label='Je recommande'
                      value={'recommendation'} />
                    <Toggle
                      size={60}
                      width={140}
                      style={styles.pastille}
                      icon={require('../../../assets/img/actions/icons/aessayer.png')}
                      activeInitial={false}
                      label='Sur ma wishlist'
                      value={'wish'} />
                  </View>
                );
              }}
            </ToggleGroup>
          ] : [
            this.state.loading ? [
              Platform.OS == 'ios' ? [
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
                  <ActivityIndicatorIOS animating={true} color='#FE3139' style={[{height: 80}]} size='large' />
                </View>
              ] : [
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
                  <ProgressBarAndroid indeterminate />
                </View>
              ]
            ] : [
              this.state.error ? [
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
                  <Text style={styles.noResultText}>Votre requête a eu un problème d'exécution, veuillez réessayer</Text>
                </View>
              ] : [
                this.state.restaurants.length < 1 ? [
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
                    <Text style={styles.noResultText}>Pas de résultat</Text>
                  </View>
                ] : [
                  <ListView
                    style={styles.restaurantsList}
                    dataSource={ds.cloneWithRows(this.state.restaurants || [])}
                    renderRow={this.renderRestaurant}
                    contentInset={{top: 0}}
                    onScroll={this.closeKeyboard}
                    automaticallyAdjustContentInsets={false}
                    showsVerticalScrollIndicator={false} />
                ]
              ]
            ]
          ]}
        </ScrollView>

        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_recommendation' style={{top: windowHeight/ 2 + 130}} triangleTop={-25} triangleRight={windowWidth / 2 - triangleWidth + 75}>
            <Text style={styles.onboardingText}>Renseigne tes <Text style={{color: '#FE3139'}}>coups de coeur</Text> et gagne en statut.</Text>
          </Onboard>
        ] : null}

        {this.state.onboarding_overlay ? [
          <Onboard key='onboarding_wish' style={{top: windowHeight/ 2 - 70}} triangleBottom={-25} triangleRight={windowWidth / 2 - triangleWidth - 65} rotation='180deg'>
            <Text style={styles.onboardingText}><Text style={{color: '#FE3139'}}>Garde en mémoire</Text> pour plus tard.</Text>
          </Onboard>
        ] : null}
      </View>
    );
  };

  onRestaurantQuery = (query) => {
    RecoActions.fetchRestaurants(query);
    this.setState({query: query});
  };
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    paddingTop: 30,
    justifyContent: 'center',
  },
  restaurantsList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  restaurantRowInner: {
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#C1BFCC'
  },
  viewContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    padding: 10
  },
  noResultText: {
    fontWeight: 'bold',
    color: '#3A325D',
    textAlign: 'center'
  },
  title: {
    margin: 20,
    fontSize: 15,
    color: '#837D9B',
    textAlign: 'center'
  },
  pastilleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pastille: {
    margin: 10
  },
  onboardingText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#EEEDF1',
    margin: 10
  }
});

export default RecoStep1;
