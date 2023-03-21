import React from 'react';
import ReactDOM from 'react-dom';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './store.jsx';
import FileView from './FileView.jsx';

const rootDiv = document.getElementById('root');

const comp =
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className={'btn-padding'}>
      <button onClick={reloadComponent}>Reload Component</button>
    </div>
    <Provider store={store}>
      <FileView />
    </Provider>
  </div>;

const root = createRoot(rootDiv);
root.render(comp);

function reloadComponent() {
  ReactDOM.unmountComponentAtNode(rootDiv);
  // adding a slight delay so that reloading is noticeable!
  setTimeout(() => render(comp, rootDiv), 50);
}