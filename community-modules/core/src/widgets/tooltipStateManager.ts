import { Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { ITooltipComp, ITooltipParams } from "../rendering/tooltipComponent";
import { PopupService } from "./popupService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { exists } from "../utils/generic";
import { isIOSUserAgent } from "../utils/browser";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { warnOnce } from "../utils/function";
import { Events } from "../eventKeys";
import { TooltipHideEvent, TooltipShowEvent } from "../events";

export interface TooltipParentComp {
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    getGui(): HTMLElement;
}

enum TooltipStates { NOTHING, WAITING_TO_SHOW, SHOWING }
enum TooltipTrigger { HOVER, FOCUS }

export class TooltipStateManager extends BeanStub {

    private readonly SHOW_QUICK_TOOLTIP_DIFF = 1000;
    private readonly FADE_OUT_TOOLTIP_TIMEOUT = 1000;
    private readonly INTERACTIVE_HIDE_DELAY = 100;

    // different instances of tooltipFeature use this to see when the
    // last tooltip was hidden.
    private static lastTooltipHideTime: number;
    private static isLocked = false;

    @Autowired('popupService') private popupService: PopupService;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private showTooltipTimeoutId: number | undefined;
    private hideTooltipTimeoutId: number | undefined;
    private interactiveTooltipTimeoutId: number | undefined;

    private interactionEnabled = false;
    private isInteractingWithTooltip = false;

    private state = TooltipStates.NOTHING;

    private lastMouseEvent: MouseEvent | null;

    private tooltipComp: ITooltipComp | undefined;
    private tooltipPopupDestroyFunc: (() => void) | undefined;
    // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
    // async we could request two tooltips before the first instance returns, in which case we should
    // disregard the second instance.
    private tooltipInstanceCount = 0;
    private tooltipMouseTrack: boolean = false;
    private tooltipTrigger: TooltipTrigger;

    private tooltipMouseEnterListener: (() => null) | null;
    private tooltipMouseLeaveListener: (() => null) | null;
    private tooltipFocusInListener: (() => null) | null;
    private tooltipFocusOutListener: (() => null) | null;

    private onBodyScrollEventCallback: (() => null) | undefined;
    private onColumnMovedEventCallback: (() => null) | undefined;

    constructor(
        private parentComp: TooltipParentComp,
        private tooltipShowDelayOverride?: number,
        private tooltipHideDelayOverride?: number,
        private shouldDisplayTooltip?: () => boolean
    ) {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        if (this.gos.get('tooltipInteraction')) {
            this.interactionEnabled = true;
        }

        this.tooltipTrigger = this.getTooltipTrigger();
        this.tooltipMouseTrack = this.gos.get('tooltipMouseTrack');

        const el = this.parentComp.getGui();

        if (this.tooltipTrigger === TooltipTrigger.HOVER) {
            this.addManagedListener(el, 'mouseenter', this.onMouseEnter.bind(this));
            this.addManagedListener(el, 'mouseleave', this.onMouseLeave.bind(this));
        }

        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.addManagedListener(el, 'focusin', this.onFocusIn.bind(this));
            this.addManagedListener(el, 'focusout', this.onFocusOut.bind(this))
        }

        this.addManagedListener(el, 'mousemove', this.onMouseMove.bind(this));

        if (!this.interactionEnabled) {
            this.addManagedListener(el, 'mousedown', this.onMouseDown.bind(this));
            this.addManagedListener(el, 'keydown', this.onKeyDown.bind(this));
        }
    }

    private getGridOptionsTooltipDelay(delayOption: 'tooltipShowDelay' | 'tooltipHideDelay'): number {
        const delay = this.gos.get(delayOption);
        if (delay < 0) {
            warnOnce(`${delayOption} should not be lower than 0`);
        }
        return Math.max(200, delay);
    }

    private getTooltipDelay(type: 'show' | 'hide'): number {
        if (type === 'show') {
            return this.tooltipShowDelayOverride ?? this.getGridOptionsTooltipDelay('tooltipShowDelay')!;
        }

        return this.tooltipHideDelayOverride ?? this.getGridOptionsTooltipDelay('tooltipHideDelay')!;
    }

    protected destroy(): void {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no mouseLeave event resulting in zombie tooltip
        this.setToDoNothing();
        super.destroy();
    }

    private getTooltipTrigger(): TooltipTrigger {
        const trigger = this.gos.get('tooltipTrigger');

        if (!trigger || trigger === 'hover') {
            return TooltipTrigger.HOVER;
        }

        return TooltipTrigger.FOCUS;
    }

    public onMouseEnter(e: MouseEvent): void {
        // if `interactiveTooltipTimeoutId` is set, it means that this cell has a tooltip
        // and we are in the process of moving the cursor from the tooltip back to the cell
        // so we need to unlock this service here.
        if (this.interactionEnabled && this.interactiveTooltipTimeoutId) {
            this.unlockService();
            this.startHideTimeout();
        }

        if (isIOSUserAgent()) { return; }

        if (TooltipStateManager.isLocked) {
            this.showTooltipTimeoutId = window.setTimeout(() => {
                this.prepareToShowTooltip(e);
            }, this.INTERACTIVE_HIDE_DELAY)
        } else {
            this.prepareToShowTooltip(e);
        }
    }

    private onMouseMove(e: MouseEvent): void {
        // there is a delay from the time we mouseOver a component and the time the
        // tooltip is displayed, so we need to track mousemove to be able to correctly
        // position the tooltip when showTooltip is called.
        if (this.lastMouseEvent) {
            this.lastMouseEvent = e;
        }

        if (
            this.tooltipMouseTrack &&
            this.state === TooltipStates.SHOWING &&
            this.tooltipComp
        ) {
            this.positionTooltip();
        }
    }

    private onMouseDown(): void {
        this.setToDoNothing();
    }

    private onMouseLeave(): void {
        // if interaction is enabled, we need to verify if the user is moving
        // the cursor from the cell onto the tooltip, so we lock the service 
        // for 100ms to prevent other tooltips from being created while this is happening.
        if (this.interactionEnabled) {
            this.lockService();
        } else {
            this.setToDoNothing();
        }
    }

    private onFocusIn(): void {
        this.prepareToShowTooltip();
    }

    private onFocusOut(e: FocusEvent): void {
        const relatedTarget = e.relatedTarget as Element;
        const parentCompGui = this.parentComp.getGui();
        const tooltipGui = this.tooltipComp?.getGui();

        if (
            this.isInteractingWithTooltip ||
            parentCompGui.contains(relatedTarget) ||
            (this.interactionEnabled && tooltipGui?.contains(relatedTarget))
        ) { return; }

        this.setToDoNothing();
    }

    private onKeyDown(): void {
        this.setToDoNothing();
    }

    private prepareToShowTooltip(mouseEvent?: MouseEvent): void {
        // every mouseenter should be following by a mouseleave, however for some unknown, it's possible for
        // mouseenter to be called twice in a row, which can happen if editing the cell. this was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is != nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING || TooltipStateManager.isLocked) { return; }

        // if we are showing the tooltip because of focus, no delay at all
        // if another tooltip was hidden very recently, we only wait 200ms to show, not the normal waiting time
        let delay = 0;
        if (mouseEvent) {
            delay = this.isLastTooltipHiddenRecently() ? 200 : this.getTooltipDelay('show');
        }

        this.lastMouseEvent = mouseEvent || null;

        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.state = TooltipStates.WAITING_TO_SHOW;
    }

    private isLastTooltipHiddenRecently(): boolean {
        // return true if <1000ms since last time we hid a tooltip
        const now = new Date().getTime();
        const then = TooltipStateManager.lastTooltipHideTime;

        return (now - then) < this.SHOW_QUICK_TOOLTIP_DIFF;
    }


    private setToDoNothing(): void {
        if (this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }

        if (this.onBodyScrollEventCallback) {
            this.onBodyScrollEventCallback();
            this.onBodyScrollEventCallback = undefined;
        }

        if (this.onColumnMovedEventCallback) {
            this.onColumnMovedEventCallback();
            this.onColumnMovedEventCallback = undefined;
        }

        this.clearTimeouts();
        this.state = TooltipStates.NOTHING;
        this.lastMouseEvent = null;
    }

    private showTooltip(): void {
        const params: WithoutGridCommon<ITooltipParams> = {
            ...this.parentComp.getTooltipParams(),
        };

        if (!exists(params.value) || (this.shouldDisplayTooltip && !this.shouldDisplayTooltip())) {
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


    public hideTooltip(forceHide?: boolean): void {
        if (!forceHide && this.isInteractingWithTooltip) { return; }
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            TooltipStateManager.lastTooltipHideTime = new Date().getTime();
        }

        const event: WithoutGridCommon<TooltipHideEvent> = {
            type: Events.EVENT_TOOLTIP_HIDE,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);

        this.state = TooltipStates.NOTHING;
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

        if (this.tooltipTrigger === TooltipTrigger.HOVER) {
            eGui.classList.add('ag-tooltip-animate');
        }

        if (this.interactionEnabled) {
            eGui.classList.add('ag-tooltip-interactive');
        }

        const translate = this.localeService.getLocaleTextFunc();

        const addPopupRes = this.popupService.addPopup({
            eChild: eGui,
            ariaLabel: translate('ariaLabelTooltip', 'Tooltip')
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }

        this.positionTooltip();

        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.onBodyScrollEventCallback = this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, this.setToDoNothing.bind(this));
            this.onColumnMovedEventCallback = this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.setToDoNothing.bind(this));
        }

        if (this.interactionEnabled) {
            if (this.tooltipTrigger === TooltipTrigger.HOVER) {
                this.tooltipMouseEnterListener = this.addManagedListener(eGui, 'mouseenter', this.onTooltipMouseEnter.bind(this)) || null;
                this.tooltipMouseLeaveListener = this.addManagedListener(eGui, 'mouseleave', this.onTooltipMouseLeave.bind(this)) || null;
            } else {
                this.tooltipFocusInListener = this.addManagedListener(eGui, 'focusin', this.onTooltipFocusIn.bind(this)) || null;
                this.tooltipFocusOutListener = this.addManagedListener(eGui, 'focusout', this.onTooltipFocusOut.bind(this)) || null;
            }
        }

        const event: WithoutGridCommon<TooltipShowEvent> = {
            type: Events.EVENT_TOOLTIP_SHOW,
            tooltipGui: eGui,
            parentGui: this.parentComp.getGui()
        };
        this.eventService.dispatchEvent(event);

        this.startHideTimeout();
    }

    private onTooltipMouseEnter(): void {
        this.isInteractingWithTooltip = true;
        this.unlockService();
    }

    private onTooltipMouseLeave(): void {
        this.isInteractingWithTooltip = false;
        this.lockService();
    }

    private onTooltipFocusIn(): void {
        this.isInteractingWithTooltip = true;
    }

    private onTooltipFocusOut(e: FocusEvent): void {
        const parentGui = this.parentComp.getGui();
        const tooltipGui = this.tooltipComp?.getGui();
        const relatedTarget = e.relatedTarget as Element;

        // focusout is dispatched when inner elements lose focus
        // so we need to verify if focus is contained within the tooltip
        if (tooltipGui?.contains(relatedTarget)) { return; }

        this.isInteractingWithTooltip = false;

        // if we move the focus from the tooltip back to the original cell
        // the tooltip should remain open, but we need to restart the hide timeout counter
        if (parentGui.contains(relatedTarget)) {
            this.startHideTimeout();
        }
        // if the parent cell doesn't contain the focus, simply hide the tooltip
        else {
            this.hideTooltip();
        }
    }

    private positionTooltip(): void {
        const params = {
            type: 'tooltip',
            ePopup: this.tooltipComp!.getGui(),
            nudgeY: 18,
            skipObserver: this.tooltipMouseTrack
        };

        if (this.lastMouseEvent) {
            this.popupService.positionPopupUnderMouseEvent({
                ...params,
                mouseEvent: this.lastMouseEvent
            });
        } else {
            this.popupService.positionPopupByComponent({
                ...params,
                eventSource: this.parentComp.getGui(),
                position: 'under',
                keepWithinBounds: true,
                nudgeY: 5
            });
        }
    }

    private destroyTooltipComp(): void {
        // add class to fade out the tooltip
        this.tooltipComp!.getGui().classList.add('ag-tooltip-hiding');

        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;
        const delay = this.tooltipTrigger === TooltipTrigger.HOVER ? this.FADE_OUT_TOOLTIP_TIMEOUT : 0;

        window.setTimeout(() => {
            tooltipPopupDestroyFunc!();
            this.getContext().destroyBean(tooltipComp);
        }, delay);

        this.clearTooltipListeners();
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }

    private clearTooltipListeners(): void {
        [ 
            this.tooltipMouseEnterListener, this.tooltipMouseLeaveListener,
            this.tooltipFocusInListener, this.tooltipFocusOutListener
        ].forEach(listener => {
            if (listener) { listener(); }
        });

        this.tooltipMouseEnterListener = this.tooltipMouseLeaveListener =
        this.tooltipFocusInListener = this.tooltipFocusOutListener = null;
    }

    private lockService(): void {
        TooltipStateManager.isLocked = true;
        this.interactiveTooltipTimeoutId = window.setTimeout(() => {
            this.unlockService();
            this.setToDoNothing();
        }, this.INTERACTIVE_HIDE_DELAY);
    }

    private unlockService(): void {
        TooltipStateManager.isLocked = false;
        this.clearInteractiveTimeout();
    }

    private startHideTimeout(): void {
        this.clearHideTimeout();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.getTooltipDelay('hide'));
    }

    private clearShowTimeout(): void {
        if (!this.showTooltipTimeoutId) { return; }
        window.clearTimeout(this.showTooltipTimeoutId);
        this.showTooltipTimeoutId = undefined;
    }

    private clearHideTimeout(): void {
        if (!this.hideTooltipTimeoutId) { return; }
        window.clearTimeout(this.hideTooltipTimeoutId);
        this.hideTooltipTimeoutId = undefined;
    }

    private clearInteractiveTimeout(): void {
        if (!this.interactiveTooltipTimeoutId) { return; }
        window.clearTimeout(this.interactiveTooltipTimeoutId);
        this.interactiveTooltipTimeoutId = undefined;
    }

    private clearTimeouts(): void {
        this.clearShowTimeout();
        this.clearHideTimeout();
        this.clearInteractiveTimeout();
    }
}
