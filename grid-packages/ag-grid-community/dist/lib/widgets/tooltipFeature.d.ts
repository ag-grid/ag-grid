import { BeanStub } from "../context/beanStub";
import { Component } from "./component";
import { ColDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { CellPosition } from "../entities/cellPosition";
export interface TooltipParentComp extends Component {
    getTooltipText(): string;
    getComponentHolder(): ColDef | undefined;
    getColumn?(): Column | ColumnGroup;
    getCellPosition?(): CellPosition;
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
    private gridOptionsWrapper;
    private readonly location;
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
    constructor(parentComp: TooltipParentComp, location: string);
    private postConstruct;
    protected destroy(): void;
    onMouseEnter(e: MouseEvent): void;
    onMouseLeave(): void;
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
