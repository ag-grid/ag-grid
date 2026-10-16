import { dispatchColumnResizedEvent } from '../columns/columnEventUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { getShiftPair } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import { getColGroupAfter } from '../entities/agColumnGroup';
import type { ColKey } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { HeaderCellCtrl, IHeaderCellComp } from '../headerRendering/cells/column/headerCellCtrl';
import type { IHeaderGroupCellComp } from '../headerRendering/cells/columnGroup/headerGroupCellCtrl';
import { _clamp } from '../utils/number';
import { GroupResizeFeature } from './groupResizeFeature';
import { ResizeFeature } from './resizeFeature';

/** A group resize's columns and bounds, made as it starts and reused by every move of a drag. */
export interface GroupResizePlan {
    /** The group's resizable leaves, then, when the next group gives or takes the difference, that group's. */
    columns: AgColumn[];
    /** Each column's share of its own group's start width. */
    ratios: number[];
    group: ColumnRun;
    next: ColumnRun | null;
    /** Each column's width as the last move dealt it, reused by every move. */
    widths: number[];
    /** The group width `widths` was dealt for, so a move landing there again deals nothing. */
    fitted: number;
    /** Each column's `distributeWidth` state, reused by every move. */
    states: ShareState[];
}

export class ColumnResizeService extends BeanStub implements NamedBean {
    beanName = 'colResize' as const;

    public setColumnWidths(
        columnWidths: {
            key: ColKey; // @key - the column who's size we want to change
            newWidth: number; // @newWidth - width in pixels
        }[],
        finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
        source: ColumnEventType
    ): void {
        const { colModel, visibleCols } = this.beans;
        const columns: AgColumn[] = [];
        const widths: number[] = [];
        // under shift, keyed by column so adjacent named cols keep their widths whatever the call's order
        const named = this.takesFromAdjacent(false) ? new Map<AgColumn, number>() : null;

        for (const columnWidth of columnWidths) {
            const col = colModel.getCol(columnWidth.key);
            if (!col) {
                continue;
            }
            if (named) {
                named.set(col, columnWidth.newWidth);
            } else {
                columns.push(col);
                widths.push(columnWidth.newWidth);
            }
        }

        named?.forEach((width, col) => {
            const before = visibleCols.getColBefore(col);
            // a run of adjacent named cols is pushed whole from its first, then the col after it takes their change
            if (before && named.has(before)) {
                return;
            }
            let change = 0;
            let runCol: AgColumn | null = col;
            let runWidth: number | undefined = width;
            while (runCol && runWidth !== undefined) {
                columns.push(runCol);
                widths.push(runWidth);
                change += runWidth - runCol.actualWidth;
                runCol = getShiftPair(visibleCols, runCol);
                runWidth = runCol ? named.get(runCol) : undefined;
            }
            if (runCol) {
                columns.push(runCol);
                widths.push(runCol.actualWidth - change);
            }
        });

        for (let i = 0, count = columns.length; i < count; ++i) {
            const col = columns[i];
            const width = widths[i];
            const maxWidth = col.maxWidth;
            // NaN fails both; max wins over a min above it, as in `setActualWidth`
            if (width >= Math.min(col.minWidth, maxWidth) && width <= maxWidth) {
                continue;
            }
            // one width out of bounds refuses them all; a finished one still reports, as a resize (`[]`) for aligned grids
            if (!finished) {
                return;
            }
            dispatchColumnResizedEvent(this.eventSvc, columns, finished, source, []);
            return;
        }

        this.applyColumnWidths(columns, widths, finished, source, columns, false);
    }

    /** Sets widths decided elsewhere, each held within its column's bounds in `widths`, none taken from another. */
    public setClampedColumnWidths(
        columns: AgColumn[],
        widths: number[],
        finished: boolean,
        source: ColumnEventType,
        resizingCols: AgColumn[] | undefined
    ): void {
        for (let i = 0, count = columns.length; i < count; ++i) {
            const col = columns[i];
            // held first, so a width this column cannot take reads as unchanged rather than re-laid out
            widths[i] = Math.min(Math.max(widths[i], col.minWidth), col.maxWidth);
        }
        this.applyColumnWidths(columns, widths, finished, source, resizingCols, false);
    }

    /** Whether a resize takes from the column or group after it: Shift does, `colResizeDefault: 'shift'` inverting. */
    public takesFromAdjacent(shiftKey: boolean): boolean {
        return shiftKey !== (this.gos.get('colResizeDefault') === 'shift');
    }

    /** A user's resize of one column, which stops on its bounds and its shift pair's instead of being refused. */
    public resizeColumn(key: ColKey, newWidth: number, takeFromAdjacent: boolean, finished: boolean): void {
        const { colModel, visibleCols } = this.beans;
        const column = colModel.getCol(key);
        if (!column) {
            return;
        }
        const otherCol = takeFromAdjacent ? getShiftPair(visibleCols, column) : null;
        const total = otherCol ? column.actualWidth + otherCol.actualWidth : 0;
        const width = fitWidth(newWidth, column, otherCol, total);
        if (Number.isNaN(width)) {
            if (!finished) {
                return;
            }
            dispatchColumnResizedEvent(this.eventSvc, [column], finished, 'uiColumnResized', []);
            return;
        }
        // the shift pair keeps the total, so it moves only with the column: mid-drag, nothing to lay out or report
        if (!finished && width === column.actualWidth) {
            return;
        }
        const columns = otherCol ? [column, otherCol] : [column];
        const widths = otherCol ? [width, total - width] : [width];
        this.applyColumnWidths(columns, widths, finished, 'uiColumnResized', columns, false);
    }

    /** Plans a group resize, with the next group's resizable leaves when it takes from that group. */
    public planGroupResize(columnGroup: AgColumnGroup, takeFromAdjacent: boolean): GroupResizePlan {
        const columns: AgColumn[] = [];
        pushResizableLeaves(columnGroup, columns);
        const split = columns.length;
        pushResizableLeaves(takeFromAdjacent ? getColGroupAfter(this.beans.visibleCols, columnGroup) : null, columns);
        const count = columns.length;
        const ratios: number[] = [];
        const group = measureRun(columns, 0, split, ratios);
        // a next group with no resizable leaf gives nothing, so the group resizes alone
        const next = count > split ? measureRun(columns, split, count, ratios) : null;
        const widths: number[] = [];
        const states: ShareState[] = [];
        for (let i = 0; i < count; ++i) {
            widths.push(0);
            states.push(FREE);
        }
        return { columns, ratios, group, next, widths, states, fitted: Number.NaN };
    }

    /**
     * Resizes a group to the width nearest `width` its and the next group's bounds allow; none fitting, nothing.
     * `reflexAll` re-flexes every flex column, as an auto-size does, instead of only those after the group.
     */
    public resizeGroup(
        plan: GroupResizePlan,
        width: number,
        finished: boolean,
        source: ColumnEventType,
        reflexAll = false
    ): void {
        const { group, next } = plan;
        const total = next ? group.startWidth + next.startWidth : 0;
        const fitted = fitWidth(width, group, next, total);
        if (Number.isNaN(fitted)) {
            // Not resizing past min/max, but a finished drag still owes its event.
            if (!finished) {
                return;
            }
            dispatchColumnResizedEvent(this.eventSvc, plan.columns.slice(0, group.to), finished, source, []);
            return;
        }
        if (fitted !== plan.fitted) {
            plan.fitted = fitted;
            distributeWidth(plan, group, fitted);
            distributeWidth(plan, next, total - fitted);
        }
        const columns = plan.columns;
        this.applyColumnWidths(columns, plan.widths, finished, source, reflexAll ? undefined : columns, true);
    }

    /** Applies `widths`, re-flexes the flex cols after `resizingCols` (all when absent), lays out and reports, with
     *  `flexColumns` only when `resizingCols` bounded the flex pass, so an aligned grid re-flexes as this one did. */
    private applyColumnWidths(
        columns: AgColumn[],
        widths: number[],
        finished: boolean,
        source: ColumnEventType,
        resizingCols: AgColumn[] | undefined,
        // the caller uses `columns` again, so listeners get a copy
        columnsReused: boolean
    ): void {
        let atLeastOneColChanged = false;
        let pinnedColChanged = false;

        for (let i = 0, len = columns.length; i < len; ++i) {
            const col = columns[i];
            const newWidth = widths[i];

            if (col.actualWidth !== newWidth) {
                col.setActualWidth(newWidth, source);
                atLeastOneColChanged = true;
                pinnedColChanged ||= col.pinnedLane !== 1;
            }
        }

        let flexedCols: AgColumn[] | undefined;

        if (atLeastOneColChanged) {
            const { colFlex, visibleCols, colViewport, ctrlsSvc } = this.beans;
            flexedCols = colFlex?.refreshFlexedColumns({
                resizingCols,
                skipSetLeft: true,
                // A pinned resize moves the centre boundary with no DOM resize; 0 is "not laid out yet".
                viewportWidth:
                    (pinnedColChanged && ctrlsSvc.get('gridBodyCtrl')?.getReportedCenterWidth()) || undefined,
            });
            visibleCols.updateBodyWidths(source, visibleCols.setLeftValues());
            colViewport.checkViewportColumns();
        }

        // a finished resize always reports, changed or not, so a stream of moves is always seen to end
        if (atLeastOneColChanged || finished) {
            let colsForEvent = columns;
            if (flexedCols?.length) {
                colsForEvent = resizingCols ? columns.concat(flexedCols) : joinReflexed(columns, flexedCols);
            } else if (columnsReused) {
                colsForEvent = columns.slice();
            }
            const flexColumns = resizingCols ? (flexedCols ?? []) : null;
            dispatchColumnResizedEvent(this.eventSvc, colsForEvent, finished, source, flexColumns);
        }
    }

    public createResizeFeature(
        column: AgColumn,
        eResize: HTMLElement,
        comp: IHeaderCellComp,
        ctrl: HeaderCellCtrl
    ): ResizeFeature {
        return new ResizeFeature(column, eResize, comp, ctrl);
    }

    public createGroupResizeFeature(
        comp: IHeaderGroupCellComp,
        eResize: HTMLElement,
        columnGroup: AgColumnGroup
    ): GroupResizeFeature {
        return new GroupResizeFeature(comp, eResize, columnGroup);
    }
}

const FREE = 0;
const HELD_AT_MIN = 1;
const HELD_AT_MAX = 2;
const FROZEN = 3;

/** A column's state in `distributeWidth`: free, held on its min or max by this pass, or frozen on it for the rest. */
type ShareState = typeof FREE | typeof HELD_AT_MIN | typeof HELD_AT_MAX | typeof FROZEN;

/** Splits `width` over `run` by ratio into the plan's `widths`, freezing on their bounds as CSS flex does. */
function distributeWidth(plan: GroupResizePlan, run: ColumnRun | null, width: number): void {
    if (!run) {
        return;
    }
    const { columns, ratios, widths: out, states } = plan;
    const { from, to } = run;
    states.fill(FREE, from, to);
    // the first pass shares the whole width among every column, as the plan summed them
    let remaining = width;
    let ratioTotal = run.ratioTotal;
    let unfrozen = to - from;
    let last = to - 1;

    for (let pass = from; pass <= to; ++pass) {
        // only what the unfrozen cols share: scaling the whole width would also hand them the frozen cols' pixels
        const distributable = remaining;
        const ratioScale = 1 / ratioTotal;
        // unfrozen cols all 0px wide have no ratio to keep, so they share equally
        const byRatio = ratioTotal > 0;
        const equalShare = distributable / unfrozen;
        // under a min adds, over a max takes away: what the held cols add to the split
        let violation = 0;

        for (let i = from; i <= last; ++i) {
            if (states[i] === FROZEN) {
                continue;
            }
            let colWidth: number;
            if (i === last) {
                colWidth = remaining;
            } else {
                colWidth = Math.round(byRatio ? ratios[i] * distributable * ratioScale : equalShare);
                remaining -= colWidth;
            }

            const col = columns[i];
            const maxWidth = col.maxWidth;
            // max wins over a min above it, as in `setActualWidth`
            const minWidth = Math.min(col.minWidth, maxWidth);
            let state: ShareState = FREE;
            if (colWidth < minWidth) {
                violation += minWidth - colWidth;
                colWidth = minWidth;
                state = HELD_AT_MIN;
            } else if (colWidth > maxWidth) {
                violation -= colWidth - maxWidth;
                colWidth = maxWidth;
                state = HELD_AT_MAX;
            }
            states[i] = state;
            out[i] = colWidth;
        }

        // none held, or the holds cancel out: the widths sum to the set's width
        if (violation === 0) {
            return;
        }
        // the held cols on the side the overshoot leaned to freeze; the rest share what they leave
        const freezing = violation > 0 ? HELD_AT_MIN : HELD_AT_MAX;
        remaining = width;
        ratioTotal = 0;
        unfrozen = 0;
        last = -1;
        for (let i = from; i < to; ++i) {
            const state = states[i];
            if (state === FROZEN || state === freezing) {
                states[i] = FROZEN;
                remaining -= out[i];
            } else {
                ratioTotal += ratios[i];
                ++unfrozen;
                last = i;
            }
        }
    }
}

/** `columns` then `flexed`, but for the cols of `columns` an unbounded flex pass re-flexed, which `flexed` lists. */
function joinReflexed(columns: AgColumn[], flexed: AgColumn[]): AgColumn[] {
    const joined: AgColumn[] = [];
    for (let i = 0, len = columns.length; i < len; ++i) {
        const col = columns[i];
        const flex = col.flex;
        // an unbounded pass re-flexes every centre col still flexing, one this call left at its width too
        if (flex == null || flex <= 0 || col.pinnedLane !== 1) {
            joined.push(col);
        }
    }
    for (let i = 0, len = flexed.length; i < len; ++i) {
        joined.push(flexed[i]);
    }
    return joined;
}

/** Pushes `group`'s displayed resizable leaves onto `out` in display order: one walk, no leaf list to filter. */
function pushResizableLeaves(group: AgColumnGroup | null, out: AgColumn[]): void {
    const children = group?.displayedChildren;
    if (!children) {
        return;
    }
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (!child.isColumn) {
            pushResizableLeaves(child, out);
        } else if (child.isResizable()) {
            out.push(child);
        }
    }
}

/** A run of a group plan's columns, with their start widths, bounds and ratios summed. */
interface ColumnRun {
    from: number;
    to: number;
    startWidth: number;
    minWidth: number;
    maxWidth: number;
    ratioTotal: number;
}

/** Measures `columns` from `from` to `to`, pushing each one's share of their start width onto `ratios`. */
function measureRun(columns: AgColumn[], from: number, to: number, ratios: number[]): ColumnRun {
    let startWidth = 0;
    let minWidth = 0;
    let maxWidth = 0;
    for (let i = from; i < to; ++i) {
        const col = columns[i];
        const colMaxWidth = col.maxWidth;
        startWidth += col.actualWidth;
        minWidth += Math.min(col.minWidth, colMaxWidth);
        maxWidth += colMaxWidth;
    }
    let ratioTotal = 0;
    for (let i = from; i < to; ++i) {
        const ratio = startWidth > 0 ? columns[i].actualWidth / startWidth : 0;
        ratios.push(ratio);
        ratioTotal += ratio;
    }
    return { from, to, startWidth, minWidth, maxWidth, ratioTotal };
}

/** The width nearest `width` in `own` leaving the shift `pair` within its range of `total`; NaN when none fits. */
function fitWidth(width: number, own: ColumnRun | AgColumn, pair: ColumnRun | AgColumn | null, total: number): number {
    // max wins over a min above it, as in `setActualWidth`; a run's summed bounds already hold it
    let max = own.maxWidth;
    let min = Math.min(own.minWidth, max);
    if (pair) {
        const pairMax = pair.maxWidth;
        min = Math.max(min, total - pairMax);
        max = Math.min(max, total - Math.min(pair.minWidth, pairMax));
    }
    const fitted = _clamp(width, min, max);
    // over max only when no width fits, or for NaN
    return fitted <= max ? fitted : Number.NaN;
}
