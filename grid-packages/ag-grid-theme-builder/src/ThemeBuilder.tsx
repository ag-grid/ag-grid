import { initStore } from 'atoms/store';
import { App, ThemeBuilderAppProps } from 'components/App';
import { Provider } from 'jotai';
import { useMemo } from 'react';

export const ThemeBuilder = (props: ThemeBuilderAppProps) => {
  const store = useMemo(initStore, []);
  return (
    <Provider store={store}>
      <App {...props} />
    </Provider>
  );
};
