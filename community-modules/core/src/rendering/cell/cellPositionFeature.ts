import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _areEqual, _last } from '../../utils/array';
import { _missing } from '../../utils/generic';
import type { CellCtrl } from './cellCtrl';

export interface CellPositionStyles {
    left?: string;
    width?: string;
    height?: string;
    zIndex?: string;
}

/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
export class CellPositionFeature extends BeanStub {
    private cellCtrl: CellCtrl;
    private eGui: HTMLElement;

    private readonly column: AgColumn;
    private readonly rowNode: RowNode;

    private colsSpanning: AgColumn[];
    private rowSpan: number;

    private left: string;
    private width: string;
    private height: string;
    private zIndex: string;

    private beans: BeanCollection;

    constructor(ctrl: CellCtrl, beans: BeanCollection) {
        super();

        this.cellCtrl = ctrl;
        this.beans = beans;

        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();

        this.setupColSpan();
        this.setupRowSpan();

        // Work out the initial values before we have the GUI so they can be used in the first React Render
        this.onLeftChanged();
        this.onWidthChanged();
        this.applyRowSpan();
    }

    public setComp(eGui: HTMLElement): void {
        this.eGui = eGui;

        // Now we have the GUI, we set the properties
        this.onLeftChanged();
        this.onWidthChanged();
        this.applyRowSpan();
    }

    public getStyles(): CellPositionStyles {
        return { left: this.left, width: this.width, height: this.height, zIndex: this.zIndex };
    }

    private onNewColumnsLoaded(): void {
        const rowSpan = this.column.getRowSpan(this.rowNode);
        if (this.rowSpan === rowSpan) {
            return;
        }

        this.rowSpan = rowSpan;
        this.applyRowSpan(true);
    }

    private onDisplayColumnsChanged(): void {
        const colsSpanning: AgColumn[] = this.getColSpanningList();

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

        this.addManagedListeners(this.beans.eventService, {
            // because we are col spanning, a reorder of the cols can change what cols we are spanning over
            displayedColumnsChanged: this.onDisplayColumnsChanged.bind(this),
            // because we are spanning over multiple cols, we check for width any time any cols width changes.
            // this is expensive - really we should be explicitly checking only the cols we are spanning over
            // instead of every col, however it would be tricky code to track the cols we are spanning over, so
            // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
            displayedColumnsWidthChanged: this.onWidthChanged.bind(this),
        });
    }

    private setupRowSpan(): void {
        this.rowSpan = this.column.getRowSpan(this.rowNode);

        this.addManagedListeners(this.beans.eventService, { newColumnsLoaded: () => this.onNewColumnsLoaded() });
    }

    public onWidthChanged(): void {
        this.width = `${this.getCellWidth()}px`;
        if (this.eGui) {
            this.eGui.style.width = this.width;
        }
    }

    private getCellWidth(): number {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }

        return this.colsSpanning.reduce((width, col) => width + col.getActualWidth(), 0);
    }

    public getColSpanningList(): AgColumn[] {
        const colSpan = this.column.getColSpan(this.rowNode);
        const colsSpanning: AgColumn[] = [];

        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        } else {
            let pointer: AgColumn | null = this.column;
            const pinned = this.column.getPinned();
            for (let i = 0; pointer && i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.visibleColsService.getColAfter(pointer);
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
        this.left = this.modifyLeftForPrintLayout(this.getCellLeft()) + 'px';
        if (this.eGui) {
            this.eGui.style.left = this.left;
        }
    }

    private getCellLeft(): number | null {
        const mostLeftCol =
            this.colsSpanning && this.beans.gos.get('enableRtl') ? _last(this.colsSpanning) : this.column;

        return mostLeftCol.getLeft();
    }

    private modifyLeftForPrintLayout(leftPosition: number | null): number | null {
        const { column, beans } = this;
        const pinned = column.getPinned();
        if (!this.cellCtrl.isPrintLayout() || pinned === 'left') {
            return leftPosition;
        }
        const visibleColsService = beans.visibleColsService;
        const leftWidth = visibleColsService.getColsLeftWidth();

        if (pinned === 'right') {
            const bodyWidth = visibleColsService.getBodyContainerWidth();
            return leftWidth + bodyWidth + (leftPosition || 0);
        }

        // is in body
        return leftWidth + (leftPosition || 0);
    }

    private applyRowSpan(force?: boolean): void {
        if (this.rowSpan === 1 && !force) {
            return;
        }

        const singleRowHeight = this.beans.gos.getRowHeightAsNumber();
        const totalRowHeight = singleRowHeight * this.rowSpan;

        this.height = `${totalRowHeight}px`;
        this.zIndex = '1';

        if (this.eGui) {
            this.eGui.style.height = this.height;
            this.eGui.style.zIndex = this.zIndex;
        }
    }

    // overriding to make public, as we don't dispose this bean via context
    public override destroy() {
        super.destroy();
    }
}
