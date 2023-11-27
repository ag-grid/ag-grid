import { ModuleNames } from "@ag-grid-community/core";
import { GridLicenseManager as LicenseManager } from "./license/gridLicenseManager.mjs";
import { WatermarkComp } from "./license/watermark.mjs";
export { WatermarkComp } from "./license/watermark.mjs";
import { VERSION } from "./version.mjs";
export const EnterpriseCoreModule = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: WatermarkComp }
    ]
};
