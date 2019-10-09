import { Grid } from "ag-grid-community";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { RangeController } from "./rangeController";
import { EnterpriseBoot } from "./enterpriseBoot";
import { ContextMenuFactory } from "./menu/contextMenu";
import { SideBarComp } from "./sideBar/sideBarComp";
import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";
import { MenuItemMapper } from "./menu/menuItemMapper";
import { HorizontalResizeComp } from "./sideBar/horizontalResizeComp";
import { SideBarButtonsComp } from "./sideBar/sideBarButtonsComp";
import { StatusBarService } from "./statusBar/statusBarService";
import { StatusBar } from "./statusBar/statusBar";
import { NameValueComp } from "./statusBar/providedPanels/nameValueComp";
import { PrimaryColsHeaderPanel } from "./sideBar/providedPanels/columns/panels/primaryColsPanel/primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./sideBar/providedPanels/columns/panels/primaryColsPanel/primaryColsListPanel";
import { GridHeaderDropZones } from "./sideBar/providedPanels/columns/gridHeaderDropZones";
import { WatermarkComp } from "./license/watermark";
import { FillHandle } from "./widgets/selection/fillHandle";
import { RangeHandle } from "./widgets/selection/rangeHandle";
import { FiltersToolPanelHeaderPanel } from "./sideBar/providedPanels/filters/filtersToolPanelHeaderPanel";
import { FiltersToolPanelListPanel } from "./sideBar/providedPanels/filters/filtersToolPanelListPanel";
import { ToolPanelColDefService } from "./sideBar/providedPanels/toolPanelColDefService";

export { SetFilter } from "./setFilter/setFilter";
export { SetValueModel } from "./setFilter/setValueModel";
export { StatusBar } from "./statusBar/statusBar";
export { StatusBarService } from "./statusBar/statusBarService";
export { EnterpriseBoot } from "./enterpriseBoot";
export { EnterpriseMenu } from "./menu/enterpriseMenu";
export { MenuItemComponent } from "./menu/menuItemComponent";
export { MenuList } from "./menu/menuList";
export { RangeController } from "./rangeController";
export { RowGroupDropZonePanel } from "./sideBar/providedPanels/columns/panels/rowGroupDropZonePanel";
export { ContextMenuFactory } from "./menu/contextMenu";
export { RichSelectCellEditor } from "./rendering/richSelect/richSelectCellEditor";
export { RichSelectRow } from "./rendering/richSelect/richSelectRow";
export { VirtualList } from "./rendering/virtualList";
export { BaseDropZonePanel } from "./sideBar/providedPanels/columns/dropZone/baseDropZonePanel";
export { PivotDropZonePanel } from "./sideBar/providedPanels/columns/panels/pivotDropZonePanel";
export { SideBarComp } from "./sideBar/sideBarComp";
export { LicenseManager } from "./licenseManager";
export { PivotModePanel } from "./sideBar/providedPanels/columns/panels/pivotModePanel";
export { MD5 } from "./license/md5";
export { SetFilterListItem } from "./setFilter/setFilterListItem";
export { DropZoneColumnComp } from "./sideBar/providedPanels/columns/dropZone/dropZoneColumnComp";
export { ValuesDropZonePanel } from "./sideBar/providedPanels/columns/panels/valueDropZonePanel";
export { WatermarkComp } from "./license/watermark";
export { FillHandle } from "./widgets/selection/fillHandle";
export { RangeHandle } from "./widgets/selection/rangeHandle";
export { IColumnToolPanel } from "./sideBar/providedPanels/columns/columnToolPanel";
export { IFiltersToolPanel } from "./sideBar/providedPanels/filters/filtersToolPanel";

Grid.setEnterpriseBeans([EnterpriseMenuFactory, RangeController,
    ContextMenuFactory, EnterpriseBoot,
    LicenseManager, MD5, MenuItemMapper, StatusBarService, ToolPanelColDefService
]);

Grid.setEnterpriseAgStackComponents([
    {componentName: 'AgFiltersToolPanelHeader', theClass: FiltersToolPanelHeaderPanel},
    {componentName: 'AgFiltersToolPanelList', theClass: FiltersToolPanelListPanel},
    {componentName: 'AgPrimaryColsHeader', theClass: PrimaryColsHeaderPanel},
    {componentName: 'AgPrimaryColsList', theClass: PrimaryColsListPanel},
    {componentName: 'AgHorizontalResize', theClass: HorizontalResizeComp},
    {componentName: 'AgSideBar', theClass: SideBarComp},
    {componentName: 'AgStatusBar', theClass: StatusBar},
    {componentName: 'AgNameValue', theClass: NameValueComp},
    {componentName: 'AgGridHeaderDropZones', theClass: GridHeaderDropZones},
    {componentName: 'AgSideBarButtons', theClass: SideBarButtonsComp},
    {componentName: 'AgWatermark', theClass: WatermarkComp},
    {componentName: 'AgFillHandle', theClass: FillHandle},
    {componentName: 'AgRangeHandle', theClass: RangeHandle}
]);

// include enterprise modules
import "./modules/viewportRowModelModule";
import "./modules/serverSideRowModelModule";
import "./modules/rowGroupingModule";
import "./modules/excelExportModule";
import "./modules/clipboardModule";
