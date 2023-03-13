import React from 'react';
import { createRoot } from 'react-dom/client';
import {Provider} from 'react-redux';

import store from './store.jsx';
import FileBrowser from './FileBrowser.jsx';

render(
  <Provider store={store}>
    <FileBrowser/>
  </Provider>,
  document.getElementById('root')
);