import { sharedCSS } from '../agStack/theming/shared/shared.css-GENERATED';
import { coreCSS as oldCoreCss } from './core/core.css-GENERATED';

// This file contains types and utilities required by Theme Builder but not part
// of the public Theming API

export * from '../agStack/theming/themeTypes';
export * from '../agStack/theming/themeTypeUtils';
export const coreCSS = oldCoreCss + sharedCSS;
export { getParamDocs } from './param-docs';
