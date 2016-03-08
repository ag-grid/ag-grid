import {ColumnSelectPanel} from "./columnSelect/columnSelectPanel";
import {RenderedColumn} from "./columnSelect/renderedColumn";
import {RenderedGroup} from "./columnSelect/renderedGroup";
import {AggregationStage} from "./rowStages/aggregationStage";
import {GroupStage} from "./rowStages/groupStage";
import {SetFilter} from "./setFilter/setFilter";
import {SetFilterModel} from "./setFilter/setFilterModel";
import {StatusBar} from "./statusBar/statusBar";
import {StatusItem} from "./statusBar/statusItem";
import {ContextMenuFactory} from "./cContextMenu";
import {ClipboardService} from "./clipboardService";
import {EnterpriseBoot} from "./enterpriseBoot";
import {EnterpriseMenu} from "./enterpriseMenu";
import {RangeController} from "./rangeController";
import {RowGroupPanel} from "./rowGroupPanel";
import {ToolPanel} from "./toolPanel";

export function populateClientExports(exports: any): void {

    exports.ColumnSelectPanel = ColumnSelectPanel;
    exports.RenderedColumn = RenderedColumn;
    exports.RenderedGroup = RenderedGroup;

    exports.AggregationStage = AggregationStage;
    exports.GroupStage = GroupStage;

    exports.SetFilter = SetFilter;
    exports.SetFilterModel = SetFilterModel;

    exports.StatusBar = StatusBar;
    exports.StatusItem = StatusItem;

    exports.ContextMenuFactory = ContextMenuFactory;
    exports.ClipboardService = ClipboardService;
    exports.EnterpriseBoot = EnterpriseBoot;
    exports.EnterpriseMenu = EnterpriseMenu;
    exports.RangeController = RangeController;
    exports.RowGroupPanel = RowGroupPanel;
    exports.ToolPanel = ToolPanel;

}
