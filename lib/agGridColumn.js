// ag-grid-aurelia v13.3.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_framework_1 = require("aurelia-framework");
var agTemplate_1 = require("./agTemplate");
var agUtils_1 = require("./agUtils");
var AgGridColumn = /** @class */ (function () {
    function AgGridColumn() {
        this.mappedColumnProperties = {
            "hideCol": "hide" // hide exists in aurelia-templating-resources and will conflict
        };
        this.childColumns = [];
    }
    AgGridColumn_1 = AgGridColumn;
    AgGridColumn.prototype.hasChildColumns = function () {
        return this.childColumns && this.childColumns.length > 0;
    };
    AgGridColumn.prototype.toColDef = function () {
        var colDef = this.createColDefFromGridColumn();
        if (this.hasChildColumns()) {
            colDef["children"] = AgGridColumn_1.getChildColDefs(this.childColumns);
        }
        if (this.cellTemplate) {
            colDef.cellRendererFramework = { template: this.cellTemplate.template };
            delete colDef.cellTemplate;
        }
        if (this.editorTemplate) {
            if (colDef.editable === undefined) {
                colDef.editable = true;
            }
            colDef.cellEditorFramework = { template: this.editorTemplate.template };
            delete colDef.editorTemplate;
        }
        if (this.filterTemplate) {
            colDef.filterFramework = { template: this.filterTemplate.template };
            delete colDef.filterTemplate;
        }
        if (this.headerTemplate) {
            colDef.headerComponentFramework = { template: this.headerTemplate.template };
            delete colDef.headerTemplate;
        }
        if (this.headerGroupTemplate) {
            colDef.headerGroupComponentFramework = { template: this.headerGroupTemplate.template };
            delete colDef.headerGroupTemplate;
        }
        return colDef;
    };
    AgGridColumn.getChildColDefs = function (childColumns) {
        return childColumns
            .filter(function (column) { return !column.hasChildColumns(); })
            .map(function (column) {
            return column.toColDef();
        });
    };
    ;
    AgGridColumn.prototype.createColDefFromGridColumn = function () {
        var colDef = {};
        for (var prop in this) {
            var colDefProperty = this.mappedColumnProperties[prop] ? this.mappedColumnProperties[prop] : prop;
            colDef[colDefProperty] = this[prop];
        }
        delete colDef.childColumns;
        return colDef;
    };
    ;
    __decorate([
        aurelia_framework_1.children('ag-grid-column'),
        __metadata("design:type", Array)
    ], AgGridColumn.prototype, "childColumns", void 0);
    __decorate([
        aurelia_framework_1.child('ag-cell-template'),
        __metadata("design:type", agTemplate_1.AgCellTemplate)
    ], AgGridColumn.prototype, "cellTemplate", void 0);
    __decorate([
        aurelia_framework_1.child('ag-editor-template'),
        __metadata("design:type", agTemplate_1.AgEditorTemplate)
    ], AgGridColumn.prototype, "editorTemplate", void 0);
    __decorate([
        aurelia_framework_1.child('ag-filter-template'),
        __metadata("design:type", agTemplate_1.AgFilterTemplate)
    ], AgGridColumn.prototype, "filterTemplate", void 0);
    __decorate([
        aurelia_framework_1.child('ag-header-template'),
        __metadata("design:type", agTemplate_1.AgHeaderTemplate)
    ], AgGridColumn.prototype, "headerTemplate", void 0);
    __decorate([
        aurelia_framework_1.child('ag-header-group-template'),
        __metadata("design:type", agTemplate_1.AgHeaderGroupTemplate)
    ], AgGridColumn.prototype, "headerGroupTemplate", void 0);
    AgGridColumn = AgGridColumn_1 = __decorate([
        aurelia_framework_1.customElement('ag-grid-column'),
        agUtils_1.generateBindables(["colId", "sort", "sortedAt", "sortingOrder", "field", "headerValueGetter", "hideCol", "pinned",
            "tooltipField", "headerTooltip", "valueGetter", "keyCreator", "headerCellRenderer", "headerCellTemplate",
            "width", "minWidth", "maxWidth", "cellClass", "cellStyle", "cellRenderer", "cellRendererFramework",
            "cellRendererParams", "cellEditor", "cellEditorFramework", "cellEditorParams", "floatingCellRenderer",
            "floatingCellRendererFramework", "floatingCellRendererParams", "cellFormatter(", "floatingCellFormatter",
            "getQuickFilterText", "aggFunc", "rowGroupIndex", "pivotIndex", "comparator", "checkboxSelection", "suppressMenu",
            "suppressSorting", "suppressMovable", "suppressFilter", "unSortIcon", "suppressSizeToFit", "suppressResize",
            "suppressAutoSize", "enableRowGroup", "enablePivot", "enableValue", "editable", "suppressNavigable", "newValueHandler",
            "volatile", "filter", "filterFramework", "filterParams", "cellClassRules", "onCellValueChanged", "onCellClicked",
            "onCellDoubleClicked", "onCellContextMenu", "icons", "enableCellChangeFlash", "headerName", "columnGroupShow",
            "headerClass", "children", "groupId", "openByDefault", "marryChildren", "headerCheckboxSelection",
            "headerCheckboxSelectionFilteredOnly", "type", "tooltipField", "valueSetter", "pinnedRowCellRenderer",
            "pinnedRowCellRendererFramework", "pinnedRowCellRendererParams", "valueFormatter", "pinnedRowValueFormatter",
            "valueParser", "allowedAggFuncs", "rowGroup", "showRowGroup", "pivot", "equals", "pivotComparator", "menuTabs",
            "colSpan", "suppressPaste", "template", "templateUrl", "pivotValueColumn", "pivotTotalColumnIds", "headerComponent",
            "headerComponentFramework", "headerComponentParams", "floatingFilterComponent", "floatingFilterComponentParams",
            "floatingFilterComponentFramework"])
        // <slot> is required for @children to work.  https://github.com/aurelia/templating/issues/451#issuecomment-254206622
        ,
        aurelia_framework_1.inlineView("<template><slot></slot></template>"),
        aurelia_framework_1.autoinject(),
        __metadata("design:paramtypes", [])
    ], AgGridColumn);
    return AgGridColumn;
    var AgGridColumn_1;
}());
exports.AgGridColumn = AgGridColumn;
