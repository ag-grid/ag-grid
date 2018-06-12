import {Grid} from "ag-grid/main";
import {EnterpriseMenuFactory} from "./menu/enterpriseMenu";
import {RangeController} from "./rangeController";
import {ClipboardService} from "./clipboardService";
import {GroupStage} from "./rowStages/groupStage";
import {AggregationStage} from "./rowStages/aggregationStage";
import {EnterpriseBoot} from "./enterpriseBoot";
import {StatusBar} from "./statusBar/statusBar";
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
import {ExcelCreator} from "./excelCreator";
import {ExcelXmlFactory} from "./excelXmlFactory";
import {ServerSideRowModel} from "./rowModels/serverSide/serverSideRowModel";
import {ColumnSelectHeaderComp} from "./toolPanel/columnsSelect/columnSelectHeaderComp";
import {ColumnContainerComp} from "./toolPanel/columnsSelect/columnContainerComp";
import {HorizontalResizeComp} from "./toolPanel/columnsSelect/horizontalResizeComp";
import {HeaderColumnDropComp} from "./toolPanel/columnDrop/headerColumnDropComp";
import {ToolPanelColumnComp} from "./toolPanel/toolPanelColumnComp";
import {ToolPanelSelectComp} from "./toolPanel/toolPanelSelectComp";

let rowModelTypes = {viewport: ViewportRowModel, serverSide: ServerSideRowModel};

Grid.setEnterpriseBeans([EnterpriseMenuFactory, ExcelCreator, ExcelXmlFactory, RowGroupCompFactory, PivotCompFactory,
    PivotColumnsPanel, RangeController, ClipboardService, PivotStage, PivotColDefService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot, AggFuncService,
    LicenseManager, MD5, MenuItemMapper], rowModelTypes);

Grid.setEnterpriseComponents([
    {componentName: 'AgColumnSelectHeader', theClass: ColumnSelectHeaderComp},
    {componentName: 'AgColumnContainer', theClass: ColumnContainerComp},
    {componentName: 'AgHorizontalResize', theClass: HorizontalResizeComp},
    {componentName: 'AgToolPanel', theClass: ToolPanelComp},
    {componentName: 'AgStatusBar', theClass: StatusBar},
    {componentName: 'AgHeaderColumnDrop', theClass: HeaderColumnDropComp},
    {componentName: 'AgToolPanelColumnComp', theClass: ToolPanelColumnComp},
    {componentName: 'AgToolPanelSelectComp', theClass: ToolPanelSelectComp},
]);
