import { useColorScheme, useSetColorScheme } from 'atoms/colorScheme';
import { useParentTheme } from 'atoms/parentTheme';
import { kebabCaseToTitleCase } from 'model/utils';
import { useLayoutEffect } from 'react';

export const ColorSchemeMenu = () => {
  const parentTheme = useParentTheme();
  const colorScheme = useColorScheme() || '';
  const setColorScheme = useSetColorScheme();

  useLayoutEffect(() => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      htmlElement.classList.add('no-transitions');
      htmlElement.dataset.darkMode = parentTheme.name.includes('-dark') ? 'true' : 'false';
      if (colorScheme === 'auto') {
        delete htmlElement.dataset.darkMode;
      } else {
        htmlElement.dataset.darkMode = /dark/i.test(colorScheme) ? 'true' : 'false';
      }
      // TODO remove when this branch drops the design system
      htmlElement.offsetHeight; // Trigger a reflow, flushing the CSS changes
      htmlElement.classList.remove('no-transitions');
    }
  }, [colorScheme, parentTheme.name]);

  return (
    <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
      {parentTheme.colorSchemes.map((colorScheme) => (
        <option key={colorScheme} value={colorScheme}>
          {kebabCaseToTitleCase(colorScheme)}
        </option>
      ))}
    </select>
  );
};
