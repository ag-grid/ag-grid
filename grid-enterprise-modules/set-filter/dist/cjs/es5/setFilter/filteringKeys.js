"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetValueModelFilteringKeys = void 0;
var SetValueModelFilteringKeys = /** @class */ (function () {
    function SetValueModelFilteringKeys(_a) {
        var caseFormat = _a.caseFormat;
        // To make the filtering fast, we store the keys in a Set rather than using the default array.
        this.filteringKeys = null;
        // This attribute contains keys that are actually used for filtering.
        // These keys take into account case sensitivity:
        // - When filtering is case-insensitive, all filtering keys are converted to upper case and stored here.
        // - When filtering is case-sensitive, this is the same as filteringKeys.
        this.filteringKeysCaseFormatted = null;
        this.hasNoAppliedFilteringKeys = false;
        this.caseFormat = caseFormat;
    }
    SetValueModelFilteringKeys.prototype.allFilteringKeys = function () {
        return this.filteringKeys;
    };
    SetValueModelFilteringKeys.prototype.allFilteringKeysCaseFormatted = function () {
        return this.filteringKeysCaseFormatted;
    };
    SetValueModelFilteringKeys.prototype.noAppliedFilteringKeys = function () {
        return this.hasNoAppliedFilteringKeys;
    };
    SetValueModelFilteringKeys.prototype.setFilteringKeys = function (filteringKeys) {
        var _this = this;
        this.filteringKeys = new Set(filteringKeys);
        this.hasNoAppliedFilteringKeys = !this.filteringKeys || this.filteringKeys.size === 0;
        this.filteringKeysCaseFormatted = new Set();
        this.filteringKeys.forEach(function (key) {
            return _this.filteringKeysCaseFormatted.add(_this.caseFormat(key));
        });
    };
    SetValueModelFilteringKeys.prototype.addFilteringKey = function (key) {
        if (this.filteringKeys == null) {
            this.filteringKeys = new Set();
            this.filteringKeysCaseFormatted = new Set();
        }
        this.filteringKeys.add(key);
        this.filteringKeysCaseFormatted.add(this.caseFormat(key));
        if (this.hasNoAppliedFilteringKeys) {
            this.hasNoAppliedFilteringKeys = false;
        }
    };
    SetValueModelFilteringKeys.prototype.hasCaseFormattedFilteringKey = function (key) {
        return this.filteringKeysCaseFormatted.has(this.caseFormat(key));
    };
    SetValueModelFilteringKeys.prototype.hasFilteringKey = function (key) {
        return this.filteringKeys.has(key);
    };
    SetValueModelFilteringKeys.prototype.reset = function () {
        this.filteringKeys = null;
        this.filteringKeysCaseFormatted = null;
        this.hasNoAppliedFilteringKeys = false;
    };
    return SetValueModelFilteringKeys;
}());
exports.SetValueModelFilteringKeys = SetValueModelFilteringKeys;
