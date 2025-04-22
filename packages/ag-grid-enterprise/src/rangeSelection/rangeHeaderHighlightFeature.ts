import { BeanStub } from 'ag-grid-community';
import type { AgColumn, AgColumnGroup, IHeaderCellComp } from 'ag-grid-community';

export class RangeHeaderHighlightFeature extends BeanStub {
    private columnMap: Map<AgColumn, boolean> = new Map();
    private isActive: boolean = false;
    constructor(
        private column: AgColumn | AgColumnGroup,
        private comp: IHeaderCellComp
    ) {
        super();
        this.resetColumnMap();
    }

    public postConstruct(): void {
        this.addManagedPropertyListener('cellSelection', () => {
            this.refreshActive();
        });
        this.refreshActive();
        this.setupRangeHeaderHighlight();
    }

    private resetColumnMap(): void {
        this.columnMap.clear();

        let columns: AgColumn[] | null;
        if (this.column.isColumn) {
            columns = [this.column];
        } else {
            columns = this.column.getDisplayedLeafColumns();
        }

        for (const column of columns) {
            this.columnMap.set(column, false);
        }
    }

    private refreshActive(): void {
        const { gos, rangeSvc } = this.beans;
        const selection = gos.get('cellSelection');

        this.isActive = !!(selection && rangeSvc && typeof selection === 'object' && selection.enableHeaderHighlight);
    }

    private setupRangeHeaderHighlight(): void {
        const listener = this.onRangeSelectionChanged.bind(this);

        this.addManagedEventListeners({
            rangeSelectionChanged: listener,
            columnPinned: listener,
            columnMoved: listener,
            columnGroupOpened: listener,
        });

        listener();
    }

    public onRangeSelectionChanged(): void {
        if (!this.isActive) {
            return;
        }

        this.resetColumnMap();

        const ranges = this.beans.rangeSvc!.getCellRanges();
        let hasRange = false;
        let isAllColumnRange = true;

        for (const range of ranges) {
            if (hasRange) {
                break;
            }

            for (const column of range.columns) {
                if (this.columnMap.has(column as AgColumn)) {
                    this.columnMap.set(column as AgColumn, true);
                    hasRange ||= true;
                }
            }
        }

        for (const value of Array.from(this.columnMap.values())) {
            if (value === false) {
                isAllColumnRange = false;
                break;
            }
        }

        this.comp.toggleCss('ag-header-range-highlight', hasRange && isAllColumnRange);
    }

    public override destroy(): void {
        super.destroy();
        (this.comp as any) = null;
        (this.column as any) = null;
    }
}
