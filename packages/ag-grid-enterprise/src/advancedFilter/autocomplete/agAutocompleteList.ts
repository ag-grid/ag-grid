import {
    AgPopupComponent,
    RefPlaceholder,
    _exists,
    _fuzzySuggestions,
    _isVisible,
    _setAriaActiveDescendant,
    _setAriaSelected,
} from 'ag-stack';

import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    Component,
    ElementParams,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { KeyCode, _clamp } from 'ag-grid-community';

import { VirtualList } from '../../widgets/virtualList';
import agAutocompleteCSS from './agAutocomplete.css';
import { AgAutocompleteRow } from './agAutocompleteRow';
import type { AutocompleteEntry } from './autocompleteParams';

type AutocompleteRowComponent = Component & {
    updateSelected(selected: boolean): void;
    setSearchString(searchString: string): void;
};

const AgAutocompleteListElement: ElementParams = {
    tag: 'div',
    cls: 'ag-autocomplete-list-popup',
    children: [
        {
            tag: 'div',
            ref: 'eList',
            cls: 'ag-autocomplete-list',
        },
    ],
};
export class AgAutocompleteList extends AgPopupComponent<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
> {
    private readonly eList: HTMLElement = RefPlaceholder;

    private virtualList: VirtualList<AutocompleteRowComponent, AutocompleteEntry>;

    private autocompleteEntries: AutocompleteEntry[];

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: AutocompleteEntry;

    private searchString = '';
    private lastAutoListHeight: number | null = null;

    constructor(
        private readonly params: {
            autocompleteEntries: AutocompleteEntry[];
            onConfirmed: () => void;
            useFuzzySearch?: boolean;
            useStartsWithSearch?: boolean;
            autoSizeList?: boolean;
            maxVisibleItems?: number;
            onListHeightChanged?: () => void;
            rowComponentCreator?: (value: AutocompleteEntry, selected: boolean) => AutocompleteRowComponent;
            forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean;
            onActiveOptionChanged?: (optionId: string | null) => void;
        }
    ) {
        super(AgAutocompleteListElement);
        this.registerCSS(agAutocompleteCSS);
    }

    public postConstruct(): void {
        this.autocompleteEntries = this.params.autocompleteEntries;
        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        this.virtualList.getAriaElement().id = this.getListId();
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        this.virtualList.setModel({
            getRowCount: () => this.autocompleteEntries.length,
            getRow: (index: number) => this.autocompleteEntries[index],
        });

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListeners(virtualListGui, {
            click: () => this.params.onConfirmed(),
            mousemove: this.onMouseMove.bind(this),
            mousedown: (e) => e.preventDefault(),
        });

        this.setSelectedValue(0);
        this.updateListHeight();
    }

    public getActiveOptionId(): string | null {
        const selectedValue = this.selectedValue;
        const index = selectedValue ? this.autocompleteEntries.indexOf(selectedValue) : -1;

        return index >= 0 ? this.getOptionId(index) : null;
    }

    public getListId(): string {
        return `ag-autocomplete-list-${this.getCompId()}`;
    }

    public onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        if (!this.autocompleteEntries.length) {
            return;
        }

        const oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
        let nextIndex = 0;
        if (oldIndex >= 0) {
            nextIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;
        }
        const lastIndex = this.autocompleteEntries.length - 1;

        this.setSelectedValue(_clamp(nextIndex, 0, lastIndex));
    }

    public setSearch(searchString: string): void {
        this.searchString = searchString;
        if (_exists(searchString)) {
            this.runSearch();
        } else {
            // reset
            this.autocompleteEntries = this.params.autocompleteEntries;
            this.refreshVirtualList();
            this.checkSetSelectedValue(0);
            this.updateListHeight();
        }
        this.updateSearchInList();
    }

    private runContainsSearch(
        searchString: string,
        searchStrings: string[]
    ): { topMatch: string | undefined; allMatches: string[] } {
        let topMatch: string | undefined;
        let topMatchStartsWithSearchString = false;
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const allMatches = searchStrings.filter((string) => {
            const lowerCaseString = string.toLocaleLowerCase();
            const index = lowerCaseString.indexOf(lowerCaseSearchString);
            const startsWithSearchString = index === 0;
            const isMatch = index >= 0;
            // top match is shortest value that starts with the search string, otherwise shortest value that includes the search string
            if (
                isMatch &&
                (!topMatch ||
                    (!topMatchStartsWithSearchString && startsWithSearchString) ||
                    (topMatchStartsWithSearchString === startsWithSearchString && string.length < topMatch.length))
            ) {
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

    private runStartsWithSearch(
        searchString: string,
        searchStrings: string[]
    ): { topMatch: string | undefined; allMatches: string[] } {
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const allMatches = searchStrings.filter((string) =>
            string.toLocaleLowerCase().startsWith(lowerCaseSearchString)
        );
        const topMatch = allMatches[0];
        return { topMatch, allMatches };
    }

    private runSearch() {
        const { autocompleteEntries, useFuzzySearch, useStartsWithSearch, forceLastSelection } = this.params;
        const searchStrings = autocompleteEntries.map((v) => v.displayValue ?? v.key);

        let matchingStrings: string[];
        let topSuggestion: string | undefined;
        if (useFuzzySearch) {
            matchingStrings = _fuzzySuggestions({
                inputValue: this.searchString,
                allSuggestions: searchStrings,
                hideIrrelevant: true,
            }).values;
            topSuggestion = matchingStrings.length ? matchingStrings[0] : undefined;
        } else {
            const matches = useStartsWithSearch
                ? this.runStartsWithSearch(this.searchString, searchStrings)
                : this.runContainsSearch(this.searchString, searchStrings);
            matchingStrings = matches.allMatches;
            topSuggestion = matches.topMatch;
        }

        let filteredEntries = autocompleteEntries.filter(({ key, displayValue }) =>
            matchingStrings.includes(displayValue ?? key)
        );
        if (
            !filteredEntries.length &&
            this.selectedValue &&
            forceLastSelection?.(this.selectedValue, this.searchString)
        ) {
            filteredEntries = [this.selectedValue];
        }
        this.autocompleteEntries = filteredEntries;
        this.refreshVirtualList();
        this.updateListHeight();

        if (!topSuggestion) {
            return;
        }

        const topSuggestionIndex = matchingStrings.indexOf(topSuggestion);

        this.checkSetSelectedValue(topSuggestionIndex);
    }

    private updateSearchInList(): void {
        this.virtualList.forEachRenderedRow((row) => row.setSearchString(this.searchString));
    }

    private updateListHeight(): void {
        if (!this.params.autoSizeList) {
            return;
        }

        const rowCount = this.autocompleteEntries.length;
        const rowHeight = this.virtualList.getRowHeight();
        const maxItems = this.params.maxVisibleItems ?? rowCount;
        const visibleCount = Math.min(rowCount, maxItems);
        let height = visibleCount * rowHeight;

        if (rowCount === 0) {
            height = rowHeight;
        }

        if (this.lastAutoListHeight === height) {
            return;
        }

        this.lastAutoListHeight = height;
        this.eList.style.height = `${height}px`;

        if (_isVisible(this.eList)) {
            this.params.onListHeightChanged?.();
        }
    }

    private checkSetSelectedValue(index: number): void {
        if (index >= 0 && index < this.autocompleteEntries.length) {
            this.setSelectedValue(index);
        }
    }

    private refreshVirtualList(): void {
        this.virtualList.refresh();
        this.virtualList.awaitStable(() => {
            this.refreshRenderedRowsAria();
            this.refreshActiveDescendant();
        });
    }

    private setSelectedValue(index: number): void {
        const value = this.autocompleteEntries[index];

        if (this.selectedValue === value) {
            this.refreshRenderedRowsAria();
            this.refreshActiveDescendant();
            return;
        }

        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);

        this.refreshRenderedRowsAria();
        this.refreshActiveDescendant();
    }

    private refreshRenderedRowsAria(): void {
        this.virtualList.forEachRenderedRow((rowComponent, rowIndex) => {
            const rowGui = rowComponent.getGui();
            const rowParent = rowGui.parentElement;
            if (rowParent instanceof HTMLElement) {
                this.updateRowAriaProperties(rowComponent, rowParent, rowIndex);
            }
        });
    }

    private refreshActiveDescendant(): void {
        const activeOptionId = this.getActiveOptionId();

        _setAriaActiveDescendant(this.virtualList.getAriaElement(), activeOptionId);
        this.params.onActiveOptionChanged?.(activeOptionId);
    }

    private updateRowAriaProperties(
        rowComponent: AutocompleteRowComponent,
        listItemElement: HTMLElement,
        rowIndex: number
    ): void {
        const isSelected = this.autocompleteEntries[rowIndex] === this.selectedValue;

        rowComponent.updateSelected(isSelected);
        _setAriaSelected(listItemElement, isSelected);
        listItemElement.setAttribute('id', this.getOptionId(rowIndex));
    }

    private getOptionId(index: number): string {
        return `${this.getListId()}-option-${index}`;
    }

    private createRowComponent(value: AutocompleteEntry, listItemElement: HTMLElement): AutocompleteRowComponent {
        const customRow = this.params.rowComponentCreator?.(value, value === this.selectedValue);
        if (customRow) {
            this.createBean(customRow);
            this.updateRowAriaProperties(customRow, listItemElement, this.autocompleteEntries.indexOf(value));
            return customRow;
        }

        const row = new AgAutocompleteRow();

        this.createBean(row);
        row.setState(value.displayValue ?? value.key, value === this.selectedValue);
        this.updateRowAriaProperties(row, listItemElement, this.autocompleteEntries.indexOf(value));

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        const virtualList = this.virtualList;
        const rect = virtualList.getGui().getBoundingClientRect();
        const scrollTop = virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / virtualList.getRowHeight());

        this.checkSetSelectedValue(row);
    }

    public afterGuiAttached(): void {
        this.refreshVirtualList();
        this.updateListHeight();
    }

    public getSelectedValue(): AutocompleteEntry | null {
        if (!this.autocompleteEntries.length) {
            return null;
        }
        return this.selectedValue ?? null;
    }
}
