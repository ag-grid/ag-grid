/*
 * Used for umd bundles with styles
 */
// Each ag-theme-*.css is its font CSS followed by its -no-font CSS, so importing it alone avoids
// shipping the same rules and embedded font twice.
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@ag-grid-community/styles/ag-theme-balham.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import '@ag-grid-community/styles/agGridClassicFont.css';

import { AllCommunityModule, ModuleRegistry, _setUmd } from './main';

_setUmd();
ModuleRegistry.registerModules([AllCommunityModule]);

export * from './main';
