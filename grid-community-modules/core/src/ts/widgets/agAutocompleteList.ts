import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { VirtualList } from "./virtualList";
import { KeyCode } from "../constants/keyCode";
import { AgAutocompleteRow } from "./agAutocompleteRow";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { PopupComponent } from "./popupComponent";
import { PostConstruct } from "../context/context";
import { AutocompleteEntry } from "./autocompleteParams";
import { exists } from "../utils/generic";

export class AgAutocompleteList extends PopupComponent {
    private static TEMPLATE = /* html */
        `<div class="ag-autocomplete-list-popup">
            <div ref="eList" class="ag-autocomplete-list"></div>
        <div>`;

    @RefSelector('eList') private eList: HTMLElement;

    private virtualList: VirtualList;

    private autocompleteEntries: AutocompleteEntry[];

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: AutocompleteEntry;

    private searchString = '';

    constructor(private params: {
        autocompleteEntries: AutocompleteEntry[];
        onConfirmed: () => void;
        useFuzzySearch?: boolean;
        forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean;
    }) {
        super(AgAutocompleteList.TEMPLATE);
    }

    public destroy(): void {
        super.destroy();
    }

    @PostConstruct
    protected init(): void {
        this.autocompleteEntries = this.params.autocompleteEntries;
        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        this.virtualList.setModel({
            getRowCount: () => this.autocompleteEntries.length,
            getRow: (index: number) => this.autocompleteEntries[index]
        });

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListener(virtualListGui, 'click', () => this.params.onConfirmed());
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(virtualListGui, 'mousedown', (e) => e.preventDefault());

        this.setSelectedValue(0);
    }

    public onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;

        this.checkSetSelectedValue(newIndex);
    }

    public setSearch(searchString: string): void {
        this.searchString = searchString;
        if (exists(searchString)) {
            this.runSearch();
        } else {
            // reset
            this.autocompleteEntries = this.params.autocompleteEntries;
            this.virtualList.refresh();
            this.checkSetSelectedValue(0);
        }
        this.updateSearchInList();
    }

    private runContainsSearch(searchString: string, searchStrings: string[]): { topMatch: string | undefined, allMatches: string[] } {
        let topMatch: string | undefined;
        let topMatchStartsWithSearchString = false;
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const allMatches = searchStrings.filter(string => {
            const lowerCaseString = string.toLocaleLowerCase();
            const index = lowerCaseString.indexOf(lowerCaseSearchString);
            const startsWithSearchString = index === 0;
            const isMatch = index >= 0;
            // top match is shortest value that starts with the search string, otherwise shortest value that includes the search string
            if (isMatch && (
                !topMatch ||
                (!topMatchStartsWithSearchString && startsWithSearchString) ||
                (topMatchStartsWithSearchString === startsWithSearchString && string.length < topMatch.length)
            )) {
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

    private runSearch() {
        const { autocompleteEntries } = this.params;
        const searchStrings = autocompleteEntries.map(v => v.displayValue ?? v.key);

        let matchingStrings: string[];
        let topSuggestion: string | undefined;
        if (this.params.useFuzzySearch) {
            matchingStrings = fuzzySuggestions(this.searchString, searchStrings, true).values;
            topSuggestion = matchingStrings.length ? matchingStrings[0] : undefined;
        } else {
            const containsMatches = this.runContainsSearch(this.searchString, searchStrings);
            matchingStrings = containsMatches.allMatches;
            topSuggestion = containsMatches.topMatch;
        }

        let filteredEntries = autocompleteEntries.filter(({ key, displayValue }) => matchingStrings.includes(displayValue ?? key));
        if (!filteredEntries.length && this.selectedValue && this.params?.forceLastSelection?.(this.selectedValue, this.searchString)) {
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

    private updateSearchInList(): void {
        this.virtualList.forEachRenderedRow((row: AgAutocompleteRow) => row.setSearchString(this.searchString));
    }

    private checkSetSelectedValue(index: number): void {
        if (index >= 0 && index < this.autocompleteEntries.length) {
            this.setSelectedValue(index);
        }
    }

    private setSelectedValue(index: number): void {
        const value = this.autocompleteEntries[index];

        if (this.selectedValue === value) { return; }

        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);

        this.virtualList.forEachRenderedRow((cmp: AgAutocompleteRow, idx: number) => {
            cmp.updateSelected(index === idx);
        });
    }

    private createRowComponent(value: AutocompleteEntry): Component {
        const row = new AgAutocompleteRow();

        this.getContext().createBean(row);
        row.setState(value.displayValue ?? value.key, value === this.selectedValue);

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        const rect = this.virtualList.getGui().getBoundingClientRect();
        const scrollTop = this.virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.virtualList.getRowHeight());

        this.checkSetSelectedValue(row);
    }

    public afterGuiAttached(): void {
        this.virtualList.refresh();
    }

    public getSelectedValue(): AutocompleteEntry | null {
        if (!this.autocompleteEntries.length) { return null };
        return this.selectedValue ?? null;
    }
}
