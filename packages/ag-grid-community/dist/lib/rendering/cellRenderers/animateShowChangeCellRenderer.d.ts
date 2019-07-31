// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export declare class AnimateShowChangeCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private lastValue;
    private eValue;
    private eDelta;
    private refreshCount;
    private filterManager;
    constructor();
    init(params: any): void;
    private showDelta;
    private setTimerToRemoveDelta;
    private hideDeltaValue;
    refresh(params: any): boolean;
}
