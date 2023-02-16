/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { areEqual, last } from "../../utils/array";
import { Events } from "../../eventKeys";
import { missing } from "../../utils/generic";
import { BeanStub } from "../../context/beanStub";
/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
var CellPositionFeature = /** @class */ (function (_super) {
    __extends(CellPositionFeature, _super);
    function CellPositionFeature(ctrl, beans) {
        var _this = _super.call(this) || this;
        _this.cellCtrl = ctrl;
        _this.beans = beans;
        _this.column = ctrl.getColumn();
        _this.rowNode = ctrl.getRowNode();
        _this.setupColSpan();
        _this.setupRowSpan();
        return _this;
    }
    CellPositionFeature.prototype.setupRowSpan = function () {
        this.rowSpan = this.column.getRowSpan(this.rowNode);
    };
    CellPositionFeature.prototype.setComp = function (eGui) {
        this.eGui = eGui;
        this.onLeftChanged();
        this.onWidthChanged();
        this.applyRowSpan();
    };
    CellPositionFeature.prototype.onDisplayColumnsChanged = function () {
        var colsSpanning = this.getColSpanningList();
        if (!areEqual(this.colsSpanning, colsSpanning)) {
            this.colsSpanning = colsSpanning;
            this.onWidthChanged();
            this.onLeftChanged(); // left changes when doing RTL
        }
    };
    CellPositionFeature.prototype.setupColSpan = function () {
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
    };
    CellPositionFeature.prototype.onWidthChanged = function () {
        if (!this.eGui) {
            return;
        }
        var width = this.getCellWidth();
        this.eGui.style.width = width + "px";
    };
    CellPositionFeature.prototype.getCellWidth = function () {
        if (!this.colsSpanning) {
            return this.column.getActualWidth();
        }
        return this.colsSpanning.reduce(function (width, col) { return width + col.getActualWidth(); }, 0);
    };
    CellPositionFeature.prototype.getColSpanningList = function () {
        var colSpan = this.column.getColSpan(this.rowNode);
        var colsSpanning = [];
        // if just one col, the col span is just the column we are in
        if (colSpan === 1) {
            colsSpanning.push(this.column);
        }
        else {
            var pointer = this.column;
            var pinned = this.column.getPinned();
            for (var i = 0; pointer && i < colSpan; i++) {
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
    };
    CellPositionFeature.prototype.onLeftChanged = function () {
        if (!this.eGui) {
            return;
        }
        var left = this.modifyLeftForPrintLayout(this.getCellLeft());
        this.eGui.style.left = left + 'px';
    };
    CellPositionFeature.prototype.getCellLeft = function () {
        var mostLeftCol;
        if (this.beans.gridOptionsService.is('enableRtl') && this.colsSpanning) {
            mostLeftCol = last(this.colsSpanning);
        }
        else {
            mostLeftCol = this.column;
        }
        return mostLeftCol.getLeft();
    };
    CellPositionFeature.prototype.modifyLeftForPrintLayout = function (leftPosition) {
        if (!this.cellCtrl.isPrintLayout() || this.column.getPinned() === 'left') {
            return leftPosition;
        }
        var leftWidth = this.beans.columnModel.getDisplayedColumnsLeftWidth();
        if (this.column.getPinned() === 'right') {
            var bodyWidth = this.beans.columnModel.getBodyContainerWidth();
            return leftWidth + bodyWidth + (leftPosition || 0);
        }
        // is in body
        return leftWidth + (leftPosition || 0);
    };
    CellPositionFeature.prototype.applyRowSpan = function () {
        if (this.rowSpan === 1) {
            return;
        }
        var singleRowHeight = this.beans.gridOptionsService.getRowHeightAsNumber();
        var totalRowHeight = singleRowHeight * this.rowSpan;
        this.eGui.style.height = totalRowHeight + "px";
        this.eGui.style.zIndex = '1';
    };
    // overriding to make public, as we don't dispose this bean via context
    CellPositionFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return CellPositionFeature;
}(BeanStub));
export { CellPositionFeature };
