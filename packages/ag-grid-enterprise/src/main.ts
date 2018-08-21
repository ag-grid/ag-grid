import {ToolPanelAllFiltersComp} from "./toolPanel/filter/toolPanelAllFiltersComp";

export {ColumnSelectComp} from "./toolPanel/columnsSelect/columnSelectComp";
export {ToolPanelColumnComp} from "./toolPanel/columnsSelect/toolPanelColumnComp";
export {ToolPanelGroupComp} from "./toolPanel/columnsSelect/toolPanelGroupComp";
export {AggregationStage} from "./rowStages/aggregationStage";
export {GroupStage} from "./rowStages/groupStage";
export {SetFilter} from "./setFilter/setFilter";
export {SetFilterModel} from "./setFilter/setFilterModel";
export {StatusBarComp} from "./statusBar/statusBarComp";
export {StatusBarService} from "./statusBar/statusBarService";
export {ClipboardService} from "./clipboardService";
export {EnterpriseBoot} from "./enterpriseBoot";
export {EnterpriseMenu} from "./menu/enterpriseMenu";
export {MenuItemComponent} from "./menu/menuItemComponent";
export {MenuList} from "./menu/menuList";
export {RangeController} from "./rangeController";
export {RowGroupColumnsPanel} from "./toolPanel/columnDrop/rowGroupColumnsPanel";
export {ContextMenuFactory} from "./menu/contextMenu";
export {ViewportRowModel} from "./rowModels/viewport/viewportRowModel";
export {RichSelectCellEditor} from "./rendering/richSelect/richSelectCellEditor";
export {RichSelectRow} from "./rendering/richSelect/richSelectRow";
export {VirtualList} from "./rendering/virtualList";
export {AbstractColumnDropPanel} from "./toolPanel/columnDrop/abstractColumnDropPanel";
export {PivotColumnsPanel} from "./toolPanel/columnDrop/pivotColumnsPanel";
export {ToolPanelComp} from "./toolPanel/toolPanelComp";
export {LicenseManager} from "./licenseManager";
export {PivotStage} from "./rowStages/pivotStage";
export {PivotColDefService} from "./rowStages/pivotColDefService";
export {PivotModePanel} from "./toolPanel/columnDrop/pivotModePanel";
export {AggFuncService} from "./aggregation/aggFuncService";
export {MD5} from "./license/md5";
export {SetFilterListItem} from "./setFilter/setFilterListItem";
export {ColumnComponent} from "./toolPanel/columnDrop/columnComponent";
export {ValuesColumnPanel} from "./toolPanel/columnDrop/valueColumnsPanel";
export {PivotCompFactory} from "./pivotCompFactory";
export {RowGroupCompFactory} from "./rowGroupCompFactory";
export {ExcelCreator} from "./exporter/excelCreator";
export {ExcelXmlFactory} from "./exporter/excelXmlFactory";

import {Grid} from "ag-grid";
import {EnterpriseMenuFactory} from "./menu/enterpriseMenu";
import {RangeController} from "./rangeController";
import {ClipboardService} from "./clipboardService";
import {GroupStage} from "./rowStages/groupStage";
import {AggregationStage} from "./rowStages/aggregationStage";
import {EnterpriseBoot} from "./enterpriseBoot";
import {ContextMenuFactory} from "./menu/contextMenu";
import {ViewportRowModel} from "./rowModels/viewport/viewportRowModel";
import {PivotColumnsPanel} from "./toolPanel/columnDrop/pivotColumnsPanel";
import {ToolPanelComp} from "./toolPanel/toolPanelComp";
import {RowGroupCompFactory} from "./rowGroupCompFactory";
import {LicenseManager} from "./licenseManager";
import {MD5} from "./license/md5";
import {PivotStage} from "./rowStages/pivotStage";
import {PivotColDefService} from "./rowStages/pivotColDefService";
import {AggFuncService} from "./aggregation/aggFuncService";
import {PivotCompFactory} from "./pivotCompFactory";
import {MenuItemMapper} from "./menu/menuItemMapper";
import {ExcelCreator} from "./exporter/excelCreator";
import {ExcelXmlFactory} from "./exporter/excelXmlFactory";
import {ServerSideRowModel} from "./rowModels/serverSide/serverSideRowModel";
import {ColumnSelectHeaderComp} from "./toolPanel/columnsSelect/columnSelectHeaderComp";
import {ColumnContainerComp} from "./toolPanel/columnsSelect/columnContainerComp";
import {HorizontalResizeComp} from "./toolPanel/columnsSelect/horizontalResizeComp";
import {HeaderColumnDropComp} from "./toolPanel/columnDrop/headerColumnDropComp";
import {ToolPanelColumnComp} from "./toolPanel/toolPanelColumnComp";
import {ToolPanelSelectComp} from "./toolPanel/toolPanelSelectComp";

import {StatusBarService} from "./statusBar/statusBarService";
import {StatusBarComp} from "./statusBar/statusBarComp";
import {AggregationComponent} from "./statusBar/aggregationComponent"
import {StatusBarValueComponent} from "./statusBar/statusBarValueComponent";
import {SelectedRowCountComponent} from "./statusBar/selectedRowCountComponent"
import {TotalRowCountComponent} from "./statusBar/totalRowCountComponent"
import {FilteredRowCountComponent} from "./statusBar/filteredRowCountComponent"
import {TotalAndFilteredRowCountComponent} from "./statusBar/totalAndFilteredRowCountComponent"

let rowModelTypes = {viewport: ViewportRowModel, serverSide: ServerSideRowModel};

Grid.setEnterpriseBeans([EnterpriseMenuFactory, ExcelCreator, ExcelXmlFactory, RowGroupCompFactory, PivotCompFactory,
    PivotColumnsPanel, RangeController, ClipboardService, PivotStage, PivotColDefService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot, AggFuncService,
    LicenseManager, MD5, MenuItemMapper, StatusBarService], rowModelTypes);

Grid.setEnterpriseComponents([
    {componentName: 'AgColumnSelectHeader', theClass: ColumnSelectHeaderComp},
    {componentName: 'AgColumnContainer', theClass: ColumnContainerComp},
    {componentName: 'AgHorizontalResize', theClass: HorizontalResizeComp},
    {componentName: 'AgToolPanel', theClass: ToolPanelComp},

    {componentName: 'AgStatusBar', theClass: StatusBarComp},
    {componentName: 'AgSumAggregationComp', theClass: StatusBarValueComponent},
    {componentName: 'AgCountAggregationComp', theClass: StatusBarValueComponent},
    {componentName: 'AgMinAggregationComp', theClass: StatusBarValueComponent},
    {componentName: 'AgMaxAggregationComp', theClass: StatusBarValueComponent},
    {componentName: 'AgAvgAggregationComp', theClass: StatusBarValueComponent},
    {componentName: 'AgSelectedRowCountComp', theClass: StatusBarValueComponent},

    {componentName: 'AgHeaderColumnDrop', theClass: HeaderColumnDropComp},
    {componentName: 'AgToolPanelColumnComp', theClass: ToolPanelColumnComp},
    {componentName: 'AgToolPanelAllFiltersComp', theClass: ToolPanelAllFiltersComp},
    {componentName: 'AgToolPanelSelectComp', theClass: ToolPanelSelectComp},
]);

Grid.setEnterpriseDefaultComponents([
    {componentName: 'agAggregationComponent', theClass: AggregationComponent},
    {componentName: 'agSelectedRowCountComponent', theClass: SelectedRowCountComponent},
    {componentName: 'agTotalRowCountComponent', theClass: TotalRowCountComponent},
    {componentName: 'agFilteredRowCountComponent', theClass: FilteredRowCountComponent},
    {componentName: 'agTotalAndFilteredRowCountComponent', theClass: TotalAndFilteredRowCountComponent}
]);