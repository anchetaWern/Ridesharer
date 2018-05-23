import React from 'react';
import { View, Button } from 'react-native';

import styles from './styles';

const Tapper = (props) => {

  return (
	<View style={styles.button_container}>
		<Button
		  onPress={props.onPress}
		  title={props.title}
		  color={props.color}
		/>
	</View>
  );

}

export default Tapper;