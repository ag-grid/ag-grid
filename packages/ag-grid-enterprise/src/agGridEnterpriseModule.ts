import type { _ModuleWithoutApi } from 'ag-grid-community';

import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { baseEnterpriseModule } from './moduleUtils';

export { AgWatermark } from './license/watermark';

export const EnterpriseCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('EnterpriseCoreModule'),
    beans: [LicenseManager],
    dependsOn: [],
};
