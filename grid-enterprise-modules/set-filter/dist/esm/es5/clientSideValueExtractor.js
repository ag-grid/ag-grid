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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZVZhbHVlRXh0cmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVWYWx1ZUV4dHJhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlHLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRTNJLCtDQUErQztBQUMvQztJQUNJLG1DQUNxQixRQUE2QixFQUM3QixZQUFxQyxFQUNyQyxTQUE2RCxFQUM3RCxVQUErRSxFQUMvRSxXQUF3QixFQUN4QixZQUEwQixFQUMxQixrQkFBMkIsRUFDM0IsUUFBaUIsRUFDakIsV0FBeUI7UUFSekIsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7UUFDN0IsaUJBQVksR0FBWixZQUFZLENBQXlCO1FBQ3JDLGNBQVMsR0FBVCxTQUFTLENBQW9EO1FBQzdELGVBQVUsR0FBVixVQUFVLENBQXFFO1FBQy9FLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBQzFCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztRQUMzQixhQUFRLEdBQVIsUUFBUSxDQUFTO1FBQ2pCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO0lBRTlDLENBQUM7SUFFTSx1REFBbUIsR0FBMUIsVUFBMkIsU0FBcUMsRUFBRSxjQUE2QztRQUEvRyxpQkFxREM7UUFwREcsSUFBTSxNQUFNLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDdkQsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEYsSUFBTSxhQUFhLEdBQXVCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNyRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFF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