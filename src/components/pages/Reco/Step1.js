'use strict';

import React, {View, Component, Text, StyleSheet, TextInput, ListView, ActivityIndicatorIOS, TouchableHighlight} from 'react-native';
import _ from 'lodash';

import RecoActions from '../../../actions/RecoActions';
import RecoStore from '../../../stores/Reco';
import MeStore from '../../../stores/Me';
import Step2 from './Step2';
import Step3 from './Step3';

let restaurantsSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});

class RecoStep1 extends Component {
  static route() {
    return {
      component: RecoStep1,
      title: 'Sélection'
    };
  }

  static getRecoState() {
    var state = RecoStore.getState();
    state.nb = state.restaurants && state.restaurants.length;
    state.restaurants = restaurantsSource.cloneWithRows(state.restaurants || []);
    return state;
  }

  state = RecoStep1.getRecoState()

  componentWillMount() {
    RecoStore.listen(this.onRecoChange);
    RecoActions.reset();
  }

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoChange);
  }

  onRecoChange = () => {
    this.setState(RecoStep1.getRecoState());
  }

  renderRestaurant = (restaurant) => {
    return (
      <TouchableHighlight style={styles.restaurantRow} onPress={() => {
        RecoActions.setReco({restaurant: restaurant});
        if (MeStore.getState().me.HAS_SHARED) {
          this.props.navigator.push(Step2.route());
        } else {
          var reco = RecoStore.getReco();
          reco.approved = true;
          reco.step2 = true;
          this.props.navigator.push(Step3.route());
        }
      }}>
        <View style={styles.restaurantRowInner}>
          <Text style={{color: 'white'}}>{restaurant.name_and_address.split(': ')[0]}</Text>
          <Text style={{color: 'white'}}>{restaurant.name_and_address.split(': ')[1]}</Text>
        </View>
      </TouchableHighlight> 
    );
  }

  renderRestaurants() {
    return <ListView
      style={styles.restaurantsList}
      dataSource={this.state.restaurants}
      renderRow={this.renderRestaurant}
      contentInset={{top: 0}}
      automaticallyAdjustContentInsets={false}
      showsVerticalScrollIndicator={false} />;
  }

  renderBlankScreen(content) {
    return (
      <View style={styles.viewContainer}>
        {content}
      </View>
    );
  }

  render() {
    var content;

    if (!this.state.query) {
      content = this.renderBlankScreen();
    } else if(this.state.status.restaurantsLoading) {
      content = this.renderBlankScreen(<ActivityIndicatorIOS
        animating={true}
        style={[{height: 80}]}
        size="large" />
        );
    } else if(this.state.status.restaurantsLoadingError) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Votre requête a eu un problème d''exécution, veuillez réessayer</Text>);
    } else if (!this.state.nb) {
      content = this.renderBlankScreen(<Text style={styles.noResultText}>Pas de résultat</Text>);
    } else {
      content = this.renderRestaurants();
    }

    return (
     <View style={styles.container}>
      {!MeStore.getState().me.HAS_SHARED ?
        <View style={styles.firstMessage}>
          <Text style={styles.firstMessageText}>Partage ta première reco avant de découvrir celles de tes amis !</Text>
        </View>
      : null}
      <TextInput
        style={styles.restaurantQueryInput}
        autoCorrent={false}
        onChangeText={this.onRestaurantQuery}
        value={this.state.query}
        placeholder="Sélectionne le bon restaurant"/>

        {content}

     </View>
    );
  }

  onRestaurantQuery = (query) => {
    RecoActions.fetchRestaurants(query);
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  firstMessage: {
    backgroundColor: '#38E1B2',
    padding: 10
  },
  firstMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  restaurantQueryInput: {
    height: 30,
    backgroundColor: '#DDD',
    borderRadius: 15,
    paddingLeft: 15,
    paddingRight: 15,
    margin: 10
  },
  restaurantsList: {
    flex: 1,
    backgroundColor: 'black'
  },
  restaurantRowInner: {
    justifyContent: 'center',
    backgroundColor: 'black',
    padding: 10,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: '#EF582D'
  },
  viewContainer: {
    backgroundColor: 'black',
    flex: 1,
    alignItems: 'center',
    padding: 10
  },
  noResultText: {
    fontWeight: 'bold',
    color: 'white'
  }
});

export default RecoStep1;
