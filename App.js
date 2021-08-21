import React from 'react';
import Providers from './src/routes';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { LogBox } from 'react-native';


export default function App() {

  LogBox.ignoreAllLogs();
  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.dark}>
        <Providers />
      </ApplicationProvider>
    </React.Fragment>

  );
}



