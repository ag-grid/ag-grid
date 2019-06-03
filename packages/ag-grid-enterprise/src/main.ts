import { Grid } from "ag-grid-community";
import { EnterpriseMenuFactory } from "./menu/enterpriseMenu";
import { RangeController } from "./rangeController";
import { ClipboardService } from "./clipboardService";
import { GroupStage } from "./rowStages/groupStage";
import { AggregationStage } from "./rowStages/aggregationStage";
import { EnterpriseBoot } from "./enterpriseBoot";
import { ContextMenuFactory } from "./menu/contextMenu";
import { ViewportRowModel } from "./rowModels/viewport/viewportRowModel";
import { SideBarComp } from "./sideBar/sideBarComp";
import { LicenseManager } from "./licenseManager";
import { MD5 } from "./license/md5";
import { PivotStage } from "./rowStages/pivotStage";
import { PivotColDefService } from "./rowStages/pivotColDefService";
import { AggFuncService } from "./aggregation/aggFuncService";
import { MenuItemMapper } from "./menu/menuItemMapper";
import { ExcelCreator } from "./exporter/excelCreator";
import { ExcelXmlFactory } from "./exporter/excelXmlFactory";
import { ExcelXlsxFactory } from "./exporter/excelXlsxFactory";
import { ServerSideRowModel } from "./rowModels/serverSide/serverSideRowModel";
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

export { AggregationStage } from "./rowStages/aggregationStage";
export { GroupStage } from "./rowStages/groupStage";
export { SetFilter } from "./setFilter/setFilter";
export { SetValueModel } from "./setFilter/setValueModel";
export { StatusBar } from "./statusBar/statusBar";
export { StatusBarService } from "./statusBar/statusBarService";
export { ClipboardService } from "./clipboardService";
export { EnterpriseBoot } from "./enterpriseBoot";
export { EnterpriseMenu } from "./menu/enterpriseMenu";
export { MenuItemComponent } from "./menu/menuItemComponent";
export { MenuList } from "./menu/menuList";
export { RangeController } from "./rangeController";
export { RowGroupDropZonePanel } from "./sideBar/providedPanels/columns/panels/rowGroupDropZonePanel";
export { ContextMenuFactory } from "./menu/contextMenu";
export { ViewportRowModel } from "./rowModels/viewport/viewportRowModel";
export { RichSelectCellEditor } from "./rendering/richSelect/richSelectCellEditor";
export { RichSelectRow } from "./rendering/richSelect/richSelectRow";
export { VirtualList } from "./rendering/virtualList";
export { BaseDropZonePanel } from "./sideBar/providedPanels/columns/dropZone/baseDropZonePanel";
export { PivotDropZonePanel } from "./sideBar/providedPanels/columns/panels/pivotDropZonePanel";
export { SideBarComp } from "./sideBar/sideBarComp";
export { LicenseManager } from "./licenseManager";
export { PivotStage } from "./rowStages/pivotStage";
export { PivotColDefService } from "./rowStages/pivotColDefService";
export { PivotModePanel } from "./sideBar/providedPanels/columns/panels/pivotModePanel";
export { AggFuncService } from "./aggregation/aggFuncService";
export { MD5 } from "./license/md5";
export { SetFilterListItem } from "./setFilter/setFilterListItem";
export { DropZoneColumnComp } from "./sideBar/providedPanels/columns/dropZone/dropZoneColumnComp";
export { ValuesDropZonePanel } from "./sideBar/providedPanels/columns/panels/valueDropZonePanel";
export { ExcelCreator } from "./exporter/excelCreator";
export { ExcelXmlFactory } from "./exporter/excelXmlFactory";
export { ExcelXlsxFactory } from "./exporter/excelXlsxFactory";
export { WatermarkComp } from "./license/watermark";
export { FillHandle } from "./widgets/selection/fillHandle";
export { RangeHandle } from "./widgets/selection/rangeHandle";

const rowModelTypes = {viewport: ViewportRowModel, serverSide: ServerSideRowModel};

Grid.setEnterpriseBeans([EnterpriseMenuFactory, ExcelCreator, ExcelXmlFactory, ExcelXlsxFactory,
    RangeController, ClipboardService, PivotStage, PivotColDefService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot, AggFuncService, LicenseManager, MD5,
    MenuItemMapper, StatusBarService], rowModelTypes);

Grid.setEnterpriseComponents([
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
