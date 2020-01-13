import React from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, FlatList, AsyncStorage } from 'react-native';
import * as Google from 'expo-google-app-auth';
import {Gap} from './Gap';

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userInfoResponse: null,
      accessToken: null,
      type: null,
      files: null,
      fetching: false,
      uploading: false,
      wallet: null,
      metaDataForUploadedFile: null,
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
      scopes: ['profile', 'email','https://www.googleapis.com/auth/drive.appdata','https://www.googleapis.com/auth/drive'],
    };
    const { type, accessToken, user } = await Google.logInAsync(config);
    console.log(accessToken, 'this is the access token!!!!!!')
    
    if (type === 'success') {
      // Then you can use the Google REST API
      let userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      this.setState({userInfoResponse, accessToken, type});
      console.log('Access token: ', accessToken ? accessToken : undefined)
    }
    }

  getFiles(){
    const { accessToken, files } = this.state; 
    this.setState({fetching: true});
    if(accessToken !== null){
      fetch('https://www.googleapis.com/drive/v3/files',{
          headers: { 
            Authorization: `Bearer ${accessToken}`}
      })
      .then(response => response.json())
      .then(data => this.setState({files: data.files, fetching: false}, () => console.log('Files: ', files ? files : undefined)))
      .catch(err => console.log(err, 'this error occurred when trying to get the files'));
    }
  }

  storeDataToDrive(){
    /* This works perfectly, we need to save the ID of the saved file so that we can query it at some point */
    this.retrieveData();
    if(this.state.wallet !== null){
      const { accessToken, wallet } = this.state; 
      this.setState({uploading: true});
      if((accessToken !== null && wallet !== null)){
        const boundaryString = 'foo_bar_baz';
        const metaData = {
          name: 'data.json',
          description: 'Backup data for my app',
          mimeType: 'application/json',
          parents: 'appDataFolder'
        }
        // request body
        const multipartBody = `\r\n--${boundaryString}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
        + `${JSON.stringify(metaData)}\r\n`
        + `--${boundaryString}\r\nContent-Type: application/json\r\n\r\n`
        + `${JSON.stringify(wallet)}\r\n`
        + `--${boundaryString}--`
       
        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundaryString}`
          },
          body: multipartBody
        })
        .then(response => response.json())
        .then(metaData => {
          this.setState({metaDataForUploadedFile: metaData});
          alert(JSON.stringify(metaData));
        }) //metadata has {kind, id, name, mimeType}
        .catch(err => console.log(err, 'this is the error'))
      }else{
        alert('No google access token detected ! Also make sure the Wallet data is present')
      }
    }else{
      alert('There is no data in the wallet to send to the drive api')
    }
    
  }

  getFileFromDriveAppDataFolder() {
    const {accessToken} = this.state;
    if(accessToken !== null){
        const qParams = encodeURIComponent("name = 'data.json' and 'appDataFolder' in parents")
        return fetch(`https://www.googleapis.com/drive/v3/files?q=${qParams}&spaces=appDataFolder`, {
          headers: {Authorization: `Bearer ${accessToken}`}
        })
          .then(response => response.json())
          .then((body) => {
            if (body && body.files && body.files.length > 0) alert(body.files[0])
            return null
          })
          .catch(err => alert(JSON.stringify(err)))
    }else{
      alert('No access token in state')
    }
  }

// download the file contents given the id
downloadFile() {
  const { accessToken, metaDataForUploadedFile } = this.state;
  if (!metaDataForUploadedFile.id) throw new Error('Didn\'t provide a valid file id.')
  return fetch(`https://www.googleapis.com/drive/v3/files/${metaDataForUploadedFile.id}?alt=media`, {
    headers: {Authorization: `Bearer ${accessToken}`}
  })
    .then(response => response.json())
    .then(data => alert(JSON.stringify(data)))
}

  storeData = async () => {
    try {
      await AsyncStorage.setItem('@wallet-data', JSON.stringify({
        'eth': 0.25,
        'btc': 2.503001,
        'binance': 0.0002
      }));
      alert('Data successfully saved!')
    } catch (e) {
      alert('Failed to save the wallet.', JSON.stringify(e));
    }
  }

  retrieveData = async () => {
    try {
      const wallet = await AsyncStorage.getItem('@wallet-data')

      if (wallet !== null) {
        this.setState({ wallet })
      }
    } catch (e) {
      alert('Failed to load name.')
    }
  }

  render(){
    const {fetching, files, metaDataForUploadedFile} = this.state;
    console.log('ID for file', metaDataForUploadedFile ? metaDataForUploadedFile.id : 'no id found');
    console.log(this.state.accessToken && this.state.accessToken, 'this is the access token!!!!!!')
    return (
      <View style={styles.container}>
        <Text>{this.state.accessToken ? 'Access token saved to state' : 'Authenticating'}</Text>

        {/* Button to fetch files from google drive */}
        <Button disabled={files ? true : false} onPress={() => this.getFiles()} title="Fetch files from your Google Drive" />
        <Text>{fetching ? 'fetching files': undefined}</Text>
    <Text>{metaDataForUploadedFile ? metaDataForUploadedFile.id : 'No ID yet'}</Text>

        {/**  Button to save application data to Google Drive App Data Folder 
         * First we need to **/}
        <Button onPress={() => this.storeData()} title={'1. Save data to Offline Storage'} />
        <Gap />
      
        <Gap />
        <Button onPress={() => this.storeDataToDrive()} title={'2. Save App Data to Google Drive AppData Folder'} />
        <Text>{this.state.accessToken ? this.state.accessToken : undefined}</Text>
        <Button onPress={() => this.downloadFile()} title="3. Download File from App Data"/>
        <SafeAreaView style={styles.container}>
          <FlatList
            data={files && files}
            renderItem={({ item }) => <Text>{item.name}</Text>}
            keyExtractor={item => item.id}
          />
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 35,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
