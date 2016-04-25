import {Grid} from 'ag-grid/main';
import {ToolPanel} from "./toolPanel";
import {EnterpriseMenuFactory} from "./enterpriseMenu";
import {RowGroupPanel} from "./rowGroupPanel";
import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";
import {RangeController} from "./rangeController";
import {ClipboardService} from "./clipboardService";
import {GroupStage} from "./rowStages/groupStage";
import {AggregationStage} from "./rowStages/aggregationStage";
import {EnterpriseBoot} from "./enterpriseBoot";
import {StatusBar} from "./statusBar/statusBar";
import {ContextMenuFactory} from "./contextMenu";
import {ViewportRowModel} from "./viewport/viewportRowModel";

var rowModelTypes = {viewport: ViewportRowModel};

Grid.setEnterpriseBeans([ToolPanel, EnterpriseMenuFactory, RowGroupPanel,
    ColumnSelectPanel, RangeController, ClipboardService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot,
    StatusBar], rowModelTypes);
