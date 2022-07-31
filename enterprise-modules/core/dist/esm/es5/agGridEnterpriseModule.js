import { ModuleNames } from "@ag-grid-community/core";
import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";
import { WatermarkComp } from "./license/watermark";
export { LicenseManager } from "./licenseManager";
export { MD5 } from "./license/md5";
export { WatermarkComp } from "./license/watermark";
export var EnterpriseCoreModule = {
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager, MD5],
    agStackComponents: [
        { componentName: 'AgWatermark', componentClass: WatermarkComp }
    ]
};
