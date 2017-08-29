// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export declare class AnimateShowChangeCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private lastValue;
    private eValue;
    private eDelta;
    private refreshCount;
    constructor();
    init(params: any): void;
    private showDelta(params, delta);
    private setTimerToRemoveDelta();
    private hideDeltaValue();
    refresh(params: any): boolean;
}
