import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';

import { GridLicenseManager as LicenseManager } from './license/gridLicenseManager';
import { AgWatermarkClass } from './license/watermark';
import { VERSION } from './version';
import { AgMenuItemRenderer } from './widgets/agMenuItemRenderer';

export { AgWatermark } from './license/watermark';

export const EnterpriseCoreModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [AgWatermarkClass],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
};
