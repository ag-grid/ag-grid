import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { VirtualList } from '../../widgets/virtualList';
import { KeyCode } from '../../constants/keyCode';
import { AgAutocompleteRow } from './agAutocompleteRow';
import { fuzzySuggestions } from '../../utils/fuzzyMatch';
import { PopupComponent } from '../../widgets/popupComponent';
import { PostConstruct } from '../../context/context';
import { AutocompleteEntry } from './agAutocomplete';
import { exists } from '../../utils/generic';

export class AgAutocompleteList extends PopupComponent {
    private static TEMPLATE = /* html */
        `<div class="ag-popup-editor ag-ltr ag-popup-child"><div class="ag-rich-select" tabindex="-1">
            <div ref="eList" class="ag-rich-select-list"></div>
        </div><div>`;

    @RefSelector('eList') private eList: HTMLElement;

    private virtualList: VirtualList;

    private focusAfterAttached: boolean;

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: AutocompleteEntry;

    private searchString = '';

    constructor(private autocompleteEntries: AutocompleteEntry[], private onConfirmed: () => void) {
        super(AgAutocompleteList.TEMPLATE);
    }

    public destroy(): void {
        super.destroy();
    }

    @PostConstruct
    protected init(): void {
        this.selectedValue = undefined as any; // TODO
        this.focusAfterAttached = false; // TODO

        this.virtualList = this.createManagedBean(new VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        // if (exists(this.params.cellHeight)) {
            //     this.virtualList.setRowHeight(this.params.cellHeight);
        // }

        this.virtualList.setModel({
            getRowCount: () => this.autocompleteEntries.length,
            getRow: (index: number) => this.autocompleteEntries[index]
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        event.preventDefault();

        switch (key) {
            case KeyCode.ENTER:
                this.confirmSelection();
                break;
            case KeyCode.TAB:
                this.confirmSelection();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
        }
    }

    private confirmSelection(): void {
        this.onConfirmed();
    }

    public onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.autocompleteEntries.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;

        if (newIndex >= 0 && newIndex < this.autocompleteEntries.length) {
            const valueToSelect = this.autocompleteEntries[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }

    public setSearch(searchString: string): void {
        this.searchString = searchString;
        if (exists(searchString)) {
            this.runSearch();
        }
        this.updateSearchInList();
    }

    private runSearch() {
        const values = this.autocompleteEntries;
        const searchStrings = values.map(v => v.displayValue ?? v.key);

        const topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];

        if (!topSuggestion) {
            return;
        }

        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        const topValue = values[topSuggestionIndex];

        this.setSelectedValue(topValue);
    }

    private updateSearchInList(): void {
        this.virtualList.forEachRenderedRow((row: AgAutocompleteRow) => row.setSearchString(this.searchString));
    }

    private setSelectedValue(value: AutocompleteEntry): void {
        if (this.selectedValue === value) { return; }

        const index = this.autocompleteEntries.indexOf(value);

        if (index === -1) { return; }

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
        const value = this.autocompleteEntries[row];

        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    }

    private onClick(): void {
        this.confirmSelection();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const selectedIndex = this.autocompleteEntries.indexOf(this.selectedValue);

        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndexVisible would do nothing
        this.virtualList.refresh();

        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }

        // we call refresh again, as the list could have moved, and we need to render the new rows
        this.virtualList.refresh();

        if (this.focusAfterAttached) {
            const indexToSelect = selectedIndex !== -1 ? selectedIndex : 0;
            if (this.autocompleteEntries.length) {
                this.virtualList.focusRow(indexToSelect);
            } else {
                this.getGui().focus();
            }
        }
    }

    public getSelectedValue(): string | null {
        return this.selectedValue?.key ?? null;
    }
}
