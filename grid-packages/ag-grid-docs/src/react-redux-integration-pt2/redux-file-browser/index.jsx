import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import store from './store.jsx';
import FileBrowser from './FileBrowser.jsx';

render(
  <Provider store={store}>
    <FileBrowser/>
  </Provider>,
  document.getElementById('root')
);