import { Provider, createStore } from 'jotai';
import { useMemo } from 'react';
import { RootContainer } from './components/general/RootContainer';
import { rerenderTheme } from './model/rendered-theme';

export const ThemeBuilder = () => {
  const store = useMemo(createStore, []);

  (window as any).handlePartsCssChange = () => {
    rerenderTheme(store);
  };

  return (
    <Provider store={store}>
      <RootContainer />
    </Provider>
  );
};
