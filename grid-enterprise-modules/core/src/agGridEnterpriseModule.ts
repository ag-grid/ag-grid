import { Module, ModuleNames } from "@ag-grid-community/core";
import { LicenseManager } from "@ag/license";
import { WatermarkComp } from "./license/watermark";

export { LicenseManager } from "@ag/license";
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
