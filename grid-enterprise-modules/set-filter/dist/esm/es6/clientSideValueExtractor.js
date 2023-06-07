import { _ } from '@ag-grid-community/core';
/** @param V type of value in the Set Filter */
export class ClientSideValuesExtractor {
    constructor(rowModel, filterParams, createKey, caseFormat, columnModel, valueService, treeDataOrGrouping, treeData, getDataPath) {
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
    extractUniqueValues(predicate, existingValues) {
        const values = new Map();
        const existingFormattedKeys = this.extractExistingFormattedKeys(existingValues);
        const formattedKeys = new Set();
        const treeData = this.treeData && !!this.getDataPath;
        const groupedCols = this.columnModel.getRowGroupColumns();
        const addValue = (unformattedKey, value) => {
            const formattedKey = this.caseFormat(unformattedKey);
            if (!formattedKeys.has(formattedKey)) {
                formattedKeys.add(formattedKey);
                let keyToAdd = unformattedKey;
                let valueToAdd = _.makeNull(value);
                // when case insensitive, we pick the first value to use. if this is later filtered out,
                // we still want to use the original value and not one with a different case
                const existingUnformattedKey = existingFormattedKeys === null || existingFormattedKeys === void 0 ? void 0 : existingFormattedKeys.get(formattedKey);
                if (existingUnformattedKey != null) {
                    keyToAdd = existingUnformattedKey;
                    valueToAdd = existingValues.get(existingUnformattedKey);
                }
                values.set(keyToAdd, valueToAdd);
            }
        };
        this.rowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || !predicate(node)) {
                return;
            }
            if (this.treeDataOrGrouping) {
                this.addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue);
                return;
            }
            let value = this.getValue(node);
            if (this.filterParams.convertValuesToStrings) {
                // for backwards compatibility - keeping separate as it will eventually be removed
                this.addValueForConvertValuesToString(node, value, addValue);
                return;
            }
            if (value != null && Array.isArray(value)) {
                value.forEach(x => {
                    addValue(this.createKey(x, node), x);
                });
                if (value.length === 0) {
                    addValue(null, null);
                }
            }
            else {
                addValue(this.createKey(value, node), value);
            }
        });
        return values;
    }
    addValueForConvertValuesToString(node, value, addValue) {
        const key = this.createKey(value, node);
        if (key != null && Array.isArray(key)) {
            key.forEach(part => {
                const processedPart = _.toStringOrNull(_.makeNull(part));
                addValue(processedPart, processedPart);
            });
            if (key.length === 0) {
                addValue(null, null);
            }
        }
        else {
            addValue(key, key);
        }
    }
    addValueForTreeDataOrGrouping(node, treeData, groupedCols, addValue) {
        var _a;
        let dataPath;
        if (treeData) {
            if ((_a = node.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length) {
                return;
            }
            dataPath = this.getDataPath(node.data);
        }
        else {
            dataPath = groupedCols.map(groupCol => this.valueService.getKeyForNode(groupCol, node));
            dataPath.push(this.getValue(node));
        }
        if (dataPath) {
            dataPath = dataPath.map(treeKey => _.toStringOrNull(_.makeNull(treeKey)));
        }
        if (dataPath === null || dataPath === void 0 ? void 0 : dataPath.some(treeKey => treeKey == null)) {
            dataPath = null;
        }
        addValue(this.createKey(dataPath), dataPath);
    }
    getValue(node) {
        const { api, colDef, column, columnApi, context } = this.filterParams;
        return this.filterParams.valueGetter({
            api,
            colDef,
            column,
            columnApi,
            context,
            data: node.data,
            getValue: (field) => node.data[field],
            node,
        });
    }
    extractExistingFormattedKeys(existingValues) {
        if (!existingValues) {
            return null;
        }
        const existingFormattedKeys = new Map();
        existingValues.forEach((_value, key) => {
            existingFormattedKeys.set(this.caseFormat(key), key);
        });
        return existingFormattedKeys;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50U2lkZVZhbHVlRXh0cmFjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVWYWx1ZUV4dHJhY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlHLENBQUMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRTNJLCtDQUErQztBQUMvQyxNQUFNLE9BQU8seUJBQXlCO0lBQ2xDLFlBQ3FCLFFBQTZCLEVBQzdCLFlBQXFDLEVBQ3JDLFNBQTZELEVBQzdELFVBQStFLEVBQy9FLFdBQXdCLEVBQ3hCLFlBQTBCLEVBQzFCLGtCQUEyQixFQUMzQixRQUFpQixFQUNqQixXQUF5QjtRQVJ6QixhQUFRLEdBQVIsUUFBUSxDQUFxQjtRQUM3QixpQkFBWSxHQUFaLFlBQVksQ0FBeUI7UUFDckMsY0FBUyxHQUFULFNBQVMsQ0FBb0Q7UUFDN0QsZUFBVSxHQUFWLFVBQVUsQ0FBcUU7UUFDL0UsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFDeEIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFDMUIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLGFBQVEsR0FBUixRQUFRLENBQVM7UUFDakIsZ0JBQVcsR0FBWCxXQUFXLENBQWM7SUFFOUMsQ0FBQztJQUVNLG1CQUFtQixDQUFDLFNBQXFDLEVBQUUsY0FBNkM7UUFDM0csTUFBTSxNQUFNLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDdkQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDaEYsTUFBTSxhQUFhLEdBQXVCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNyRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENB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