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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdFNldERpc3BsYXlWYWx1ZU1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci9mbGF0U2V0RGlzcGxheVZhbHVlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQXlCLHFCQUFxQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFdkY7SUFJSSxrQ0FDcUIscUJBQTRDLEVBQzVDLGNBQXNFLEVBQ3RFLFNBQXdCLEVBQ3hCLE1BQWM7UUFIZCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLG1CQUFjLEdBQWQsY0FBYyxDQUF3RDtRQUN0RSxjQUFTLEdBQVQsU0FBUyxDQUFlO1FBQ3hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFQbkMscUZBQXFGO1FBQzdFLGtCQUFhLEdBQXNCLEVBQUUsQ0FBQztJQU8zQyxDQUFDO0lBRUcsc0VBQW1DLEdBQTFDLFVBQ0ksU0FBMkMsRUFDM0MsUUFBNkMsRUFDN0MsYUFBaUM7UUFFakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTSx5RUFBc0MsR0FBN0MsVUFDSSxRQUEwQyxFQUMxQyxRQUE2QyxFQUM3QyxhQUFpQyxFQUNqQyxhQUF1RCxFQUN2RCxpQkFBMEI7O1FBRTFCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDOztZQUV4QixLQUFnQixJQUFBLGtCQUFBLFNBQUEsYUFBYSxDQUFBLDRDQUFBLHVFQUFFO2dCQUExQixJQUFJLEdBQUcsMEJBQUE7Z0JBQ1IsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO29CQUNiLElBQUksaUJBQWlCLEVBQUU7d0JBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNoQztpQkFDSjtxQkFBTTtvQkFDSCxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVCLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FDOUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBRTFELElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO29CQUUvRCxJQUFJLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO3dCQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDaEM7aUJBQ0o7YUFDSjs7Ozs7Ozs7O0lBQ0wsQ0FBQztJQUVNLHlEQUFzQixHQUE3QjtRQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7SUFDckMsQ0FBQztJQUVNLG1EQUFnQixHQUF2QixVQUF3QixLQUFhO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsbURBQWdCLEdBQWhCO1FBQ0ksT0FBTyxxQkFBcUIsQ0FBQyxVQUFVLENBQUM7SUFDNUMsQ0FBQztJQUVNLG1EQUFnQixHQUF2QjtRQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRU0sc0RBQW1CLEdBQTFCLFVBQTJCLElBQWtDO1FBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxtREFBZ0IsR0FBdkIsVUFBd0IsSUFBcUM7UUFDekQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sNENBQVMsR0FBaEI7UUFDSSxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sMENBQU8sR0FBZDtRQUNJLFdBQVc7SUFDZixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBOUVELElBOEVDIn0=