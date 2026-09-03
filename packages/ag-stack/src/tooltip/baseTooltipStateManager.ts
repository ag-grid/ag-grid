import { AgBeanStub } from '../core/agBeanStub';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IComponent } from '../interfaces/iComponent';
import type { IPopupService } from '../interfaces/iPopupService';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { TooltipCtrl } from '../interfaces/iTooltip';
import { _setAriaRole } from '../utils/aria';
import { _getActiveDomElement, _getDocument } from '../utils/document';
import { _findFocusableElements } from '../utils/focus';
import { _exists } from '../utils/generic';

enum TooltipStates {
    NOTHING,
    WAITING_TO_SHOW,
    SHOWING,
}
export enum TooltipTrigger {
    HOVER,
    FOCUS,
}

const SHOW_SWITCH_TOOLTIP_DIFF = 1000;
const FADE_OUT_TOOLTIP_TIMEOUT = 1000;
const INTERACTIVE_HIDE_DELAY = 100;
interface SharedTooltipState {
    lastHideTime?: number;
    lockOwner?: object;
}

const sharedStateByGrid = new WeakMap<object, SharedTooltipState>();
let tooltipIdSequence = 0;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface BaseTooltipParams<TLocation extends string, TValue = any> {
    location: TLocation;
    /** The value to be rendered by the tooltip. */
    value?: TValue | null;
    /** A callback function that hides the tooltip */
    hideTooltipCallback?: () => void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseTooltipStateManager<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
    TTooltipParams extends BaseTooltipParams<TLocation>,
    TTooltipCtrlParams,
    TLocation extends string,
> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private popupSvc?: IPopupService<any>;

    public wireBeans(beans: TBeanCollection): void {
        this.popupSvc = beans.popupSvc;
    }

    private showTooltipTimeoutId: number | undefined;
    private hideTooltipTimeoutId: number | undefined;
    private interactiveTooltipTimeoutId: number | undefined;

    private interactionEnabled = false;
    private isInteractingWithTooltip = false;

    private state = TooltipStates.NOTHING;

    private lastMouseEvent: MouseEvent | null;

    private tooltipComp: IComponent<TTooltipParams> | undefined;
    private tooltipPopupDestroyFunc: (() => void) | undefined;
    // when showing the tooltip, we need to make sure it's the most recent instance we request, as due to
    // async we could request two tooltips before the first instance returns, in which case we should
    // disregard the second instance.
    private tooltipInstanceCount = 0;
    private tooltipMouseTrack: boolean = false;
    private tooltipTrigger: TooltipTrigger;

    private tooltipPointerEnterListener: (() => null) | null;
    private tooltipPointerLeaveListener: (() => null) | null;
    private tooltipFocusInListener: (() => null) | null;
    private tooltipFocusOutListener: (() => null) | null;

    private onBodyScrollEventCallback: (() => null) | undefined;
    private onDocumentKeyDownCallback: (() => null) | undefined;
    private onDocumentPointerDownCallback: (() => null) | undefined;
    private sharedState!: SharedTooltipState;
    private showEventDispatched = false;
    private describedById: string | undefined;
    private describedBySource: HTMLElement | undefined;

    constructor(
        protected readonly tooltipCtrl: TooltipCtrl<TLocation, TTooltipCtrlParams>,
        private readonly getTooltipValue: () => any
    ) {
        super();
    }

    protected abstract createTooltipComp(
        params: TTooltipParams,
        callback: (comp: IComponent<TTooltipParams>) => void
    ): void;

    protected abstract setEventHandlers(listener: () => void): void;

    protected abstract clearEventHandlers(): void;

    protected getPopupPositionParams(): unknown {
        return undefined;
    }

    public postConstruct(): void {
        let sharedState = sharedStateByGrid.get(this.gos);
        if (!sharedState) {
            sharedState = {};
            sharedStateByGrid.set(this.gos, sharedState);
        }
        this.sharedState = sharedState;

        if (this.gos.get('tooltipInteraction')) {
            this.interactionEnabled = true;
        }

        this.tooltipTrigger = this.getTooltipTrigger();
        this.tooltipMouseTrack = this.gos.get('tooltipMouseTrack')!;

        const el = this.tooltipCtrl.getGui();

        if (this.tooltipTrigger === TooltipTrigger.HOVER) {
            this.addManagedListeners(el, {
                pointerenter: this.onPointerEnter.bind(this),
                pointerleave: this.onPointerLeave.bind(this),
            });
        }

        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            this.addManagedListeners(el, {
                focusin: this.onFocusIn.bind(this),
                focusout: this.onFocusOut.bind(this),
            });
        }

        if (this.interactionEnabled && this.tooltipTrigger !== TooltipTrigger.FOCUS) {
            this.addManagedListeners(el, { focusout: this.onFocusOut.bind(this) });
        }

        if (this.interactionEnabled) {
            this.addManagedListeners(el, { keydown: this.onInteractiveSourceKeyDown.bind(this) });
        }

        this.addManagedListeners(el, { pointermove: this.onPointerMove.bind(this) });

        if (!this.interactionEnabled) {
            this.addManagedListeners(el, {
                pointerdown: this.onPointerDown.bind(this),
                keydown: this.onKeyDown.bind(this),
            });
        }
    }

    private getTooltipDelay(type: 'Show' | 'Hide' | 'SwitchShow'): number {
        const delay = this.tooltipCtrl[`getTooltip${type}DelayOverride`]?.() ?? this.gos.get(`tooltip${type}Delay`)!;
        return Math.max(0, delay);
    }

    public override destroy(): void {
        // if this component gets destroyed while tooltip is showing, need to make sure
        // we don't end with no pointerleave event resulting in zombie tooltip
        this.hideTooltip(true);
        super.destroy();
    }

    private getTooltipTrigger(): TooltipTrigger {
        const trigger = this.gos.get('tooltipTrigger');

        if (!trigger || trigger === 'hover') {
            return TooltipTrigger.HOVER;
        }

        return TooltipTrigger.FOCUS;
    }

    /** True only once a tooltip is on screen — a show still waiting out its delay is not showing. */
    public isShowing(): boolean {
        return this.state === TooltipStates.SHOWING;
    }

    public onPointerEnter(e: PointerEvent): void {
        // if `interactiveTooltipTimeoutId` is set, it means that this cell has a tooltip
        // and we are in the process of moving the cursor from the tooltip back to the cell
        // so we need to unlock this service here.
        if (this.interactionEnabled && this.interactiveTooltipTimeoutId) {
            this.unlockService();
            this.startHideTimeout();
        }

        if (e.pointerType === 'touch') {
            return;
        }

        if (this.isLocked()) {
            this.showTooltipTimeoutId = window.setTimeout(() => {
                this.prepareToShowTooltip(e);
            }, INTERACTIVE_HIDE_DELAY);
        } else {
            this.prepareToShowTooltip(e);
        }
    }

    private onPointerMove(e: PointerEvent): void {
        // there is a delay from the time we hover over a component and the time the
        // tooltip is displayed, so we need to track pointermove to be able to correctly
        // position the tooltip when showTooltip is called.
        if (this.lastMouseEvent) {
            this.lastMouseEvent = e;
        }

        if (this.tooltipMouseTrack && this.state === TooltipStates.SHOWING && this.tooltipComp) {
            this.positionTooltip();
        }
    }

    private onPointerDown(): void {
        this.setToDoNothing();
    }

    private onPointerLeave(e: PointerEvent): void {
        // a touch pointer ceases to exist on lift, firing pointerleave; a long-press tooltip must
        // survive that (dismissal is the document pointerdown handler), so only react to hover pointers
        if (e.pointerType === 'touch') {
            return;
        }

        // the lock lets the cursor travel from the cell onto its own tooltip, so only lock when a
        // tooltip is showing - locking with nothing to travel onto just blocks other cells' tooltips.
        if (this.interactionEnabled && this.state === TooltipStates.SHOWING) {
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
        const parentCompGui = this.tooltipCtrl.getGui();
        const tooltipGui = this.tooltipComp?.getGui();

        if (
            this.isInteractingWithTooltip ||
            parentCompGui.contains(relatedTarget) ||
            (this.interactionEnabled && tooltipGui?.contains(relatedTarget))
        ) {
            return;
        }

        this.setToDoNothing();
    }

    private onKeyDown(): void {
        // if the keydown happens outside of the tooltip, we cancel
        // the tooltip interaction and hide the tooltip.
        if (this.isInteractingWithTooltip) {
            this.isInteractingWithTooltip = false;
        }
        this.setToDoNothing();
    }

    public prepareToShowTooltip(mouseEvent?: MouseEvent, showDelayOverride?: number): void {
        // every pointerenter should be followed by a pointerleave, however it is possible for
        // pointerenter to be called twice in a row when editing the cell. This was reported
        // in https://ag-grid.atlassian.net/browse/AG-4422. to get around this, we check the state, and if
        // state is != nothing, then we know mouseenter was already received.
        if (this.state != TooltipStates.NOTHING || this.isLocked()) {
            return;
        }

        // if we are showing the tooltip because of focus, no delay at all
        // if another tooltip was hidden very recently, use the switch show delay instead of the normal delay
        let delay = showDelayOverride == null ? 0 : Math.max(0, showDelayOverride);
        if (mouseEvent && showDelayOverride == null) {
            delay = this.isLastTooltipHiddenRecently()
                ? this.getTooltipDelay('SwitchShow')
                : this.getTooltipDelay('Show');
        }

        this.lastMouseEvent = mouseEvent || null;

        this.showTooltipTimeoutId = window.setTimeout(this.showTooltip.bind(this), delay);
        this.state = TooltipStates.WAITING_TO_SHOW;
    }

    protected canShowTooltip(): boolean {
        const value = this.getTooltipValue();
        return _exists(value) && (!this.tooltipCtrl.shouldDisplayTooltip || this.tooltipCtrl.shouldDisplayTooltip());
    }

    private isLastTooltipHiddenRecently(): boolean {
        // return true if <1000ms since last time we hid a tooltip
        const now = Date.now();
        const then = this.sharedState.lastHideTime;

        return then != null && now - then < SHOW_SWITCH_TOOLTIP_DIFF;
    }

    private setToDoNothing(fromHideTooltip?: boolean): void {
        if (!fromHideTooltip && this.state === TooltipStates.SHOWING) {
            this.hideTooltip();
        }

        if (this.onBodyScrollEventCallback) {
            this.onBodyScrollEventCallback();
            this.onBodyScrollEventCallback = undefined;
        }

        this.clearEventHandlers();

        if (this.onDocumentKeyDownCallback) {
            this.onDocumentKeyDownCallback();
            this.onDocumentKeyDownCallback = undefined;
        }

        if (this.onDocumentPointerDownCallback) {
            this.onDocumentPointerDownCallback();
            this.onDocumentPointerDownCallback = undefined;
        }

        this.clearTimeouts();
        this.state = TooltipStates.NOTHING;
        this.lastMouseEvent = null;
    }

    private showTooltip(): void {
        const value = this.getTooltipValue();
        const ctrl = this.tooltipCtrl;

        if (!_exists(value) || (ctrl.shouldDisplayTooltip && !ctrl.shouldDisplayTooltip())) {
            this.setToDoNothing();
            return;
        }

        const params = this.gos.addCommon<TCommon & TTooltipParams>({
            location: ctrl.getLocation?.() ?? 'UNKNOWN',
            value,
            hideTooltipCallback: () => this.hideTooltip(true),
            ...ctrl.getAdditionalParams?.(),
        } as BaseTooltipParams<TLocation> as any);

        this.state = TooltipStates.SHOWING;
        this.tooltipInstanceCount++;

        // we pass in tooltipInstanceCount so the callback knows what the count was when
        // we requested the tooltip, so if another tooltip was requested in the mean time
        // we disregard it
        const callback = this.newTooltipComponentCallback.bind(this, this.tooltipInstanceCount);

        this.createTooltipComp(params, callback);
    }

    public hideTooltip(forceHide?: boolean): void {
        if (!forceHide && this.isInteractingWithTooltip) {
            return;
        }
        // check if comp exists - due to async, although we asked for
        // one, the instance may not be back yet
        if (this.tooltipComp) {
            this.destroyTooltipComp();
            this.sharedState.lastHideTime = Date.now();
        }

        if (this.showEventDispatched) {
            this.showEventDispatched = false;
            this.eventSvc.dispatchEvent({
                type: 'tooltipHide',
                parentGui: this.tooltipCtrl.getGui(),
            });
        }

        if (forceHide) {
            this.isInteractingWithTooltip = false;
        }

        this.setToDoNothing(true);
    }

    private newTooltipComponentCallback(tooltipInstanceCopy: number, tooltipComp: IComponent<TTooltipParams>): void {
        const compNoLongerNeeded =
            this.state !== TooltipStates.SHOWING || this.tooltipInstanceCount !== tooltipInstanceCopy;

        if (compNoLongerNeeded) {
            this.destroyBean(tooltipComp);
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

        if (!eGui.hasAttribute('role')) {
            _setAriaRole(eGui, this.interactionEnabled ? 'dialog' : 'tooltip');
        }
        this.connectAriaDescription(eGui);

        const translate = this.getLocaleTextFunc();

        const addPopupRes = this.popupSvc?.addPopup({
            eChild: eGui,
            ...(this.interactionEnabled
                ? { ariaLabel: translate('ariaLabelTooltip', 'Tooltip') }
                : { ariaOwns: this.tooltipCtrl.getGui() }),
        });
        if (addPopupRes) {
            this.tooltipPopupDestroyFunc = addPopupRes.hideFunc;
        }

        this.positionTooltip();

        if (this.tooltipTrigger === TooltipTrigger.FOCUS) {
            const listener = () => this.hideTooltip(true);
            [this.onBodyScrollEventCallback] = this.addManagedEventListeners({
                bodyScroll: listener,
            });
            this.setEventHandlers(listener);
        }

        if (this.interactionEnabled) {
            [this.tooltipPointerEnterListener, this.tooltipPointerLeaveListener] = this.addManagedElementListeners(
                eGui,
                {
                    pointerenter: this.onTooltipPointerEnter.bind(this),
                    pointerleave: this.onTooltipPointerLeave.bind(this),
                }
            );

            [this.onDocumentKeyDownCallback] = this.addManagedElementListeners(_getDocument(this.beans), {
                keydown: (event) => {
                    if (event) {
                        this.onDocumentKeyDown(event, eGui);
                    }
                },
            });

            [this.tooltipFocusInListener, this.tooltipFocusOutListener] = this.addManagedElementListeners(eGui, {
                focusin: this.onTooltipFocusIn.bind(this),
                focusout: this.onTooltipFocusOut.bind(this),
            });
        }

        [this.onDocumentPointerDownCallback] = this.addManagedElementListeners(_getDocument(this.beans), {
            pointerdown: (event) => {
                if (event?.pointerType === 'touch' && !eGui.contains(event.target as Node)) {
                    this.hideTooltip(true);
                }
            },
        });

        this.showEventDispatched = true;
        this.eventSvc.dispatchEvent({
            type: 'tooltipShow',
            tooltipGui: eGui,
            parentGui: this.tooltipCtrl.getGui(),
        });

        this.startHideTimeout();
    }

    private connectAriaDescription(eGui: HTMLElement): void {
        eGui.id ||= `ag-tooltip-${++tooltipIdSequence}`;
        const id = eGui.id;
        const source = this.tooltipCtrl.getGui();
        const describedBy = source.getAttribute('aria-describedby')?.split(/\s+/).filter(Boolean) ?? [];
        if (!describedBy.includes(id)) {
            source.setAttribute('aria-describedby', [...describedBy, id].join(' '));
        }
        this.describedById = id;
        this.describedBySource = source;
    }

    private disconnectAriaDescription(): void {
        const id = this.describedById;
        const source = this.describedBySource;
        if (!id || !source) {
            return;
        }
        this.describedById = undefined;
        this.describedBySource = undefined;
        const describedBy = source
            .getAttribute('aria-describedby')
            ?.split(/\s+/)
            .filter((value) => value && value !== id);
        if (describedBy?.length) {
            source.setAttribute('aria-describedby', describedBy.join(' '));
        } else {
            source.removeAttribute('aria-describedby');
        }
    }

    private onDocumentKeyDown(event: KeyboardEvent, eGui: HTMLElement): void {
        const source = this.tooltipCtrl.getGui();
        if (event.key === 'Escape') {
            const eventTarget = event.target as Node;
            const returnFocus = eGui.contains(eventTarget);
            const consumeEvent = returnFocus || source.contains(eventTarget);
            if (consumeEvent) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (returnFocus && source.isConnected) {
                // Restore focus while this tooltip is still showing so the source's focusin handler
                // cannot immediately open a replacement tooltip.
                source.focus({ preventScroll: true });
            }
            this.hideTooltip(true);
            return;
        }

        if (event.key === 'Tab' && source.contains(event.target as Node)) {
            const focusableElements = _findFocusableElements(eGui);
            const target = event.shiftKey ? focusableElements.at(-1) : focusableElements[0];
            if (target) {
                event.preventDefault();
                this.isInteractingWithTooltip = true;
                target.focus();
                return;
            }
        }

        if (!eGui.contains(event.target as Node)) {
            this.onKeyDown();
        }
    }

    private onInteractiveSourceKeyDown(event: KeyboardEvent): void {
        if (this.state !== TooltipStates.SHOWING || !this.tooltipComp) {
            return;
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            this.hideTooltip(true);
            return;
        }
        if (event.key !== 'Tab') {
            return;
        }

        const focusableElements = _findFocusableElements(this.tooltipComp.getGui());
        const target = event.shiftKey ? focusableElements.at(-1) : focusableElements[0];
        if (target) {
            event.preventDefault();
            event.stopPropagation();
            this.isInteractingWithTooltip = true;
            target.focus();
        }
    }

    private onTooltipPointerEnter(): void {
        this.isInteractingWithTooltip = true;
        this.unlockService();
    }

    private onTooltipPointerLeave(): void {
        if (this.isTooltipFocused()) {
            return;
        }
        this.isInteractingWithTooltip = false;
        this.lockService();
    }

    private onTooltipFocusIn(): void {
        this.isInteractingWithTooltip = true;
    }

    private isTooltipFocused(): boolean {
        const tooltipGui = this.tooltipComp?.getGui();
        const activeEl = _getActiveDomElement(this.beans);

        return !!tooltipGui && tooltipGui.contains(activeEl);
    }

    private onTooltipFocusOut(e: FocusEvent): void {
        const parentGui = this.tooltipCtrl.getGui();
        const tooltipGui = this.tooltipComp?.getGui();
        const relatedTarget = e.relatedTarget as Node | null;

        // focusout is dispatched when inner elements lose focus
        // so we need to verify if focus is contained within the tooltip
        if (this.isTooltipFocused() || tooltipGui?.contains(relatedTarget)) {
            return;
        }

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
            skipObserver: this.tooltipMouseTrack,
            additionalParams: this.getPopupPositionParams(),
        };

        if (this.lastMouseEvent) {
            this.popupSvc?.positionPopupUnderMouseEvent({
                ...params,
                mouseEvent: this.lastMouseEvent,
            });
        } else {
            this.popupSvc?.positionPopupByComponent({
                ...params,
                eventSource: this.tooltipCtrl.getGui(),
                position: 'under',
                keepWithinBounds: true,
                nudgeY: 5,
            });
        }
    }

    private destroyTooltipComp(): void {
        this.disconnectAriaDescription();
        // add class to fade out the tooltip
        const eGui = this.tooltipComp!.getGui();
        eGui.classList.remove('ag-tooltip-interactive');
        eGui.classList.add('ag-tooltip-hiding');

        // make local copies of these variables, as we use them in the async function below,
        // and we clear then to 'undefined' later, so need to take a copy before they are undefined.
        const tooltipPopupDestroyFunc = this.tooltipPopupDestroyFunc;
        const tooltipComp = this.tooltipComp;
        const delay = this.tooltipTrigger === TooltipTrigger.HOVER ? FADE_OUT_TOOLTIP_TIMEOUT : 0;

        window.setTimeout(() => {
            tooltipPopupDestroyFunc?.();
            this.destroyBean(tooltipComp);
        }, delay);

        this.clearTooltipListeners();
        this.tooltipPopupDestroyFunc = undefined;
        this.tooltipComp = undefined;
    }

    private clearTooltipListeners(): void {
        for (const listener of [
            this.tooltipPointerEnterListener,
            this.tooltipPointerLeaveListener,
            this.tooltipFocusInListener,
            this.tooltipFocusOutListener,
        ]) {
            if (listener) {
                listener();
            }
        }

        this.tooltipPointerEnterListener =
            this.tooltipPointerLeaveListener =
            this.tooltipFocusInListener =
            this.tooltipFocusOutListener =
                null;
    }

    private lockService(): void {
        this.sharedState.lockOwner = this;
        this.interactiveTooltipTimeoutId = window.setTimeout(() => {
            this.unlockService();
            this.setToDoNothing();
        }, INTERACTIVE_HIDE_DELAY);
    }

    private unlockService(): void {
        if (this.sharedState.lockOwner === this) {
            this.sharedState.lockOwner = undefined;
        }
        this.clearInteractiveTimeout();
    }

    private startHideTimeout(): void {
        this.clearHideTimeout();
        this.hideTooltipTimeoutId = window.setTimeout(this.hideTooltip.bind(this), this.getTooltipDelay('Hide'));
    }

    private clearShowTimeout(): void {
        if (!this.showTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.showTooltipTimeoutId);
        this.showTooltipTimeoutId = undefined;
    }

    private clearHideTimeout(): void {
        if (!this.hideTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.hideTooltipTimeoutId);
        this.hideTooltipTimeoutId = undefined;
    }

    private clearInteractiveTimeout(): void {
        if (!this.interactiveTooltipTimeoutId) {
            return;
        }
        window.clearTimeout(this.interactiveTooltipTimeoutId);
        this.interactiveTooltipTimeoutId = undefined;
        if (this.sharedState.lockOwner === this) {
            this.sharedState.lockOwner = undefined;
        }
    }

    private clearTimeouts(): void {
        this.clearShowTimeout();
        this.clearHideTimeout();
        this.clearInteractiveTimeout();
    }

    private isLocked(): boolean {
        return this.sharedState.lockOwner != null;
    }
}
