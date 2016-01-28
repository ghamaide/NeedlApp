'use strict';

import React, {StyleSheet, Component, View, ActivityIndicatorIOS, Dimensions} from 'react-native';

import _ from 'lodash';

import request from '../../../utils/api';

import Button from '../../elements/Button';

import Text from '../../ui/Text';
import NavigationBar from '../../ui/NavigationBar';

import ToggleGroup from './ToggleGroup';

import RecoStore from '../../../stores/Reco';

import RecoActions from '../../../actions/RecoActions';

import Step4 from './Step4';

var windowWidth = Dimensions.get('window').width;

class RecoStep3 extends Component {
  static route(props) {
    return {
      component: RecoStep3,
      title: 'Ambiances',
      passProps: props,
    };
  };

  state = {};

  onRecoUpdate = () => {
    this.setState({
      loading: RecoStore.getRecoLoading(),
      err: RecoStore.getRecoErr()
    });
  };

  componentDidMount() {
    if (this.props.editing) {
      RecoStore.listen(this.onRecoUpdate);
      RecoActions.getReco(this.props.restaurant_id, this.props.restaurant_name);
    }
  };

  componentWillUnmount() {
    RecoStore.unlisten(this.onRecoUpdate);
  };

  onRightButtonPress= () => {
    var reco = RecoStore.getReco();

    if (!reco.ambiances || !reco.ambiances.length) {
      return;
    }

    this.props.navigator.push(Step4.route());
  };

  render() {
    if (this.state.err || this.state.loading) {
      var content;

      if (this.state.loading) {
        content = <ActivityIndicatorIOS
          animating={true}
          style={[{height: 80}]}
          size="large" />;
      }

      if (this.state.err) {
        content = <View style={styles.errorBlock}>
          <Text style={{color: 'white'}}>Une erreur est survenue</Text>
          <Button style={styles.errorButton}
            label="Réessayer"
            onPress={() => {
              RecoActions.getReco(this.props.restaurant_id, this.props.restaurant_name);
            }} />
        </View>;
      }

      return (
        <View style={styles.container}>
          {content}
        </View>
      );
    }

    var reco = RecoStore.getReco();
    return (
      <View style={styles.container}>
        <NavigationBar title="Ambiances" rightButtonTitle="Valider" onRightButtonPress={this.onRightButtonPress} />
        <Text style={styles.title}>Sélectionne une ou plusieurs ambiances</Text>
        <ToggleGroup
          ref="togglegroup"
          maxSelection={5}
          fifo={true}
          selectedInitial={reco.ambiances}
          onSelect={(v, selected) => {
            reco.ambiances = selected;
          }}
          onUnselect={(v, selected) => {
            reco.ambiances = selected;
          }}>
          {(Toggle) => {
            return <View style={{alignItems: 'center'}}>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/chic.png')} activeInitial={false} label="Chic" value={1} />
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/festif.png')} activeInitial={false} label="Festif" value={2} />
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/convivial.png')} activeInitial={false} label="Convivial" value={3} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/romantique.png')} activeInitial={false} label="Romantique" value={4} />
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/branche.png')} activeInitial={false} label="Branché" value={5} />
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/typique.png')} activeInitial={false} label="Typique" value={6} />
              </View>
              <View style={styles.pastilleContainer}>
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/cosy.png')} activeInitial={false} label="Cosy" value={7} />
                <Toggle size={60} width={105} style={styles.pastille} icon={require('../../../assets/img/ambiances/icons/autre.png')} activeInitial={false} label="Inclassable" value={8} />
              </View>
            </View>;
          }}
        </ToggleGroup>
        <View style={styles.progressBar}>
          <View style={styles.progressBarCompleted} />
        </View>
      </View>
    );
  };
}

var styles = StyleSheet.create({
 container: {
  backgroundColor: 'transparent',
  padding: 10,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
 },
 title: {
  marginBottom: 30,
  color: '#000000',
  fontSize: 13,
  textAlign: 'center'
 },
 pastilleContainer: {
  flexDirection: 'row',
  alignItems: 'flex-start',
 },
 pastille: {
  marginLeft: 15,
  marginRight: 15,
  marginTop: 10,
  marginBottom: 10
 },
 progressBar: {
  top: 0,
  left: 0,
  right: 0,
  height: 10,
  position: 'absolute',
  backgroundColor: '#DDDDDD',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row'
 },
 progressBarCompleted: {
  backgroundColor: '#38E1B2',
  position: 'absolute',
  top: 0,
  left: 0,
  width: windowWidth / 4,
  height: 10
 }
});

export default RecoStep3;
