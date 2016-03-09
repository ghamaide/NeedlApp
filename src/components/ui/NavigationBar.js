'use strict';

import React, {Component, Image, Platform, StyleSheet, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import Text from '../ui/Text';

class BackButton extends Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent'}, this.props.style]}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 3, padding: 5, marginLeft: 7}}>
          <Icon
            name='angle-left'
            size={17}
            color='#333333'
            style={[{marginRight: 10}, this.props.style]}/>
          <Text style={{color:'#333333', fontSize: 14, marginTop: 1}}>{this.props.title}</Text>
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
            <Image source={this.props.image} style={{height: 20, width: 20, tintColor: '#000000'}} />
            <Text style={{color:'#333333', fontSize: 11}}>{this.props.title}</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={this.props.onPress} style={[{backgroundColor: 'transparent', position: 'absolute', right: 0, top: 0}, this.props.style]}>
          <View style={{marginTop: (Platform.OS === 'ios' ? 3 : 2), padding: 5, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 7}}>
            <Text style={{fontSize: 14, color: '#EF582D', fontWeight: '500', marginTop: 1}}>{this.props.title}</Text>
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
        <TouchableOpacity style={{borderBottomWidth: this.props.active ? 1 : 0, borderColor: '#EF582D'}} onPress={this.props.onPressLeft}>
          <Text
            style={[styles.navBarTitleSwitch, {color: this.props.active ? '#EF582D' : '#333333'}]}>
            {this.props.title_left}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.navBarTitleSwitch, {marginLeft: 6, marginRight: 6}]}>|</Text>
        <TouchableOpacity style={{borderBottomWidth: this.props.active ? 0 : 1, borderColor: '#EF582D'}} onPress={this.props.onPressRight}>
          <Text
            style={[styles.navBarTitleSwitch, {color: this.props.active ? '#333333' : '#EF582D'}]}>
            {this.props.title_right}
          </Text>
        </TouchableOpacity>
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
    if (!this.props.switch) {
      return (
        <Text
          style={styles.navBarTitleText}>
          {data.title}
        </Text>
      );
    } else {
      return (
        <NavBarSwitch 
          active={this.props.active}
          title_left={this.props.title_left} title_right={this.props.title_right}
          onPressLeft={this.props.onPressLeft} onPressRight={this.props.onPressRight} />
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
    fontSize: 14,
    letterSpacing: 0.5,
    marginTop: 12,
    color: '#333333'
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
    fontSize: 14,
    color: '#333333',
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: (Platform.OS === 'ios' ? 12 : 10),
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  navBarTitleSwitch: {
    fontSize: 14,
    color: '#333333',
    fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
    textAlign: 'center',
    backgroundColor: 'transparent'
  }
});

export default NavigationBar;
