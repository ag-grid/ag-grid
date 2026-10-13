import type { AgColumn, AgColumnGroup, IHeaderCellComp } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class RangeHeaderHighlightFeature extends BeanStub {
    private readonly columnMap: Map<AgColumn, boolean> = new Map();
    private isActive: boolean = false;
    constructor(
        private readonly column: AgColumn | AgColumnGroup,
        private readonly comp: IHeaderCellComp
    ) {
        super();
    }

    public postConstruct(): void {
        const onRangeSelectionChanged = this.onRangeSelectionChanged.bind(this);
        this.addManagedEventListeners({
            rangeSelectionChanged: onRangeSelectionChanged,
            displayedColumnsChanged: onRangeSelectionChanged,
        });
        this.addManagedPropertyListener('cellSelection', this.refreshActive.bind(this));
        this.refreshActive();
    }

    private resetColumnMap(): void {
        const { columnMap, column } = this;
        columnMap.clear();
        if (column.isColumn) {
            columnMap.set(column, false);
            return;
        }
        const leafColumns = column.getDisplayedLeafColumns();
        for (let i = 0, len = leafColumns.length; i < len; ++i) {
            columnMap.set(leafColumns[i], false);
        }
    }

    private refreshActive(): void {
        const { gos, rangeSvc } = this.beans;
        const selection = gos.get('cellSelection');
        const isActive = !!(selection && rangeSvc && typeof selection === 'object' && selection.enableHeaderHighlight);
        if (isActive === this.isActive) {
            return;
        }

        this.isActive = isActive;
        if (isActive) {
            this.onRangeSelectionChanged();
        } else {
            this.comp.toggleCss('ag-header-range-highlight', false);
        }
    }

    private onRangeSelectionChanged(): void {
        if (!this.isActive) {
            return;
        }

        this.resetColumnMap();
        const columnMap = this.columnMap;
        let uncovered = columnMap.size;

        // a group is highlighted once every column it displays is in some range, as each column's own header is
        const ranges = this.beans.rangeSvc!.getCellRanges();
        for (let i = 0, len = ranges.length; i < len && uncovered > 0; ++i) {
            const columns = ranges[i].columns;
            for (let j = 0, colsLen = columns.length; j < colsLen; ++j) {
                const column = columns[j] as AgColumn;
                if (columnMap.get(column) === false) {
                    columnMap.set(column, true);
                    --uncovered;
                }
            }
        }

        this.comp.toggleCss('ag-header-range-highlight', columnMap.size > 0 && uncovered === 0);
    }

    public override destroy(): void {
        super.destroy();
        (this.comp as any) = null;
        (this.column as any) = null;
    }
}
