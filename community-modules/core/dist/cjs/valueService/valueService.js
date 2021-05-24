/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var events_1 = require("../events");
var beanStub_1 = require("../context/beanStub");
var object_1 = require("../utils/object");
var generic_1 = require("../utils/generic");
var function_1 = require("../utils/function");
var ValueService = /** @class */ (function (_super) {
    __extends(ValueService, _super);
    function ValueService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.initialised = false;
        return _this;
    }
    ValueService.prototype.init = function () {
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.initialised = true;
    };
    ValueService.prototype.getValue = function (column, rowNode, forFilter, ignoreAggData) {
        if (forFilter === void 0) { forFilter = false; }
        if (ignoreAggData === void 0) { ignoreAggData = false; }
        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) {
            this.init();
        }
        if (!rowNode) {
            return;
        }
        // pull these out to make code below easier to read
        var colDef = column.getColDef();
        var field = colDef.field;
        var colId = column.getId();
        var data = rowNode.data;
        var result;
        // if there is a value getter, this gets precedence over a field
        var groupDataExists = rowNode.groupData && rowNode.groupData[colId] !== undefined;
        var aggDataExists = !ignoreAggData && rowNode.aggData && rowNode.aggData[colId] !== undefined;
        if (forFilter && colDef.filterValueGetter) {
            result = this.executeFilterValueGetter(colDef.filterValueGetter, data, column, rowNode);
        }
        else if (this.gridOptionsWrapper.isTreeData() && aggDataExists) {
            result = rowNode.aggData[colId];
        }
        else if (this.gridOptionsWrapper.isTreeData() && colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        }
        else if (this.gridOptionsWrapper.isTreeData() && (field && data)) {
            result = object_1.getValueUsingField(data, field, column.isFieldContainsDots());
        }
        else if (groupDataExists) {
            result = rowNode.groupData[colId];
        }
        else if (aggDataExists) {
            result = rowNode.aggData[colId];
        }
        else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        }
        else if (field && data) {
            result = object_1.getValueUsingField(data, field, column.isFieldContainsDots());
        }
        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, rowNode);
        }
        if (result == null) {
            var openedGroup = this.getOpenedGroup(rowNode, column);
            if (openedGroup != null) {
                return openedGroup;
            }
        }
        return result;
    };
    ValueService.prototype.getOpenedGroup = function (rowNode, column) {
        if (!this.gridOptionsWrapper.isShowOpenedGroup()) {
            return;
        }
        var colDef = column.getColDef();
        if (!colDef.showRowGroup) {
            return;
        }
        var showRowGroup = column.getColDef().showRowGroup;
        var pointer = rowNode.parent;
        while (pointer != null) {
            if (pointer.rowGroupColumn && (showRowGroup === true || showRowGroup === pointer.rowGroupColumn.getId())) {
                return pointer.key;
            }
            pointer = pointer.parent;
        }
        return undefined;
    };
    ValueService.prototype.setValue = function (rowNode, colKey, newValue, eventSource) {
        var column = this.columnController.getPrimaryColumn(colKey);
        if (!rowNode || !column) {
            return;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        if (generic_1.missing(rowNode.data)) {
            rowNode.data = {};
        }
        // for backwards compatibility we are also retrieving the newValueHandler as well as the valueSetter
        var _a = column.getColDef(), field = _a.field, newValueHandler = _a.newValueHandler, valueSetter = _a.valueSetter;
        // need either a field or a newValueHandler for this to work
        if (generic_1.missing(field) && generic_1.missing(newValueHandler) && generic_1.missing(valueSetter)) {
            // we don't tell user about newValueHandler, as that is deprecated
            console.warn("AG Grid: you need either field or valueSetter set on colDef for editing to work");
            return;
        }
        var params = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            column: column,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        };
        params.newValue = newValue;
        var valueWasDifferent;
        if (newValueHandler && generic_1.exists(newValueHandler)) {
            valueWasDifferent = newValueHandler(params);
        }
        else if (generic_1.exists(valueSetter)) {
            valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
        }
        else {
            valueWasDifferent = this.setValueUsingField(rowNode.data, field, newValue, column.isFieldContainsDots());
        }
        // in case user forgot to return something (possible if they are not using TypeScript
        // and just forgot, or using an old newValueHandler we didn't always expect a return
        // value here), we default the return value to true, so we always refresh.
        if (valueWasDifferent === undefined) {
            valueWasDifferent = true;
        }
        // if no change to the value, then no need to do the updating, or notifying via events.
        // otherwise the user could be tabbing around the grid, and cellValueChange would get called
        // all the time.
        if (!valueWasDifferent) {
            return;
        }
        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();
        this.valueCache.onDataChanged();
        params.newValue = this.getValue(column, rowNode);
        var onCellValueChanged = column.getColDef().onCellValueChanged;
        if (typeof onCellValueChanged === 'function') {
            // to make callback async, do in a timeout
            setTimeout(function () { return onCellValueChanged(params); }, 0);
        }
        var event = {
            type: events_1.Events.EVENT_CELL_VALUE_CHANGED,
            event: null,
            rowIndex: rowNode.rowIndex,
            rowPinned: rowNode.rowPinned,
            column: params.column,
            api: params.api,
            columnApi: params.columnApi,
            colDef: params.colDef,
            context: params.context,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: params.newValue,
            value: params.newValue,
            source: eventSource
        };
        this.eventService.dispatchEvent(event);
    };
    ValueService.prototype.setValueUsingField = function (data, field, newValue, isFieldContainsDots) {
        if (!field) {
            return false;
        }
        // if no '.', then it's not a deep value
        var valuesAreSame = false;
        if (!isFieldContainsDots) {
            data[field] = newValue;
        }
        else {
            // otherwise it is a deep value, so need to dig for it
            var fieldPieces = field.split('.');
            var currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                var fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    currentObject[fieldPiece] = newValue;
                }
                else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
        return !valuesAreSame;
    };
    ValueService.prototype.executeFilterValueGetter = function (valueGetter, data, column, rowNode) {
        var params = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            getValue: this.getValueCallback.bind(this, rowNode)
        };
        return this.expressionService.evaluate(valueGetter, params);
    };
    ValueService.prototype.executeValueGetter = function (valueGetter, data, column, rowNode) {
        var colId = column.getId();
        // if inside the same turn, just return back the value we got last time
        var valueFromCache = this.valueCache.getValue(rowNode, colId);
        if (valueFromCache !== undefined) {
            return valueFromCache;
        }
        var params = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            getValue: this.getValueCallback.bind(this, rowNode)
        };
        var result = this.expressionService.evaluate(valueGetter, params);
        // if a turn is active, store the value in case the grid asks for it again
        this.valueCache.setValue(rowNode, colId, result);
        return result;
    };
    ValueService.prototype.getValueCallback = function (node, field) {
        var otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn, node);
        }
        return null;
    };
    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    ValueService.prototype.getKeyForNode = function (col, rowNode) {
        var value = this.getValue(col, rowNode);
        var keyCreator = col.getColDef().keyCreator;
        var result = keyCreator ? keyCreator({ value: value }) : value;
        // if already a string, or missing, just return it
        if (typeof result === 'string' || result == null) {
            return result;
        }
        result = String(result);
        if (result === '[object Object]') {
            function_1.doOnce(function () {
                console.warn('AG Grid: a column you are grouping or pivoting by has objects as values. If you want to group by complex objects then either a) use a colDef.keyCreator (se AG Grid docs) or b) to toString() on the object to return a key');
            }, 'getKeyForNode - warn about [object,object]');
        }
        return result;
    };
    __decorate([
        context_1.Autowired('expressionService')
    ], ValueService.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], ValueService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('valueCache')
    ], ValueService.prototype, "valueCache", void 0);
    __decorate([
        context_1.PostConstruct
    ], ValueService.prototype, "init", null);
    ValueService = __decorate([
        context_1.Bean('valueService')
    ], ValueService);
    return ValueService;
}(beanStub_1.BeanStub));
exports.ValueService = ValueService;

//# sourceMappingURL=valueService.js.map
