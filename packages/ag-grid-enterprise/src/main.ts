import { Grid } from "ag-grid-community";
import { RangeController } from "./rangeController";
import { EnterpriseBoot } from "./enterpriseBoot";
import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";
import { StatusBarService } from "./statusBar/statusBarService";
import { StatusBar } from "./statusBar/statusBar";
import { NameValueComp } from "./statusBar/providedPanels/nameValueComp";
import { WatermarkComp } from "./license/watermark";
import { FillHandle } from "./widgets/selection/fillHandle";
import { RangeHandle } from "./widgets/selection/rangeHandle";
import { ToolPanelColDefService } from "./common/toolPanelColDefService";

export { StatusBar } from "./statusBar/statusBar";
export { StatusBarService } from "./statusBar/statusBarService";
export { EnterpriseBoot } from "./enterpriseBoot";
export { RangeController } from "./rangeController";
export { RichSelectCellEditor } from "./rendering/richSelect/richSelectCellEditor";
export { RichSelectRow } from "./rendering/richSelect/richSelectRow";
export { VirtualList } from "./rendering/virtualList";
export { LicenseManager } from "./licenseManager";
export { MD5 } from "./license/md5";
export { WatermarkComp } from "./license/watermark";
export { FillHandle } from "./widgets/selection/fillHandle";
export { RangeHandle } from "./widgets/selection/rangeHandle";

Grid.setEnterpriseBeans([RangeController, EnterpriseBoot,
    LicenseManager, MD5, StatusBarService, ToolPanelColDefService
]);

Grid.setEnterpriseAgStackComponents([
    {componentName: 'AgStatusBar', componentClass: StatusBar},
    {componentName: 'AgNameValue', componentClass: NameValueComp},
    {componentName: 'AgWatermark', componentClass: WatermarkComp},
    {componentName: 'AgFillHandle', componentClass: FillHandle},
    {componentName: 'AgRangeHandle', componentClass: RangeHandle}
]);
