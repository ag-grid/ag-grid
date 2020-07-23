import { Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { ColumnApi } from "../columnController/columnApi";
import { Component } from "./component";
import { ColDef } from "../entities/colDef";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { CellPosition } from "../entities/cellPosition";
import { GridApi } from "../gridApi";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ITooltipComp, ITooltipParams } from "../rendering/tooltipComponent";
import { PopupService } from "./popupService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { addCssClass, containsClass } from "../utils/dom";

export interface TooltipParentComp extends Component {
    getTooltipText(): string;
    getComponentHolder(): ColDef | undefined;
    getColumn?(): Column | ColumnGroup;
    getCellPosition?(): CellPosition;
}

enum TooltipStates { NOTHING, WAITING_TO_SHOW, SHOWING }

export class TooltipFeature extends BeanStub {

    private readonly DEFAULT_HIDE_TOOLTIP_TIMEOUT = 10000;
    private readonly SHOW_QUICK_TOOLTIP_DIFF = 1000;
    private readonly FADE_OUT_TOOLTIP_TIMEOUT = 1000;

    // different instances of tooltipFeature use this to see when the
    // last tooltip was hidden.
    private static lastTooltipHideTime: number;

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private readonly location: string;

    private tooltipShowDelay: number;

    private parentComp: TooltipParentComp;

    private showTooltipTimeoutId: number;
    private hideTooltipTimeoutId: number;

    private state = TooltipStates.NOTHING;

    private lastMouseEvent: MouseEvent;

    private tooltipComp: ITooltipComp;
    private tooltipPopupDestroyFunc: () => void;
    // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
    // async we could request two tooltips before the first instance returns, in which case we should
    // disregard the second instance.
    private tooltipInstanceCount = 0;

    private tooltipMouseTrack: boolean = false;

    constructor(parentComp: TooltipParentComp, location: string) {
        super();
        this.parentComp = parentComp;
        this.location = location;
    }

    @PostConstruct
    private postConstruct(): void {
        this.tooltipShowDelay = this.gridOptionsWrapper.getTooltipShowDelay() || 2000;
        this.tooltipMouseTrack = this.gridOptionsWrapper.isTooltipMouseTrack();

        const el = this.parentComp.getGui();

        this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
        this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
    }

    protected destroy(): void {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        super.destroy();
    }

    public onMouseEnter(e: MouseEvent): void {
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        const delay = this.isLastTooltipHiddenRecently() ? 200 : this.tooltipShowDelay;

        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.lastMouseEvent = e;
        this.state = TooltipStates.WAITING_TO_SHOW;
    }

    public onMouseLeave(): void {
        this.setToDoNothing();
    }

    private setToDoNothing(): void {
        if (this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }

        this.clearTimeouts();

        this.state = TooltipStates.NOTHING;
    }

    public onMouseMove(e: MouseEvent): void {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        this.lastMouseEvent = e;

        if (
            this.tooltipMouseTrack &&
            this.state === TooltipStates.SHOWING &&
            this.tooltipComp
        ) {
            this.positionTooltipUnderLastMouseEvent();
        }
    }

    public onMouseDown(): void {
        this.setToDoNothing();
    }

    private hideTooltip(): void {
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            TooltipFeature.lastTooltipHideTime = new Date().getTime();
        }

        this.state = TooltipStates.NOTHING;
    }

    private destroyTooltipComp(): void {
        // add class to fade out the tooltip
        addCssClass(this.tooltipComp.getGui(), 'ag-tooltip-hiding');

        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;

        window.setTimeout(() => {
            tooltipPopupDestroyFunc();
            this.getContext().destroyBean(tooltipComp);
        }, this.FADE_OUT_TOOLTIP_TIMEOUT);

        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }

    private isLastTooltipHiddenRecently(): boolean {
        // return true if <1000ms since last time we hid a tooltip
        const now = new Date().getTime();
        const then = TooltipFeature.lastTooltipHideTime;

        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    }

    private showTooltip(): void {
        const tooltipText = this.parentComp.getTooltipText();

        if (!tooltipText) {
            this.setToDoNothing();
            return;
        }

        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;

        const params: ITooltipParams = {
            location: this.location,
            api: this.gridApi,
            columnApi: this.columnApi,
            colDef: this.parentComp.getComponentHolder(),
            column: this.parentComp.getColumn,
            context: this.gridOptionsWrapper.getContext(),
            rowIndex: this.parentComp.getCellPosition && this.parentComp.getCellPosition().rowIndex,
            value: tooltipText
        };

        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        const callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);

        this.userComponentFactory.newTooltipComponent(params).then(callback);
    }

    private newTooltipComponentCallback(tooltipInstanceCopy: number, tooltipComp: ITooltipComp): void {
        const compNoLongerNeeded = this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;

        if (compNoLongerNeeded) {
            this.getContext().destroyBean(tooltipComp);
            return;
        }

        const eGui = tooltipComp.getGui();

        this.tooltipComp = tooltipComp;

        if (!containsClass(eGui, 'ag-tooltip')) {
            addCssClass(eGui, 'ag-tooltip-custom');
        }

        this.tooltipPopupDestroyFunc = this.popupService.addPopup(false, eGui, false);
        this.positionTooltipUnderLastMouseEvent();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.DEFAULT_HIDE_TOOLTIP_TIMEOUT);
    }

    private positionTooltipUnderLastMouseEvent(): void {
        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: this.lastMouseEvent,
            ePopup: this.tooltipComp.getGui(),
            nudgeY: 18
        });
    }

    private clearTimeouts(): void {
        if (this.showTooltipTimeoutId) {
            window.clearTimeout(this.showTooltipTimeoutId);
            this.showTooltipTimeoutId = undefined;
        }

        if (this.hideTooltipTimeoutId) {
            window.clearTimeout(this.hideTooltipTimeoutId);
            this.hideTooltipTimeoutId = undefined;
        }
    }
}
