// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "./component";
import { ColDef } from "../entities/colDef";
interface TooltipTarget extends Component {
    getTooltipText(): string;
    getComponentHolder(): ColDef | undefined;
}
export declare class TooltipManager {
    private popupService;
    private userComponentFactory;
    private columnApi;
    private gridApi;
    private gridOptionsWrapper;
    private readonly DEFAULT_HIDE_TOOLTIP_TIMEOUT;
    private readonly MOUSEOUT_HIDE_TOOLTIP_TIMEOUT;
    private readonly MOUSEOVER_SHOW_TOOLTIP_TIMEOUT;
    private readonly HIDE_SHOW_ONLY;
    private showTimeoutId;
    private hideTimeoutId;
    private activeComponent;
    private lastHoveredComponent;
    private lastMouseEvent;
    private registeredComponents;
    registerTooltip(targetCmp: TooltipTarget): void;
    unregisterTooltip(targetCmp: TooltipTarget): void;
    private processMouseOver;
    private processMouseOut;
    private processMouseMove;
    private showTooltip;
    private createTooltipComponent;
    private hideTooltip;
    private clearRegisteredComponent;
    private clearTimers;
}
export {};
