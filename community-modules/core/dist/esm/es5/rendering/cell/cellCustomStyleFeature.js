/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
import { BeanStub } from "../../context/beanStub";
var CellCustomStyleFeature = /** @class */ (function (_super) {
    __extends(CellCustomStyleFeature, _super);
    function CellCustomStyleFeature(ctrl, beans) {
        var _this = _super.call(this) || this;
        _this.staticClasses = [];
        _this.cellCtrl = ctrl;
        _this.beans = beans;
        _this.column = ctrl.getColumn();
        _this.rowNode = ctrl.getRowNode();
        return _this;
    }
    CellCustomStyleFeature.prototype.setComp = function (comp) {
        this.cellComp = comp;
        this.applyUserStyles();
        this.applyCellClassRules();
        this.applyClassesFromColDef();
    };
    CellCustomStyleFeature.prototype.applyCellClassRules = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var cellClassParams = {
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            colDef: colDef,
            column: this.column,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsService.get('api'),
            columnApi: this.beans.gridOptionsService.get('columnApi'),
            context: this.beans.gridOptionsService.get('context')
        };
        this.beans.stylingService.processClassRules(colDef.cellClassRules, cellClassParams, function (className) { return _this.cellComp.addOrRemoveCssClass(className, true); }, function (className) { return _this.cellComp.addOrRemoveCssClass(className, false); });
    };
    CellCustomStyleFeature.prototype.applyUserStyles = function () {
        var colDef = this.column.getColDef();
        if (!colDef.cellStyle) {
            return;
        }
        var styles;
        if (typeof colDef.cellStyle === 'function') {
            var cellStyleParams = {
                column: this.column,
                value: this.cellCtrl.getValue(),
                colDef: colDef,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsService.get('api'),
                columnApi: this.beans.gridOptionsService.get('columnApi'),
                context: this.beans.gridOptionsService.get('context'),
            };
            var cellStyleFunc = colDef.cellStyle;
            styles = cellStyleFunc(cellStyleParams);
        }
        else {
            styles = colDef.cellStyle;
        }
        this.cellComp.setUserStyles(styles);
    };
    CellCustomStyleFeature.prototype.applyClassesFromColDef = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var cellClassParams = {
            value: this.cellCtrl.getValue(),
            data: this.rowNode.data,
            node: this.rowNode,
            column: this.column,
            colDef: colDef,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsService.get('api'),
            columnApi: this.beans.gridOptionsService.get('columnApi'),
            context: this.beans.gridOptionsService.get('context')
        };
        if (this.staticClasses.length) {
            this.staticClasses.forEach(function (className) { return _this.cellComp.addOrRemoveCssClass(className, false); });
        }
        this.staticClasses = this.beans.stylingService.getStaticCellClasses(colDef, cellClassParams);
        if (this.staticClasses.length) {
            this.staticClasses.forEach(function (className) { return _this.cellComp.addOrRemoveCssClass(className, true); });
        }
    };
    // overriding to make public, as we don't dispose this bean via context
    CellCustomStyleFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    return CellCustomStyleFeature;
}(BeanStub));
export { CellCustomStyleFeature };
