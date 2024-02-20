var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RefSelector } from "./componentAnnotations.mjs";
import { VirtualList } from "./virtualList.mjs";
import { KeyCode } from "../constants/keyCode.mjs";
import { AgAutocompleteRow } from "./agAutocompleteRow.mjs";
import { fuzzySuggestions } from "../utils/fuzzyMatch.mjs";
import { PopupComponent } from "./popupComponent.mjs";
import { PostConstruct } from "../context/context.mjs";
import { exists } from "../utils/generic.mjs";
export class AgAutocompleteList extends PopupComponent {
    constructor(params) {
        super(AgAutocompleteList.TEMPLATE);
        this.params = params;
        this.searchString = '';
    }
    destroy() {
        super.destroy();
    }
    init() {
        this.autocompleteEntries = this.params.autocompleteEntries;
        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());
        this.virtualList.setModel({
            getRowCount: () => this.autocompleteEntries.length,
            getRow: (index) => this.autocompleteEntries[index]
        });
        const virtualListGui = this.virtualList.getGui();
        this.addManagedListener(virtualListGui, 'click', () => this.params.onConfirmed());
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(virtualListGui, 'mousedown', (e) => e.preventDefault());
        this.setSelectedValue(0);
    }
    onNavigationKeyDown(event, key) {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        this.checkSetSelectedValue(newIndex);
    }
    setSearch(searchString) {
        this.searchString = searchString;
        if (exists(searchString)) {
            this.runSearch();
        }
        else {
            // reset
            this.autocompleteEntries = this.params.autocompleteEntries;
            this.virtualList.refresh();
            this.checkSetSelectedValue(0);
        }
        this.updateSearchInList();
    }
    runContainsSearch(searchString, searchStrings) {
        let topMatch;
        let topMatchStartsWithSearchString = false;
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const allMatches = searchStrings.filter(string => {
            const lowerCaseString = string.toLocaleLowerCase();
            const index = lowerCaseString.indexOf(lowerCaseSearchString);
            const startsWithSearchString = index === 0;
            const isMatch = index >= 0;
            // top match is shortest value that starts with the search string, otherwise shortest value that includes the search string
            if (isMatch && (!topMatch ||
                (!topMatchStartsWithSearchString && startsWithSearchString) ||
                (topMatchStartsWithSearchString === startsWithSearchString && string.length < topMatch.length))) {
                topMatch = string;
                topMatchStartsWithSearchString = startsWithSearchString;
            }
            return isMatch;
        });
        if (!topMatch && allMatches.length) {
            topMatch = allMatches[0];
        }
        return { topMatch, allMatches };
    }
    runSearch() {
        var _a, _b;
        const { autocompleteEntries } = this.params;
        const searchStrings = autocompleteEntries.map(v => { var _a; return (_a = v.displayValue) !== null && _a !== void 0 ? _a : v.key; });
        let matchingStrings;
        let topSuggestion;
        if (this.params.useFuzzySearch) {
            matchingStrings = fuzzySuggestions(this.searchString, searchStrings, true).values;
            topSuggestion = matchingStrings.length ? matchingStrings[0] : undefined;
        }
        else {
            const containsMatches = this.runContainsSearch(this.searchString, searchStrings);
            matchingStrings = containsMatches.allMatches;
            topSuggestion = containsMatches.topMatch;
        }
        let filteredEntries = autocompleteEntries.filter(({ key, displayValue }) => matchingStrings.includes(displayValue !== null && displayValue !== void 0 ? displayValue : key));
        if (!filteredEntries.length && this.selectedValue && ((_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.forceLastSelection) === null || _b === void 0 ? void 0 : _b.call(_a, this.selectedValue, this.searchString))) {
            filteredEntries = [this.selectedValue];
        }
        this.autocompleteEntries = filteredEntries;
        this.virtualList.refresh();
        if (!topSuggestion) {
            return;
        }
        const topSuggestionIndex = matchingStrings.indexOf(topSuggestion);
        this.checkSetSelectedValue(topSuggestionIndex);
    }
    updateSearchInList() {
        this.virtualList.forEachRenderedRow((row) => row.setSearchString(this.searchString));
    }
    checkSetSelectedValue(index) {
        if (index >= 0 && index < this.autocompleteEntries.length) {
            this.setSelectedValue(index);
        }
    }
    setSelectedValue(index) {
        const value = this.autocompleteEntries[index];
        if (this.selectedValue === value) {
            return;
        }
        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);
        this.virtualList.forEachRenderedRow((cmp, idx) => {
            cmp.updateSelected(index === idx);
        });
    }
    createRowComponent(value) {
        var _a;
        const row = new AgAutocompleteRow();
        this.getContext().createBean(row);
        row.setState((_a = value.displayValue) !== null && _a !== void 0 ? _a : value.key, value === this.selectedValue);
        return row;
    }
    onMouseMove(mouseEvent) {
        const rect = this.virtualList.getGui().getBoundingClientRect();
        const scrollTop = this.virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.virtualList.getRowHeight());
        this.checkSetSelectedValue(row);
    }
    afterGuiAttached() {
        this.virtualList.refresh();
    }
    getSelectedValue() {
        var _a;
        if (!this.autocompleteEntries.length) {
            return null;
        }
        ;
        return (_a = this.selectedValue) !== null && _a !== void 0 ? _a : null;
    }
}
AgAutocompleteList.TEMPLATE = `<div class="ag-autocomplete-list-popup">
            <div ref="eList" class="ag-autocomplete-list"></div>
        <div>`;
__decorate([
    RefSelector('eList')
], AgAutocompleteList.prototype, "eList", void 0);
__decorate([
    PostConstruct
], AgAutocompleteList.prototype, "init", null);
