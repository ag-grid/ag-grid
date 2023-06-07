import { SetFilterDisplayValue } from './iSetDisplayValueModel';
export class FlatSetDisplayValueModel {
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
        return SetFilterDisplayValue.SELECT_ALL;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdFNldERpc3BsYXlWYWx1ZU1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NldEZpbHRlci9mbGF0U2V0RGlzcGxheVZhbHVlTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUF5QixxQkFBcUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXZGLE1BQU0sT0FBTyx3QkFBd0I7SUFJakMsWUFDcUIscUJBQTRDLEVBQzVDLGNBQXNFLEVBQ3RFLFNBQXdCLEVBQ3hCLE1BQWM7UUFIZCwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLG1CQUFjLEdBQWQsY0FBYyxDQUF3RDtRQUN0RSxjQUFTLEdBQVQsU0FBUyxDQUFlO1FBQ3hCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFQbkMscUZBQXFGO1FBQzdFLGtCQUFhLEdBQXNCLEVBQUUsQ0FBQztJQU8zQyxDQUFDO0lBRUcsbUNBQW1DLENBQ3RDLFNBQTJDLEVBQzNDLFFBQTZDLEVBQzdDLGFBQWlDO1FBRWpDLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sc0NBQXNDLENBQ3pDLFFBQTBDLEVBQzFDLFFBQTZDLEVBQzdDLGFBQWlDLEVBQ2pDLGFBQXVELEVBQ3ZELGlCQUEwQjtRQUUxQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUV4QixLQUFLLElBQUksR0FBRyxJQUFJLGFBQWEsRUFBRTtZQUMzQixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ2IsSUFBSSxpQkFBaUIsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hDO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQzlELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUUxRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFFL0QsSUFBSSxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFBRTtvQkFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hDO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFTSxzQkFBc0I7UUFDekIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztJQUNyQyxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsS0FBYTtRQUNqQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGdCQUFnQjtRQUNaLE9BQU8scUJBQXFCLENBQUMsVUFBVSxDQUFDO0lBQzVDLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxJQUFrQztRQUN6RCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsSUFBcUM7UUFDekQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxPQUFPO1FBQ1YsV0FBVztJQUNmLENBQUM7Q0FDSiJ9