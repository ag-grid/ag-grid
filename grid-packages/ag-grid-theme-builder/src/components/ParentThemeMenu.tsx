import { useParentTheme, useSetParentTheme } from 'atoms/parentTheme';
import { allThemes, getThemeOrThrow } from 'model/themes';
import { kebabCaseToTitleCase } from 'model/utils';

export const ParentThemeMenu = () => {
  const parentTheme = useParentTheme();
  const setParentTheme = useSetParentTheme();

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
