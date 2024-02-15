import { CssBaseline, CssVarsProvider, extendTheme } from '@mui/joy';
import { Provider, createStore } from 'jotai';
import { useMemo } from 'react';
import { App } from './components/App';

const theme = extendTheme({
  components: {
    JoyStack: {
      defaultProps: {
        useFlexGap: true,
        gap: 1,
      },
    },
    JoyMenuButton: {
      defaultProps: {
        sx: { gap: 1 },
      },
    },
    JoyTooltip: {
      defaultProps: {
        slotProps: {
          root: {
            sx: { maxWidth: '350px' },
          } as any,
        },
        arrow: true,
      },
    },
  },
  fontFamily: {
    display: 'IBM Plex Sans', // applies to `h1`–`h4`
    body: 'IBM Plex Sans', // applies to `title-*` and `body-*`
  },
});

export const ThemeBuilder = () => {
  const store = useMemo(createStore, []);
  // const { isDark } = useAtomValue(renderedThemeAtom);
  const isDark = false; // TODO restore
  return (
    <Provider store={store}>
      <CssVarsProvider theme={theme} defaultMode={isDark ? 'dark' : 'light'}>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </Provider>
  );
};
