import React from 'react';
import ReactDOM, {render} from 'react-dom';
import {Provider} from 'react-redux';

import store from './store.jsx';
import FileView from './FileView.jsx';

const rootDiv = document.getElementById('root');

const comp =
  <div>
    <div className={'btn-padding'}>
    <button onClick={reloadComponent}>Reload Component</button>
    </div>
    <Provider store={store}>
      <FileView/>
    </Provider>
  </div>;

render(comp, rootDiv);

function reloadComponent() {
  ReactDOM.unmountComponentAtNode(rootDiv);
  // adding a slight delay so that reloading is noticeable!
  setTimeout(() => render(comp, rootDiv), 50);
}