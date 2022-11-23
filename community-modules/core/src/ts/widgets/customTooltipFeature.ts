import { Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { ColumnApi } from "../columns/columnApi";
import { GridApi } from "../gridApi";
import { ITooltipComp, ITooltipParams } from "../rendering/tooltipComponent";
import { PopupService } from "./popupService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { exists } from "../utils/generic";
import { isIOSUserAgent } from "../utils/browser";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { capitalise } from "../utils/string";
import { doOnce } from "../utils/function";

export interface TooltipParentComp {
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    getGui(): HTMLElement;
}

enum TooltipStates { NOTHING, WAITING_TO_SHOW, SHOWING }

export class CustomTooltipFeature extends BeanStub {

    private readonly DEFAULT_SHOW_TOOLTIP_DELAY = 2000;
    private readonly DEFAULT_HIDE_TOOLTIP_DELAY = 10000;
    private readonly SHOW_QUICK_TOOLTIP_DIFF = 1000;
    private readonly FADE_OUT_TOOLTIP_TIMEOUT = 1000;

    // different instances of tooltipFeature use this to see when the
    // last tooltip was hidden.
    private static lastTooltipHideTime: number;

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;

    private tooltipShowDelay: number;
    private tooltipHideDelay: number;

    private parentComp: TooltipParentComp;

    private showTooltipTimeoutId: number | undefined;
    private hideTooltipTimeoutId: number | undefined;

    private state = TooltipStates.NOTHING;

    private lastMouseEvent: MouseEvent;

    private tooltipComp: ITooltipComp | undefined;
    private tooltipPopupDestroyFunc: (() => void) | undefined;
    // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
    // async we could request two tooltips before the first instance returns, in which case we should
    // disregard the second instance.
    private tooltipInstanceCount = 0;

    private tooltipMouseTrack: boolean = false;

    constructor(parentComp: TooltipParentComp) {
        super();
        this.parentComp = parentComp;
    }

    @PostConstruct
    private postConstruct(): void {
        this.tooltipShowDelay = this.getTooltipDelay('show') || this.DEFAULT_SHOW_TOOLTIP_DELAY;
        this.tooltipHideDelay = this.getTooltipDelay('hide') || this.DEFAULT_HIDE_TOOLTIP_DELAY;
        this.tooltipMouseTrack = this.gridOptionsService.is('tooltipMouseTrack');

        const el = this.parentComp.getGui();

        this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
        this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
        this.addManagedListener(el, 'keydown', this.onKeyDown.bind(this));
    }

    protected destroy(): void {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        super.destroy();
    }

    public onMouseEnter(e: MouseEvent): void {
        if (isIOSUserAgent()) { return; }
        // every mouseenter should be following by a mouseleave, however for some unkonwn, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is !=nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING) { return; }

        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        const delay = this.isLastTooltipHiddenRecently() ? 200 : this.tooltipShowDelay;

        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.lastMouseEvent = e;
        this.state = TooltipStates.WAITING_TO_SHOW;
    }

    public onMouseLeave(): void {
        this.setToDoNothing();
    }

    private onKeyDown(): void {
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

    private getTooltipDelay(type: 'show' | 'hide'): number | null {
        const tooltipShowDelay = this.gridOptionsService.getNum('tooltipShowDelay');
        const tooltipHideDelay = this.gridOptionsService.getNum('tooltipHideDelay');
        const delay = type === 'show' ? tooltipShowDelay : tooltipHideDelay;
        const capitalisedType = capitalise(type);

        if (exists(delay)) {
            if (delay < 0) {
                doOnce(() => console.warn(`AG Grid: tooltip${capitalisedType}Delay should not be lower than 0`), `tooltip${capitalisedType}DelayWarn`);
            }

            return Math.max(200, delay);
        }

        return null;
    }


    private hideTooltip(): void {
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            CustomTooltipFeature.lastTooltipHideTime = new Date().getTime();
        }

        this.state = TooltipStates.NOTHING;
    }

    private destroyTooltipComp(): void {
        // add class to fade out the tooltip
        this.tooltipComp!.getGui().classList.add('ag-tooltip-hiding');

        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;

        window.setTimeout(() => {
            tooltipPopupDestroyFunc!();
            this.getContext().destroyBean(tooltipComp);
        }, this.FADE_OUT_TOOLTIP_TIMEOUT);

        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }

    private isLastTooltipHiddenRecently(): boolean {
        // return true if <1000ms since last time we hid a tooltip
        const now = new Date().getTime();
        const then = CustomTooltipFeature.lastTooltipHideTime;

        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    }

    private showTooltip(): void {
        const params: WithoutGridCommon<ITooltipParams> = {
            ...this.parentComp.getTooltipParams()
        };

        if (!exists(params.value)) {
            this.setToDoNothing();
            return;
        }

        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;

        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        const callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);

        const userDetails = this.userComponentFactory.getTooltipCompDetails(params);
        userDetails.newAgStackInstance()!.then(callback);
    }

    private newTooltipComponentCallback(tooltipInstanceCopy: number, tooltipComp: ITooltipComp): void {
        const compNoLongerNeeded = this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;

        if (compNoLongerNeeded) {
            this.getContext().destroyBean(tooltipComp);
            return;
        }

        const eGui = tooltipComp.getGui();

        this.tooltipComp = tooltipComp;

        if (!eGui.classList.contains('ag-tooltip')) {
            eGui.classList.add('ag-tooltip-custom');
        }

        const translate = this.gridOptionsWrapper.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            eChild: eGui,
            ariaLabel: translate('ariaLabelTooltip', 'Tooltip')
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }
        // this.tooltipPopupDestroyFunc = this.popupService.addPopup(false, eGui, false);

        this.positionTooltipUnderLastMouseEvent();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.tooltipHideDelay);
    }

    private positionTooltipUnderLastMouseEvent(): void {
        this.popupService.positionPopupUnderMouseEvent({
            type: 'tooltip',
            mouseEvent: this.lastMouseEvent,
            ePopup: this.tooltipComp!.getGui(),
            nudgeY: 18,
            skipObserver: this.tooltipMouseTrack
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
