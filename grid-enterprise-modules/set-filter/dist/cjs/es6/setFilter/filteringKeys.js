"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetValueModelFilteringKeys = void 0;
class SetValueModelFilteringKeys {
    constructor({ caseFormat }) {
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
    allFilteringKeys() {
        return this.filteringKeys;
    }
    allFilteringKeysCaseFormatted() {
        return this.filteringKeysCaseFormatted;
    }
    noAppliedFilteringKeys() {
        return this.hasNoAppliedFilteringKeys;
    }
    setFilteringKeys(filteringKeys) {
        this.filteringKeys = new Set(filteringKeys);
        this.hasNoAppliedFilteringKeys = !this.filteringKeys || this.filteringKeys.size === 0;
        this.filteringKeysCaseFormatted = new Set();
        this.filteringKeys.forEach(key => this.filteringKeysCaseFormatted.add(this.caseFormat(key)));
    }
    addFilteringKey(key) {
        if (this.filteringKeys == null) {
            this.filteringKeys = new Set();
            this.filteringKeysCaseFormatted = new Set();
        }
        this.filteringKeys.add(key);
        this.filteringKeysCaseFormatted.add(this.caseFormat(key));
        if (this.hasNoAppliedFilteringKeys) {
            this.hasNoAppliedFilteringKeys = false;
        }
    }
    hasCaseFormattedFilteringKey(key) {
        return this.filteringKeysCaseFormatted.has(this.caseFormat(key));
    }
    hasFilteringKey(key) {
        return this.filteringKeys.has(key);
    }
    reset() {
        this.filteringKeys = null;
        this.filteringKeysCaseFormatted = null;
        this.hasNoAppliedFilteringKeys = false;
    }
}
exports.SetValueModelFilteringKeys = SetValueModelFilteringKeys;
