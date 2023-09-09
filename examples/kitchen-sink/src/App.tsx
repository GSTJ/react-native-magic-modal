import React, {useEffect} from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MagicModalPortal, magicModal } from '@magic/react-native-magic-modal';
import { ExampleModal } from './components/ExampleModal/ExampleModal';

export default function App() {
  useEffect(() => {
    const showModal = async () => {
      console.log('opening modal');

      const modalResponse = await magicModal.show(() => <ExampleModal />);

      console.log('modal closed with response:', modalResponse);
    };

    showModal();
  }, []);

  return (
    <View style={styles.container}>
      <MagicModalPortal />
      <TouchableOpacity
        style={styles.button}
        onPress={() => magicModal.show(() => <ExampleModal />)}
      >
        <Text style={styles.buttonText}>Press me!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
