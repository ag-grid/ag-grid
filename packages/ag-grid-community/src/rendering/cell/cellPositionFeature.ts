import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _getRowHeightAsNumber } from '../../gridOptionsUtils';
import { _areEqual, _last } from '../../utils/array';
import { _missing } from '../../utils/generic';
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

    private eSetLeft: HTMLElement;
    private eContent: HTMLElement;

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
    }

    private setupRowSpan(): void {
        this.rowSpan = this.column.getRowSpan(this.rowNode);

        this.addManagedListeners(this.beans.eventSvc, { newColumnsLoaded: () => this.onNewColumnsLoaded() });
    }

    public init(): void {
        this.eSetLeft = this.cellCtrl.getRootElement();
        this.eContent = this.cellCtrl.eGui;

        const cellSpan = this.cellCtrl.getCellSpan();

        // add event handlers only after GUI is attached,
        // so we don't get events before we are ready
        if (!cellSpan) {
            this.setupColSpan();
            this.setupRowSpan();
        }

        this.onLeftChanged();
        this.onWidthChanged();
        if (!cellSpan) {
            this._legacyApplyRowSpan();
        }

        if (cellSpan) {
            const refreshSpanHeight = this.refreshSpanHeight.bind(this, cellSpan);
            refreshSpanHeight();
            this.addManagedListeners(this.beans.eventSvc, {
                paginationChanged: refreshSpanHeight,
                recalculateRowBounds: refreshSpanHeight,
                pinnedHeightChanged: refreshSpanHeight,
            });
        }
    }

    private refreshSpanHeight(cellSpan: CellSpan) {
        const spanHeight = cellSpan.getCellHeight();
        if (spanHeight != null) {
            this.eContent.style.height = `${spanHeight}px`;
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
        if (this.column.getColDef().colSpan == null) {
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
        if (!this.eContent) {
            return;
        }
        const width = this.getCellWidth();
        this.eContent.style.width = `${width}px`;
    }

    private getCellWidth(): number {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }

        return this.colsSpanning.reduce((width, col) => width + col.getActualWidth(), 0);
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
        if (!this.eSetLeft) {
            return;
        }
        const left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.eSetLeft.style.left = left + 'px';
    }

    private getCellLeft(): number | null {
        let mostLeftCol: AgColumn;

        if (this.beans.gos.get('enableRtl') && this.colsSpanning) {
            mostLeftCol = _last(this.colsSpanning);
        } else {
            mostLeftCol = this.column;
        }

        return mostLeftCol.getLeft();
    }

    private modifyLeftForPrintLayout(leftPosition: number | null): number | null {
        if (!this.cellCtrl.printLayout || this.column.getPinned() === 'left') {
            return leftPosition;
        }

        const { visibleCols } = this.beans;
        const leftWidth = visibleCols.getColsLeftWidth();

        if (this.column.getPinned() === 'right') {
            const bodyWidth = visibleCols.bodyWidth;
            return leftWidth + bodyWidth + (leftPosition || 0);
        }

        // is in body
        return leftWidth + (leftPosition || 0);
    }

    private _legacyApplyRowSpan(force?: boolean): void {
        if (this.rowSpan === 1 && !force) {
            return;
        }

        const singleRowHeight = _getRowHeightAsNumber(this.beans);
        const totalRowHeight = singleRowHeight * this.rowSpan;

        this.eContent.style.height = `${totalRowHeight}px`;
        this.eContent.style.zIndex = '1';
    }

    // overriding to make public, as we don't dispose this bean via context
    public override destroy() {
        super.destroy();
    }
}
