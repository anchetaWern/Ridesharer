# Ridesharer
A carpooling app built with React Native, Pusher Channels, PHP, and Elasticsearch.

Full tutorial is available on the Pusher tutorial hub:
- [Create a carpooling app with React Native - Part 1: Setting up the server](https://pusher.com/tutorials/carpooling-react-native-part-1)
- [Create a carpooling app with React Native - Part 2: Creating the frontend](https://pusher.com/tutorials/carpooling-react-native-part-2)

### Prerequisites

* Docker
* React Native development environment for Android or iOS (depending on where you want to deploy).
* Git

## Getting Started

Clone the repo and navigate inside it:

```bash
git clone https://github.com/anchetaWern/Ridesharer
cd Ridesharer
```

### Setting up the server

1. Clone laradock and navigate inside:

```
git clone https://github.com/Laradock/laradock.git
cd laradock
```


2. Copy sample environment file:

```
cp env-example .env
```

3. Open `.env` and set `APPLICATION` path:

```
APPLICATION=../laradock-projects
```

4. Create `laradock-projects` directory outside the `laradock` folder:

```
mkdir laradock-projects
```

5. Copy the contents of `laradock/apache2/sites/default.apache.conf` file from the `Ridesharer/server` directory and put it on your `laradock/apache2/sites/default.apache.conf` file.


6. Open the `docker-compose.yml` file on your `laradock` folder (not the one from `Ridesharer`) and add the following under the `environment` config or elasticsearch (check the tutorial for more detailed instructions):

```
xpack.security.enabled=false
```

7. Navigate inside the `laradock-projects` and create a `ridesharer` directory:

```
cd laradock-projects
mkdir ridesharer
```

8. Copy the files from `Ridesharer/server/files` (from this repo) and paste it on the `ridesharer` directory which you just created.

9. Update the `.env` file with your Pusher and Google config.

10. Bring up the container:

```
docker-compose up -d apache2 php-fpm elasticsearch workspace
```

11. Create an account at ngrok and download it.

12. Navigate inside the directory where you downloaded ngrok and unzip it. 

13. Add your ngrok token (you can find this on the ngrok dashboard):

```
.\ngrok authtoken YOUR_AUTH_TOKEN
```

14. Expose the server to the internet:

```
ngrok http -host-header=ridesharer.loc 80
```


### Setting up the app

1. Navigate inside the `app` directory:

```
cd app
```

2. Copy `android` and `ios` folders somewhere else. These will only be used as a basis on what the following files should look like after all the React Native modules has been installed and set up:

```
# android-only
android/settings.gradle
android/app/build.gradle
android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/ridesharer/MainApplication.java

# ios-only
ios/Podfile
ios/Ridesharer/AppDelegate.m
ios/Ridesharer/Info.plist
```

3. Install all dependencies:

```
npm install
```

4. Set up the dependencies that needs additional setup. Open the `README` for the specific version you're using and read install instructions (instructions on how to do this is available on the tutorial):

5. If you want to deploy to iOS, navigate inside the `ios` folder and execute `pod install` to install all the native dependencies.

6. Update the config for Google, ngrok Base URL, and Pusher on `app/screens/Map.js` and `app/screens/Home.js`:

```
const google_api_key = 'YOUR GOOGLE PROJECT API KEY';
const base_url = 'YOUR NGROK URL';
const pusher_app_key = 'YOUR PUSHER APP KEY';
const pusher_app_cluster = 'YOUR PUSHER CLUSTER';
```

7. Run the app:

```
react-native run-android
react-native run-ios # or open the .xcworkspace file with Xcode
```


## Built With

* [React Native](http://facebook.github.io/react-native/) - for creating cross-platform apps with JavaScript and React.
* [Pusher Channels](https://pusher.com/) - for sending realtime data between users.
* [Laradock](http://laradock.io/) - for easily setting up a server.
* [PHP](http://php.net/) - for running the server-side code.
* [Ngrok](https://ngrok.com/) - for exposing the server to the internet.
* [Google Directions API](https://developers.google.com/maps/documentation/directions/intro) - for getting the best route between to points.
* [Geometry Library Google Maps API V3](https://github.com/alexpechkarev/geometry-library) - for determining if a coordinate lies within a set of coordinates.
* [Elasticsearch](https://www.elastic.co/) - for indexing and searching for routes
* [Genymotion](https://www.genymotion.com/) - for running the app on en emulated android device.
* [axios](https://github.com/axios/axios) - for making requests to the server. Although React Native already comes with fetch, axios gives us a simpler API to work with.
* [pusher-js](https://github.com/pusher/pusher-js) - the official Pusher JavaScript library. This allows us connect to a Pusher app and send real-time data.
* [react-native-geocoding](https://github.com/marlove/react-native-geocoding) - for converting latitude and longitude pairs to the actual name of the place.
* [react-native-google-places-autocomplete](https://github.com/FaridSafi/react-native-google-places-autocomplete) - for searching the user’s destination.
* [react-native-maps](https://github.com/react-community/react-native-maps) - for showing a map inside the app. This is also used for showing markers on where the users are and their destinations. 
* [react-native-maps-directions](https://github.com/bramus/react-native-maps-directions) - for showing the route from the user’s origin to their destination. 
* [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) - for using icons inside the app.
* [react-navigation](https://github.com/react-navigation/react-navigation) - for easily implementing navigation between screens.


## Acknowledgments

- @npomfret's [formula on getting latitude and longitude delta values](https://github.com/react-community/react-native-maps/issues/505#issuecomment-285393532)
- @chuck's [formula on getting latitude and longitude difference in kilometers](https://stackoverflow.com/a/27943/472034)


