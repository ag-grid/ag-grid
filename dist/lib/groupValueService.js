/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v11.0.0
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
var context_1 = require("./context/context");
var valueFormatterService_1 = require("./rendering/valueFormatterService");
var utils_1 = require("./utils");
var columnController_1 = require("./columnController/columnController");
var autoGroupColService_1 = require("./columnController/autoGroupColService");
var GroupValueService = (function () {
    function GroupValueService() {
    }
    GroupValueService.prototype.mapGroupName = function (rowNodeKey, keyMap) {
        if (keyMap && typeof keyMap === 'object') {
            var valueFromMap = keyMap[rowNodeKey];
            if (valueFromMap) {
                return valueFromMap;
            }
            else {
                return rowNodeKey;
            }
        }
        else {
            return rowNodeKey;
        }
    };
    GroupValueService.prototype.formatGroupName = function (unformatted, formattedParams, node) {
        var columnOfGroupedCol = this.getGroupColumn(formattedParams.rowGroupIndex, formattedParams.column);
        return this.valueFormatterService.formatValue(columnOfGroupedCol, node, formattedParams.scope, unformatted);
    };
    GroupValueService.prototype.getGroupColumn = function (rowGroupIndex, column) {
        // pull out the column that the grouping is on
        var rowGroupColumns = this.columnApi.getRowGroupColumns();
        // if we are using in memory grid grouping, then we try to look up the column that
        // we did the grouping on. however if it is not possible (happens when user provides
        // the data already grouped) then we just the current col, ie use cellRenderer of current col
        var columnOfGroupedCol = rowGroupColumns[rowGroupIndex];
        if (utils_1._.missing(columnOfGroupedCol)) {
            columnOfGroupedCol = column;
        }
        return columnOfGroupedCol;
    };
    GroupValueService.prototype.getGroupNameValuesByRawValue = function (rawValue, params) {
        return this.getGroupNameValues(rawValue, params, null);
    };
    GroupValueService.prototype.getGroupNameValuesByNode = function (params, node) {
        return this.getGroupNameValues(node.key, params, node);
    };
    GroupValueService.prototype.getGroupNameValues = function (rawValue, params, node) {
        var mappedGroupName = this.mapGroupName(rawValue, params.keyMap);
        var valueFormatted = null;
        if (node) {
            valueFormatted = this.formatGroupName(mappedGroupName, params, node);
        }
        var actualValue = utils_1._.exists(valueFormatted) ? valueFormatted : mappedGroupName;
        return {
            mappedGroupName: mappedGroupName,
            valueFormatted: valueFormatted,
            actualValue: actualValue
        };
    };
    GroupValueService.prototype.assignToParams = function (receiver, params, node) {
        var groupNameInfo = this.getGroupNameValuesByNode(params, node);
        receiver.value = groupNameInfo.mappedGroupName;
        receiver.valueFormatted = groupNameInfo.valueFormatted;
        receiver.actualValue = groupNameInfo.actualValue;
        return receiver;
    };
    GroupValueService.prototype.getGroupNameInfo = function (column, rowGroupIndex, rowIndex, rawValue) {
        var params = {
            rowGroupIndex: rowGroupIndex,
            column: column,
            rowIndex: rowIndex,
            scope: null,
            keyMap: {}
        };
        var groupColumn = this.getGroupColumn(params.rowGroupIndex, column);
        if (groupColumn.getColId() === column.getColId()) {
            return this.extractInfo(rawValue, params, column);
        }
        else if (column.getColId() === autoGroupColService_1.AutoGroupColService.GROUP_AUTO_COLUMN_BUNDLE_ID) {
            return this.extractInfo(rawValue, params, column);
        }
        else if (column.getColId() === autoGroupColService_1.AutoGroupColService.GROUP_AUTO_COLUMN_ID + '_' + column.getColId()) {
            return this.extractInfo(rawValue, params, column);
        }
        return null;
    };
    GroupValueService.prototype.extractInfo = function (rawValue, params, column) {
        return this.enrich(this.getGroupNameValuesByRawValue(rawValue, params), column);
    };
    GroupValueService.prototype.enrich = function (values, column) {
        return {
            actualValue: values.actualValue,
            column: column,
            valueFormatted: values.valueFormatted,
            mappedGroupName: values.mappedGroupName
        };
    };
    return GroupValueService;
}());
__decorate([
    context_1.Autowired('valueFormatterService'),
    __metadata("design:type", valueFormatterService_1.ValueFormatterService)
], GroupValueService.prototype, "valueFormatterService", void 0);
__decorate([
    context_1.Autowired('columnApi'),
    __metadata("design:type", columnController_1.ColumnApi)
], GroupValueService.prototype, "columnApi", void 0);
GroupValueService = __decorate([
    context_1.Bean('groupValueService')
], GroupValueService);
exports.GroupValueService = GroupValueService;
