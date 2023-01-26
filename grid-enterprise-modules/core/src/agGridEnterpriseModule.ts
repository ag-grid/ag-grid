import { Module, ModuleNames } from "@ag-grid-community/core";
import { GridLicenseManager as LicenseManager } from "./license/gridLicenseManager";
import { WatermarkComp } from "./license/watermark";

export { WatermarkComp } from "./license/watermark";
import { VERSION } from "./version";

export const EnterpriseCoreModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: WatermarkComp }
    ]
};
