// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Grid } from "./grid";
export default class SelectionRendererFactory {
    private grid;
    private selectionController;
    init(grid: Grid, selectionController: any): void;
    createSelectionCheckbox(node: any, rowIndex: any): HTMLInputElement;
    private setCheckboxState(eCheckbox, state);
}
