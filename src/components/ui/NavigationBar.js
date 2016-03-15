'use strict';

import React, {Component, Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import Text from '../ui/Text';

class BackButton extends Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent'}, this.props.style]}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 2, padding: 5, marginLeft: 7}}>
          <Icon
            name='angle-left'
            size={17}
            color='#3A325D'
            style={[{marginRight: 10}, this.props.style]}/>
          <Text style={{color:'#3A325D', fontSize: 14, marginTop: 1}}>{this.props.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

class NavBarButton extends Component {
  render() {
    if (this.props.image) {
      return (
        <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent', position: 'absolute', right: 0, top: 0}, this.props.style]}>
          <View style={{alignItems: 'center', justifyContent: 'center', marginRight: 7}}>
            <Image source={this.props.image} style={{height: 20, width: 20, tintColor: '#FE3139'}} />
            <Text style={{color:'#FE3139', fontSize: 11}}>{this.props.title}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent', position: 'absolute', right: 0, top: 0}, this.props.style]}>
          <View style={{marginTop: (Platform.OS === 'ios' ? 3 : 2), padding: 5, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 7}}>
            <Text style={{fontSize: 14, color: '#FE3139', fontWeight: '500', marginTop: 1}}>{this.props.title}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  }
}

class NavBarSwitch extends Component {
  render() {
    return (
      <View style={[styles.navBarTitle, {flexDirection: 'row'}]}>
        <TouchableOpacity style={{borderBottomWidth: this.props.active ? 1 : 0, borderColor: '#FE3139'}} onPress={this.props.onPressLeft}>
          <Text
            style={[styles.navBarTitleSwitch, {color: this.props.active ? '#FE3139' : '#3A325D'}]}>
            {this.props.title_left}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.navBarTitleSwitch, {marginLeft: 6, marginRight: 6}]}>|</Text>
        <TouchableOpacity style={{borderBottomWidth: this.props.active ? 0 : 1, borderColor: '#FE3139'}} onPress={this.props.onPressRight}>
          <Text
            style={[styles.navBarTitleSwitch, {color: this.props.active ? '#3A325D' : '#FE3139'}]}>
            {this.props.title_right}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class NavBarSwitchAndBack extends Component {
  render() {
    var content;
    return (
      <View style={[styles.navBarTitle, {flexDirection: 'row'}]}>
        {_.map(this.props.data, (item, key) => {
          return (
            <View key={'button_' + key} style={{flexDirection: 'row'}}>
              <TouchableOpacity style={{borderBottomWidth: this.props.active === (key + 1) ? 1 : 0, borderColor: '#FE3139'}} onPress={() => this.props.onPress(key + 1)}>
                <Text
                  style={[styles.navBarTitleSwitch, {color: this.props.active === (key + 1) ? '#FE3139' : '#3A325D'}]}>
                  {this.props.titles[key]}
                </Text>
              </TouchableOpacity>
              {key < this.props.data.length - 1 ? [
                <Text key={'separator_' + key} style={[styles.navBarTitleSwitch, {marginLeft: 6, marginRight: 6}]}>|</Text>
              ] : null}
            </View>
          );
        })}
      </View>
    );
  }
}

class NavigationBar extends Component {
  render() {
    const rightButtonConfiguration = {
      title: this.props.rightButtonTitle,
      handler: this.props.onRightButtonPress,
      image: this.props.image,
      tintColor: '#000000'
    };

    const titleConfiguration = {
      title: this.props.title,
      title_left: this.props.title_left,
      title_right: this.props.title_right
    };
       
    const leftButtonConfiguration = {
      title: this.props.leftButtonTitle,
      handler: this.props.onLeftButtonPress,
      tintColor: '#000000'
    };

    switch (this.props.type) {
      case 'back' :
        return (
          <NavBar
            style={[{borderBottomWidth: 1, borderColor: '#CCCCCC', paddingBottom: 0, margin: 0}, this.props.style]}
            title={titleConfiguration}
            rightButton={rightButtonConfiguration.title ? <NavBarButton title={rightButtonConfiguration.title} onPress={rightButtonConfiguration.handler} image={this.props.rightImage} /> : []}
            leftButton={<BackButton icon={leftButtonConfiguration.icon} title={leftButtonConfiguration.title} onPress={this.props.onLeftButtonPress} /> } />
        );
        break;
      case 'default' :
        return (
          <NavBar
            style={[{borderBottomWidth: 1, borderColor: '#CCCCCC', paddingBottom: 0, margin: 0}, this.props.style]}
            title={titleConfiguration}
            rightButton={rightButtonConfiguration.title ? <NavBarButton title={rightButtonConfiguration.title} onPress={rightButtonConfiguration.handler} image={this.props.rightImage} /> : []}
            leftButton={leftButtonConfiguration.title ? <NavBarButton title={leftButtonConfiguration.title} onPress={leftButtonConfiguration.handler} image={this.props.leftImage} /> : []} />
        );
        break;
      case 'switch' : 
        return (
          <NavBar
            switch={true}
            style={[{borderBottomWidth: 1, borderColor: '#CCCCCC', paddingBottom: 0, margin: 0}, this.props.style]}
            title_left={this.props.title_left} title_right={this.props.title_right}
            active={this.props.active}
            onPressLeft={this.props.onPressLeft} onPressRight={this.props.onPressRight}
            rightButton={rightButtonConfiguration.title ? <NavBarButton title={rightButtonConfiguration.title} onPress={rightButtonConfiguration.handler} image={this.props.rightImage} /> : []}
            leftButton={leftButtonConfiguration.title ? <NavBarButton title={rightButtonConfiguration.title} onPress={rightButtonConfiguration.handler} image={this.props.leftImage} /> : []} />
        );
        break;
      case 'switch_and_back' :
        return (
          <NavBar
            switch_and_back={true}
            style={[{borderBottomWidth: 1, borderColor: '#CCCCCC', paddingBottom: 0, margin: 0}, this.props.style]}
            data={this.props.data} titles={this.props.titles}
            active={this.props.active}
            onPress={this.props.onPress}
            rightButton={rightButtonConfiguration.title ? <NavBarButton title={rightButtonConfiguration.title} onPress={rightButtonConfiguration.handler} image={this.props.rightImage} /> : []}
            leftButton={<BackButton icon={leftButtonConfiguration.icon} title={leftButtonConfiguration.title} onPress={this.props.onLeftButtonPress} /> } />
        );
        break;
      default :
        return <Text>Type not specified</Text>
    }
  };
}

class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  getButtonElement(data = {}, style) {
    if (!!data.props) {
      return <View style={styles.navBarButton}>{data}</View>;
    }

    return (
      <TouchableOpacity onPress={data.handler}>
        <View style={[data.style, style, {backgroundColor: 'red'}]}>
          <Text style={[styles.navBarButtonText, { color: data.tintColor, }, ]}>{data.title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  getTitleElement(data) {
    if (!this.props.switch && !this.props.switch_and_back) {
      return (
        <Text
          style={styles.navBarTitleText}>
          {data.title}
        </Text>
      );
    } else if (this.props.switch) {
      return (
        <NavBarSwitch 
          active={this.props.active}
          title_left={this.props.title_left} title_right={this.props.title_right}
          onPressLeft={this.props.onPressLeft} onPressRight={this.props.onPressRight} />
      );
    } else if (this.props.switch_and_back) {
      return (
        <NavBarSwitchAndBack 
          active={this.props.active}
          data={this.props.data} titles={this.props.titles}
          onPress={this.props.onPress} />
      );
    }
  }

  render() {
    const customTintColor = this.props.tintColor ?
      { backgroundColor: this.props.tintColor } : null;

    return (
      <View style={[styles.navBarContainer, customTintColor, ]}>
        <View style={[styles.navBar, this.props.style, ]}>
          {this.getTitleElement(this.props.title)}
          {this.getButtonElement(this.props.leftButton, { marginLeft: 8, })}
          {this.getButtonElement(this.props.rightButton, { marginRight: 8, })}
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  navBarContainer: {
    backgroundColor: 'white',
    marginTop: (Platform.OS === 'ios' ? 20 : 0),
  },
  statusBar: {
    height: (Platform.OS === 'ios' ? 20 : 0),
  },
  navBar: {
    height: (Platform.OS === 'ios' ? 40 : 40),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 7,
    alignItems: 'center',
  },
  navBarButton: {
    marginTop: 3,
  },
  navBarButtonText: {
    fontSize: 15,
    letterSpacing: 0.5,
    marginTop: 12,
    color: '#3A325D'
  },
  navBarTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  navBarTitleText: {
    fontSize: 15,
    color: '#3A325D',
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: (Platform.OS === 'ios' ? 12 : 10),
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  navBarTitleSwitch: {
    fontSize: 15,
    color: '#3A325D',
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    textAlign: 'center',
    backgroundColor: 'transparent'
  }
});

export default NavigationBar;
