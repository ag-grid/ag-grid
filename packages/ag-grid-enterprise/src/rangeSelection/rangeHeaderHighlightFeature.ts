import { BeanStub } from 'ag-grid-community';
import type { AgColumn, IHeaderCellComp } from 'ag-grid-community';

export class RangeHeaderHighlightFeature extends BeanStub {
    constructor(
        private column: AgColumn,
        private comp: IHeaderCellComp
    ) {
        super();

        this.column = column;
        this.comp = comp;
    }

    public postConstruct(): void {
        this.setupRangeHeaderHighlight();
    }

    private setupRangeHeaderHighlight(): void {
        const { gos, rangeSvc } = this.beans;
        const selection = gos.get('cellSelection');

        if (!selection || !rangeSvc || typeof selection !== 'object' || !selection.enableHeaderHighlight) {
            return;
        }

        this.addManagedEventListeners({
            rangeSelectionChanged: this.onRangeSelectionChanged.bind(this),
        });
    }

    onRangeSelectionChanged(): void {
        const ranges = this.beans.rangeSvc!.getCellRanges();
        let hasRange = false;

        for (const range of ranges) {
            if (hasRange) {
                break;
            }
            for (const column of range.columns) {
                if (column === this.column) {
                    hasRange = true;
                    break;
                }
            }
        }

        this.comp.addOrRemoveCssClass('ag-header-range-highlight', hasRange);
    }

    public override destroy(): void {
        super.destroy();
        (this.comp as any) = null;
        (this.column as any) = null;
    }
}
