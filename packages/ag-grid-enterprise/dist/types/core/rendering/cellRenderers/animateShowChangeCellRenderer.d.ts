import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export declare class AnimateShowChangeCellRenderer extends Component implements ICellRenderer {
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
    refresh(params: any, isInitialRender?: boolean): boolean;
}
