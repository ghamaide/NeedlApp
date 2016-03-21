'use strict';

import React, {Component, Dimensions, Image, StyleSheet, ScrollView, TouchableHighlight, View} from 'react-native';

import ToggleGroup from './Reco/ToggleGroup';

import Text from '../ui/Text';
import NavigationBar from '../ui/NavigationBar';

import Overlay from '../elements/Overlay';

import RestaurantsActions from '../../actions/RestaurantsActions';

import MeStore from '../../stores/Me';
import ProfilStore from '../../stores/Profil';
import RestaurantsStore from '../../stores/Restaurants';

var windowWidth = Dimensions.get('window').width;

class Filtre extends Component {
  static route(props) {
    return {
      component: Filtre,
      title: 'Filtres',
      passProps: props
    };
  };

  constructor(props) {
    super(props);

    this.state = this.restaurantsState();

    this.state.showOverlayAmbiences = false;
    this.state.showOverlayOccasions = false;
    this.state.showOverlayTypes = false;
  }

  componentWillMount() {
    RestaurantsStore.listen(this.onRestaurantsChange);
  }

  componentWillUnmount() {
    RestaurantsStore.unlisten(this.onRestaurantsChange);
  }

  onRestaurantsChange = () => {
    this.setState(this.restaurantsState());
  };

  restaurantsState = () => {
    return  {
      me_friends_and_followings: _.union(ProfilStore.getFriends(), ProfilStore.getFollowings(), [ProfilStore.getMe()]),
      prices_available: RestaurantsStore.getPrices(),
      occasions_available: RestaurantsStore.getOccasions(),
      types_available: RestaurantsStore.getTypes(),
      friends_available: RestaurantsStore.getFriends(),
      prices_filter: RestaurantsStore.getState().filters.prices,
      occasions_filter: RestaurantsStore.getState().filters.occasions,
      types_filter: RestaurantsStore.getState().filters.types,
      friends_filter: RestaurantsStore.getState().filters.friends,
      prices_available_with_exception: RestaurantsStore.getAvailableFilters('price'),
      occasions_available_with_exception: RestaurantsStore.getAvailableFilters('occasion'),
      types_available_with_exception: RestaurantsStore.getAvailableFilters('type'),
      friends_available_with_exception: RestaurantsStore.getAvailableFilters('friend'),
    };
  };

  resetFilters = () => {
    RestaurantsActions.resetFilters();
    _.map(RestaurantsStore.MAP_PRICES, (price) => {
      this.refs.togglegroupprices.onUnselect(price.label);
    });
  };

  render() {
    var me_friends_and_followings_ids = _.map(this.state.me_friends_and_followings, (user) => {
      return user.id
    });

    var backgroundColor = '#FFFFFF';
    var backgroundColorOverlay = 'rgba(0, 0, 0, 0)';
    var color = '#FFFFFF';
    var colorInactive = '#555555';
    var colorOverlay = '#FFFFFF';
    var colorActive = '#FE3139';

    return (
      <View style={{flex: 1}}>
        <NavigationBar type='back' title='Filtres' rightButtonTitle='Réinitialiser' onRightButtonPress={this.resetFilters} leftButtonTitle='Retour' onLeftButtonPress={() => this.props.navigator.pop()} />
        <ScrollView key='filter_scrollview' style={styles.container}>

          <ToggleGroup
            ref='togglegroupprices'
            key='price_filter_togglegroup'
            maxSelection={4}
            fifo={true}
            selectedInitial={this.state.prices_filter}
            onSelect={(v, selected) => {
              this.setState({prices_filter: selected});
              RestaurantsActions.setFilter('prices', this.state.prices_filter);
            }}
            onUnselect={(v, selected) => {
              this.setState({prices_filter: selected});
              RestaurantsActions.setFilter('prices', this.state.prices_filter);
            }}>
            {(Toggle) => {
              return (
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.filtreTitle}>Prix</Text>
                  <View style={styles.pastilleWrapper}>
                    <View style={styles.pastilleContainer}>
                      {_.map(this.state.prices_available_with_exception, (id) => {
                        var price = RestaurantsStore.MAP_PRICES[id - 1];
                        return <Toggle key={price.label} size={40} width={70} fontSize={12} backgroundColor={backgroundColor} backgroundColorActive={backgroundColor} tintColor={'#C1BFCC'} tintColorActive={'#FE3139'} labelColor={'#C1BFCC'} labelColorActive={'#FE3139'} style={styles.pastille} icon={price.icon} value={price.label} />
                      })}
                    </View>
                  </View>
                </View>
              );
            }}
          </ToggleGroup>

          {!_.isEmpty(this.state.occasions_available_with_exception) || !_.isEmpty(this.state.occasions_filter) ? [
            <View key='occasions_filter' style={{flex: 1, alignItems: 'center'}}>
              <Text style={styles.filtreTitle}>Occasions</Text>
              {this.state.occasions_filter.length > 0 ? [
                <TouchableHighlight key='occasions_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayOccasions: true})}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.occasions_filter.slice(0, 3), (id) => {
                      var icon = RestaurantsStore.MAP_OCCASIONS[id - 1].icon;
                      return <Image key={id} style={[styles.pastilleOverlay, {tintColor: '#FE3139'}]} source={icon} />;
                    })}
                    {this.state.occasions_filter.length > 3 ? [
                      <Text key='occasions_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.occasions_filter.length - 3}</Text>
                    ] : null}
                  </View>
                </TouchableHighlight>
              ] : [
                <TouchableHighlight key='occasions_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayOccasions: true})}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.occasions_available_with_exception.slice(0, 3), (id) => {
                      var occasion = RestaurantsStore.MAP_OCCASIONS[id - 1];
                      return <Image key={id} style={[styles.pastilleOverlay, {tintColor: '#C1BFCC'}]} source={occasion.icon} />
                    })}
                    {this.state.occasions_available_with_exception.length > 3 ? [
                      <Text key='occasions_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.occasions_available_with_exception.length - 3}</Text>
                    ] : null}
                  </View>
                </TouchableHighlight>
              ]}
            </View>
          ] : null}

          {!_.isEmpty(this.state.types_available_with_exception) || !_.isEmpty(this.state.types_filter) ? [
            <View key='types_filter' style={{flex: 1, alignItems: 'center'}}>
              <Text style={styles.filtreTitle}>Types</Text>
              {this.state.types_filter.length > 0 ? [
                <TouchableHighlight key='types_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayTypes: true})}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.types_filter.slice(0, 3), (id) => {
                      var icon = RestaurantsStore.MAP_TYPES[id - 1].icon
                      return <Image key={id} style={[styles.pastilleOverlay, {tintColor: '#FE3139'}]} source={icon} />;
                    })}
                    {this.state.types_filter.length > 3 ? [
                      <Text key='types_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.types_filter.length - 3}</Text>
                    ] : null}
                  </View>
                </TouchableHighlight>
              ] : [
                <TouchableHighlight key='types_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayTypes: true})}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.types_available_with_exception.slice(0, 3), (id) => {
                      var type = RestaurantsStore.MAP_TYPES[id - 1];
                      return <Image key={id} style={[styles.pastilleOverlay, {tintColor: '#C1BFCC'}]} source={type.icon} />
                    })}
                    {this.state.types_available_with_exception.length > 3 ? [
                      <Text key='types_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.types_available_with_exception.length - 3}</Text>
                    ] : null}
                  </View>
                </TouchableHighlight>
              ]}
            </View>
          ] : null}

          {!_.isEmpty(this.state.friends_available_with_exception) || !_.isEmpty(this.state.friends_filter) ? [
            <View key='friends_filter' style={{flex: 1, alignItems: 'center'}}>
              <Text style={styles.filtreTitle}>Amis</Text>
              {this.state.friends_filter.length > 0 ? [
                <TouchableHighlight key='friends_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => {
                  this.setState({showOverlayFriends: true});
                  var new_friends_filter = _.intersection(this.state.friends_filter, this.state.friends_available);
                  this.setState({friends_filter: new_friends_filter});
                }}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.friends_filter.slice(0, 3), (id) => {
                      var friend = ProfilStore.getProfil(id);
                      return <Image key={id} style={styles.profilePicture} source={{uri: friend.picture}} />;
                    })}
                    {this.state.friends_filter.length > 3 ? [
                      <Text key='friends_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.friends_filter.length - 3}</Text>
                    ] : []}
                  </View>
                </TouchableHighlight>
              ] : [
                <TouchableHighlight key='friends_filter_button' underlayColor='rgba(0, 0, 0, 0)' style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayFriends: true})}>
                  <View style={styles.pastilleContainer}>
                    {_.map(this.state.friends_available_with_exception.slice(0, 3), (id) => {
                      var friend = ProfilStore.getProfil(id);
                      return <Image key={id} style={styles.profilePicture} source={{uri: friend.picture}} />
                    })}
                    {this.state.friends_available_with_exception.length > 3 ? [
                      <Text key='friends_remaining' style={{width: 40, color: '#FE3139', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.friends_available_with_exception.length - 3}</Text>
                    ] : null}
                  </View>
                </TouchableHighlight>
              ]}
            </View>
          ] : null}

          <TouchableHighlight onPress={() => this.props.navigator.pop()} underlayColor='rgba(0, 0, 0, 0)' style={styles.submitButton}>
            <Text style={styles.submitText}>Valider</Text>
          </TouchableHighlight>
        </ScrollView>

        {this.state.showOverlayOccasions ? [
          <Overlay key='occasions_overlay'>
            <ToggleGroup
              ref='togglegroupoccasions'
              maxSelection={9}
              fifo={true}
              selectedInitial={this.state.occasions_filter}
              onSelect={(v, selected) => {
                this.setState({occasions_filter: selected});
              }}
              onUnselect={(v, selected) => {
                this.setState({occasions_filter: selected});
              }}>
              {(Toggle) => {
                return (
                  <View style={{flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
                    <Text style={styles.filtreTitleOverlay}>Occasions</Text>
                    <View style={styles.pastilleWrapperOverlay}>
                      <View style={styles.pastilleContainerOverlay}>
                        {_.map(RestaurantsStore.MAP_OCCASIONS, (occasion) => {
                          var index = _.findIndex(RestaurantsStore.MAP_OCCASIONS, occasion) + 1;
                          var enabled = _.includes(this.state.occasions_available_with_exception, index);
                          return <Toggle key={occasion.label} disabled={!enabled} size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorOverlay} tintColor={enabled ? colorOverlay : colorInactive} tintColorActive={enabled ? colorActive : colorInactive} labelColor={enabled ? colorOverlay : colorInactive} labelColorActive={enabled ? colorActive : colorInactive} style={styles.pastille} icon={occasion.icon} activeInitial={false} label={occasion.label} value={index} />
                        })}
                      </View>
                      <TouchableHighlight 
                        underlayColor='rgba(0, 0, 0, 0.3)'
                        style={styles.submitButtonOverlay}
                        onPress={() => {
                          this.setState({showOverlayOccasions: false});
                          RestaurantsActions.setFilter('occasions', this.state.occasions_filter);
                        }}>
                        <Text style={styles.submitText}>Valider</Text>
                      </TouchableHighlight>
                    </View>
                  </View>
                );
              }}
            </ToggleGroup>
          </Overlay>
        ] : null}

        {this.state.showOverlayTypes ? [
          <Overlay key='types_overlay'>
            <ToggleGroup
              ref='togglegrouptypes'
              maxSelection={23}
              fifo={true}
              selectedInitial={this.state.types_filter}
              onSelect={(v, selected) => {
                this.setState({types_filter: selected});
              }}
              onUnselect={(v, selected) => {
                this.setState({types_filter: selected});
              }}>
              {(Toggle) => {
                return (
                  <View style={{flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
                    <Text style={[styles.filtreTitleOverlay, {marginTop: 20, marginBottom: 10}]}>Types</Text>
                    <ScrollView style={styles.pastilleWrapperOverlayScroll} automaticallyAdjustContentInsets={false} alignItems='center'>
                      <View style={styles.pastilleContainerOverlayScroll}>
                        {_.map(RestaurantsStore.MAP_TYPES, (type) => {
                          var index = _.findIndex(RestaurantsStore.MAP_TYPES, type) + 1;
                          var enabled = _.includes(this.state.types_available_with_exception, index);
                          return <Toggle key={type.label} disabled={!enabled} size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorOverlay} tintColor={enabled ? colorOverlay : colorInactive} tintColorActive={enabled ? colorActive : colorInactive} labelColor={enabled ? colorOverlay : colorInactive} labelColorActive={enabled ? colorActive : colorInactive} style={styles.pastille} icon={type.icon} activeInitial={false} label={type.label} value={index} />
                        })}
                      </View>
                    </ScrollView>
                    <TouchableHighlight
                      underlayColor='rgba(0, 0, 0, 0.3)'
                      style={[styles.submitButtonOverlay, {position: 'absolute', bottom: 11, width: 160, left: (windowWidth - 200) / 2}]}
                      onPress={() => {
                        this.setState({showOverlayTypes: false});
                        RestaurantsActions.setFilter('types', this.state.types_filter);
                      }}>
                      <Text style={styles.submitText}>Valider</Text>
                    </TouchableHighlight>
                  </View>
                );
              }}
            </ToggleGroup>
          </Overlay>
        ] : null}

        {this.state.showOverlayFriends ? [
          <Overlay key='friends_overlay'>
            <View style={{flex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
              <Text style={[styles.filtreTitleOverlay, {marginTop: 20, marginBottom: 10}]}>Amis</Text>
              <ScrollView style={styles.pastilleWrapperOverlayScroll} automaticallyAdjustContentInsets={false} alignItems='center'>
                <View style={styles.pastilleContainerOverlayScroll}>
                  {_.map(me_friends_and_followings_ids, (id) => {
                    var profile = ProfilStore.getProfil(id);
                    var active = _.includes(this.state.friends_filter, id);
                    var enabled = _.includes(this.state.friends_available_with_exception, id);
                    if (enabled) {
                      return (
                        <TouchableHighlight
                          key={id} 
                          underlayColor='rgba(0, 0, 0, 0)'
                          style={styles.profilePictureButton}
                          onPress={() => {
                            if (_.includes(this.state.friends_filter, id)) {
                              var new_friends_filter = _.filter(this.state.friends_filter, (friend_id) => {return friend_id !== id});
                              this.setState({friends_filter: new_friends_filter});
                            } else {
                              var new_friends_filter = this.state.friends_filter;
                              new_friends_filter.push(id);
                              this.setState({friends_filter: new_friends_filter});
                            }
                          }}>
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                              <Image style={styles.profilePictureOverlay} source={{uri: profile.picture}} />
                              {!active ? [
                                <View key={'active_' + id} style={styles.grayImage} />
                              ] : null}
                              <Text style={{color: active ? '#FE3139' : '#CCCCCC', textAlign: 'center'}}>{profile.name}</Text>
                            </View>
                        </TouchableHighlight>
                      );
                    } else {
                      return (
                        <View
                          key={id} 
                          style={styles.profilePictureButton}>
                            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                              <Image style={styles.profilePictureOverlay} source={{uri: profile.picture}} />
                              <View style={styles.blackImage} />
                              <Text style={{color: '#333333', textAlign: 'center'}}>{profile.name}</Text>
                            </View>
                        </View>
                      );
                    }
                  })}
                </View>
              </ScrollView>
              <TouchableHighlight
                underlayColor='rgba(0, 0, 0, 0.3)'
                style={[styles.submitButtonOverlay, {position: 'absolute', bottom: 11, width: 160, left: (windowWidth - 200) / 2}]}
                onPress={() => {
                  this.setState({showOverlayFriends: false});
                  RestaurantsActions.setFilter('friends', this.state.friends_filter);
                }}>
                <Text style={styles.submitText}>Valider</Text>
              </TouchableHighlight>
            </View>
          </Overlay>
        ] : null}

      </View>
    );
  };
}

var styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    backgroundColor: '#EEEEEE',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    margin: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    padding: 10,
    borderColor: '#FE3139'
  },
  resetButton : {
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    padding: 10,
    borderColor: '#C1BFCC',
    borderWidth: 1,
    width: 240,
    marginLeft: (windowWidth - 240) / 2,
    marginBottom: 5
  },
  resetText: {
    flex: 1,
    fontSize: 15,
    color: '#C1BFCC',
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton : {
    backgroundColor: '#FE3139',
    borderRadius: 3,
    padding: 10,
    borderColor: '#FE3139',
    width: 160,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: (windowWidth - 160) / 2,
   },
  submitButtonOverlay: {
    backgroundColor: 'rgba(239, 88, 45, 0.7)',
    borderRadius: 3,
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 15,
    paddingBottom: 15,
    margin: 20
  },
  submitText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  clearText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  pastilleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  pastilleWrapperOverlay: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 2,
    backgroundColor: 'transparent',
  },
  pastilleWrapperOverlayScroll: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    marginBottom: 70,
    backgroundColor: 'transparent',
  },
  pastilleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: 3,
    paddingBottom: 5,
    paddingTop: 5,
    justifyContent: 'center',
    width: windowWidth - 40
  },
  pastilleContainerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 20,
    flexWrap: 'wrap',
    width: windowWidth
  },
  pastilleContainerOverlayScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 20,
    flexWrap: 'wrap',
    width: windowWidth
  },
  pastille: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    marginBottom: 5
  },
  pastilleOverlay: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 5,
    marginBottom: 5,
    width: 25,
    height: 25,
    margin: 10
  },
  filtreTitle: {
    margin: 2,
    color: '#444444',
    fontSize: 15,
    fontWeight: '600',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filtreTitleOverlay: {
    marginTop: 60,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profilePicture: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 5,
    marginBottom: 5,
    width: 30,
    height: 30,
    borderRadius: 15
  },
  profilePictureOverlay: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 5,
    marginBottom: 5,
    width: 40,
    height: 40,
    borderRadius: 20
  },
  grayImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 5,
    left: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  blackImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 5,
    left: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  }
});

export default Filtre;