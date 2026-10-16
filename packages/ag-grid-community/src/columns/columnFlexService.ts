import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { ColumnDelayRenderService } from '../rendering/columnDelayRenderService';
import { dispatchColumnResizedEvent } from './columnEventUtils';

type FlexItem = {
    col: AgColumn;
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
            reflexAll?: boolean;
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
        const centerCount = visibleCenterCols.length;
        const centerStart = visibleCenterCols[0].allColsIndex;

        // the centre cols keeping their widths: up to the last resizing one, or with `reflexAll` only the run of the
        // resizing ones, so the flex cols before them re-flex too
        let frozenFrom = 0;
        let frozenTo = -1;
        const resizingCols = params.resizingCols;
        if (resizingCols) {
            let first = centerCount;
            for (let i = 0, len = resizingCols.length; i < len; ++i) {
                const col = resizingCols[i];
                const index = col.allColsIndex - centerStart;
                if (index < 0 || visibleCenterCols[index] !== col) {
                    continue;
                }
                first = Math.min(first, index);
                frozenTo = Math.max(frozenTo, index);
            }
            if (params.reflexAll) {
                frozenFrom = first;
            } else if (centerStart + frozenTo >= lastFlexIndex) {
                // no flex col after the resizing ones, as when resizing past the last
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
        // an item only for the cols this pass flexes: the rest are frozen below without one
        const items: FlexItem[] = [];
        for (let i = 0; i < centerCount; ++i) {
            const col = visibleCenterCols[i];
            const flex = col.flex;
            if ((i >= frozenFrom && i <= frozenTo) || flex == null || flex <= 0) {
                continue;
            }
            flexedColumns.push(col);
            unfrozenFlex += flex;
            items.push({
                col,
                flex,
                initialSize: col.actualWidth,
                min: col.minWidth,
                max: col.maxWidth,
                targetSize: 0,
                frozenSize: undefined,
                violationType: undefined,
            });
        }
        const itemCount = items.length;
        if (!itemCount) {
            this.revealColumns(colDelayRenderSvc);
            return flexedColumns;
        }
        // hidden while they flex, so no cell shows its pre-flex width; revealed below
        colDelayRenderSvc?.hideColumns('colFlex');
        this.columnsHidden = true;

        let unfrozenItemCount = itemCount;
        let unfrozenSpace = totalSpace;

        // Freeze inflexible columns
        for (let i = 0; i < centerCount; ++i) {
            const col = visibleCenterCols[i];
            const flex = col.flex;
            if ((i < frozenFrom || i > frozenTo) && flex != null && flex > 0) {
                continue;
            }
            const width = col.actualWidth;
            col.setActualWidth(width, source);
            unfrozenSpace -= width;
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
                const width = item.targetSize;
                item.frozenSize = width;
                item.col.setActualWidth(width, source);
                unfrozenSpace -= width;
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
            for (let i = 0; i < itemCount; ++i) {
                const item = items[i];
                if (item.initialSize !== item.frozenSize) {
                    changedColumns.push(item.col);
                }
            }

            dispatchColumnResizedEvent(this.eventSvc, changedColumns, true, source, flexedColumns);
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
