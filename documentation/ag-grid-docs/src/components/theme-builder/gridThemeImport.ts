import { type Palette, fromThemePalette } from '@ag-website-shared/components/theme-builder/palette';
import { type ThemeCodeExtension, validateThemeCode } from '@ag-website-shared/components/theme-builder/themeImport';

import { applyGridPreset } from './presets';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value != null && !Array.isArray(value);

const chartThemeOptions: ThemeCodeExtension<Palette> = {
    key: 'customChartThemes',
    read: (customChartThemes) =>
        isPlainObject(customChartThemes)
            ? fromThemePalette(Object.values(customChartThemes).find(isPlainObject)?.palette)
            : undefined,
    apply: (store, preset, chartPalette) => applyGridPreset(store, { ...preset, chartPalette }),
    describe: () => 'a chart palette',
};

/** Grid theme code, optionally followed by the exported chart theme options. */
export const validateGridThemeCode = (code: string) => validateThemeCode(code, chartThemeOptions);
