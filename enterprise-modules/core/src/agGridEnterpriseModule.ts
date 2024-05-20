import { Module, ModuleNames } from '@ag-grid-community/core';

import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { AgWatermark } from './license/watermark';
import { VERSION } from './version';

export { AgWatermark as WatermarkComp } from './license/watermark';

export const EnterpriseCoreModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [AgWatermark],
};
