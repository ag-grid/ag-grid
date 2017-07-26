// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellRenderer } from "./iCellRenderer";
import { Component } from "../../widgets/component";
export declare class AnimateSlideCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private params;
    private eCurrent;
    private ePrevious;
    private lastValue;
    private refreshCount;
    constructor();
    init(params: any): void;
    addSlideAnimation(): void;
    refresh(params: any): boolean;
}
