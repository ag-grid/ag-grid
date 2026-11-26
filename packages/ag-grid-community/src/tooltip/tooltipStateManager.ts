import type { IComponent } from 'ag-stack';
import { BaseTooltipStateManager, _isTooltipPosition } from 'ag-stack';

import { _getBuiltInTooltipCompDetails, _getTooltipCompDetails } from '../components/framework/userCompUtils';
import type { BeanCollection } from '../context/context';
import { isColumn } from '../entities/agColumn';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import { _getDomData } from '../gridOptionsUtils';
import type { AbstractHeaderCellCtrl } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import { DOM_DATA_KEY_HEADER_CTRL } from '../headerRendering/cells/abstractCell/abstractHeaderCellCtrl';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { PopupPositionParams } from '../interfaces/iPopupPositionParams';
import { _getCellCtrlForEventTarget, _getRowCtrlForEventTarget } from '../rendering/renderUtils';
import type {
    BuiltInTooltipControl,
    ITooltipParams,
    TooltipCallbackParams,
    TooltipLocation,
    TooltipPosition,
} from './tooltipComponent';
import type { ResolvedTooltip } from './tooltipFeature';

export class TooltipStateManager extends BaseTooltipStateManager<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    ITooltipParams,
    ResolvedTooltip,
    TooltipLocation
> {
    private onColumnMovedEventCallback: (() => null) | undefined;
    private onContextMenuEventCallback: (() => null) | undefined;

    protected override isTooltipAllowed(): boolean {
        return (
            !(this.tooltipCtrl.control && this.gos.get('suppressBuiltInTooltips')) &&
            (!this.beans.tooltipSvc?.isContextMenuOpen || this.tooltipCtrl.getLocation?.() === 'menu')
        );
    }

    protected override getTooltipTrigger() {
        return this.tooltipCtrl.control ? 'hoverOrFocus' : super.getTooltipTrigger();
    }

    protected override getTooltipFocusShowDelay(): number | undefined {
        return this.tooltipCtrl.control ? 0 : super.getTooltipFocusShowDelay();
    }

    protected override isTooltipMouseTracking(): boolean {
        return !this.tooltipCtrl.control && super.isTooltipMouseTracking();
    }

    protected override isTooltipPointerAnchored(): boolean {
        return !this.tooltipCtrl.control && super.isTooltipPointerAnchored();
    }

    protected override getTooltipPosition(tooltip: ResolvedTooltip, trigger: 'hover' | 'focus'): TooltipPosition {
        const configured = this.gos.get('tooltipPosition');
        const position =
            typeof configured === 'function' ? configured({ ...this.getCallbackParams(tooltip), trigger }) : configured;
        if (_isTooltipPosition(position)) {
            return position;
        }
        if (this.tooltipCtrl.control === 'toolPanel') {
            const sideBarOnLeft = this.beans.sideBar?.comp.getSideBarPosition() === 'left';
            const visuallyOnLeft = sideBarOnLeft !== this.gos.get('enableRtl');
            return visuallyOnLeft ? 'right' : 'left';
        }
        return this.tooltipCtrl.control ? 'top' : super.getTooltipPosition(tooltip, trigger);
    }

    protected override getTooltipInteraction(tooltip?: ResolvedTooltip): boolean {
        const configured = this.gos.get('tooltipInteraction');
        if (typeof configured !== 'function') {
            return !!configured;
        }
        tooltip ??= this.getTooltipDetails();
        return !!tooltip && configured(this.getCallbackParams(tooltip));
    }

    private getCallbackParams(tooltip: ResolvedTooltip): TooltipCallbackParams {
        return this.gos.addCommon({
            location: tooltip.location ?? this.tooltipCtrl.getLocation?.() ?? 'UNKNOWN',
            value: tooltip.value,
            ...tooltip.params,
            ...tooltip.sourceValues,
        });
    }

    public override postConstruct(): void {
        super.postConstruct();

        const unregister = this.beans.tooltipTouchSvc?.registerSource(
            this.tooltipCtrl.getGui(),
            () => this.canShowTooltip(),
            (touchStart) => this.prepareToShowTooltip(touchStart, 0)
        );
        if (unregister) {
            this.addDestroyFunc(unregister);
        }
    }

    public override onMouseEnter(event: MouseEvent): void {
        if (this.beans.tooltipTouchSvc?.isCompatibilityMouseEvent(this.tooltipCtrl.getGui())) {
            return;
        }
        super.onMouseEnter(event);
    }

    protected override onAncestorScroll(event: Event): void {
        // The grid viewport's own scrolling suspends and resumes through bodyScroll / bodyScrollEnd instead.
        if (event.target !== this.beans.ctrlsSvc.getGridBodyCtrl()?.eGridViewport) {
            super.onAncestorScroll(event);
        }
    }

    protected override getAriaDescription(params: ITooltipParams): string | undefined {
        const description = this.gos.get('getTooltipAriaDescription')?.(params);
        return description === undefined ? super.getAriaDescription(params) : (description ?? undefined);
    }

    protected override createTooltipComp(
        params: ITooltipParams<any, any, any>,
        tooltip: ResolvedTooltip,
        callback: (comp: IComponent<ITooltipParams<any, any, any>>) => void
    ): void {
        const control = this.tooltipCtrl.control as BuiltInTooltipControl | undefined;
        if (control) {
            const { value, ...common } = params;
            const userDetails = _getBuiltInTooltipCompDetails(this.beans.userCompFactory, {
                ...common,
                control,
                text: String(value),
                hideTooltipCallback: params.hideTooltipCallback!,
            });
            userDetails?.newAgStackInstance().then((comp) => {
                if (comp) {
                    comp.getGui().classList.add('ag-tooltip');
                    callback(comp);
                }
            });
            return;
        }
        const userDetails = _getTooltipCompDetails(this.beans.userCompFactory, params, tooltip.componentDefinition);
        userDetails?.newAgStackInstance().then(callback);
    }

    protected override setEventHandlers(listener: () => void): void {
        [this.onColumnMovedEventCallback, this.onContextMenuEventCallback] = this.addManagedEventListeners({
            columnMoved: listener,
            contextMenuVisibleChanged: ({ visible }) => {
                if (visible && this.tooltipCtrl.getLocation?.() !== 'menu') {
                    this.hideTooltip(true, true);
                }
            },
        });
    }

    protected override clearEventHandlers(): void {
        this.onColumnMovedEventCallback?.();
        this.onColumnMovedEventCallback = undefined;
        this.onContextMenuEventCallback?.();
        this.onContextMenuEventCallback = undefined;
    }

    protected override getPopupPositionParams(position: TooltipPosition, params: ITooltipParams): PopupPositionParams {
        const column = params.column;
        return {
            column: column && isColumn(column) ? column : undefined,
            rowNode: params.node,
            tooltipLocation: params.location,
            tooltipPosition: position,
        };
    }

    protected override getTooltipSourceRect(eventSource: HTMLElement) {
        return clipToGridViewport(this.beans, eventSource, super.getTooltipSourceRect(eventSource));
    }
}

function clipToGridViewport(
    beans: BeanCollection,
    eventSource: HTMLElement,
    rect: { top: number; right: number; bottom: number; left: number }
) {
    const { gos } = beans;
    const headerCtrl = _getDomData(gos, eventSource, DOM_DATA_KEY_HEADER_CTRL) as AbstractHeaderCellCtrl | undefined;
    const column = headerCtrl?.column ?? _getCellCtrlForEventTarget(gos, eventSource)?.column;
    const rowNode = _getRowCtrlForEventTarget(gos, eventSource)?.rowNode;
    const scrollingRow = rowNode && !rowNode.rowPinned && !rowNode.sticky;
    if ((column && !column.pinned) || scrollingRow) {
        const bodyCtrl = beans.ctrlsSvc.getGridBodyCtrl();
        const viewport = bodyCtrl.eGridViewport;
        const bounds = viewport.getBoundingClientRect();
        // Sticky rows and columns occlude scrolling sources without clipping their DOM ancestors.
        if (column && !column.pinned) {
            const scale = viewport.offsetWidth ? bounds.width / viewport.offsetWidth : 1;
            const left = bounds.left + viewport.clientLeft * scale;
            rect.left = Math.max(rect.left, left + beans.visibleCols.getLeftStickyColumnContainerWidth() * scale);
            rect.right = Math.min(
                rect.right,
                left + (viewport.clientWidth - beans.visibleCols.getRightStickyColumnContainerWidth()) * scale
            );
        }
        if (scrollingRow) {
            const scale = viewport.offsetHeight ? bounds.height / viewport.offsetHeight : 1;
            const top = bounds.top + viewport.clientTop * scale;
            rect.top = Math.max(rect.top, top + (bodyCtrl.getTopPinnedRowsOffset() + bodyCtrl.stickyTopHeight) * scale);
            rect.bottom = Math.min(
                rect.bottom,
                top +
                    (viewport.clientHeight - bodyCtrl.getBottomPinnedRowsOffset() - bodyCtrl.stickyBottomHeight) * scale
            );
        }
    }
    return rect;
}
