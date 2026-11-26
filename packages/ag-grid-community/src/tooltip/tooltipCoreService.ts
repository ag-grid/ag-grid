import type { HighlightTooltipEventType, IEventEmitter } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEditorTooltipSource, _createCellTooltipSource } from './cellTooltip';
import type { TooltipFeature, TooltipSource } from './tooltipFeature';
import { shouldDisplayTextTooltip } from './tooltipFeature';

/**
 * Owns the tooltip feature lifecycle for features that show their own tooltips, such as validation errors.
 * Tooltips the grid shows unprompted (configured, automatic and built-in) are added by `TooltipModule`.
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
    public createTooltip(source: TooltipSource): TooltipFeature | undefined {
        const { beans } = this;
        this.configureTextTooltip(source);
        return beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, source, beans);
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
    ): TooltipFeature | undefined {
        const { beans } = this;
        this.configureTextTooltip(source);
        return beans.registry.createDynamicBean<TooltipFeature>(
            'highlightTooltipFeature',
            false,
            source,
            highlightTracker,
            beans
        );
    }

    /** Replaces and initialises a tooltip owned by an already-attached host. */
    public registerTooltip(
        owner: BeanStub,
        source: TooltipSource,
        current?: TooltipFeature
    ): TooltipFeature | undefined {
        const { beans } = this;
        owner.destroyBean(current, beans.context);
        const feature = this.createTooltip(source);
        return feature ? owner.createBean(feature, beans.context) : undefined;
    }

    /** Calls through to standalone method for treeshaking via the tooltipCoreSvc */
    public enableCellTooltipFeature(ctrl: CellCtrl): TooltipFeature | undefined {
        return this.createTooltip(_createCellTooltipSource(this.beans, ctrl));
    }

    /** Calls through to standalone method for treeshaking via the tooltipCoreSvc */
    public setupCellEditorTooltip(ctrl: CellCtrl, editor: ICellEditor): TooltipFeature | undefined {
        const source = _createCellEditorTooltipSource(this.beans, ctrl, editor);
        return source ? this.registerTooltip(ctrl, source) : undefined;
    }
}
