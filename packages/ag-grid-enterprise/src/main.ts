import {Grid, Module, ModuleNames} from "ag-grid-community";
import {LicenseManager} from "./licenseManager";
import {MD5} from "./license/md5";
import {WatermarkComp} from "./license/watermark";

export { LicenseManager } from "./licenseManager";
export { MD5 } from "./license/md5";
export { WatermarkComp } from "./license/watermark";

export const EnterpriseCoreModule: Module = {
    moduleName: ModuleNames.EnterpriseCoreModule,
    beans: [LicenseManager, MD5],
    agStackComponents: [
        {componentName: 'AgWatermark', componentClass: WatermarkComp}
    ]
};

Grid.addModule([EnterpriseCoreModule]);

/*
Grid.setEnterpriseBeans([LicenseManager, MD5]);

Grid.setEnterpriseAgStackComponents([
    {componentName: 'AgWatermark', componentClass: WatermarkComp}
]);
*/
