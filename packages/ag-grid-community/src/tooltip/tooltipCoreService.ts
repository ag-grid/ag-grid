import type { HighlightTooltipEventType, IEventEmitter } from 'ag-stack';
import { AgHighlightTooltipFeature, AgTooltipFeature } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgEventTypeParams } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEditorTooltipSource, _createCellTooltipSource } from './cellTooltip';
import type { ITooltipParams, TooltipLocation } from './tooltipComponent';
import type { ResolvedTooltip, TooltipFeature, TooltipSource } from './tooltipFeature';
import { shouldDisplayTextTooltip } from './tooltipFeature';

/**
 * Creates tooltips for features that show their own, such as validation errors. Tooltips the grid shows
 * unprompted are created through the registry, whose tooltip features only `TooltipModule` registers.
 */
export class TooltipCoreService extends BeanStub implements NamedBean {
    beanName = 'tooltipCoreSvc' as const;
    public isContextMenuOpen = false;

    public postConstruct(): void {
        this.addManagedEventListeners({
            contextMenuVisibleChanged: ({ visible }) => {
                this.isContextMenuOpen = visible;
                if (!visible) {
                    return;
                }
                // Fading tooltips have already released their state-manager listeners.
                for (const popup of this.beans.popupSvc?.getActivePopups() ?? []) {
                    if (popup.classList.contains('ag-tooltip-hiding')) {
                        popup.style.display = 'none';
                    }
                }
            },
        });
    }

    /** Creates an uninitialised feature for hosts whose element is attached later (ordinary cells). */
    public createTooltip(source: TooltipSource): TooltipFeature {
        this.configureTextTooltip(source);
        return new AgTooltipFeature<
            BeanCollection,
            GridOptionsWithDefaults,
            AgEventTypeParams,
            AgGridCommon<any, any>,
            GridOptionsService,
            ITooltipParams,
            ResolvedTooltip,
            TooltipLocation
        >(source, this.beans);
    }

    private configureTextTooltip(source: TooltipSource): void {
        const { getTextElement, shouldDisplayTooltip } = source;
        if (getTextElement) {
            source.shouldDisplayTooltip = (tooltip) =>
                shouldDisplayTooltip?.(tooltip) !== false && shouldDisplayTextTooltip(tooltip, getTextElement);
        }
    }

    /** Creates a feature which can also be shown when its owner reports keyboard highlight changes. */
    public createHighlightTooltip(
        source: TooltipSource,
        highlightTracker: IEventEmitter<HighlightTooltipEventType>
    ): TooltipFeature {
        this.configureTextTooltip(source);
        return new AgHighlightTooltipFeature<
            BeanCollection,
            GridOptionsWithDefaults,
            AgEventTypeParams,
            AgGridCommon<any, any>,
            GridOptionsService,
            ITooltipParams,
            ResolvedTooltip,
            TooltipLocation
        >(source, highlightTracker, this.beans);
    }

    /** Replaces and initialises a tooltip owned by an already-attached host. */
    public registerTooltip(owner: BeanStub, source: TooltipSource, current?: TooltipFeature): TooltipFeature {
        const { beans } = this;
        owner.destroyBean(current, beans.context);
        return owner.createBean(this.createTooltip(source), beans.context);
    }

    /** Calls through to standalone method for treeshaking via the tooltipCoreSvc */
    public enableCellTooltipFeature(ctrl: CellCtrl): TooltipFeature {
        return this.createTooltip(_createCellTooltipSource(this.beans, ctrl));
    }

    /** Calls through to standalone method for treeshaking via the tooltipCoreSvc */
    public setupCellEditorTooltip(ctrl: CellCtrl, editor: ICellEditor): TooltipFeature | undefined {
        const source = _createCellEditorTooltipSource(this.beans, ctrl, editor);
        return source ? this.registerTooltip(ctrl, source) : undefined;
    }
}
