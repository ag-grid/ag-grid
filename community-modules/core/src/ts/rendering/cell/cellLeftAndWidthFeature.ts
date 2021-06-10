import { CellCtrl, ICellComp } from "./cellCtrl";
import { CellComp } from "./cellComp";
import { Column } from "../../entities/column";
import { areEqual, last } from "../../utils/array";
import { Events } from "../../eventKeys";
import { missing } from "../../utils/generic";
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";

export class CellLeftAndWidthFeature extends BeanStub {

    private ctrl: CellCtrl;
    private comp: ICellComp;

    private readonly column: Column;
    private readonly rowNode: RowNode;

    private beans: Beans;

    private colsSpanning: Column[];

    constructor(ctrl: CellCtrl, beans: Beans) {
        super();

        this.ctrl = ctrl;
        this.beans = beans;

        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();

        this.setupColSpan();
    }

    public setComp(comp: ICellComp): void {
        this.comp = comp;
        this.onLeftChanged();
        this.onWidthChanged();
    }

    private onDisplayColumnsChanged(): void {
        const colsSpanning: Column[] = this.getColSpanningList();

        if (!areEqual(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    }

    private setupColSpan(): void {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (this.column.getColDef().colSpan == null) { return; }

        this.colsSpanning = this.getColSpanningList();

        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addManagedListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayColumnsChanged.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
        this.addManagedListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onWidthChanged.bind(this));
    }

    public onWidthChanged(): void {
        if (!this.comp) { return; }
        const width = this.getCellWidth();
        this.comp.setWidth(`${width}px`);
    }

    private getCellWidth(): number {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }

        return this.colsSpanning.reduce((width, col) => width + col.getActualWidth(), 0);
    }

    public getColSpanningList(): Column[] {
        const colSpan = this.column.getColSpan(this.rowNode);
        const colsSpanning: Column[] = [];

        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        } else {
            let pointer: Column | null = this.column;
            const pinned = this.column.getPinned();
            for (let i = 0; pointer && i < colSpan; i++) {
                colsSpanning.push(pointer);
                pointer = this.beans.columnModel.getDisplayedColAfter(pointer);
                if (!pointer || missing(pointer)) {
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
        if (!this.comp) { return; }
        const left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.comp.setLeft(left + 'px');
        this.refreshAriaIndex();
    }

    private refreshAriaIndex(): void {
        const colIdx = this.beans.columnModel.getAriaColumnIndex(this.column);
        this.comp.setAriaColIndex(colIdx);
    }

    private getCellLeft(): number | null {
        let mostLeftCol: Column;

        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            mostLeftCol = last(this.colsSpanning);
        } else {
            mostLeftCol = this.column;
        }

        return mostLeftCol.getLeft();
    }

    private modifyLeftForPrintLayout(leftPosition: number | null): number | null {
        if (!this.ctrl.isPrintLayout() || this.column.getPinned() === Constants.PINNED_LEFT) {
            return leftPosition;
        }

        const leftWidth = this.beans.columnModel.getDisplayedColumnsLeftWidth();

        if (this.column.getPinned() === Constants.PINNED_RIGHT) {
            const bodyWidth = this.beans.columnModel.getBodyContainerWidth();
            return leftWidth + bodyWidth + (leftPosition || 0);
        }

        // is in body
        return leftWidth + (leftPosition || 0);
    }

    // overriding to make public, as we don't dispose this bean via context
    public destroy() {
        super.destroy();
    }
}