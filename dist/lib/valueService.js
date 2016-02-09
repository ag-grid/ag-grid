/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var ValueService = (function () {
    function ValueService() {
    }
    ValueService.prototype.init = function (gridOptionsWrapper, expressionService, columnController) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.expressionService = expressionService;
        this.columnController = columnController;
    };
    ValueService.prototype.getValue = function (colDef, data, node) {
        var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        var field = colDef.field;
        var result;
        // if there is a value getter, this gets precedence over a field
        if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, colDef, node);
        }
        else if (field && data) {
            result = this.getValueUsingField(data, field);
        }
        else {
            result = undefined;
        }
        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, colDef, node);
        }
        return result;
    };
    ValueService.prototype.getValueUsingField = function (data, field) {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (field.indexOf('.') < 0) {
            return data[field];
        }
        else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i < fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (!currentObject) {
                    return null;
                }
            }
            return currentObject;
        }
    };
    ValueService.prototype.setValueUsingField = function (data, field, newValue) {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (field.indexOf('.') < 0) {
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
    ValueService.prototype.executeValueGetter = function (valueGetter, data, colDef, node) {
        var context = this.gridOptionsWrapper.getContext();
        var api = this.gridOptionsWrapper.getApi();
        var params = {
            data: data,
            node: node,
            colDef: colDef,
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
        var otherColumn = this.columnController.getColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn.getColDef(), data, node);
        }
        else {
            return null;
        }
    };
    return ValueService;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ValueService;
