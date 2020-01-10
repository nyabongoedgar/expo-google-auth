import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Google from 'expo-google-app-auth';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userInfoResponse: null,
      accessToken: null,
      type: null,
      files: null,
      fetching: false
    }
  }
  componentDidMount(){
    this.Init();
  }

  async Init(){
    // First- obtain access token from Expo's Google API
    const config = {
      androidClientId: "303742960455-l1h7sqft68tqt9ph9k3r3qd1vc6sghb8.apps.googleusercontent.com",
      iosClientId: "303742960455-jaha2fb02ekc1i51k69g2ljh5e44rsdb.apps.googleusercontent.com",
      scopes: ['profile', 'email','https://www.googleapis.com/auth/drive'],
    };
    const { type, accessToken, user } = await Google.logInAsync(config);
    
    if (type === 'success') {
      // Then you can use the Google REST API
      let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      this.setState({userInfoResponse, accessToken, type}, () => console.log('user info response to state', this.state.userInfoResponse));
    }
    }

  async getFiles(){
    const { accessToken } = this.state; 
    this.setState({fetching: true});
    if(accessToken !== null){
      try{
        let files = await fetch('https://www.googleapis.com/drive/v3/files',{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      this.setState({files: JSON.stringify(files), fetching: false}, () => console.log(this.state.files, 'this has been returned !'));
      }catch(err){
        console.log(err, 'this is the error');
      }
    }
  }

  render(){
    const { fetching, accessToken } = this.state;
    console.log(accessToken ? accessToken : undefined, 'access token info' )
    return (
      <View style={styles.container}>
        <Text>{this.state.accessToken ? 'Access token saved to state' : 'working now'}</Text>
        <Button onPress={() => this.getFiles()} title="Fetch Files" />
        <Text>{fetching ? 'fetching files': undefined}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
