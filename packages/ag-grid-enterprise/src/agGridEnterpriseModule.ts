import type { _ModuleWithLicenseManager, _ModuleWithoutApi } from 'ag-grid-community';

import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { VERSION } from './version';

/**
 * @internal
 */
export const EnterpriseCoreModule: _ModuleWithoutApi & _ModuleWithLicenseManager = {
    moduleName: 'EnterpriseCore',
    version: VERSION,
    beans: [LicenseManager],
    dependsOn: [],
    setLicenseKey: LicenseManager.setLicenseKey,
};
