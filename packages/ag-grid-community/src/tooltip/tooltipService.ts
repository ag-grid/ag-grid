import type { HighlightTooltipEventType, IEventEmitter } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { HeaderCellCtrl } from '../headerRendering/cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { ICellEditor } from '../interfaces/iCellEditor';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { _createCellEditorTooltipSource, _createCellTooltipSource } from './cellTooltip';
import { FullWidthRowTooltips } from './fullWidthRowTooltips';
import type { ComponentTooltip } from './headerTooltipSource';
import { _setupHeaderGroupTooltip, _setupHeaderTooltip } from './headerTooltipSource';
import type { TooltipFeature, TooltipSource } from './tooltipFeature';
import { _initColTooltip } from './tooltipValueUtils';

/**
 * Grid-level entry point for tooltip registration. Content and positioning rules belong to the source host;
 * this service only owns the common feature lifecycle.
 */
export class TooltipService extends BeanStub implements NamedBean {
    beanName = 'tooltipSvc' as const;

    /** Creates an uninitialised feature for hosts whose element is attached later (ordinary cells). */
    public createTooltip(source: TooltipSource): TooltipFeature | undefined {
        const { beans } = this;
        return beans.registry.createDynamicBean<TooltipFeature>('tooltipFeature', false, source, beans);
    }

    /** Creates a feature which can also be shown when its owner reports keyboard highlight changes. */
    public createHighlightTooltip(
        source: TooltipSource,
        highlightTracker: IEventEmitter<HighlightTooltipEventType>
    ): TooltipFeature | undefined {
        const { beans } = this;
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

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public initCol(column: AgColumn): void {
        _initColTooltip(column);
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public setupHeaderTooltip(
        ctrl: HeaderCellCtrl,
        current: TooltipFeature | undefined,
        getComponentTooltip: () => ComponentTooltip
    ): TooltipFeature | undefined {
        return _setupHeaderTooltip(this.beans, ctrl, current, getComponentTooltip);
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public setupHeaderGroupTooltip(
        ctrl: HeaderGroupCellCtrl,
        current: TooltipFeature | undefined,
        getComponentTooltip: () => ComponentTooltip
    ): TooltipFeature | undefined {
        return _setupHeaderGroupTooltip(this.beans, ctrl, current, getComponentTooltip);
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public enableCellTooltipFeature(ctrl: CellCtrl): TooltipFeature | undefined {
        return this.createTooltip(_createCellTooltipSource(this.beans, ctrl));
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public setupCellEditorTooltip(ctrl: CellCtrl, editor: ICellEditor): TooltipFeature | undefined {
        const source = _createCellEditorTooltipSource(this.beans, ctrl, editor);
        return source ? this.registerTooltip(ctrl, source) : undefined;
    }

    /** Owns all tooltip state for one full-width row, so the row feature itself stays tooltip-free. */
    public createFullWidthRowTooltips(rowCtrl: RowCtrl): FullWidthRowTooltips {
        return this.createBean(new FullWidthRowTooltips(rowCtrl));
    }
}
