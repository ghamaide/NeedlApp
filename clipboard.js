<MapView
  style={styles.restaurantsMap}
  showsUserLocation={this.state.showsUserLocation}
  annotations={_.map(this.state.data, (restaurant) => {
    var myRestaurant = _.contains(restaurant.friends_recommending, MeStore.getState().me.id);
    myRestaurant = myRestaurant || _.contains(restaurant.friends_wishing, MeStore.getState().me.id);
    return {
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      title: restaurant.name,
      subtitle: restaurant.food[1],
      color: myRestaurant ? 'green' : 'red',
      rightCallout: {
        type: 'button',
        onPress: () => {
          this.props.navigator.push(Restaurant.route({id: restaurant.id}));
        }
      },
      leftCallout: {
        type: 'image',
        config: {
          image: restaurant.pictures[0]
        }
      }
    };
  })}
  region={{
    latitude: 48.8534100,
    longitude: 2.3378000,
    latitudeDelta: 0.12,
    longitudeDelta: 0.065
  }}
  onRegionChangeComplete={this.onRegionChangeComplete} />


  onRegionChangeComplete(region) {
    console.log(region);
  }
