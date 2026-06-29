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
}
