import type { AgColumn, IPivotColsService, NamedBean } from 'ag-grid-community';

import { OrderedColsService } from '../columns/orderedColsService';

export class PivotColsSvc extends OrderedColsService implements NamedBean, IPivotColsService {
    beanName = 'pivotColsSvc' as const;
    protected override eventName = 'columnPivotChanged' as const;
    protected override enableProp = 'pivot' as const;
    protected override indexProp = 'pivotIndex' as const;
    protected override initialEnableProp = 'initialPivot' as const;
    protected override initialIndexProp = 'initialPivotIndex' as const;

    /** True if any active pivot col has a `pivotComparator`; cached so {@link isStrictColumnOrder} stays O(1). */
    private hasPivotComparator = false;

    public postConstruct(): void {
        this.addManagedEventListeners({
            columnValueChanged: () => {
                // In pivot mode the sort cache filters by value-col membership (driven by aggFunc);
                // an in-place aggFunc change doesn't rebuild columns, so invalidate it.
                const beans = this.beans;
                if (beans.colModel.pivotMode) {
                    beans.sortSvc?.invalidate();
                }
            },
        });
    }

    protected override setActiveFlag(col: AgColumn, active: boolean): boolean {
        if (col.pivotActive === active) {
            return false;
        }
        col.pivotActive = active;
        return true;
    }

    /** Stamps each active pivot col's position (`pivotActiveIndex`) and refreshes {@link hasPivotComparator}. */
    protected override onColumnsChanged(): void {
        const cols = this.columns;
        let hasPivotComparator = false;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            col.pivotActiveIndex = i;
            hasPivotComparator ||= col.colDef.pivotComparator != null;
        }
        this.hasPivotComparator = hasPivotComparator;
    }

    /** Computed live: a `pivotSort` toggle does not change pivot-column membership, so it can't be cached.
     *  Any explicitly-set direction counts, including `null` ("no sort"); only the unset default (`undefined`)
     *  does not - so clearing to `null` still forces the freshly-generated natural order over the sticky one. */
    public hasInteractivePivotSort(): boolean {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            if (cols[i].pivotSort !== undefined) {
                return true;
            }
        }
        return false;
    }

    public isStrictColumnOrder(): boolean {
        // An interactive pivotSort forces strict ordering regardless of `enableStrictPivotColumnOrder`,
        // otherwise toggling pivot sort would silently fail to reorder the pivot columns.
        return (
            (this.hasPivotComparator && !!this.gos.get('enableStrictPivotColumnOrder')) ||
            this.hasInteractivePivotSort()
        );
    }

    public reRankByPivotGroupOrder(
        defColsList: AgColumn[],
        stickyOrder: string[],
        colsById: Record<string, AgColumn>
    ): string[] {
        const groupRank = new Map<string, number>();
        for (let i = 0, len = defColsList.length; i < len; ++i) {
            const key = pivotGroupKey(defColsList[i]);
            if (!groupRank.has(key)) {
                groupRank.set(key, groupRank.size);
            }
        }
        // Cols absent from defColsList have no known group, so they rank last (after every known group).
        const unknownRank = groupRank.size;
        const ranked: RankedColId[] = [];
        for (let i = 0, len = stickyOrder.length; i < len; ++i) {
            const id = stickyOrder[i];
            const col = colsById[id];
            if (col != null) {
                ranked.push({ id, order: i, rank: groupRank.get(pivotGroupKey(col)) ?? unknownRank });
            }
        }
        ranked.sort(byRankThenOrder);
        const rankedLen = ranked.length;
        const result = new Array<string>(rankedLen);
        for (let i = 0; i < rankedLen; ++i) {
            result[i] = ranked[i].id;
        }
        return result;
    }
}

/** Identifies the pivot group a result col belongs to, so cols of one group re-rank together.
 *
 *  Generated cols carry `pivotKeys`. Application-supplied colDefs need not, so fall back to the provided-group
 *  hierarchy, which expresses the same grouping - without it every supplied col keys alike, the re-rank collapses
 *  to a no-op, and the sticky order silently overrides the `pivotSort` the columns were just ordered by. */
const pivotGroupKey = (col: AgColumn): string => {
    const pivotKeys = col.colDef.pivotKeys;
    if (pivotKeys !== undefined && pivotKeys.length > 0) {
        return pivotKeys.join('');
    }
    if (pivotKeys !== undefined) {
        // Present but empty: a generated row total, which sits outside every pivot group.
        return ungroupedKey(col);
    }
    let key = '';
    let parent = col.originalParent;
    while (parent != null) {
        if (!parent.isPadding()) {
            key = `${parent.getGroupId()}\0${key}`;
        }
        parent = parent.originalParent;
    }
    if (key !== '') {
        return key;
    }
    // No enclosing group either: an ungrouped supplied colDef, or the auto group column.
    return ungroupedKey(col);
};

/** Key for a col in no pivot group: a `pivotRowTotals` total, an ungrouped supplied colDef, or the auto group
 *  column. Each gets a key of its own, so it ranks at its own position in the freshly-built order instead of
 *  sharing one bucket - sharing it made such a column inherit the auto column's leading rank and jump to the front
 *  of a descending sort, rather than hold the position the pivot-key ordering left it in. The leading separator
 *  cannot start a `pivotKeys`-derived or group-derived key, so the two namespaces stay disjoint. */
const ungroupedKey = (col: AgColumn): string => `\0${col.colId}`;

interface RankedColId {
    id: string;
    order: number;
    rank: number;
}

const byRankThenOrder = (a: RankedColId, b: RankedColId): number => a.rank - b.rank || a.order - b.order;
