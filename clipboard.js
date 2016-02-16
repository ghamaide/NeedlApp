
              <ListView
                key="list_restaurants"
                renderToHardwareTextureAndroid={true}
                initialListSize={1}
                pageSize={10}
                dataSource={ds.cloneWithRows(this.state.data.slice(0, 3))}
                renderRow={this.renderRestaurant}
                renderHeaderWrapper={this.renderHeaderWrapper}
                contentInset={{top: 0}}
                automaticallyAdjustContentInsets={false}
                showsVerticalScrollIndicator={false} />