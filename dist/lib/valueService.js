/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.6
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var expressionService_1 = require("./expressionService");
var columnController_1 = require("./columnController/columnController");
var context_1 = require("./context/context");
var utils_1 = require("./utils");
var events_1 = require("./events");
var eventService_1 = require("./eventService");
var ValueService = (function () {
    function ValueService() {
        this.initialised = false;
    }
    ValueService.prototype.init = function () {
        this.suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.userProvidedTheGroups = utils_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        this.suppressUseColIdForGroups = this.gridOptionsWrapper.isSuppressUseColIdForGroups();
        this.initialised = true;
    };
    ValueService.prototype.getValue = function (column, node) {
        return this.getValueUsingSpecificData(column, node.data, node);
    };
    ValueService.prototype.getValueUsingSpecificData = function (column, data, node) {
        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) {
            this.init();
        }
        var colDef = column.getColDef();
        var field = colDef.field;
        var result;
        // if there is a value getter, this gets precedence over a field
        // - need to revisit this, we check 'data' as this is the way for the grid to
        //   not render when on the footer row
        if (data && node.group && !this.userProvidedTheGroups && !this.suppressUseColIdForGroups) {
            result = node.data ? node.data[column.getId()] : undefined;
        }
        else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, node);
        }
        else if (field && data) {
            result = this.getValueUsingField(data, field, column.isFieldContainsDots());
        }
        else {
            result = undefined;
        }
        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, node);
        }
        return result;
    };
    ValueService.prototype.getValueUsingField = function (data, field, fieldContainsDots) {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (!fieldContainsDots) {
            return data[field];
        }
        else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i < fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (utils_1.Utils.missing(currentObject)) {
                    return null;
                }
            }
            return currentObject;
        }
    };
    ValueService.prototype.setValue = function (rowNode, colKey, newValue) {
        var column = this.columnController.getPrimaryColumn(colKey);
        if (!rowNode || !column) {
            return;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        var data = rowNode.data;
        if (utils_1.Utils.missing(data)) {
            return;
        }
        var field = column.getColDef().field;
        var newValueHandler = column.getColDef().newValueHandler;
        // need either a field or a newValueHandler for this to work
        if (utils_1.Utils.missing(field) && utils_1.Utils.missing(newValueHandler)) {
            return;
        }
        var paramsForCallbacks = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };
        if (newValueHandler) {
            newValueHandler(paramsForCallbacks);
        }
        else {
            this.setValueUsingField(data, field, newValue, column.isFieldContainsDots());
        }
        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();
        paramsForCallbacks.newValue = this.getValue(column, rowNode);
        if (typeof column.getColDef().onCellValueChanged === 'function') {
            column.getColDef().onCellValueChanged(paramsForCallbacks);
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
    };
    ValueService.prototype.setValueUsingField = function (data, field, newValue, isFieldContainsDots) {
        // if no '.', then it's not a deep value
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
    };
    ValueService.prototype.executeValueGetter = function (valueGetter, data, column, node) {
        var context = this.gridOptionsWrapper.getContext();
        var api = this.gridOptionsWrapper.getApi();
        var params = {
            data: data,
            node: node,
            colDef: column.getColDef(),
            api: api,
            context: context,
            getValue: this.getValueCallback.bind(this, data, node)
        };
        if (typeof valueGetter === 'function') {
            // valueGetter is a function, so just call it
            return valueGetter(params);
        }
        else if (typeof valueGetter === 'string') {
            // valueGetter is an expression, so execute the expression
            return this.expressionService.evaluate(valueGetter, params);
        }
    };
    ValueService.prototype.getValueCallback = function (data, node, field) {
        var otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValueUsingSpecificData(otherColumn, data, node);
        }
        else {
            return null;
        }
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], ValueService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('expressionService'), 
        __metadata('design:type', expressionService_1.ExpressionService)
    ], ValueService.prototype, "expressionService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], ValueService.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], ValueService.prototype, "eventService", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], ValueService.prototype, "init", null);
    ValueService = __decorate([
        context_1.Bean('valueService'), 
        __metadata('design:paramtypes', [])
    ], ValueService);
    return ValueService;
})();
exports.ValueService = ValueService;
