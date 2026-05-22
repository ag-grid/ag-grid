/*
 * Used for umd bundles without styles
 */
import { ModuleRegistry, _setUmd } from 'ag-grid-community';

import { AllEnterpriseModule } from './main';

_setUmd();
ModuleRegistry.registerModules([AllEnterpriseModule]);
export * from './community-public';
export * from './main';
// Export the overridden createGrid function which automatically registers AG Charts modules if present
export { createGrid } from './main-umd-shared';
