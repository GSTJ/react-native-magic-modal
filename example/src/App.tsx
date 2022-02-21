import * as React from 'react';

import { MagicModalPortal, magicModal } from 'react-native-magic-modal';
import { ExampleModal } from './components/ExampleModal/ExampleModal';

export default function App() {
  React.useEffect(() => {
    setTimeout(async () => {
      console.log('opening modal');
      const modalResponse = await magicModal.show(() => <ExampleModal />);
      console.log('modal closed with response:', modalResponse);
    }, 1000);
  }, []);

  return <MagicModalPortal />;
}
