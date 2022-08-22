/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { areEqual, last } from "../../utils/array";
import { Events } from "../../eventKeys";
import { missing } from "../../utils/generic";
import { Constants } from "../../constants/constants";
import { BeanStub } from "../../context/beanStub";
/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
export class CellPositionFeature extends BeanStub {
    constructor(ctrl, beans) {
        super();
        this.cellCtrl = ctrl;
        this.beans = beans;
        this.column = ctrl.getColumn();
        this.rowNode = ctrl.getRowNode();
        this.setupColSpan();
        this.setupRowSpan();
    }
    setupRowSpan() {
        this.rowSpan = this.column.getRowSpan(this.rowNode);
    }
    setComp(eGui) {
        this.eGui = eGui;
        this.onLeftChanged();
        this.onWidthChanged();
        this.applyRowSpan();
    }
    onDisplayColumnsChanged() {
        const colsSpanning = this.getColSpanningList();
        if (!areEqual(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    }
    setupColSpan() {
        // if no col span is active, then we don't set it up, as it would be wasteful of CPU
        if (this.column.getColDef().colSpan == null) {
            return;
        }
        this.colsSpanning = this.getColSpanningList();
        // because we are col spanning, a reorder of the cols can change what cols we are spanning over
        this.addManagedListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayColumnsChanged.bind(this));
        // because we are spanning over multiple cols, we check for width any time any cols width changes.
        // this is expensive - really we should be explicitly checking only the cols we are spanning over
        // instead of every col, however it would be tricky code to track the cols we are spanning over, so
        // because hardly anyone will be using colSpan, am favouring this easier way for more maintainable code.
        this.addManagedListener(this.beans.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onWidthChanged.bind(this));
    }
    onWidthChanged() {
        if (!this.eGui) {
            return;
        }
        const width = this.getCellWidth();
        this.eGui.style.width = `${width}px`;
    }
    getCellWidth() {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }
        return this.colsSpanning.reduce((width, col) => width + col.getActualWidth(), 0);
    }
    getColSpanningList() {
        const colSpan = this.column.getColSpan(this.rowNode);
        const colsSpanning = [];
        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        }
        else {
            let pointer = this.column;
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
    onLeftChanged() {
        if (!this.eGui) {
            return;
        }
        const left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.eGui.style.left = left + 'px';
    }
    getCellLeft() {
        let mostLeftCol;
        if (this.beans.gridOptionsWrapper.isEnableRtl() && this.colsSpanning) {
            mostLeftCol = last(this.colsSpanning);
        }
        else {
            mostLeftCol = this.column;
        }
        return mostLeftCol.getLeft();
    }
    modifyLeftForPrintLayout(leftPosition) {
        if (!this.cellCtrl.isPrintLayout() || this.column.getPinned() === Constants.PINNED_LEFT) {
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
    applyRowSpan() {
        if (this.rowSpan === 1) {
            return;
        }
        const singleRowHeight = this.beans.gridOptionsWrapper.getRowHeightAsNumber();
        const totalRowHeight = singleRowHeight * this.rowSpan;
        this.eGui.style.height = `${totalRowHeight}px`;
        this.eGui.style.zIndex = '1';
    }
    // overriding to make public, as we don't dispose this bean via context
    destroy() {
        super.destroy();
    }
}
