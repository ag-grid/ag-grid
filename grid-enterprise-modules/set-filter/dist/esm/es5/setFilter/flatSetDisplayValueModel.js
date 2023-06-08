var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { SetFilterDisplayValue } from './iSetDisplayValueModel';
var FlatSetDisplayValueModel = /** @class */ (function () {
    function FlatSetDisplayValueModel(valueFormatterService, valueFormatter, formatter, column) {
        this.valueFormatterService = valueFormatterService;
        this.valueFormatter = valueFormatter;
        this.formatter = formatter;
        this.column = column;
        /** All keys that are currently displayed, after the mini-filter has been applied. */
        this.displayedKeys = [];
    }
    FlatSetDisplayValueModel.prototype.updateDisplayedValuesToAllAvailable = function (_getValue, _allKeys, availableKeys) {
        this.displayedKeys = Array.from(availableKeys);
    };
    FlatSetDisplayValueModel.prototype.updateDisplayedValuesToMatchMiniFilter = function (getValue, _allKeys, availableKeys, matchesFilter, nullMatchesFilter) {
        var e_1, _a;
        this.displayedKeys = [];
        try {
            for (var availableKeys_1 = __values(availableKeys), availableKeys_1_1 = availableKeys_1.next(); !availableKeys_1_1.done; availableKeys_1_1 = availableKeys_1.next()) {
                var key = availableKeys_1_1.value;
                if (key == null) {
                    if (nullMatchesFilter) {
                        this.displayedKeys.push(key);
                    }
                }
                else {
                    var value = getValue(key);
                    var valueFormatterValue = this.valueFormatterService.formatValue(this.column, null, value, this.valueFormatter, false);
                    var textFormatterValue = this.formatter(valueFormatterValue);
                    if (matchesFilter(textFormatterValue)) {
                        this.displayedKeys.push(key);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (availableKeys_1_1 && !availableKeys_1_1.done && (_a = availableKeys_1.return)) _a.call(availableKeys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FlatSetDisplayValueModel.prototype.getDisplayedValueCount = function () {
        return this.displayedKeys.length;
    };
    FlatSetDisplayValueModel.prototype.getDisplayedItem = function (index) {
        return this.displayedKeys[index];
    };
    FlatSetDisplayValueModel.prototype.getSelectAllItem = function () {
        return SetFilterDisplayValue.SELECT_ALL;
    };
    FlatSetDisplayValueModel.prototype.getDisplayedKeys = function () {
        return this.displayedKeys;
    };
    FlatSetDisplayValueModel.prototype.forEachDisplayedKey = function (func) {
        this.displayedKeys.forEach(func);
    };
    FlatSetDisplayValueModel.prototype.someDisplayedKey = function (func) {
        return this.displayedKeys.some(func);
    };
    FlatSetDisplayValueModel.prototype.hasGroups = function () {
        return false;
    };
    FlatSetDisplayValueModel.prototype.refresh = function () {
        // not used
    };
    return FlatSetDisplayValueModel;
}());
export { FlatSetDisplayValueModel };
