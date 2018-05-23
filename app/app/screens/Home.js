import React, { Component } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  PermissionsAndroid, 
  KeyboardAvoidingView 
} from 'react-native';

import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';

import Tapper from '../components/Tapper';

const base_url = 'YOUR NGROK URL';

type Props = {};

async function requestGeolocationPermission() {
  try{
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Ridesharer Geolocation Permission',
        'message': 'Ridesharer needs access to your current location so you can share or search for a ride'
      }
    );

    if(granted === PermissionsAndroid.RESULTS.GRANTED){
      console.log("You can use the geolocation")
    }else{
      console.log("Geolocation permission denied")
    }
  }catch(err){
    console.warn(err)
  }
}

requestGeolocationPermission();

export default class Home extends Component<Props> {
  
  static navigationOptions = {
    header: null,
  };


  state = {
    is_loading: false,
    username: ''
  }

  
  enterUser = (action) => {
    if(this.state.username){

      this.setState({
        is_loading: true
      });
      
      axios.post(`${base_url}/save-user.php`, {
        username: this.state.username
      })
      .then((response) => {
        
        if(response.data == 'ok'){
          this.setState({
            is_loading: false
          });

          this.props.navigation.navigate('Map', {
            action: action,
            username: this.state.username
          });
        }
        
      });
  
    }else{
      Alert.alert(
        'Username required',
        'Please enter a username'
      );
    }
  }


	render() {
    
		return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <View style={styles.jumbo_container}>
          <Icon name="question-circle" size={35} color="#464646" />
          <Text style={styles.jumbo_text}>What do you want to do?</Text>
        </View>

        <View>
          <TextInput
            placeholder="Enter your username"
            style={styles.text_field}
            onChangeText={(username) => this.setState({username})}
            value={this.state.username}
            clearButtonMode={"always"}
            returnKeyType={"done"}
          />
          <ActivityIndicator size="small" color="#007ff5" style={{marginTop: 10}} animating={this.state.is_loading} />
        </View>

        <View style={styles.close_container}>
          <Tapper
            title="Share a Ride"
            color="#007ff5"
            onPress={() => {
              this.enterUser('share');
            }}
          />
         
          <Tapper 
            title="Hitch a Ride" 
            color="#00bcf5" 
            onPress={() => {
              this.enterUser('hike');
            }} 
          />
        </View>
        
      </KeyboardAvoidingView>
		);
	}

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  jumbo_container: {
    padding: 50,
    alignItems: 'center'
  },
  jumbo_text: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold'
  },
  text_field: {
    width: 200,
    height: 50,
    padding: 10,
    backgroundColor: '#FFF', 
    borderColor: 'gray', 
    borderWidth: 1
  }
});