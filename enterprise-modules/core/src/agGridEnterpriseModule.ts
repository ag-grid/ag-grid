import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';

import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { AgWatermark } from './license/watermark';
import { VERSION } from './version';
import { AgMenuItemRenderer } from './widgets/agMenuItemRenderer';

export { AgWatermark } from './license/watermark';

export const EnterpriseCoreModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [AgWatermark],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
};
