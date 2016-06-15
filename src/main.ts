import {Grid} from "ag-grid/main";
import {EnterpriseMenuFactory} from "./enterpriseMenu";
import {ColumnSelectPanel} from "./toolPanel/columnsSelect/columnSelectPanel";
import {RangeController} from "./rangeController";
import {ClipboardService} from "./clipboardService";
import {GroupStage} from "./rowStages/groupStage";
import {AggregationStage} from "./rowStages/aggregationStage";
import {EnterpriseBoot} from "./enterpriseBoot";
import {StatusBar} from "./statusBar/statusBar";
import {ContextMenuFactory} from "./contextMenu";
import {ViewportRowModel} from "./viewport/viewportRowModel";
import {PivotColumnsPanel} from "./toolPanel/columnDrop/pivotColumnsPanel";
import {ToolPanelComp} from "./toolPanel/toolPanelComp";
import {RowGroupCompFactory} from "./rowGroupCompFactory";
import {LicenseManager} from "./licenseManager";
import {MD5} from "./license/md5";

var rowModelTypes = {viewport: ViewportRowModel};

Grid.setEnterpriseBeans([ToolPanelComp, EnterpriseMenuFactory, RowGroupCompFactory,
    PivotColumnsPanel, RangeController, ClipboardService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot,
    StatusBar, LicenseManager, MD5], rowModelTypes);
