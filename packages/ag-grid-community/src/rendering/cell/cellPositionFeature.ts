import { _areEqual, _missing } from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { applyHorizontalPosition, getResolvedHorizontalOffset } from '../features/horizontalPositionUtils';
import type { CellSpan } from '../spanning/rowSpanCache';
import type { CellCtrl } from './cellCtrl';

/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
export class CellPositionFeature extends BeanStub {
    private readonly column: AgColumn;
    private readonly rowNode: RowNode;

    private colsSpanning: AgColumn[];
    private rowSpan: number;

    constructor(
        private readonly cellCtrl: CellCtrl,
        beans: BeanCollection
    ) {
        super();

        this.beans = beans;

        this.column = cellCtrl.column;
        this.rowNode = cellCtrl.rowNode;

        // Listener setup runs in the constructor (before the cell component attaches) so that
        // getColSpanningList() is available as soon as the CellCtrl exists. This is required in
        // React, where setComp() is called asynchronously, but navigation normalisation may query
        // the position feature synchronously before the first render completes.
        const cellSpan = cellCtrl.getCellSpan();
        if (cellSpan) {
            const refreshSpanHeight = this.refreshSpanHeight.bind(this, cellSpan);
            this.addManagedListeners(this.beans.eventSvc, {
                paginationChanged: refreshSpanHeight,
                recalculateRowBounds: refreshSpanHeight,
                pinnedHeightChanged: refreshSpanHeight,
            });
        } else {
            this.setupColSpan();
            this.setupRowSpan();
        }
    }

    private setupRowSpan(): void {
        this.rowSpan = this.column.getRowSpan(this.rowNode);

        this.addManagedListeners(this.beans.eventSvc, { newColumnsLoaded: () => this.onNewColumnsLoaded() });
    }

    // Called each time the cell component attaches (initial mount and any remount).
    public init(): void {
        this.onLeftChanged();
        this.onWidthChanged();
        const cellSpan = this.cellCtrl.getCellSpan();
        if (cellSpan) {
            this.refreshSpanHeight(cellSpan);
        } else {
            this._legacyApplyRowSpan();
        }
    }

    private refreshSpanHeight(cellSpan: CellSpan) {
        const spanHeight = cellSpan.getCellHeight();
        const eContent = this.cellCtrl.eGui;
        if (spanHeight != null && eContent) {
            eContent.style.height = `${spanHeight}px`;
        }
    }

    private onNewColumnsLoaded(): void {
        const rowSpan = this.column.getRowSpan(this.rowNode);
        if (this.rowSpan === rowSpan) {
            return;
        }

        this.rowSpan = rowSpan;
        this._legacyApplyRowSpan(true);
    }

    private onDisplayColumnsChanged(): void {
        const colsSpanning = this.getColSpanningList();

        if (!_areEqual(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    }

    private setupColSpan(): void {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (this.column.colDef.colSpan == null) {
            return;
        }

        this.colsSpanning = this.getColSpanningList();

        this.addManagedListeners(this.beans.eventSvc, {
            // because we are col spanning, a reorder of the cols can change what cols we are spanning over
            displayedColumnsChanged: this.onDisplayColumnsChanged.bind(this),
            // because we are spanning over multiple cols, we check for width any time any cols width changes.
            // this is expensive - really we should be explicitly checking only the cols we are spanning over
            // instead of every col, however it would be tricky code to track the cols we are spanning over, so
            // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
            displayedColumnsWidthChanged: this.onWidthChanged.bind(this),
        });
    }

    public onWidthChanged(): void {
        const eContent = this.cellCtrl.eGui;
        if (!eContent) {
            return;
        }
        eContent.style.width = `${this.getCellWidth()}px`;
    }

    private getCellWidth(): number {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }
        const cols = this.colsSpanning;
        let width = 0;
        for (let i = 0, len = cols.length; i < len; ++i) {
            width += cols[i].actualWidth;
        }
        return width;
    }

    public getColSpanningList(): AgColumn[] {
        const { column, rowNode } = this;
        const colSpan = column.getColSpan(rowNode);
        const colsSpanning: AgColumn[] = [];

        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(column);
        } else {
            let pointer: AgColumn | null = column;
            const pinned = column.getPinned();
            for (let i = 0; pointer && i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.visibleCols.getColAfter(pointer);
                if (!pointer || _missing(pointer)) {
                    break;
                }
                // we do not allow col spanning to span outside of pinned areas
                if (pinned !== pointer.getPinned()) {
                    break;
                }
            }
        }

        return colsSpanning;
    }

    public onLeftChanged(): void {
        const eSetLeft = this.cellCtrl.getRootElement();
        if (!eSetLeft) {
            return;
        }
        const { gos, visibleCols } = this.beans;
        const left = getResolvedHorizontalOffset({
            left: this.getCellLeft(),
            pinned: this.column.getPinned(),
            width: this.getCellWidth(),
            isPrintLayout: this.cellCtrl.printLayout,
            isRtl: gos.get('enableRtl'),
            visibleCols,
        });
        if (left == null) {
            return;
        }

        this.setHorizontalPosition(eSetLeft, left);
    }

    private getCellLeft(): number | null {
        // column.getLeft() is "distance from start edge" — in both LTR and RTL,
        // this.column is the start-edge column of any col-spanning range.
        return this.column.getLeft();
    }

    private setHorizontalPosition(eSetLeft: HTMLElement, left: number): void {
        const { gos, visibleCols } = this.beans;
        applyHorizontalPosition(eSetLeft, {
            offset: left,
            pinned: this.column.getPinned(),
            width: this.getCellWidth(),
            isPrintLayout: this.cellCtrl.printLayout,
            isRtl: gos.get('enableRtl'),
            visibleCols,
        });
    }

    private _legacyApplyRowSpan(force?: boolean): void {
        if (this.rowSpan === 1 && !force) {
            return;
        }

        const eContent = this.cellCtrl.eGui;
        if (!eContent) {
            return;
        }

        const singleRowHeight = _getRowHeightAsNumber(this.beans);
        const totalRowHeight = singleRowHeight * this.rowSpan;

        eContent.style.height = `${totalRowHeight}px`;
        // row-spanned cell content must sit above normal cells in the same row.
        eContent.style.zIndex = '1';
    }

    // overriding to make public, as we don't dispose this bean via context
    public override destroy() {
        super.destroy();
    }
}
