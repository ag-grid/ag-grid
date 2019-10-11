import { Grid } from "ag-grid-community";
import { EnterpriseBoot } from "./enterpriseBoot";
import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";
import { WatermarkComp } from "./license/watermark";

export { EnterpriseBoot } from "./enterpriseBoot";
export { RichSelectCellEditor } from "./rendering/richSelect/richSelectCellEditor";
export { RichSelectRow } from "./rendering/richSelect/richSelectRow";
export { VirtualList } from "./rendering/virtualList";
export { LicenseManager } from "./licenseManager";
export { MD5 } from "./license/md5";
export { WatermarkComp } from "./license/watermark";

Grid.setEnterpriseBeans([EnterpriseBoot, LicenseManager, MD5]);

Grid.setEnterpriseAgStackComponents([
    {componentName: 'AgWatermark', componentClass: WatermarkComp}
]);
