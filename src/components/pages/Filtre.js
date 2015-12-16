'use strict';

import React, {StyleSheet, Text, View, ListView, Component, TouchableHighlight, ScrollView, Dimensions, Image, ActivityIndicatorIOS} from 'react-native';
import _ from 'lodash';
import Overlay from 'react-native-overlay';

import RestaurantsStore from '../../stores/Restaurants';
import RestaurantsActions from '../../actions/RestaurantsActions';
import MeActions from '../../actions/MeActions';

import Prix from './Filtre/Prix';
import Type from './Filtre/Type';
import Friends from './Filtre/Friends';
import Metro from './Filtre/Metro';
import Ambiance from './Filtre/Ambiance';
import Occasion from './Filtre/Occasion';

import ToggleGroup from './Reco/ToggleGroup';

let filtersSource = new ListView.DataSource({rowHasChanged: (r1, r2) => !_.isEqual(r1, r2)});
var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

class Filtre extends Component {
  static route() {
    return {
      component: Filtre,
      title: 'Filtrer',
      leftButtonTitle: 'Annuler',
      onLeftButtonPress() {
        MeActions.displayTabBar(true);
        this.pop();
      },/*
      rightButtonTitle: 'Réinitialiser',
      onRightButtonPress() {
        this.refs.togglegroupprice.onUnselect(this.state.prices);
        this.refs.togglegroupambiences.onUnselect(this.state.ambiences);
        this.refs.togglegroupoccasions.onUnselect(this.state.occasions);
        this.refs.togglegrouptypes.onUnselect(this.state.types);
      }*/
    };
  }

  constructor(props) {
    super(props);

    this.state = this.filtersState();
    this.arrivalState = this.filtersState();
  }

  filtersState() {
    return {
      showOverlayAmbiences: false,
      showOverlayOccasions: false,
      showOverlayTypes: false,
      prices: RestaurantsStore.getState().filters.prices,
      ambiences: RestaurantsStore.getState().filters.ambiences,
      occasions: RestaurantsStore.getState().filters.occasions,
      types: RestaurantsStore.getState().filters.types
    };
  }

  componentWillMount() {
    MeActions.displayTabBar(false);
    this.setState(this.filtersState());
  }

  componentWillUnmount() {
  }

  setFilters = () => {
    RestaurantsActions.setFilter('prices', this.state.prices);
    RestaurantsActions.setFilter('ambiences', this.state.ambiences);
    RestaurantsActions.setFilter('occasions', this.state.occasions);
    RestaurantsActions.setFilter('types', this.state.types);
  }

  clearFilters = () => {
    this.refs.togglegroupprice.onUnselect(this.state.price);
    this.refs.togglegroupambiences.onUnselect(this.state.ambience);
    this.refs.togglegroupoccasions.onUnselect(this.state.occasion);
  }

  render() {
    var backgroundColor = '#FFFFFF';
    var backgroundColorOverlay = 'rgba(0, 0, 0, 0)';
    var backgroundColorActive = '#FFFFFF';
    var backgroundColorActiveOverlay = 'rgba(0, 0, 0 ,0)';
    var labelColor = '#888888';
    var labelColorOverlay = '#FFFFFF';
    var labelColorActive = '#EF582D';
    var tintColor = '#888888';
    var tintColorOverlay = '#FFFFFF';
    var tintColorActive = '#EF582D';

    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEEEEE', position: 'relative'}}>
        <Overlay isVisible={this.state.showOverlayAmbiences}>
          <ToggleGroup
            ref="togglegroupambiences"
            maxSelection={4}
            fifo={true}
            selectedInitial={this.state.ambiences}
            onSelect={(v, selected) => {
              this.setState({ambiences: selected});
            }}
            onUnselect={(v, selected) => {
              this.setState({ambiences: selected});
            }}>
            {(Toggle) => {
              return (
                <View style={{flex: 1, position: 'absolute', top: 0, bottom: -70, left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
                  <Text style={styles.filtreTitleOverlay}>Ambiances</Text>
                  <View style={styles.pastilleWrapperOverlay}>
                    <View style={styles.pastilleContainerOverlay}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/chic.png')} label="Chic" value={1} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/typique.png')} label="Convivial" value={3} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/festif.png')} label="Festif" value={2} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/romantique.png')} label="Romantique" value={4} />
                    </View>
                    <TouchableHighlight 
                      underlayColor='rgba(0, 0, 0, 0.3)'
                      style={styles.submitButtonOverlay} 
                      onPress={() => this.setState({showOverlayAmbiences: false})}>
                      <Text style={styles.submitText}>Valider</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              );
            }}
          </ToggleGroup>
        </Overlay>

        <Overlay isVisible={this.state.showOverlayOccasions}>
          <ToggleGroup
            ref="togglegroupoccasions"
            maxSelection={7}
            fifo={true}
            selectedInitial={this.state.occasions}
            onSelect={(v, selected) => {
              this.setState({occasions: selected});
            }}
            onUnselect={(v, selected) => {
              this.setState({occasions: selected});
            }}>
            {(Toggle) => {
              return (
                <View style={{flex: 1, position: 'absolute', top: 0, bottom: -70, left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
                  <Text style={styles.filtreTitleOverlay}>Occasions</Text>
                  <View style={styles.pastilleWrapperOverlay}>
                    <View style={styles.pastilleContainerOverlay}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/dej_business.png')} activeInitial={false} label="Business" value={1} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/en_couple.png')} activeInitial={false} label="Couple" value={2} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/en_famille.png')} activeInitial={false} label="Famille" value={3} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/entre_amis.png')} activeInitial={false} label="Amis" value={4} />
                    </View>
                    <View style={styles.pastilleContainerOverlay}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/grandes_tablees.png')} activeInitial={false} label="Groupe" value={5} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/occasions/icons/brunch.png')} activeInitial={false} label="Brunch" value={6} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/terrasse.png')} activeInitial={false} label="Terrasse" value={7} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/ambiances/icons/fast.png')} activeInitial={false} label="Rapide" value={8} />
                    </View>
                    <TouchableHighlight 
                      underlayColor='rgba(0, 0, 0, 0.3)'
                      style={styles.submitButtonOverlay}
                      onPress={() => this.setState({showOverlayOccasions: false})}>
                      <Text style={styles.submitText}>Valider</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              );
            }}
          </ToggleGroup>
        </Overlay>

        <Overlay isVisible={this.state.showOverlayTypes}>
          <ToggleGroup
            ref="togglegrouptypes"
            maxSelection={7}
            fifo={true}
            selectedInitial={this.state.types}
            onSelect={(v, selected) => {
              this.setState({types: selected});
            }}
            onUnselect={(v, selected) => {
              this.setState({types: selected});
            }}>
            {(Toggle) => {
              return (
                <View style={{flex: 1, position: 'absolute', top: 0, bottom: -70, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
                  <Text style={[styles.filtreTitleOverlay, {marginTop: 20, marginBottom: 10}]}>Types</Text>
                  <ScrollView style={styles.pastilleWrapperOverlayScroll} automaticallyAdjustContentInsets={false} alignItems='center'>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/korean.png')} activeInitial={false} label="Coréen" value={1} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/thai.png')} activeInitial={false} label="Thai" value={2} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/chinese.png')} activeInitial={false} label="Chinois" value={3} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/indian.png')} activeInitial={false} label="Indien" value={4} />
                    </View>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/japanese.png')} activeInitial={false} label="Japonais" value={5} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/sushi.png')} activeInitial={false} label="Sushi" value={6} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/others_asia.png')} activeInitial={false} label="Autres Asie" value={7} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/french.png')} activeInitial={false} label="Français" value={8} />
                    </View>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/italian.png')} activeInitial={false} label="Italien" value={9} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/pizza.png')} activeInitial={false} label="Pizza" value={10} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/burger.png')} activeInitial={false} label="Burger" value={11} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/street_food.png')} activeInitial={false} label="Street Food" value={12} />
                    </View>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/others_europe.png')} activeInitial={false} label="Autres Europe" value={13} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/grill.png')} activeInitial={false} label="Viandes" value={14} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/oriental.png')} activeInitial={false} label="Oriental" value={15} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/mexican.png')} activeInitial={false} label="Mexicain" value={16} />
                    </View>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/latino.png')} activeInitial={false} label="Autres Latino" value={17} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/seafood.png')} activeInitial={false} label="Fruits de mer" value={18} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/african.png')} activeInitial={false} label="Africain" value={19} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/creole.png')} activeInitial={false} label="Créole" value={20} />
                    </View>
                    <View style={styles.pastilleContainerOverlayScroll}>
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/crepes.png')} activeInitial={false} label="Crêpes" value={21} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/tapas.png')} activeInitial={false} label="Tapas" value={22} />
                      <Toggle size={40} width={82} fontSize={12} marginTop={0} backgroundColor={backgroundColorOverlay} backgroundColorActive={backgroundColorActiveOverlay} tintColor={tintColorOverlay} tintColorActive={tintColorActive} labelColor={labelColorOverlay} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/types/icons/vegetarian.png')} activeInitial={false} label="Végétarien" value={23} />
                    </View>
                  </ScrollView>
                  <TouchableHighlight
                    underlayColor='rgba(0, 0, 0, 0.3)'
                    style={[styles.submitButtonOverlay, {position: 'absolute', bottom: 11, width: 160, left: (windowWidth - 200) / 2}]}
                    onPress={() => this.setState({showOverlayTypes: false})}>
                    <Text style={styles.submitText}>Valider</Text>
                  </TouchableHighlight>
                </View>
              );
            }}
          </ToggleGroup>
        </Overlay>

        <ScrollView style={styles.container}>
          <ToggleGroup
            ref="togglegroupprice"
            maxSelection={4}
            fifo={true}
            selectedInitial={RestaurantsStore.getState().filters.prices}
            onSelect={(v, selected) => {
              this.setState({prices: selected});
            }}
            onUnselect={(v, selected) => {
              this.setState({prices: selected});
            }}>
            {(Toggle) => {
              return (
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.filtreTitle}>Prix</Text>
                  <View style={styles.pastilleWrapper}>
                    <View style={styles.pastilleContainer}>
                      <Toggle size={40} width={70} fontSize={12} backgroundColor={backgroundColor} backgroundColorActive={backgroundColorActive} tintColor={tintColor} tintColorActive={tintColorActive} labelColor={labelColor} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/prices/icons/prix_1.png')} value={1} />
                      <Toggle size={40} width={70} fontSize={12} backgroundColor={backgroundColor} backgroundColorActive={backgroundColorActive} tintColor={tintColor} tintColorActive={tintColorActive} labelColor={labelColor} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/prices/icons/prix_2.png')} value={2} />
                      <Toggle size={40} width={70} fontSize={12} backgroundColor={backgroundColor} backgroundColorActive={backgroundColorActive} tintColor={tintColor} tintColorActive={tintColorActive} labelColor={labelColor} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/prices/icons/prix_3.png')} value={3} />
                      <Toggle size={40} width={70} fontSize={12} backgroundColor={backgroundColor} backgroundColorActive={backgroundColorActive} tintColor={tintColor} tintColorActive={tintColorActive} labelColor={labelColor} labelColorActive={labelColorActive} style={styles.pastille} icon={require('../../assets/img/prices/icons/prix_4.png')} value={4} />
                    </View>
                  </View>
                </View>
              );
            }}
          </ToggleGroup>

          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.filtreTitle}>Ambiances</Text>
            {this.state.ambiences.length > 0 ? [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayAmbiences: true})}>
                <View style={styles.pastilleContainer}>
                  {_.map(this.state.ambiences.slice(0, 3), (id) => {
                    var icon = RestaurantsStore.MAP_AMBIENCES[id - 1].icon;
                    return <Image style={styles.pastilleOverlay} source={icon} />;
                  })}
                  {this.state.ambiences.length > 3 ? [
                    <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.ambiences.length - 3}</Text>
                  ] : []}
                </View>
              </TouchableHighlight>
            ] : [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayAmbiences: true})}>
                <View style={styles.pastilleContainer}>
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/ambiances/icons/chic.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/ambiances/icons/typique.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/ambiances/icons/festif.png')} />
                  <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{RestaurantsStore.MAP_AMBIENCES.length - 2}</Text>
                </View>
              </TouchableHighlight>
            ]}
          </View>

          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.filtreTitle}>Occasions</Text>
            {this.state.occasions.length > 0 ? [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayOccasions: true})}>
                <View style={styles.pastilleContainer}>
                  {_.map(this.state.occasions.slice(0, 3), (id) => {
                    var icon = RestaurantsStore.MAP_OCCASIONS[id - 1].icon;
                    return <Image style={styles.pastilleOverlay} source={icon} />;
                  })}
                  {this.state.occasions.length > 3 ? [
                    <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.occasions.length - 3}</Text>
                  ] : []}
                </View>
              </TouchableHighlight>
            ] : [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayOccasions: true})}>
                <View style={styles.pastilleContainer}>
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/occasions/icons/dej_business.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/occasions/icons/en_couple.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/occasions/icons/en_famille.png')} />
                  <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{RestaurantsStore.MAP_OCCASIONS.length - 3}</Text>
                </View>
              </TouchableHighlight>
            ]}
          </View>

          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={styles.filtreTitle}>Types</Text>
            {this.state.types.length > 0 ? [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayTypes: true})}>
                <View style={styles.pastilleContainer}>
                  {_.map(this.state.types.slice(0, 3), (id) => {
                    var icon = RestaurantsStore.MAP_TYPES[id - 1].icon
                    return <Image style={styles.pastilleOverlay} source={icon} />;
                  })}
                  {this.state.types.length > 3 ? [
                    <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{this.state.types.length - 3}</Text>
                  ] : []}
                </View>
              </TouchableHighlight>
            ] : [
              <TouchableHighlight style={styles.pastilleWrapper} onPress={() => this.setState({showOverlayTypes: true})}>
                <View style={styles.pastilleContainer}>
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/types/icons/burger.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/types/icons/chinese.png')} />
                  <Image style={styles.pastilleOverlay} source={require('../../assets/img/types/icons/african.png')} />
                  <Text style={{width: 40, color: '#EF582D', margin: 10, fontSize: 15, fontWeight: '700'}}>+{RestaurantsStore.MAP_TYPES.length - 3}</Text>
                </View>
              </TouchableHighlight>
            ]}
          </View>
        </ScrollView>

        <TouchableHighlight 
          underlayColor='rgba(0, 0, 0, 0.3)'
          style={styles.submitButton}
          onPress={() => {
            this.setFilters();
            this.props.navigator.pop();
            MeActions.displayTabBar(true);
          }}>
          <Text style={styles.submitText}>Valider</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    backgroundColor: '#EEEEEE'
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    margin: 5,
    borderRadius: 5,
    borderWidth: 0.5,
    padding: 10,
    borderColor: '#EF582D'
  },
  submitButton : {
    backgroundColor: '#EF582D',
    borderRadius: 3,
    padding: 15,
    borderColor: '#EF582D',
    position :'absolute',
    width: 160,
    left: (windowWidth - 160) / 2,
    bottom: 5
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
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    marginBottom: 20
  },
  pastilleContainerOverlayScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 20
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
    margin: 10,
    tintColor: '#888888'
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
  }
});

export default Filtre;
