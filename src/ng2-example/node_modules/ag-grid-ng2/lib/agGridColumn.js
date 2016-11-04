// ag-grid-ng2 v6.2.0
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var AgGridColumn = (function () {
    function AgGridColumn() {
    }
    AgGridColumn.prototype.hasChildColumns = function () {
        if (this.childColumns && this.childColumns.length > 0) {
            // necessary because of https://github.com/angular/angular/issues/10098
            return !(this.childColumns.length === 1 && this.childColumns.first === this);
        }
        return false;
    };
    AgGridColumn.prototype.toColDef = function () {
        var colDef = this.createColDefFromGridColumn(this);
        if (this.hasChildColumns()) {
            colDef["children"] = this.getChildColDefs(this.childColumns);
        }
        return colDef;
    };
    AgGridColumn.prototype.getChildColDefs = function (childColumns) {
        return childColumns
            .filter(function (column) { return !column.hasChildColumns(); })
            .map(function (column) {
            return column.toColDef();
        });
    };
    ;
    AgGridColumn.prototype.createColDefFromGridColumn = function (from) {
        var colDef = {};
        Object.assign(colDef, from);
        delete colDef.childColumns;
        return colDef;
    };
    ;
    __decorate([
        core_1.ContentChildren(AgGridColumn), 
        __metadata('design:type', core_1.QueryList)
    ], AgGridColumn.prototype, "childColumns", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "colId", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "sort", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "sortedAt", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], AgGridColumn.prototype, "sortingOrder", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "field", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "headerValueGetter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "hide", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "pinned", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "tooltipField", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "headerTooltip", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "valueGetter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "keyCreator", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "headerCellRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "headerCellTemplate", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "width", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "minWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "maxWidth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellClass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellStyle", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellRendererFramework", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellRendererParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellEditor", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellEditorFramework", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellEditorParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "floatingCellRenderer", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "floatingCellRendererFramework", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "floatingCellRendererParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "cellFormatter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "floatingCellFormatter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "aggFunc", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "rowGroupIndex", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], AgGridColumn.prototype, "pivotIndex", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "comparator", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "checkboxSelection", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressMenu", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressSorting", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressMovable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressFilter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "unSortIcon", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressSizeToFit", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressResize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "suppressAutoSize", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "enableRowGroup", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "enablePivot", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "enableValue", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "editable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "suppressNavigable", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "newValueHandler", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "volatile", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "filter", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "filterFramework", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "filterParams", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "cellClassRules", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "onCellValueChanged", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "onCellClicked", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "onCellDoubleClicked", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Function)
    ], AgGridColumn.prototype, "onCellContextMenu", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "icons", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "enableCellChangeFlash", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "headerName", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "columnGroupShow", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], AgGridColumn.prototype, "headerClass", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], AgGridColumn.prototype, "children", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], AgGridColumn.prototype, "groupId", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "openByDefault", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], AgGridColumn.prototype, "marryChildren", void 0);
    AgGridColumn = __decorate([
        core_1.Component({
            selector: 'ag-grid-column',
            template: ''
        }), 
        __metadata('design:paramtypes', [])
    ], AgGridColumn);
    return AgGridColumn;
}());
exports.AgGridColumn = AgGridColumn;
