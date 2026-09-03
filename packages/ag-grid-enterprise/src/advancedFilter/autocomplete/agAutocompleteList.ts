import {
    AgPopupComponent,
    RefPlaceholder,
    _exists,
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

type AutocompleteRowComponent = Component<any> & {
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
    /** Where `selectedValue` sits, so a list is not searched on every mousemove. */
    private selectedIndex = -1;

    private searchString = '';
    private lastAutoListHeight: number | null = null;

    constructor(
        private readonly params: {
            autocompleteEntries: AutocompleteEntry[];
            onConfirmed: () => void;
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
        const index = this.selectedIndex;

        // The cached position is only good while it still holds the selection, the entries having changed.
        return index >= 0 && this.autocompleteEntries[index] === this.selectedValue ? this.getOptionId(index) : null;
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

        const cachedIndex = this.selectedIndex;
        const oldIndex = this.autocompleteEntries[cachedIndex] === this.selectedValue ? cachedIndex : -1;
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

    /**
     * Entries holding the search string, and the index of the one to suggest: the shortest starting with
     * it, otherwise the shortest holding it, the first offered winning a tie. `-1` where nothing matched.
     */
    private runContainsSearch(
        searchString: string,
        entries: AutocompleteEntry[]
    ): { matches: AutocompleteEntry[]; topIndex: number } {
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const matches: AutocompleteEntry[] = [];
        let topIndex = -1;
        let topLength = 0;
        let topStartsWith = false;
        for (let i = 0, len = entries.length; i < len; ++i) {
            const entry = entries[i];
            const text = entry.displayValue ?? entry.key;
            const index = text.toLocaleLowerCase().indexOf(lowerCaseSearchString);
            if (index < 0) {
                continue;
            }
            const startsWith = index === 0;
            if (
                topIndex < 0 ||
                (!topStartsWith && startsWith) ||
                (topStartsWith === startsWith && text.length < topLength)
            ) {
                topIndex = matches.length;
                topLength = text.length;
                topStartsWith = startsWith;
            }
            matches.push(entry);
        }
        return { matches, topIndex };
    }

    private runStartsWithSearch(searchString: string, entries: AutocompleteEntry[]): AutocompleteEntry[] {
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const matches: AutocompleteEntry[] = [];
        for (let i = 0, len = entries.length; i < len; ++i) {
            const entry = entries[i];
            const text = entry.displayValue ?? entry.key;
            if (text.toLocaleLowerCase().startsWith(lowerCaseSearchString)) {
                matches.push(entry);
            }
        }
        return matches;
    }

    /** One pass, producing the list to show and the row to suggest together, per keystroke. */
    private runSearch(): void {
        const { autocompleteEntries, useStartsWithSearch, forceLastSelection } = this.params;
        const searchString = this.searchString;

        let matches: AutocompleteEntry[];
        let topIndex = 0;
        if (useStartsWithSearch) {
            matches = this.runStartsWithSearch(searchString, autocompleteEntries);
        } else {
            ({ matches, topIndex } = this.runContainsSearch(searchString, autocompleteEntries));
        }

        const selectedValue = this.selectedValue;
        if (!matches.length && selectedValue && forceLastSelection?.(selectedValue, searchString)) {
            matches = [selectedValue];
            topIndex = 0;
        }

        this.autocompleteEntries = matches;
        this.refreshVirtualList();
        this.updateListHeight();
        this.checkSetSelectedValue(topIndex);
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
        // An empty list has no row to point at, so the position stays unset rather than naming row 0.
        this.selectedIndex = value === undefined ? -1 : index;

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

    private createRowComponent(
        value: AutocompleteEntry,
        listItemElement: HTMLElement,
        rowIndex: number
    ): AutocompleteRowComponent {
        const customRow = this.params.rowComponentCreator?.(value, value === this.selectedValue);
        if (customRow) {
            this.createBean(customRow);
            this.updateRowAriaProperties(customRow, listItemElement, rowIndex);
            return customRow;
        }

        const row = new AgAutocompleteRow();

        this.createBean(row);
        row.setState(value.displayValue ?? value.key, value === this.selectedValue);
        this.updateRowAriaProperties(row, listItemElement, rowIndex);

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
