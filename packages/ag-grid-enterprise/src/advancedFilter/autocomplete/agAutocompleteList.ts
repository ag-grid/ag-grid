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
    ElementParams,
    GridOptionsService,
    GridOptionsWithDefaults,
} from 'ag-grid-community';
import { KeyCode, _clamp, _createIconNoSpan } from 'ag-grid-community';

import { VirtualList } from '../../widgets/virtualList';
import agAutocompleteCSS from './agAutocomplete.css';
import { AgAutocompleteRow } from './agAutocompleteRow';
import type {
    AutocompleteEntry,
    AutocompleteRowComponent,
    AutocompleteRowComponentCreator,
} from './autocompleteParams';

/** The list stands empty while values load, so it shows a loading message rather than reading as an empty result. */
const getAgAutocompleteListElement = (loading: boolean): ElementParams => ({
    tag: 'div',
    cls: 'ag-autocomplete-list-popup',
    children: [
        loading
            ? {
                  tag: 'div',
                  cls: 'ag-loading ag-autocomplete-loading',
                  children: [
                      { tag: 'span', ref: 'eLoadingIcon', cls: 'ag-loading-icon' },
                      { tag: 'span', ref: 'eLoadingLabel', cls: 'ag-loading-text' },
                  ],
              }
            : null,
        {
            tag: 'div',
            ref: 'eList',
            cls: `ag-autocomplete-list${loading ? ' ag-hidden' : ''}`,
            attrs: loading ? { 'aria-hidden': 'true' } : undefined,
        },
    ],
});
export class AgAutocompleteList extends AgPopupComponent<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType
> {
    private readonly eList: HTMLElement = RefPlaceholder;
    private readonly eLoadingIcon: HTMLElement = RefPlaceholder;
    private readonly eLoadingLabel: HTMLElement = RefPlaceholder;

    private virtualList: VirtualList<AutocompleteRowComponent, AutocompleteEntry>;

    private autocompleteEntries: AutocompleteEntry[];

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: AutocompleteEntry;
    /** Where `selectedValue` sits, so a list is not searched on every mousemove. */
    private selectedIndex = -1;

    private searchString = '';
    private lastAutoListHeight: number | null = null;
    /** OPTIMIZATION: each entry's search text lower-cased once, as the entries are fixed for the list's life. */
    private lowerCaseTexts: string[] | undefined;

    constructor(
        private readonly params: {
            autocompleteEntries: AutocompleteEntry[];
            onConfirmed: () => void;
            useStartsWithSearch?: boolean;
            suggestFirstMatch?: boolean;
            autoSizeList?: boolean;
            maxVisibleItems?: number;
            onListHeightChanged?: () => void;
            rowComponentCreator?: AutocompleteRowComponentCreator;
            forceLastSelection?: (lastSelection: AutocompleteEntry, searchString: string) => boolean;
            onActiveOptionChanged?: (optionId: string | null) => void;
            /** Whether the entries are still being fetched, so the list stands in for them until they land. */
            loading?: boolean;
        }
    ) {
        super(getAgAutocompleteListElement(!!params.loading));
        this.registerCSS(agAutocompleteCSS);
    }

    public postConstruct(): void {
        this.setupLoading();
        this.autocompleteEntries = this.params.autocompleteEntries;
        this.virtualList = this.createManagedBean(new VirtualList({ cssIdentifier: 'autocomplete' }));
        const virtualList = this.virtualList;
        const virtualListGui = virtualList.getGui();
        virtualList.getAriaElement().id = this.getListId();
        virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(virtualListGui);

        virtualList.setModel({
            getRowCount: () => this.autocompleteEntries.length,
            getRow: (index: number) => this.autocompleteEntries[index],
        });

        // Taken on mousedown too: a list rebuilt under a stationary pointer highlights its first row, and a
        // click with no mousemove before it would confirm that row rather than the one clicked.
        const selectRowUnderMouse = (e: MouseEvent) => {
            if (e.type === 'mousedown') {
                e.preventDefault();
            }
            this.selectRowUnderMouse(e);
        };

        this.addManagedListeners(virtualListGui, {
            click: () => this.params.onConfirmed(),
            mousemove: selectRowUnderMouse,
            mousedown: selectRowUnderMouse,
        });

        this.setSelectedValue(0);
        this.updateListHeight();
    }

    private setupLoading(): void {
        if (!this.params.loading) {
            return;
        }
        this.eLoadingLabel.textContent = this.getLocaleTextFunc()('loadingOoo', 'Loading...');
        const eIcon = _createIconNoSpan('setFilterLoading', this.beans, null);
        if (eIcon) {
            this.eLoadingIcon.appendChild(eIcon);
        }
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
            const isPage = key === KeyCode.PAGE_UP || key === KeyCode.PAGE_DOWN;
            const step = isPage ? this.getPageSize() : 1;
            nextIndex = key === KeyCode.UP || key === KeyCode.PAGE_UP ? oldIndex - step : oldIndex + step;
        }
        const lastIndex = this.autocompleteEntries.length - 1;

        this.setSelectedValue(_clamp(nextIndex, 0, lastIndex));
    }

    private getPageSize(): number {
        const virtualList = this.virtualList;
        const rowHeight = virtualList.getRowHeight();
        const height = virtualList.getGui().getBoundingClientRect().height;
        return rowHeight > 0 ? Math.max(1, Math.floor(height / rowHeight)) : 1;
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
    }

    /**
     * Entries holding the search string, and the index of the one to suggest: the shortest starting with
     * it, otherwise the shortest holding it, the first offered winning a tie. `-1` where nothing matched.
     */
    private runContainsSearch(searchString: string): { matches: AutocompleteEntry[]; topIndex: number } {
        const entries = this.params.autocompleteEntries;
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const texts = this.getLowerCaseTexts();
        const matches: AutocompleteEntry[] = [];
        let topIndex = -1;
        let topLength = 0;
        let topStartsWith = false;
        for (let i = 0, len = entries.length; i < len; ++i) {
            const index = texts[i].indexOf(lowerCaseSearchString);
            if (index < 0) {
                continue;
            }
            const entry = entries[i];
            const length = (entry.searchValue ?? entry.displayValue ?? entry.key).length;
            const startsWith = index === 0;
            if (
                topIndex < 0 ||
                (!topStartsWith && startsWith) ||
                (topStartsWith === startsWith && length < topLength)
            ) {
                topIndex = matches.length;
                topLength = length;
                topStartsWith = startsWith;
            }
            matches.push(entry);
        }
        return { matches, topIndex };
    }

    private runStartsWithSearch(searchString: string): AutocompleteEntry[] {
        const entries = this.params.autocompleteEntries;
        const lowerCaseSearchString = searchString.toLocaleLowerCase();
        const texts = this.getLowerCaseTexts();
        const matches: AutocompleteEntry[] = [];
        for (let i = 0, len = entries.length; i < len; ++i) {
            if (texts[i].startsWith(lowerCaseSearchString)) {
                matches.push(entries[i]);
            }
        }
        return matches;
    }

    private getLowerCaseTexts(): string[] {
        let texts = this.lowerCaseTexts;
        if (!texts) {
            const entries = this.params.autocompleteEntries;
            const len = entries.length;
            texts = new Array(len);
            for (let i = 0; i < len; ++i) {
                const entry = entries[i];
                texts[i] = (entry.searchValue ?? entry.displayValue ?? entry.key).toLocaleLowerCase();
            }
            this.lowerCaseTexts = texts;
        }
        return texts;
    }

    /** One pass, producing the list to show and the row to suggest together, per keystroke. */
    private runSearch(): void {
        const { useStartsWithSearch, suggestFirstMatch, forceLastSelection } = this.params;
        const searchString = this.searchString;

        let matches: AutocompleteEntry[];
        let topIndex = 0;
        if (useStartsWithSearch) {
            matches = this.runStartsWithSearch(searchString);
        } else {
            ({ matches, topIndex } = this.runContainsSearch(searchString));
            if (suggestFirstMatch) {
                topIndex = 0;
            }
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
        const selected = value === this.selectedValue;
        let row = this.params.rowComponentCreator?.(value, selected);
        if (row) {
            this.createBean(row);
        } else {
            const defaultRow = new AgAutocompleteRow();
            this.createBean(defaultRow);
            defaultRow.setState(value.displayValue ?? value.key, selected);
            row = defaultRow;
        }
        // A row drawn after the search ran, scrolling to it say, has to mark up its own match.
        row.setSearchString(this.searchString);
        this.updateRowAriaProperties(row, listItemElement, rowIndex);

        return row;
    }

    private selectRowUnderMouse(mouseEvent: MouseEvent): void {
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
