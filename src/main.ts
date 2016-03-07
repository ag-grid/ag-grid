import {Grid} from 'ag-grid/main';
import {ToolPanel} from "./toolPanel";
import {EnterpriseMenuFactory} from "./enterpriseMenu";
import {RowGroupPanel} from "./rowGroupPanel";
import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";
import {RangeController} from "./rangeController";
import {ClipboardService} from "./clipboardService";
import {ContextMenuFactory} from "./cContextMenu";
import {GroupStage} from "./rowStages/groupStage";
import {AggregationStage} from "./rowStages/aggregationStage";
import {EnterpriseBoot} from "./enterpriseBoot";
import {StatusBar} from "./statusBar/statusBar";

Grid.setEnterpriseBeans([ToolPanel, EnterpriseMenuFactory, RowGroupPanel,
    ColumnSelectPanel, RangeController, ClipboardService,
    ContextMenuFactory, GroupStage, AggregationStage, EnterpriseBoot,
    StatusBar]);
