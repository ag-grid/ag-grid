import { useColorScheme } from '@mui/joy';
import { useEffect, useLayoutEffect } from 'react';
import { RootContainer } from './RootContainer';

export const App = () => {
  // const { isDark } = useAtomValue(renderedThemeAtom);
  const isDark = false; // TODO restore
  const { setMode } = useColorScheme();

  useLayoutEffect(() => {
    const root = document.querySelector('html');
    if (root) {
      root.dataset.darkMode = isDark ? 'true' : 'false';
    }
  }, [isDark]);

  useEffect(() => {
    setMode(isDark ? 'dark' : 'light');
  }, [isDark, setMode]);

  return <RootContainer />;
};
