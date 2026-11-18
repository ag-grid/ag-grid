import { AgAbstractBean } from '../core/agAbstractBean';
import type { AgBeanCollection } from '../interfaces/agBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IComponent } from '../interfaces/iComponent';
import type { ICommonSource, WithoutCommon } from '../interfaces/iEvent';
import type { IPopupService } from '../interfaces/iPopupService';
import type { IPropertiesService } from '../interfaces/iProperties';
import type { TooltipCtrl, TooltipDetails } from '../interfaces/iTooltip';
import type { TooltipPosition } from '../popup/tooltipPositionUtils';
import { _getAriaDescribedBy, _setAriaDescribedBy, _setAriaHidden, _setAriaRole } from '../utils/aria';
import { _getActiveDomElement, _getDocument, _getWindow } from '../utils/document';
import { _observeResize } from '../utils/dom';
import { _addManagedElementListeners } from '../utils/event';
import { _findFocusableElements } from '../utils/focus';

enum TooltipStates {
    NOTHING,
    WAITING_TO_SHOW,
    SHOWING,
}

interface TooltipOwner {
    hideTooltip(forceHide?: boolean): void;
    isTooltipFocused(): boolean;
    hasFocusedSourceWithin(element: HTMLElement): boolean;
    isTooltipTriggeredByFocus(): boolean;
    isTooltipHoveredOrLeaving(): boolean;
}

interface SharedTooltipState {
    lastHideTime?: number;
    lastMouseX?: number;
    lastMouseY?: number;
    owner?: TooltipOwner;
}

const SHOW_SWITCH_TOOLTIP_DIFF = 1000;
const FADE_OUT_TOOLTIP_TIMEOUT = 1000;
const TOOLTIP_LEAVE_DELAY = 100;
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
    TBeanCollection extends AgBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties> & ICommonSource<TCommon>,
    TTooltipParams extends BaseTooltipParams<TLocation>,
    TTooltipCtrlParams extends TooltipDetails<TLocation>,
    TLocation extends string,
> extends AgAbstractBean<TBeanCollection, TProperties, TGlobalEvents, TPropertiesService> {
    private popupSvc?: IPopupService<any>;
    private state = TooltipStates.NOTHING;
    private sharedState!: SharedTooltipState;
    private tooltipTrigger: NonNullable<BaseProperties['tooltipTrigger']>;
    private tooltipPosition: TooltipPosition = 'top-start';
    private interactionEnabled = false;
    private sourceHovered = false;
    private sourceFocused = false;
    private tooltipHovered = false;
    private lastMouseEvent: MouseEvent | Touch | null = null;
    private hoverGraceTimeout: number | undefined;
    private showTimeout: number | undefined;
    private hideTimeout: number | undefined;
    private leaveTimeout: number | undefined;
    private tooltipComp: IComponent<TTooltipParams> | undefined;
    private tooltipParams: TTooltipParams | undefined;
    private tooltipPopupDestroyFunc: (() => void) | undefined;
    private tooltipInstanceCount = 0;
    private showEventDispatched = false;
    private readonly popupListeners: (() => void)[] = [];
    private onBodyScrollEventCallback: (() => null) | undefined;
    private description: HTMLElement | undefined;
    private describedById: string | undefined;
    private describedBySource: HTMLElement | undefined;

    constructor(
        protected readonly tooltipCtrl: TooltipCtrl<TLocation, TTooltipCtrlParams>,
        private readonly getTooltip: () => TTooltipCtrlParams
    ) {
        super();
    }

    public wireBeans(beans: TBeanCollection): void {
        this.popupSvc = beans.popupSvc;
    }

    protected abstract createTooltipComp(
        params: TTooltipParams,
        tooltip: TTooltipCtrlParams,
        callback: (comp: IComponent<TTooltipParams>) => void
    ): void;
    protected abstract setEventHandlers(listener: () => void): void;
    protected abstract clearEventHandlers(): void;

    protected getPopupPositionParams(_position: TooltipPosition, _params: TTooltipParams): unknown {
        return undefined;
    }

    protected getTooltipPosition(_tooltip: TTooltipCtrlParams, _trigger: 'hover' | 'focus'): TooltipPosition {
        return 'top-start';
    }

    protected getTooltipInteraction(_tooltip: TTooltipCtrlParams): boolean {
        return this.gos.get('tooltipInteraction') === true;
    }

    protected isTooltipAllowed(): boolean {
        return true;
    }

    protected getAriaDescription(params: TTooltipParams): string | undefined {
        const value = params.value;
        return value != null && typeof value !== 'object' && typeof value !== 'function' ? String(value) : undefined;
    }

    public postConstruct(): void {
        let sharedState = sharedStateByGrid.get(this.gos);
        if (!sharedState) {
            sharedState = {};
            sharedStateByGrid.set(this.gos, sharedState);
        }
        this.sharedState = sharedState;
        const trigger = this.gos.get('tooltipTrigger');
        this.tooltipTrigger = trigger === 'focus' || trigger === 'hoverOrFocus' ? trigger : 'hover';
        this.interactionEnabled = this.gos.get('tooltipInteraction') === true;
        const el = this.tooltipCtrl.getGui();

        if (this.tooltipTrigger !== 'focus') {
            this.addManagedListeners(el, {
                mouseenter: this.onMouseEnter.bind(this),
                mouseleave: () => {
                    this.sourceHovered = false;
                    window.clearTimeout(this.hoverGraceTimeout);
                    this.hoverGraceTimeout = undefined;
                    this.hideWhenInactive(true);
                },
                mousemove: (event: MouseEvent) => {
                    const owner = this.sharedState.owner;
                    if (
                        this.updateMousePosition(event) &&
                        this.hoverGraceTimeout == null &&
                        owner !== this &&
                        owner?.isTooltipTriggeredByFocus()
                    ) {
                        this.prepareToShowTooltip(event);
                    }
                    if (this.lastMouseEvent) {
                        this.lastMouseEvent = event;
                        if (this.gos.get('tooltipMouseTrack') && this.tooltipComp) {
                            this.positionTooltip();
                        }
                    }
                },
            });
        }

        if (this.tooltipTrigger !== 'hover') {
            this.addManagedListeners(el, {
                focusin: () => {
                    if (this.tooltipCtrl.shouldDisplayTooltipOnFocus?.() !== false) {
                        this.setFocused(true);
                    }
                },
                focusout: (event: FocusEvent) => {
                    if (!el.contains(event.relatedTarget as Node)) {
                        this.setFocused(false);
                    }
                },
            });
        }

        this.addManagedListeners(el, {
            mousedown: () => {
                if (this.tooltipTrigger !== 'hover') {
                    return;
                }
                const interactionEnabled =
                    this.state === TooltipStates.WAITING_TO_SHOW
                        ? this.getTooltipInteraction(this.getTooltip())
                        : this.interactionEnabled;
                if (!interactionEnabled) {
                    this.hideTooltip();
                }
            },
            keydown: (event: KeyboardEvent) => {
                if (this.tooltipTrigger === 'hover' && event.key !== 'Tab' && event.key !== 'Escape') {
                    this.hideTooltip();
                }
            },
        });
    }

    public isShowing(): boolean {
        return this.state === TooltipStates.SHOWING;
    }

    private updateMousePosition({ clientX, clientY }: MouseEvent): boolean {
        const state = this.sharedState;
        const moved = state.lastMouseX !== clientX || state.lastMouseY !== clientY;
        state.lastMouseX = clientX;
        state.lastMouseY = clientY;
        return moved;
    }

    public onMouseEnter(event: MouseEvent): void {
        const fromTouch = (event as MouseEvent & { sourceCapabilities?: { firesTouchEvents?: boolean } })
            .sourceCapabilities?.firesTouchEvents;
        if (fromTouch) {
            return;
        }
        this.clearLeaveTimeout();
        this.sourceHovered = true;
        const owner = this.sharedState.owner;
        // Removing a tooltip beneath a stationary pointer can synthesise mouseenter on the old source.
        if (!this.updateMousePosition(event) && owner !== this && owner?.isTooltipTriggeredByFocus()) {
            return;
        }
        if (owner !== this && owner?.isTooltipHoveredOrLeaving()) {
            // Allow the pointer to cross another source on its way to the current tooltip.
            window.clearTimeout(this.hoverGraceTimeout);
            this.hoverGraceTimeout = window.setTimeout(() => this.prepareToShowTooltip(event), TOOLTIP_LEAVE_DELAY);
        } else {
            this.prepareToShowTooltip(event);
        }
    }

    public setFocused(focused: boolean): void {
        if (this.tooltipTrigger === 'hover' || this.sourceFocused === focused) {
            return;
        }
        this.sourceFocused = focused;
        if (focused) {
            this.refreshAriaDescription();
            this.prepareToShowTooltip();
        } else {
            this.disconnectAriaDescription();
            if (this.tooltipComp) {
                this.connectAriaDescription(this.tooltipComp.getGui());
            }
            this.hideWhenInactive(true);
        }
    }

    public showTooltipOnFocus(): void {
        if (this.tooltipTrigger === 'hover' || !this.tooltipCtrl.getGui().contains(_getActiveDomElement(this.beans))) {
            return;
        }
        this.setFocused(true);
        this.prepareToShowTooltip();
    }

    public refreshTooltip(): void {
        if (this.isShowing()) {
            this.hideTooltip(true);
        }
        this.disconnectAriaDescription();
        if (this.sourceFocused) {
            this.refreshAriaDescription();
        }
    }

    public prepareToShowTooltip(mouseEvent?: MouseEvent | Touch, showDelayOverride?: number): void {
        this.clearLeaveTimeout();
        if (this.state !== TooltipStates.NOTHING || !this.isAlive() || !this.isTooltipAllowed()) {
            return;
        }
        window.clearTimeout(this.hoverGraceTimeout);
        this.hoverGraceTimeout = undefined;
        const owner = this.sharedState.owner;
        if (owner !== this && (owner?.isTooltipFocused() || owner?.hasFocusedSourceWithin(this.tooltipCtrl.getGui()))) {
            return;
        }
        owner?.hideTooltip(true);
        this.sharedState.owner = this;

        let delay = showDelayOverride;
        if (delay == null) {
            if (mouseEvent) {
                const lastHide = this.sharedState.lastHideTime;
                delay = this.getTooltipDelay(
                    lastHide != null && Date.now() - lastHide < SHOW_SWITCH_TOOLTIP_DIFF ? 'SwitchShow' : 'Show'
                );
            } else {
                delay = this.tooltipTrigger === 'hoverOrFocus' ? this.getTooltipDelay('Show') : 0;
            }
        }
        this.lastMouseEvent = mouseEvent ?? null;
        this.state = TooltipStates.WAITING_TO_SHOW;
        this.showTimeout = window.setTimeout(() => this.showTooltip(), Math.max(0, delay ?? 0));

        const hide = () => this.hideTooltip(true);
        [this.onBodyScrollEventCallback] = this.addManagedEventListeners({
            bodyScroll: () => {
                // Focusing an off-screen cell scrolls it into view before its tooltip appears.
                if (!this.sourceFocused || this.state !== TooltipStates.WAITING_TO_SHOW) {
                    hide();
                }
            },
        });
        this.setEventHandlers(hide);
        const doc = _getDocument(this.beans);
        const keydown = this.onDocumentKeyDown.bind(this);
        // Dismiss before the same Escape can cancel editing or close the source menu.
        doc.addEventListener('keydown', keydown, true);
        this.popupListeners.push(() => doc.removeEventListener('keydown', keydown, true));
    }

    protected canShowTooltip(): boolean {
        return this.isTooltipAllowed() && this.getTooltipDetails() != null;
    }

    private isSourceClipped(): boolean {
        const source = this.tooltipCtrl.getGui();
        const rect = source.getBoundingClientRect();
        const win = _getWindow(this.beans);
        let parent: Element | null = source.parentElement;
        while (parent) {
            const { overflowX, overflowY } = win.getComputedStyle(parent);
            const bounds = parent.getBoundingClientRect();
            if (
                (overflowX && overflowX !== 'visible' && (rect.right <= bounds.left || rect.left >= bounds.right)) ||
                (overflowY && overflowY !== 'visible' && (rect.bottom <= bounds.top || rect.top >= bounds.bottom))
            ) {
                return true;
            }
            parent = parent.parentElement ?? (parent.getRootNode() as ShadowRoot).host ?? null;
        }
        return false;
    }

    private getTooltipDetails(): TTooltipCtrlParams | undefined {
        const tooltip = this.getTooltip();
        const value = tooltip.value;
        if (value == null || value === '' || this.tooltipCtrl.shouldDisplayTooltip?.(tooltip) === false) {
            return;
        }
        return tooltip;
    }

    private getParams(tooltip: TTooltipCtrlParams): TTooltipParams {
        return this.gos.addCommon<TCommon & TTooltipParams>({
            ...tooltip.params,
            location: tooltip.location ?? this.tooltipCtrl.getLocation?.() ?? 'UNKNOWN',
            value: tooltip.value,
        } as unknown as WithoutCommon<TCommon, TCommon & TTooltipParams>);
    }

    private showTooltip(): void {
        this.showTimeout = undefined;
        if (!this.isAlive() || this.sharedState.owner !== this || !this.isTooltipAllowed()) {
            this.hideTooltip(true);
            return;
        }
        const tooltip = this.getTooltipDetails();
        if (!tooltip || (this.sourceFocused && this.isSourceClipped())) {
            this.hideTooltip(true);
            return;
        }
        this.state = TooltipStates.SHOWING;
        const instance = ++this.tooltipInstanceCount;
        this.tooltipPosition = this.getTooltipPosition(tooltip, this.lastMouseEvent ? 'hover' : 'focus');
        if (!this.isAlive() || instance !== this.tooltipInstanceCount) {
            return;
        }
        this.interactionEnabled = this.getTooltipInteraction(tooltip);
        if (!this.isAlive() || instance !== this.tooltipInstanceCount) {
            return;
        }
        const params = this.getParams(tooltip);
        this.createTooltipComp({ ...params, hideTooltipCallback: () => this.hideTooltip(true) }, tooltip, (comp) => {
            if (!this.isAlive() || this.state !== TooltipStates.SHOWING || instance !== this.tooltipInstanceCount) {
                this.destroyBean(comp);
                return;
            }
            this.showComponent(comp, params);
        });
    }

    private showComponent(comp: IComponent<TTooltipParams>, params: TTooltipParams): void {
        const eGui = comp.getGui();
        eGui.id ||= `ag-tooltip-${++tooltipIdSequence}`;
        this.tooltipComp = comp;
        this.tooltipParams = params;
        if (!eGui.classList.contains('ag-tooltip')) {
            eGui.classList.add('ag-tooltip-custom');
        }
        if (this.lastMouseEvent) {
            eGui.classList.add('ag-tooltip-animate');
        }
        if (this.interactionEnabled) {
            eGui.classList.add('ag-tooltip-interactive');
        }
        if (!eGui.hasAttribute('role')) {
            _setAriaRole(eGui, this.interactionEnabled ? 'dialog' : 'tooltip');
        }
        if (!this.description) {
            if (this.sourceFocused) {
                this.refreshAriaDescription();
            } else {
                this.connectAriaDescription(eGui);
            }
        }
        const popup = this.popupSvc?.addPopup({
            eChild: eGui,
            ...(this.interactionEnabled
                ? { ariaLabel: this.getLocaleTextFunc()('ariaLabelTooltip', 'Tooltip') }
                : { ariaOwns: this.tooltipCtrl.getGui() }),
        });
        this.tooltipPopupDestroyFunc = popup?.hideFunc;
        this.positionTooltip();
        if (this.tooltipComp !== comp) {
            return;
        }

        let width = eGui.offsetWidth;
        let height = eGui.offsetHeight;
        this.popupListeners.push(
            _observeResize(this.beans, eGui, () => {
                const { offsetWidth, offsetHeight } = eGui;
                if (this.tooltipComp !== comp || (width === offsetWidth && height === offsetHeight)) {
                    return;
                }
                width = offsetWidth;
                height = offsetHeight;
                this.positionTooltip();
            }),
            ..._addManagedElementListeners(this, eGui, {
                mouseenter: () => {
                    this.tooltipHovered = true;
                    this.clearLeaveTimeout();
                },
                mouseleave: () => {
                    this.tooltipHovered = false;
                    this.hideWhenInactive(true);
                },
                focusin: () => this.clearLeaveTimeout(),
                focusout: (event: FocusEvent) => {
                    const next = event.relatedTarget as Node;
                    if (!eGui.contains(next) && !this.tooltipCtrl.getGui().contains(next)) {
                        this.clearLeaveTimeout();
                        this.leaveTimeout = window.setTimeout(() => this.hideWhenInactive(), TOOLTIP_LEAVE_DELAY);
                    }
                    this.startHideTimeout();
                },
            }),
            ..._addManagedElementListeners(this, _getDocument(this.beans), {
                touchstart: (event) => {
                    if (event && !event.composedPath().includes(eGui)) {
                        this.hideTooltip(true);
                    }
                },
            })
        );
        this.showEventDispatched = true;
        this.eventSvc.dispatchEvent({ type: 'tooltipShow', tooltipGui: eGui, parentGui: this.tooltipCtrl.getGui() });
        this.startHideTimeout();
    }

    public isTooltipFocused(): boolean {
        return !!this.interactionEnabled && !!this.tooltipComp?.getGui().contains(_getActiveDomElement(this.beans));
    }

    public isTooltipTriggeredByFocus(): boolean {
        return this.sourceFocused && !this.lastMouseEvent;
    }

    public hasFocusedSourceWithin(element: HTMLElement): boolean {
        const source = this.tooltipCtrl.getGui();
        return this.sourceFocused && source !== element && element.contains(source) && this.canShowTooltip();
    }

    public isTooltipHoveredOrLeaving(): boolean {
        return !!this.tooltipComp && (this.tooltipHovered || this.leaveTimeout != null);
    }

    private hideWhenInactive(delayed = false): void {
        this.clearLeaveTimeout();
        if (delayed && this.tooltipComp) {
            this.leaveTimeout = window.setTimeout(() => {
                this.leaveTimeout = undefined;
                this.hideWhenInactive();
            }, TOOLTIP_LEAVE_DELAY);
        } else if (!this.sourceHovered && !this.sourceFocused && !this.tooltipHovered && !this.isTooltipFocused()) {
            this.hideTooltip();
        }
    }

    public hideTooltip(forceHide?: boolean, immediate = false): void {
        if (!forceHide && this.isTooltipFocused()) {
            return;
        }
        this.tooltipInstanceCount++;
        if (this.tooltipComp) {
            this.destroyTooltipComp(immediate);
            this.sharedState.lastHideTime = Date.now();
        }
        if (this.sharedState.owner === this) {
            this.sharedState.owner = undefined;
        }
        this.state = TooltipStates.NOTHING;
        this.lastMouseEvent = null;
        this.tooltipHovered = false;
        window.clearTimeout(this.hoverGraceTimeout);
        window.clearTimeout(this.showTimeout);
        window.clearTimeout(this.hideTimeout);
        this.hoverGraceTimeout = this.showTimeout = this.hideTimeout = undefined;
        this.clearLeaveTimeout();
        for (const removeListener of this.popupListeners.splice(0)) {
            removeListener();
        }
        this.onBodyScrollEventCallback?.();
        this.onBodyScrollEventCallback = undefined;
        this.clearEventHandlers();
        if (!this.sourceFocused || !this.description) {
            this.disconnectAriaDescription();
        }
        if (this.showEventDispatched) {
            this.showEventDispatched = false;
            this.eventSvc.dispatchEvent({ type: 'tooltipHide', parentGui: this.tooltipCtrl.getGui() });
        }
    }

    private onDocumentKeyDown(event: KeyboardEvent): void {
        const source = this.tooltipCtrl.getGui();
        if (event.key === 'Escape') {
            if (this.tooltipComp) {
                event.preventDefault();
                event.stopImmediatePropagation();
                if (this.isTooltipFocused() && source.isConnected) {
                    source.focus({ preventScroll: true });
                }
            }
            this.hideTooltip(true);
        } else if (
            event.key === 'Tab' &&
            this.interactionEnabled &&
            this.tooltipComp &&
            event.composedPath().includes(source)
        ) {
            const elements = _findFocusableElements(this.tooltipComp.getGui());
            const next = event.shiftKey ? elements.at(-1) : elements[0];
            if (next) {
                event.preventDefault();
                event.stopPropagation();
                next.focus();
            }
        }
    }

    private refreshAriaDescription(): void {
        const tooltip = this.getTooltipDetails();
        if (!tooltip) {
            this.disconnectAriaDescription();
            return;
        }
        const text = this.getAriaDescription(this.getParams(tooltip));
        if (!text) {
            this.disconnectAriaDescription();
            return;
        }
        if (!this.description) {
            const source = this.tooltipCtrl.getGui();
            this.disconnectAriaDescription();
            const description = source.ownerDocument.createElement('div');
            description.hidden = true;
            // Keep the description in the source's tree, including when the grid is in a shadow root.
            const root = source.getRootNode();
            (root === source.ownerDocument ? source.ownerDocument.body : root).appendChild(description);
            this.description = description;
            this.connectAriaDescription(description);
        }
        this.description.textContent = text;
    }

    private connectAriaDescription(element: HTMLElement): void {
        element.id ||= `ag-tooltip-${++tooltipIdSequence}`;
        const source = this.tooltipCtrl.getAriaElement?.() ?? this.tooltipCtrl.getGui();
        const ids = _getAriaDescribedBy(source)?.split(/\s+/).filter(Boolean) ?? [];
        if (!ids.includes(element.id)) {
            _setAriaDescribedBy(source, [...ids, element.id].join(' '));
        }
        this.describedById = element.id;
        this.describedBySource = source;
    }

    private disconnectAriaDescription(): void {
        const { describedById, describedBySource } = this;
        if (describedById && describedBySource) {
            const ids = _getAriaDescribedBy(describedBySource)
                ?.split(/\s+/)
                .filter((id) => id && id !== describedById);
            _setAriaDescribedBy(describedBySource, ids?.join(' '));
        }
        this.description?.remove();
        this.description = this.describedById = this.describedBySource = undefined;
    }

    private positionTooltip(): void {
        const { gos, popupSvc, lastMouseEvent } = this;
        const eventSource = this.tooltipCtrl.getGui();
        const tracking = !!gos.get('tooltipMouseTrack');
        const offset = gos.get('tooltipOffset');
        const ePopup = this.tooltipComp!.getGui();
        const params = this.tooltipParams!;
        popupSvc?.positionPopupForTooltip({
            ePopup,
            eventSource,
            pointer:
                lastMouseEvent && (tracking || gos.get('tooltipAnchor') === 'pointer') ? lastMouseEvent : undefined,
            position: this.tooltipPosition,
            gap: typeof offset === 'number' && Number.isFinite(offset) && offset >= 0 ? offset : 6,
            postProcessCallback: (position) =>
                popupSvc.callPostProcessPopup(
                    this.getPopupPositionParams(position, params),
                    'tooltip',
                    ePopup,
                    eventSource,
                    lastMouseEvent
                ),
        });
    }

    private destroyTooltipComp(immediate = false): void {
        const comp = this.tooltipComp!;
        const gui = comp.getGui();
        const destroyPopup = this.tooltipPopupDestroyFunc;
        gui.classList.add('ag-tooltip-hiding');
        _setAriaHidden(gui, true);
        const delay = !immediate && this.lastMouseEvent ? FADE_OUT_TOOLTIP_TIMEOUT : 0;
        if (immediate) {
            gui.style.display = 'none';
        }
        window.setTimeout(() => {
            destroyPopup?.();
            this.destroyBean(comp);
        }, delay);
        this.tooltipComp = undefined;
        this.tooltipParams = undefined;
        this.tooltipPopupDestroyFunc = undefined;
    }

    private getTooltipDelay(type: 'Show' | 'Hide' | 'SwitchShow'): number | undefined {
        return this.tooltipCtrl[`getTooltip${type}DelayOverride`]?.() ?? this.gos.get(`tooltip${type}Delay`);
    }

    private startHideTimeout(): void {
        window.clearTimeout(this.hideTimeout);
        const delay = this.getTooltipDelay('Hide');
        this.hideTimeout = delay == null ? undefined : window.setTimeout(() => this.hideTooltip(), Math.max(0, delay));
    }

    private clearLeaveTimeout(): void {
        window.clearTimeout(this.leaveTimeout);
        this.leaveTimeout = undefined;
    }

    public override destroy(): void {
        this.hideTooltip(true);
        this.disconnectAriaDescription();
        super.destroy();
    }
}
