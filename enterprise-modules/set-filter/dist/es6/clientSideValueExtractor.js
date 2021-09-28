import { _ } from '@ag-grid-community/core';
var ClientSideValuesExtractor = /** @class */ (function () {
    function ClientSideValuesExtractor(rowModel, filterParams) {
        this.rowModel = rowModel;
        this.filterParams = filterParams;
    }
    ClientSideValuesExtractor.prototype.extractUniqueValues = function (predicate) {
        var _this = this;
        var values = new Set();
        var keyCreator = this.filterParams.colDef.keyCreator;
        this.rowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            var value = _this.filterParams.valueGetter(node);
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
                _.forEach(value, function (x) {
                    var formatted = _.toStringOrNull(_.makeNull(x));
                    values.add(formatted);
                });
            }
            else {
                values.add(_.toStringOrNull(value));
            }
        });
        return _.values(values);
    };
    return ClientSideValuesExtractor;
}());
export { ClientSideValuesExtractor };
