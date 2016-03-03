
import {Grid} from "./grid";
import {GridApi} from "./gridApi";
import {Events} from "./events";
import {ComponentUtil} from "./components/componentUtil";
import {ColumnController} from "./columnController/columnController";
import {initialiseAgGridWithAngular1} from "./components/agGridNg1";
import {initialiseAgGridWithWebComponents} from "./components/agGridWebComponent";
import {AddRangeSelectionParams} from "./interfaces/iRangeController";
import {RangeSelection} from "./interfaces/iRangeController";
import {IRangeController} from "./interfaces/iRangeController";
import {IRowModel} from "./interfaces/iRowModel";
import {TextAndNumberFilterParameters} from "./filter/textAndNumberFilterParameters";
import {SetFilterParameters} from "./enterprise/setFilter/setFilterParameters";
import {GridRow} from "./entities/gridCell";
import {GridCell} from "./entities/gridCell";
import {RowNode} from "./entities/rowNode";
import {OriginalColumnGroupChild} from "./entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "./entities/originalColumnGroup";
import {ColumnGroupChild} from "./entities/columnGroupChild";
import {ColumnGroup} from "./entities/columnGroup";
import {Column} from "./entities/column";
import {ColGroupDef} from "./entities/colDef";
import {ColDef} from "./entities/colDef";
import {AbstractColDef} from "./entities/colDef";
import {NodeChildDetails} from "./entities/gridOptions";
import {FocusedCellController} from "./focusedCellController";
import {defaultGroupComparator} from "./functions";
import {GridOptions} from "./entities/gridOptions";

export function populateClientExports(exports: any): void {

    // we only export classes and methods, not interfaces
    exports.Grid = Grid;
    exports.GridApi = GridApi;
    exports.Events = Events;
    exports.ComponentUtil = ComponentUtil;
    exports.ColumnController = ColumnController;
    exports.initialiseAgGridWithAngular1 = initialiseAgGridWithAngular1;
    exports.initialiseAgGridWithWebComponents = initialiseAgGridWithWebComponents;
    exports.defaultGroupComparator = defaultGroupComparator;
    exports.FocusedCellController = FocusedCellController;
    exports.Column = Column;
    exports.ColumnGroup = ColumnGroup;
    exports.OriginalColumnGroup = OriginalColumnGroup;
    exports.RowNode = RowNode;
    exports.GridCell = GridCell;
    exports.GridRow = GridRow;

}
