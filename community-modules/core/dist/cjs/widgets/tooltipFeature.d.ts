// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { Component } from "./component";
import { ITooltipParams } from "../rendering/tooltipComponent";
export interface TooltipParentComp extends Component {
    getTooltipParams(): ITooltipParams;
}
export declare class TooltipFeature extends BeanStub {
    private readonly DEFAULT_HIDE_TOOLTIP_TIMEOUT;
    private readonly SHOW_QUICK_TOOLTIP_DIFF;
    private readonly FADE_OUT_TOOLTIP_TIMEOUT;
    private static lastTooltipHideTime;
    private popupService;
    private userComponentFactory;
    private columnApi;
    private gridApi;
    private tooltipShowDelay;
    private parentComp;
    private showTooltipTimeoutId;
    private hideTooltipTimeoutId;
    private state;
    private lastMouseEvent;
    private tooltipComp;
    private tooltipPopupDestroyFunc;
    private tooltipInstanceCount;
    private tooltipMouseTrack;
    constructor(parentComp: TooltipParentComp);
    private postConstruct;
    protected destroy(): void;
    onMouseEnter(e: MouseEvent): void;
    onMouseLeave(): void;
    private onKeyDown;
    private setToDoNothing;
    onMouseMove(e: MouseEvent): void;
    onMouseDown(): void;
    private hideTooltip;
    private destroyTooltipComp;
    private isLastTooltipHiddenRecently;
    private showTooltip;
    private newTooltipComponentCallback;
    private positionTooltipUnderLastMouseEvent;
    private clearTimeouts;
}
