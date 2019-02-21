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
    private showDelta;
    private setTimerToRemoveDelta;
    private hideDeltaValue;
    refresh(params: any): boolean;
}
