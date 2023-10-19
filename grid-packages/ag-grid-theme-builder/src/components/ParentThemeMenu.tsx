import { useParentTheme, useSetParentTheme } from 'atoms/parentTheme';
import { allThemes, getThemeOrThrow } from 'model/themes';
import { kebabCaseToTitleCase } from 'model/utils';
import { useLayoutEffect } from 'react';

export const ParentThemeMenu = () => {
  const parentTheme = useParentTheme();
  const setParentTheme = useSetParentTheme();

  useLayoutEffect(() => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
      htmlElement.classList.add('no-transitions');
      htmlElement.dataset.darkMode = parentTheme.name.includes('-dark') ? 'true' : 'false';
      htmlElement.offsetHeight; // Trigger a reflow, flushing the CSS changes
      htmlElement.classList.remove('no-transitions');
    }
  });

  return (
    <select
      value={parentTheme.name}
      onChange={(e) => setParentTheme(getThemeOrThrow(e.target.value))}
    >
      {allThemes.map((theme) => (
        <option key={theme.name} value={theme.name}>
          {kebabCaseToTitleCase(theme.name, 'ag-theme-')}
        </option>
      ))}
    </select>
  );
};
