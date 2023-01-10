"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlatSetDisplayValueModel = void 0;
const iSetDisplayValueModel_1 = require("./iSetDisplayValueModel");
class FlatSetDisplayValueModel {
    constructor(valueFormatterService, valueFormatter, formatter, column) {
        this.valueFormatterService = valueFormatterService;
        this.valueFormatter = valueFormatter;
        this.formatter = formatter;
        this.column = column;
        /** All keys that are currently displayed, after the mini-filter has been applied. */
        this.displayedKeys = [];
    }
    updateDisplayedValuesToAllAvailable(_getValue, _allKeys, availableKeys) {
        this.displayedKeys = Array.from(availableKeys);
    }
    updateDisplayedValuesToMatchMiniFilter(getValue, _allKeys, availableKeys, matchesFilter, nullMatchesFilter) {
        this.displayedKeys = [];
        for (let key of availableKeys) {
            if (key == null) {
                if (nullMatchesFilter) {
                    this.displayedKeys.push(key);
                }
            }
            else {
                const value = getValue(key);
                const valueFormatterValue = this.valueFormatterService.formatValue(this.column, null, value, this.valueFormatter, false);
                const textFormatterValue = this.formatter(valueFormatterValue);
                if (matchesFilter(textFormatterValue)) {
                    this.displayedKeys.push(key);
                }
            }
        }
    }
    getDisplayedValueCount() {
        return this.displayedKeys.length;
    }
    getDisplayedItem(index) {
        return this.displayedKeys[index];
    }
    getSelectAllItem() {
        return iSetDisplayValueModel_1.SetFilterDisplayValue.SELECT_ALL;
    }
    getDisplayedKeys() {
        return this.displayedKeys;
    }
    forEachDisplayedKey(func) {
        this.displayedKeys.forEach(func);
    }
    someDisplayedKey(func) {
        return this.displayedKeys.some(func);
    }
    hasGroups() {
        return false;
    }
    refresh() {
        // not used
    }
}
exports.FlatSetDisplayValueModel = FlatSetDisplayValueModel;
