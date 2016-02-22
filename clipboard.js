!profil.invisible ?
                  <Option
                    key={'hide_reco_' + profil.id}
                    label={ProfilStore.loading() ? 'Masque...' : 'Masquer ses recos'}
                    icon={require('../../assets/img/actions/icons/masquer.png')}
                    onPress={() => {
                      if (ProfilStore.loading()) {
                        return;
                      }
                      ProfilActions.maskProfil(profil.id);
                    }} /> :
                  <Option
                    key={'show_reco_' + profil.id}
                    label={ProfilStore.loading() ? 'Affichage...' : 'Afficher ses recos'}
                    icon={require('../../assets/img/actions/icons/afficher.png')}
                    onPress={() => {
                      if (ProfilStore.loading()) {
                        return;
                      }
                      ProfilActions.displayProfil(profil.id);
                    }} />,
                <Option
                  key={'delete_friend_' + profil.id}
                  label={FriendsStore.loading() ? 'Suppression...' : 'Retirer de mes amis'}
                  icon={require('../../assets/img/actions/icons/retirer.png')}
                  onPress={() => {
                    if (FriendsStore.loading()) {
                      return;
                    }
                    FriendsActions.removeFriendship(profil.id, () => {
                      this.props.navigator.resetTo(Friends.route());
                    });
                    this.forceUpdate();
                  }} />






              {MeStore.getState().me.id === profil.id ? [
                <TouchableHighlight
                  key={"edit_" + profil.id}
                  style={styles.leftButton}
                  onPress={() => this.props.navigator.push(EditMe.route())}>
                  <Text>Modifier mon profil</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  key={"logout_" + profil.id}
                  onPress={() => LoginActions.logout}>
                  <Text>Me Déconnecter</Text>
                </TouchableHighlight>
                <Option
                  key={"logout " + profil.id}
                  label="Me Déconnecter"
                  icon={require('../../assets/img/actions/icons/signout.png')}
                  onPress={LoginActions.logout} />
            ] : [
              !profil.invisible ? [
                <TouchableHighlight>
                  <Text>Masquer recos</Text>
                </TouchableHighlight>
              ] : [
                <TouchableHighlight>
                  <Text>Afficher recos</Text>
                </TouchableHighlight>
              ]
              <TouchableHighlight>
                <Text>Supprimer amis</Text>
              </TouchableHighlight>
            ]}