import type { HighlightTooltipEventType, IEventEmitter } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { HeaderCellCtrl } from '../headerRendering/cells/column/headerCellCtrl';
import type { HeaderGroupCellCtrl } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ResolvedCellTooltip } from './cellTooltip';
import { _resolveConfiguredCellTooltip } from './cellTooltip';
import { FullWidthRowTooltips } from './fullWidthRowTooltips';
import type { ComponentTooltip } from './headerTooltipSource';
import { _setupHeaderGroupTooltip, _setupHeaderTooltip } from './headerTooltipSource';
import type { TooltipFeature, TooltipSource, TooltipSourceParams } from './tooltipFeature';
import { _initColTooltip } from './tooltipValueUtils';

/**
 * Registers the tooltips the grid shows without a feature asking for them: configured and automatic
 * cell, header and full-width row tooltips, and tooltips on built-in controls.
 */
export class TooltipService extends BeanStub implements NamedBean {
    beanName = 'tooltipSvc' as const;

    public createTooltip(source: TooltipSource): TooltipFeature | undefined {
        return this.beans.tooltipCoreSvc!.createTooltip(source);
    }

    public createHighlightTooltip(
        source: TooltipSource,
        highlightTracker: IEventEmitter<HighlightTooltipEventType>
    ): TooltipFeature | undefined {
        return this.beans.tooltipCoreSvc!.createHighlightTooltip(source, highlightTracker);
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public initCol(column: AgColumn): void {
        _initColTooltip(column);
    }

    /** Calls through to standalone method for treeshaking via the tooltipSvc */
    public resolveCellTooltip(ctrl: CellCtrl, sourceParams: TooltipSourceParams): ResolvedCellTooltip | null {
        return _resolveConfiguredCellTooltip(this.beans, ctrl, sourceParams);
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

    /** Owns all tooltip state for one full-width row, so the row feature itself stays tooltip-free. */
    public createFullWidthRowTooltips(rowCtrl: RowCtrl): FullWidthRowTooltips {
        return this.createBean(new FullWidthRowTooltips(rowCtrl));
    }
}
