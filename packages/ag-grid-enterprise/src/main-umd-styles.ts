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

import { ModuleRegistry, _setUmd } from 'ag-grid-community';

import { AllEnterpriseModule } from './main';

_setUmd();
ModuleRegistry.registerModules([AllEnterpriseModule]);

export * from 'ag-grid-community';
export * from './main';
// Export the overridden createGrid function which automatically registers AG Charts modules if present
export { createGrid } from './main-umd-shared';
