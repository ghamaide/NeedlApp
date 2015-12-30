					annotations={_.map(this.state.data, (restaurant) => {
            var myRestaurant = _.contains(restaurant.friends_recommending, MeStore.getState().me.id);
            myRestaurant = myRestaurant || _.contains(restaurant.friends_wishing, MeStore.getState().me.id);
            return {
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
              title: restaurant.name
            };
          })}




North: 48.91
South: 48.81
West: 2.25
East: 2.42