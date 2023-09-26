import { App, ThemeBuilderAppProps } from 'features/app/App';
import { Provider } from 'jotai';

export const ThemeBuilder = (props: ThemeBuilderAppProps) => {
  return (
    <Provider>
      <App {...props} />
    </Provider>
  );
};
