import { sharedCSS } from '../agStack/theming/shared/shared.css-GENERATED';
import { _addAdditionalCss } from '../environment';
import { _getAllRegisteredModules } from '../modules/moduleRegistry';
import { coreCSS as oldCoreCss } from './core/core.css-GENERATED';

// This file contains types and utilities required by Theme Builder but not part
// of the public Theming API

export * from '../agStack/theming/themeTypes';
export * from '../agStack/theming/themeTypeUtils';
export const coreCSS = oldCoreCss + sharedCSS;
export { getParamDocs } from './param-docs';
export { gridThemeLogger } from './createTheme';

export function getAdditionalCss(): Map<string, string[]> {
    const additionalCss: Map<string, string[]> = new Map();
    additionalCss.set('core', [oldCoreCss]);
    _addAdditionalCss(additionalCss, Array.from(_getAllRegisteredModules()));
    return additionalCss;
}
