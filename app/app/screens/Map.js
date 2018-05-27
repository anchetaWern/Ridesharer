import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Icon from 'react-native-vector-icons/FontAwesome';
import Pusher from 'pusher-js/react-native'; 
import Geocoder from 'react-native-geocoding';
import axios from 'axios';

import { regionFrom, getLatLonDiffInMeters } from '../lib/location';

import Tapper from '../components/Tapper';

type Props = {};

const google_api_key = 'YOUR GOOGLE PROJECT API KEY';
const base_url = 'YOUR NGROK URL';
const pusher_app_key = 'YOUR PUSHER APP KEY';
const pusher_app_cluster = 'YOUR PUSHER CLUSTER';


const ten_minutes = 1000 * 60 * 10; 
const five_minutes = 1000 * 60 * 5;

Geocoder.init(google_api_key);

console.disableYellowBox = true;

const default_region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

var device_width = Dimensions.get('window').width; 

export default class Map extends Component<Props> {
 
  static navigationOptions = ({navigation}) => ({
    headerTitle: 'Map',
    headerStyle: {
      backgroundColor: '#007ff5'
    },
    headerTitleStyle: {
      color: '#FFF'
    }
  });


  state = {
    start_location: null,
    end_location: null,
    region: default_region,
    from: '',
    to: '',
    rider_location: null, 
    hiker_location: null,
    is_loading: false,
    has_journey: false
  }


  constructor(props) {
    super(props);
    this.from_region = null;
    this.watchId = null; // unique ID for the geolocation watcher
    this.pusher = null; // variable for storing the Pusher instance
    this.user_channel = null; // the Pusher channel for the current user
    this.journey_id = null;
    this.riders_channel = null; // if current user is a hiker, the value of this will be the riders channel
    this.users_channel = null; // the current user's channel
    this.hiker = null
  }


  componentDidMount() {

    const { navigation } = this.props;
    const username = navigation.getParam('username');

    this.pusher = new Pusher(pusher_app_key, {
      authEndpoint: `${base_url}/pusher-auth.php`,
      cluster: pusher_app_cluster,
      encrypted: true
    });

    this.users_channel = this.pusher.subscribe(`private-user-${username}`);
    this.users_channel.bind('client-rider-request', (hiker) => {
      
      Alert.alert(
        `${hiker.username} wants to ride with you`,
        `Pickup: ${hiker.origin} \nDrop off: ${hiker.dest}`,
        [
          {
            text: "Decline",
            onPress: () => {
              
            },
            style: 'cancel'
          },
          {
            text: 'Accept', 
            onPress: () => {
              this.acceptRide(hiker);
            } 
          },
        ],
        { cancelable: false } // no cancel button
      );

    });
   

    navigator.geolocation.getCurrentPosition(
      (position) => {
        var region = regionFrom(
          position.coords.latitude, 
          position.coords.longitude, 
          position.coords.accuracy
        );

        Geocoder.from({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        .then((response) => {
        
          this.from_region = region;

          this.setState({
            start_location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            region: region,
            from: response.results[0].formatted_address
          });

        });

      }
    );
  }

  
  acceptRide = (hiker) => {

    const username = this.props.navigation.getParam('username');

    let rider_data = {
      username: username,
      origin: this.state.from,
      dest: this.state.to,
      coords: this.state.start_location
    };

    this.users_channel.trigger('client-rider-accepted', rider_data);

    axios.post(`${base_url}/delete-route.php`, {
      username: username
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((err) => {
      console.log('error excluding rider: ', err);
    });

    this.hiker = hiker;

    this.setState({
      is_loading: false,
      has_journey: true,
      hiker_location: hiker.origin_coords
    });

  }


  render() {
    const { navigation } = this.props;
    const action = navigation.getParam('action');
    const username = navigation.getParam('username');
    
    let action_button_label = (action == 'share') ? 'Share Ride' : 'Search Ride';
    
    return (
      <View style={styles.container}>

        <MapView
          style={styles.map}
          region={this.state.region}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >
          {
            this.state.start_location &&
            <Marker coordinate={this.state.start_location}>
              <Callout>
                <Text>You are here</Text>
              </Callout>
            </Marker>
          }

          {
            this.state.end_location &&
            <Marker
              pinColor="#4196ea"
              coordinate={this.state.end_location}
              draggable={true}
              onDragEnd={this.tweakDestination}
            />
          }

          {
            this.state.rider_location &&
            <Marker 
              pinColor="#25a25a"
              coordinate={this.state.rider_location}
            >
              <Callout>
                <Text>Rider is here</Text>
              </Callout>
            </Marker>
          }

          {
            this.state.hiker_location &&
            <Marker 
              pinColor="#25a25a"
              coordinate={this.state.hiker_location}
            >
              <Callout>
                <Text>Hiker is here</Text>
              </Callout>
            </Marker>
          }
          
          {
            this.state.start_location && this.state.end_location &&
            <MapViewDirections
              origin={{
                'latitude': this.state.start_location.latitude,
                'longitude': this.state.start_location.longitude
              }}
              destination={{
                'latitude': this.state.end_location.latitude,
                'longitude': this.state.end_location.longitude
              }}
              strokeWidth={5}
              strokeColor={"#2d8cea"}
              apikey={google_api_key}
            />
          }
          
        </MapView>

        <View style={styles.search_field_container}>
        
          <GooglePlacesAutocomplete
            ref="endlocation"
            placeholder='Where do you want to go?'
            minLength={5} 
            returnKeyType={'search'} 
            listViewDisplayed='auto' 
            fetchDetails={true}            
            onPress={this.selectDestination}
          
            query={{
              key: google_api_key,
              language: 'en', 
            }}
            
            styles={{
              textInputContainer: {
                width: '100%',
                backgroundColor: '#FFF'
              },
              listView: {
                backgroundColor: '#FFF'
              }
            }}
            debounce={200} 
          />
        </View>

        <ActivityIndicator size="small" color="#007ff5" style={{marginBottom: 10}} animating={this.state.is_loading} />
        
        {
          !this.state.is_loading && !this.state.has_journey &&
          <View style={styles.input_container}>

            <Tapper 
              title={action_button_label}
              color={"#007ff5"}
              onPress={() => {
                this.onPressActionButton();
              }} />
           
            <Tapper
              title={"Reset"}
              color={"#555"}
              onPress={this.resetSelection} 
            />
            
          </View>
        }

      </View>
    );
  }


  resetSelection = () => {
    this.refs.endlocation.setAddressText('');
    this.setState({
      end_location: null,
      region: this.from_region,
      to: ''
    });
  }


  tweakDestination = () => {
    Geocoder.from({
      latitude: evt.nativeEvent.coordinate.latitude,
      longitude: evt.nativeEvent.coordinate.longitude
    })
    .then((response) => {
      this.setState({
        to: response.results[0].formatted_address
      });
    });

    this.setState({
      end_location: evt.nativeEvent.coordinate
    });
  }


  selectDestination = (data, details = null) => {
    
    if(details){
      const latDelta = Number(details.geometry.viewport.northeast.lat) - Number(details.geometry.viewport.southwest.lat);
      const lngDelta = Number(details.geometry.viewport.northeast.lng) - Number(details.geometry.viewport.southwest.lng);

      let region = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta
      };

      this.setState({
        end_location: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        },
        region: region,
        to: this.refs.endlocation.getAddressText()
      });
    }

  }


  onPressActionButton = () => {

    const action = this.props.navigation.getParam('action');
    const username = this.props.navigation.getParam('username');

    this.setState({
      is_loading: true
    });

    if(action == 'share'){
      this.shareRide(username);
    }else if(action == 'hike'){
      this.hikeRide(username);      
    }

  }


  shareRide = (username) => {

    axios.post(`${base_url}/save-route.php`, {
      username: username,
      from: this.state.from, 
      to: this.state.to, 
      start_location: this.state.start_location,
      end_location: this.state.end_location
    })
    .then((response) => {
      this.journey_id = response.data.id;
      Alert.alert(
        'Ride was shared!',
        'Wait until someone makes a request.'
      );
    })
    .catch((error) => {
      console.log('error occurred while saving route: ', error);
    });
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
      
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let accuracy = position.coords.accuracy;

        if(this.journey_id && this.hiker){ 

          axios.post(`${base_url}/update-route.php`, {
            id: this.journey_id,
            lat: latitude,
            lon: longitude
          })
          .then((response) => {
            console.log(response);
          });

          let location_data = {
            username: username,
            lat: latitude,
            lon: longitude,
            accy: accuracy 
          };
          this.users_channel.trigger('client-rider-locationchange', location_data);

          this.setState({
            region: regionFrom(latitude, longitude, accuracy),
            start_location: {
              latitude: latitude,
              longitude: longitude
            }
          });

          let diff_in_meters = getLatLonDiffInMeters(latitude, longitude, this.hiker.origin_coords.latitude, this.hiker.origin_coords.longitude);
          if(diff_in_meters <= 20){
            this.resetUI();
          }else if(diff_in_meters <= 50){
            Alert.alert(
              'Hiker is near',
              'Hiker is around 50 meters from your current location'
            );
          }

        }

      }
    );

    setTimeout(() => {
      this.resetUI();
    }, five_minutes);

  }


  hikeRide = (username) => {

    var interval = setInterval(() => {
      
      axios.post(`${base_url}/search-routes.php`, {
        origin: this.state.start_location,
        dest: this.state.end_location
      })
      .then((response) => {
        
        if(response.data){

          clearInterval(interval); // assumes the rider will accept the request
          
          let rider = response.data;
         
          this.riders_channel = this.pusher.subscribe(`private-user-${rider.username}`);
          
          this.riders_channel.bind('pusher:subscription_succeeded', () => {

            this.riders_channel.trigger('client-rider-request', {
              username: username, // username of the current user
              origin: this.state.from,
              dest: this.state.to,
              origin_coords: this.state.start_location
            });

          });

          this.riders_channel.bind('client-rider-accepted', (rider_data) => {

            Alert.alert(
              `${rider_data.username} accepted your request`,
              `You will now receive updates of their current location`
            );

            this.setState({
              is_loading: false,
              has_journey: true,
              rider_location: rider_data.coords
            });

            this.riders_channel.bind('client-rider-locationchange', (data) => {

              this.setState({
                region: regionFrom(data.lat, data.lon, data.accy),
                rider_location: {
                  latitude: data.lat,
                  longitude: data.lon
                }
              });

              let hikers_origin = this.state.start_location;
              let diff_in_meters = getLatLonDiffInMeters(data.lat, data.lon, hikers_origin.latitude, hikers_origin.longitude);
              
              if(diff_in_meters <= 20){
                this.resetUI();
              }else if(diff_in_meters <= 50){
                Alert.alert(
                  'Rider is near',
                  'Rider is around 50 meters from your location'
                );
              }
            });

          });
        }
        
      })
      .catch((error) => {
        console.log('error occurred while searching routes: ', error);
      });

    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      this.resetUI();
    }, ten_minutes);


  }


  resetUI = () => {

    this.from_region = null;
    this.watchId = null; // unique ID for the geolocation watcher
    this.pusher = null; // variable for storing the Pusher instance
    this.user_channel = null; // the Pusher channel for the current user
    this.journey_id = null;
    this.riders_channel = null; // if current user is a hiker, the value of this will be the riders channel
    this.users_channel = null; // the current user's channel
    this.hiker = null;

    this.setState({
      start_location: null,
      end_location: null,
      region: default_region,
      from: '',
      to: '',
      rider_location: null, 
      hiker_location: null,
      is_loading: false,
      has_journey: false
    });
    
    this.props.navigation.goBack();

    Alert.alert('Awesome!', 'Thanks for using the app!');

  }

}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  search_field_container: {
    height: 150, 
    width: device_width, 
    position: 'absolute', 
    top: 10
  },
  input_container: {
    alignSelf: 'center',
    backgroundColor: '#FFF',
    opacity: 0.80,
    marginBottom: 25
  }
});