import { _ } from '@ag-grid-community/core';
var ClientSideValuesExtractor = /** @class */ (function () {
    function ClientSideValuesExtractor(rowModel, colDef, valueGetter) {
        this.rowModel = rowModel;
        this.colDef = colDef;
        this.valueGetter = valueGetter;
    }
    ClientSideValuesExtractor.prototype.extractUniqueValues = function (predicate) {
        var _this = this;
        var values = new Set();
        var keyCreator = this.colDef.keyCreator;
        this.rowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            var value = _this.valueGetter(node);
            if (keyCreator) {
                value = keyCreator({ value: value });
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
