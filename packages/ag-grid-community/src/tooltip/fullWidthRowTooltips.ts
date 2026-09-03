import type { ComponentInstanceClaim } from '../components/framework/componentInstanceGuard';
import { ComponentInstanceGuard } from '../components/framework/componentInstanceGuard';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { TooltipCallbackParams } from './tooltipComponent';
import type { TooltipFeature, TooltipSource, TooltipSourceParams } from './tooltipFeature';
import { _getCellTooltipComponentDefinition } from './tooltipFeature';
import { _getLegacyTooltipFieldValue, _isCellTooltipConfigured, _resolveGroupTooltipValue } from './tooltipValueUtils';

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * Tooltip state for one full-width row, keyed by the element(s) the row renders into. Owned by the
 * Tooltip module so full-width rows carry no tooltip code when the module is not registered.
 */
export class FullWidthRowTooltips extends BeanStub {
    private readonly tooltipFeatures = new Map<HTMLElement, TooltipFeature>();
    private readonly rendererGuards = new Map<HTMLElement, ComponentInstanceGuard>();

    public constructor(private readonly rowCtrl: RowCtrl) {
        super();
    }

    /**
     * `adopt` claims for a freshly mounted renderer, superseding earlier ones. A refresh claims
     * provisionally: the surviving renderer's earlier params must keep working when it is kept in place.
     */
    public claimRenderer(eGui: HTMLElement, adopt: boolean): ComponentInstanceClaim {
        const { rendererGuards } = this;
        let guard = rendererGuards.get(eGui);
        if (!guard) {
            guard = new ComponentInstanceGuard();
            rendererGuards.set(eGui, guard);
        }
        return adopt ? guard.claim() : guard.provisionalClaim();
    }

    public pruneStaleElements(): void {
        const { tooltipFeatures, rendererGuards, rowCtrl } = this;
        if (tooltipFeatures.size === 0 && rendererGuards.size === 0) {
            return;
        }

        const rowComp = rowCtrl.getCurrentRowComp();
        const currentElements = new Set<HTMLElement | undefined>([
            rowCtrl.getCurrentRowElement() ?? undefined,
            rowComp?.getPinnedLeftRowElement(),
            rowComp?.getScrollingRowElement(),
            rowComp?.getPinnedRightRowElement(),
        ]);

        for (const [element, feature] of tooltipFeatures) {
            if (!currentElements.has(element)) {
                this.destroyBean(feature, this.beans.context);
                tooltipFeatures.delete(element);
            }
        }
        for (const [element, guard] of rendererGuards) {
            if (!currentElements.has(element)) {
                guard.invalidate();
                rendererGuards.delete(element);
            }
        }
    }

    public setRendererTooltip(
        eGui: HTMLElement,
        rowNode: RowNode,
        value: string,
        shouldDisplayTooltip: (() => boolean) | undefined,
        claim: ComponentInstanceClaim
    ): void {
        if (!this.isAlive() || !claim.isCurrent()) {
            return;
        }

        const isGroupRow = this.rowCtrl.getRowType() === 'FullWidthGroup';
        if (value == null) {
            this.clearTooltip(eGui);
            if (isGroupRow) {
                this.setupGroupRowsTooltip(rowNode, eGui);
            }
            return;
        }
        // Renderer-supplied tooltips are not gated by `tooltip: false`, so pass the colDef ungated.
        const groupCol = isGroupRow ? (rowNode.rowGroupColumn as AgColumn | undefined) : undefined;
        const colDef = isGroupRow ? this.getGroupColDef(rowNode) : undefined;
        this.setupTooltip(
            eGui,
            () => value,
            shouldDisplayTooltip,
            () => ({
                colDef,
                column: groupCol,
                rowIndex: rowNode.rowIndex ?? 0,
                node: rowNode,
                data: rowNode.data,
            }),
            () => colDef
        );
    }

    /** Resolves a full-width group tooltip lazily from its owning group column or tree-data auto column. */
    public setupGroupRowsTooltip(rowNode: RowNode, eGui: HTMLElement): void {
        const groupCol = rowNode.rowGroupColumn as AgColumn | undefined;
        const { gos } = this;

        const colDef = this.getGroupColDef(rowNode);
        if (!colDef) {
            this.clearTooltip(eGui);
            return;
        }

        const hasTooltipValue = _isCellTooltipConfigured(colDef);
        const hasLegacyComponentOnlyTooltip =
            colDef.tooltip !== false &&
            !hasTooltipValue &&
            !!(colDef.tooltipComponent || colDef.tooltipComponentSelector);
        if (!hasTooltipValue && !hasLegacyComponentOnlyTooltip) {
            this.clearTooltip(eGui);
            return;
        }

        const { valueSvc } = this.beans;

        let latestValueFormatted: string | null | undefined;
        const getDisplay = () => {
            const display = valueSvc.getValueForDisplay({ node: rowNode, includeValueFormatted: true, from: 'edit' });
            latestValueFormatted = display.valueFormatted;
            return display;
        };

        this.setupTooltip(
            eGui,
            () => {
                const { value, valueFormatted } = getDisplay();
                const callbackParams = _addGridCommonParams<TooltipCallbackParams>(gos, {
                    location: 'fullWidthRow' as const,
                    colDef,
                    column: groupCol,
                    rowIndex: rowNode.rowIndex ?? 0,
                    node: rowNode,
                    data: rowNode.data,
                    value,
                    valueFormatted: valueFormatted ?? undefined,
                });
                if (hasTooltipValue) {
                    return _resolveGroupTooltipValue(colDef, callbackParams, () => {
                        const tooltipField = colDef.tooltipField;
                        if (!tooltipField) {
                            return { resolved: false };
                        }
                        const data = rowNode.data;
                        if (!data) {
                            // Regular row-grouping group nodes carry no `data`; use the group display value.
                            return { resolved: true, value };
                        }
                        const containsDots = groupCol
                            ? groupCol.tooltipFieldContainsDots
                            : !gos.get('suppressFieldDotNotation') && tooltipField.includes('.');
                        return {
                            resolved: true,
                            value: _getLegacyTooltipFieldValue(data, tooltipField, containsDots),
                        };
                    });
                }
                return value;
            },
            undefined,
            () => ({
                colDef,
                column: groupCol,
                rowIndex: rowNode.rowIndex ?? 0,
                node: rowNode,
                data: rowNode.data,
                valueFormatted: latestValueFormatted ?? undefined,
            }),
            () => _getCellTooltipComponentDefinition(colDef)
        );
    }

    /**
     * Regular row grouping: read tooltip config from the row-group column's colDef.
     * Tree data (no rowGroupColumn): fall back to the auto-group column def.
     */
    private getGroupColDef(rowNode: RowNode): ColDef | undefined {
        const groupCol = rowNode.rowGroupColumn as AgColumn | undefined;
        return groupCol?.colDef ?? this.gos.get('autoGroupColumnDef');
    }

    private setupTooltip(
        eGui: HTMLElement,
        getTooltipValue: () => any,
        shouldDisplayTooltip?: () => boolean,
        getAdditionalParams?: () => TooltipSourceParams,
        getTooltipComponentDefinition: () => ColDef | undefined = () => undefined
    ): void {
        const { tooltipFeatures, rowCtrl, beans } = this;
        if (!rowCtrl.getCurrentRowElement()) {
            return;
        }

        const source: TooltipSource = {
            getGui: () => eGui,
            getTooltipComponentDefinition,
            getTooltipValue,
            getLocation: () => 'fullWidthRow',
            shouldDisplayTooltip,
            ...(getAdditionalParams ? { getAdditionalParams } : {}),
        };
        const feature = beans.tooltipSvc!.registerTooltip(this, source, tooltipFeatures.get(eGui));
        if (feature) {
            tooltipFeatures.set(eGui, feature);
        } else {
            tooltipFeatures.delete(eGui);
        }
    }

    private clearTooltip(eGui: HTMLElement): void {
        const { tooltipFeatures } = this;
        const feature = tooltipFeatures.get(eGui);
        if (feature) {
            this.destroyBean(feature, this.beans.context);
        }
        tooltipFeatures.delete(eGui);
    }

    public override destroy(): void {
        const { context } = this.beans;
        const { tooltipFeatures, rendererGuards } = this;
        for (const feature of tooltipFeatures.values()) {
            this.destroyBean(feature, context);
        }
        tooltipFeatures.clear();
        for (const guard of rendererGuards.values()) {
            guard.invalidate();
        }
        rendererGuards.clear();
        super.destroy();
    }
}
