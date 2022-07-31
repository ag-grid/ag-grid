import { _ } from '@ag-grid-community/core';
var NULL_SUBSTITUTE = '__<ag-grid-pseudo-null>__';
var ClientSideValuesExtractor = /** @class */ (function () {
    function ClientSideValuesExtractor(rowModel, filterParams, caseFormat) {
        this.rowModel = rowModel;
        this.filterParams = filterParams;
        this.caseFormat = caseFormat;
    }
    ClientSideValuesExtractor.prototype.extractUniqueValues = function (predicate) {
        var _this = this;
        var values = {};
        var keyCreator = this.filterParams.colDef.keyCreator;
        var addValue = function (value) {
            // NOTE: We don't care about the keys later on (only values in the dictionary are
            // returned), so as long as we use a non-conflicting key for the `null` value this
            // will behave correctly.
            var valueKey = value != null ? _this.caseFormat(value) : NULL_SUBSTITUTE;
            if (valueKey && values[valueKey] == null) {
                values[valueKey] = value;
            }
        };
        this.rowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            var _a = _this.filterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
            var value = _this.filterParams.valueGetter({
                api: api,
                colDef: colDef,
                column: column,
                columnApi: columnApi,
                context: context,
                data: node.data,
                getValue: function (field) { return node.data[field]; },
                node: node,
            });
            if (keyCreator) {
                var params = {
                    value: value,
                    colDef: _this.filterParams.colDef,
                    column: _this.filterParams.column,
                    node: node,
                    data: node.data,
                    api: _this.filterParams.api,
                    columnApi: _this.filterParams.columnApi,
                    context: _this.filterParams.context
                };
                value = keyCreator(params);
            }
            value = _.makeNull(value);
            if (value != null && Array.isArray(value)) {
                value.forEach(function (x) {
                    var formatted = _.toStringOrNull(_.makeNull(x));
                    addValue(formatted);
                });
            }
            else {
                addValue(_.toStringOrNull(value));
            }
        });
        return _.values(values);
    };
    return ClientSideValuesExtractor;
}());
export { ClientSideValuesExtractor };
