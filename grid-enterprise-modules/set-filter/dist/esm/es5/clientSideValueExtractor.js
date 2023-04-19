import { _ } from '@ag-grid-community/core';
/** @param V type of value in the Set Filter */
var ClientSideValuesExtractor = /** @class */ (function () {
    function ClientSideValuesExtractor(rowModel, filterParams, createKey, caseFormat, columnModel, valueService, treeDataOrGrouping, treeData, getDataPath) {
        this.rowModel = rowModel;
        this.filterParams = filterParams;
        this.createKey = createKey;
        this.caseFormat = caseFormat;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.treeDataOrGrouping = treeDataOrGrouping;
        this.treeData = treeData;
        this.getDataPath = getDataPath;
    }
    ClientSideValuesExtractor.prototype.extractUniqueValues = function (predicate, existingValues) {
        var _this = this;
        var values = new Map();
        var existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
        var formattedKeys = new Set();
        var treeData = this.treeData && !!this.getDataPath;
        var groupedCols = this.columnModel.getRowGroupColumns();
        var addValue = function (unformattedKey, value) {
            var formattedKey = _this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                var keyToAdd = unformattedKey;
                var valueToAdd = _.makeNull(value);
                // when case insensitive, we pick the first value to use. if this is later filtered out,
                // we still want to use the original value and not one with a different case
                var existingUnformattedKey = existingFormattedKeys === null || existingFormattedKeys === void 0 ? void 0 : existingFormattedKeys.get(formattedKey);
                if (existingUnformattedKey != null) {
                    keyToAdd = existingUnformattedKey;
                    valueToAdd = existingValues.get(existingUnformattedKey);
                }
                values.set(keyToAdd, valueToAdd);
            }
        };
        this.rowModel.forEachLeafNode(function (node) {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            if (_this.treeDataOrGrouping) {
                _this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue);
                return;
            }
            var value = _this.getValue(node);
            if (_this.filterParams.convertValuesToStrings) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                _this.addValueForConvertValuesToString(node, value, addValue);
                return;
            }
            if (value != null && Array.isArray(value)) {
                value.forEach(function (x) {
                    addValue(_this.createKey(x, node), x);
                });
                if (value.length === 0) {
                    addValue(null, null);
                }
            }
            else {
                addValue(_this.createKey(value, node), value);
            }
        });
        return values;
    };
    ClientSideValuesExtractor.prototype.addValueForConvertValuesToString = function (node, value, addValue) {
        var key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            key.forEach(function (part) {
                var processedPart = _.toStringOrNull(_.makeNull(part));
                addValue(processedPart, processedPart);
            });
            if (key.length === 0) {
                addValue(null, null);
            }
        }
        else {
            addValue(key, key);
        }
    };
    ClientSideValuesExtractor.prototype.addValueForTreeDataOrGrouping = function (node, treeData, groupedCols, addValue) {
        var _this = this;
        var _a;
        var dataPath;
        if (treeData) {
            if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
                return;
            }
            dataPath = this.getDataPath(node.data);
        }
        else {
            dataPath = groupedCols.map(function (groupCol) { return _this.valueService.getKeyForNode(groupCol, node); });
            dataPath.push(this.getValue(node));
        }
        if (dataPath) {
            dataPath = dataPath.map(function (treeKey) { return _.toStringOrNull(_.makeNull(treeKey)); });
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(function (treeKey) { return treeKey == null; })) {
            dataPath = null;
        }
        addValue(this.createKey(dataPath), dataPath);
    };
    ClientSideValuesExtractor.prototype.getValue = function (node) {
        var _a = this.filterParams, api = _a.api, colDef = _a.colDef, column = _a.column, columnApi = _a.columnApi, context = _a.context;
        return this.filterParams.valueGetter({
            api: api,
            colDef: colDef,
            column: column,
            columnApi: columnApi,
            context: context,
            data: node.data,
            getValue: function (field) { return node.data[field]; },
            node: node,
        });
    };
    ClientSideValuesExtractor.prototype.extractExistingFormattedKeys = function (existingValues) {
        var _this = this;
        if (!existingValues) {
            return null;
        }
        var existingFormattedKeys = new Map();
        existingValues.forEach(function (_value, key) {
            existingFormattedKeys.set(_this.caseFormat(key), key);
        });
        return existingFormattedKeys;
    };
    return ClientSideValuesExtractor;
}());
export { ClientSideValuesExtractor };
