// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import RowRenderer from "./rowRenderer";
import GridPanel from "../gridPanel/gridPanel";
import Column from "../entities/column";
export default class AutoWidthCalculator {
    private rowRenderer;
    private gridPanel;
    init(rowRenderer: RowRenderer, gridPanel: GridPanel): void;
    getPreferredWidthForColumn(column: Column): number;
}
