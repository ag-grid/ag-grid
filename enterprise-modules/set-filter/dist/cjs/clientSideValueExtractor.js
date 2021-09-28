"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
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
            value = core_1._.makeNull(value);
            if (value != null && Array.isArray(value)) {
                core_1._.forEach(value, function (x) {
                    var formatted = core_1._.toStringOrNull(core_1._.makeNull(x));
                    values.add(formatted);
                });
            }
            else {
                values.add(core_1._.toStringOrNull(value));
            }
        });
        return core_1._.values(values);
    };
    return ClientSideValuesExtractor;
}());
exports.ClientSideValuesExtractor = ClientSideValuesExtractor;
//# sourceMappingURL=clientSideValueExtractor.js.map