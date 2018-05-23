import React, { Component } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';

import Root from './Root';


type Props = {};
export default class App extends Component<Props> {

  render() {
    return (
      <View style={styles.container}>
        <Root />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
