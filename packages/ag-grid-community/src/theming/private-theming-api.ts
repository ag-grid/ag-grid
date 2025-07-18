import { coreCSS as oldCoreCss } from './core/core.css-GENERATED';
import { sharedCSS } from './core/shared.css-GENERATED';

// This file contains types and utilities required by Theme Builder but not part
// of the public Theming API

export * from './theme-types';
export const coreCSS = oldCoreCss + sharedCSS;
export { getParamDocs } from './param-docs';
