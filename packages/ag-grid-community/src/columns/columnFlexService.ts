import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { ColumnDelayRenderService } from '../rendering/columnDelayRenderService';
import { dispatchColumnResizedEvent } from './columnEventUtils';

type FlexItem = {
    col: AgColumn;
    isFlex: boolean;
    flex: number;
    min: number;
    max: number;
    initialSize: number;
    targetSize: number;
    frozenSize: number | undefined;
    violationType: 'min' | 'max' | undefined;
};

export class ColumnFlexService extends BeanStub implements NamedBean {
    beanName = 'colFlex' as const;

    /** The last centre width handed to the flex pass, recorded even when the pass then flexes nothing. */
    public flexViewportWidth = 0;
    public columnsHidden = false;

    public refreshFlexedColumns(
        params: {
            resizingCols?: AgColumn[];
            skipSetLeft?: boolean;
            viewportWidth?: number;
            source?: ColumnEventType;
            fireResizedEvent?: boolean;
            updateBodyWidths?: boolean;
        } = {}
    ): AgColumn[] {
        const source = params.source ?? 'flex';

        if (params.viewportWidth != null) {
            this.flexViewportWidth = params.viewportWidth;
        }

        const totalSpace = this.flexViewportWidth;

        const { visibleCols, colDelayRenderSvc } = this.beans;
        const lastFlexIndex = visibleCols.lastFlexIndex;

        // most grids flex nothing, and an unmeasured grid has no space: settled before an item is made per column
        if (lastFlexIndex < 0 || !totalSpace) {
            this.revealColumns(colDelayRenderSvc);
            return [];
        }
        const visibleCenterCols = visibleCols.centerCols;
        const centerStart = visibleCenterCols[0].allColsIndex;

        // the last resizing centre col, as only cols after this one are affected by the resizing
        let flexAfterDisplayIndex = -1;
        const resizingCols = params.resizingCols;
        if (resizingCols) {
            for (let i = 0, len = resizingCols.length; i < len; ++i) {
                const col = resizingCols[i];
                const index = col.allColsIndex - centerStart;
                if (index <= flexAfterDisplayIndex || visibleCenterCols[index] !== col) {
                    continue;
                }
                flexAfterDisplayIndex = index;
            }
            // no flex col after the resizing ones, as when resizing past the last
            if (centerStart + flexAfterDisplayIndex >= lastFlexIndex) {
                this.revealColumns(colDelayRenderSvc);
                return [];
            }
        }

        // NOTE this is an implementation of the "Resolve Flexible Lengths" part
        // of the flex spec, simplified because we only support flex growing not
        // shrinking, and don't support flex-basis.
        // https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-lengths
        // every col this pass sizes, those held on a bound too, so a resize reports each width it changed
        const flexedColumns: AgColumn[] = [];
        let unfrozenFlex = 0;
        const itemCount = visibleCenterCols.length;
        const items: FlexItem[] = [];
        for (let i = 0; i < itemCount; ++i) {
            const col = visibleCenterCols[i];
            const flex = col.flex;
            const itemFlex = flex != null && flex > 0 ? flex : 0;
            const isFlex = itemFlex > 0 && i > flexAfterDisplayIndex;
            if (isFlex) {
                flexedColumns.push(col);
                unfrozenFlex += itemFlex;
            }
            items.push({
                col,
                isFlex,
                flex: itemFlex,
                initialSize: col.actualWidth,
                min: col.minWidth,
                max: col.maxWidth,
                targetSize: 0,
                frozenSize: undefined,
                violationType: undefined,
            });
        }
        if (!flexedColumns.length) {
            this.revealColumns(colDelayRenderSvc);
            return flexedColumns;
        }
        // hidden while they flex, so no cell shows its pre-flex width; revealed below
        colDelayRenderSvc?.hideColumns('colFlex');
        this.columnsHidden = true;

        let unfrozenItemCount = flexedColumns.length;
        let unfrozenSpace = totalSpace;

        // Freeze inflexible columns
        for (let i = 0; i < itemCount; ++i) {
            const item = items[i];
            if (item.isFlex) {
                continue;
            }
            unfrozenSpace -= freeze(item, item.initialSize, source);
        }

        // a. Check for flexible items. If all the flex items on the line are
        // frozen, free space has been distributed; exit this loop.
        while (unfrozenItemCount > 0) {
            // b. Calculate the remaining free space as for initial free space,
            // above. If the sum of the unfrozen flex items’ flex factors is
            // less than one, multiply the initial free space by this sum.
            const spaceToFill = Math.round(unfrozenFlex < 1 ? unfrozenSpace * unfrozenFlex : unfrozenSpace);

            // c. Distribute free space proportional to the flex factors.
            let lastUnfrozenItem: FlexItem | undefined;
            let actualLeft = 0;
            let idealRight = 0;

            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                if (item.frozenSize != null) {
                    continue;
                }

                lastUnfrozenItem = item;
                idealRight += spaceToFill * (item.flex / unfrozenFlex);

                const idealSize = idealRight - actualLeft;
                const roundedSize = Math.round(idealSize);

                item.targetSize = roundedSize;
                actualLeft += roundedSize;
            }

            if (lastUnfrozenItem) {
                // Correct cumulative rounding errors: adjust the size of the
                // last item to fill any remaining space
                lastUnfrozenItem.targetSize += spaceToFill - actualLeft;
            }

            // d. Fix min/max violations. Clamp each non-frozen item’s target
            // main size by its used min and max main sizes... If the item’s
            // target main size was made smaller by this, it’s a max violation.
            // If the item’s target main size was made larger by this, it’s a
            // min violation.
            let totalViolation = 0;
            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                if (item.frozenSize != null) {
                    continue;
                }

                const unclampedSize = item.targetSize;
                // max applied last to match setActualWidth: when min > max, max wins, else the frozen size leaks space
                const clampedSize = Math.min(Math.max(unclampedSize, item.min), item.max);

                totalViolation += clampedSize - unclampedSize;
                item.violationType =
                    clampedSize === unclampedSize ? undefined : clampedSize < unclampedSize ? 'max' : 'min';

                item.targetSize = clampedSize;
            }

            // e. Freeze over-flexed items. The total violation is the sum of
            // the adjustments from the previous step.
            // If the total violation is:
            //     - Zero, Freeze all items
            //     - Positive, Freeze all the items with min violations
            //     - Negative, Freeze all the items with max violations
            const freezeType = totalViolation === 0 ? 'all' : totalViolation > 0 ? 'min' : 'max';

            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                if (item.frozenSize != null || (freezeType !== 'all' && item.violationType !== freezeType)) {
                    continue;
                }
                unfrozenSpace -= freeze(item, item.targetSize, source);
                unfrozenFlex -= item.flex;
                --unfrozenItemCount;
            }
        }

        const widths = params.skipSetLeft ? undefined : visibleCols.setLeftValues();
        if (params.updateBodyWidths) {
            visibleCols.updateBodyWidths(source, widths);
        }

        if (params.fireResizedEvent) {
            const changedColumns: AgColumn[] = [];
            const flexingColumns: AgColumn[] = [];
            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                if (item.initialSize !== item.frozenSize) {
                    changedColumns.push(item.col);
                }
                if (item.flex) {
                    flexingColumns.push(item.col);
                }
            }

            dispatchColumnResizedEvent(this.eventSvc, changedColumns, true, source, flexingColumns);
        }

        this.revealColumns(colDelayRenderSvc);

        return flexedColumns;
    }

    private revealColumns(colDelayRenderSvc: ColumnDelayRenderService | undefined) {
        if (this.columnsHidden) {
            colDelayRenderSvc?.revealColumns('colFlex');
            this.columnsHidden = false;
        }
    }

    public initCol(column: AgColumn): void {
        const { flex, initialFlex } = column.colDef;
        if (flex !== undefined) {
            column.flex = flex;
        } else if (initialFlex !== undefined) {
            column.flex = initialFlex;
        }
    }

    // this method should only be used by the colModel to
    // change flex when required by the applyColumnState method.
    public setColFlex(column: AgColumn, flex: number | null, source: ColumnEventType) {
        column.flex = flex ?? null;
        column.dispatchStateUpdatedEvent('flex', source);
    }
}

function freeze(item: FlexItem, width: number, source: ColumnEventType): number {
    item.frozenSize = width;
    item.col.setActualWidth(width, source);
    return width;
}
