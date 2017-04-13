/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var context_1 = require("../context/context");
var column_1 = require("../entities/column");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var utils_1 = require("../utils");
var functions_1 = require("../functions");
var AutoGroupColService = AutoGroupColService_1 = (function () {
    function AutoGroupColService() {
    }
    AutoGroupColService.prototype.createAutoGroupColumns = function (rowGroupColumns) {
        var _this = this;
        var groupAutoColumns = [];
        if (this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            rowGroupColumns.forEach(function (rowGroupCol, index) {
                groupAutoColumns.push(_this.createOneAutoGroupColumn(rowGroupCol, index));
            });
        }
        else {
            groupAutoColumns.push(this.createOneAutoGroupColumn());
        }
        return groupAutoColumns;
    };
    AutoGroupColService.prototype.createOneAutoGroupColumn = function (rowGroupCol, index) {
        // if one provided by user, use it, otherwise create one
        var autoColDef = this.gridOptionsWrapper.getGroupColumnDef();
        if (!autoColDef) {
            var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
            autoColDef = {
                headerName: localeTextFunc('group', 'Group'),
                comparator: functions_1.defaultGroupComparator,
                valueGetter: function (params) {
                    if (params.node.group) {
                        return params.node.key;
                    }
                    else if (params.data && params.colDef.field) {
                        return params.data[params.colDef.field];
                    }
                    else {
                        return null;
                    }
                },
                cellRenderer: 'group'
            };
        }
        // we never allow moving the group column
        autoColDef.suppressMovable = true;
        // if doing multi, set the field
        var colId;
        if (rowGroupCol) {
            // because we are going to be making changes, we need to make a copy,
            // otherwise we are overwriting the same colDef for each column.
            autoColDef = utils_1._.cloneObject(autoColDef);
            var rowGroupColDef = rowGroupCol.getColDef();
            utils_1._.assign(autoColDef, {
                // cellRendererParams.groupKey: colDefToCopy.field;
                headerName: rowGroupColDef.headerName,
                headerValueGetter: rowGroupColDef.headerValueGetter,
                field: rowGroupColDef.field
            });
            if (utils_1._.missing(autoColDef.cellRendererParams)) {
                autoColDef.cellRendererParams = {};
            }
            else {
                autoColDef.cellRendererParams = utils_1._.cloneObject(autoColDef.cellRendererParams);
            }
            autoColDef.cellRendererParams.restrictToOneGroup = true;
            // if showing many cols, we don't want to show more than one with a checkbox for selection
            if (index > 0) {
                autoColDef.headerCheckboxSelection = false;
                autoColDef.cellRendererParams.checkbox = false;
            }
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_ID + "-" + Math.random() + "-" + rowGroupCol.getId();
        }
        else {
            colId = AutoGroupColService_1.GROUP_AUTO_COLUMN_ID + "-" + Math.random();
        }
        var newCol = new column_1.Column(autoColDef, colId, true);
        this.context.wireBean(newCol);
        return newCol;
    };
    return AutoGroupColService;
}());
AutoGroupColService.GROUP_AUTO_COLUMN_ID = 'ag-Grid-AutoColumn';
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], AutoGroupColService.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], AutoGroupColService.prototype, "context", void 0);
AutoGroupColService = AutoGroupColService_1 = __decorate([
    context_1.Bean('autoGroupColService')
], AutoGroupColService);
exports.AutoGroupColService = AutoGroupColService;
var AutoGroupColService_1;
