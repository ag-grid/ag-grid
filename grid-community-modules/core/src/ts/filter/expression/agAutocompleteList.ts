import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { VirtualList } from '../../widgets/virtualList';
import { KeyCode } from '../../constants/keyCode';
import { AgAutocompleteRow } from './agAutocompleteRow';
import { fuzzySuggestions } from '../../utils/fuzzyMatch';
import { PopupComponent } from '../../widgets/popupComponent';
import { PostConstruct } from '../../context/context';
import { AutocompleteEntry } from './autocompleteParams';
import { exists } from '../../utils/generic';

export class AgAutocompleteList extends PopupComponent {
    private static TEMPLATE = /* html */
        `<div class="ag-autocomplete-list-popup">
            <div ref="eList" class="ag-autocomplete-list"></div>
        <div>`;

    @RefSelector('eList') private eList: HTMLElement;

    private virtualList: VirtualList;

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: AutocompleteEntry;

    private searchString = '';

    constructor(private params: {
        autocompleteEntries: AutocompleteEntry[];
        onConfirmed: () => void;
        onCancelled: () => void;
    }) {
        super(AgAutocompleteList.TEMPLATE);
    }

    public destroy(): void {
        super.destroy();
    }

    @PostConstruct
    protected init(): void {
        this.virtualList = this.createManagedBean(new VirtualList('autocomplete'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        this.virtualList.setModel({
            getRowCount: () => this.params.autocompleteEntries.length,
            getRow: (index: number) => this.params.autocompleteEntries[index]
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListener(virtualListGui, 'click', () => this.params.onConfirmed());
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));

        this.setSelectedValue(0);
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        event.preventDefault();

        switch (key) {
            case KeyCode.ENTER:
                this.params.onConfirmed();
                break;
            case KeyCode.TAB:
                this.params.onConfirmed();
                break;
            case KeyCode.ESCAPE:
                this.params.onCancelled();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
        }
    }

    public onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.params.autocompleteEntries.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;

        this.checkSetSelectedValue(newIndex);
    }

    public setSearch(searchString: string): void {
        this.searchString = searchString;
        if (exists(searchString)) {
            this.runSearch();
        }
        this.updateSearchInList();
    }

    private runSearch() {
        const values = this.params.autocompleteEntries;
        const searchStrings = values.map(v => v.displayValue ?? v.key);

        const topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];

        if (!topSuggestion) {
            return;
        }

        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);

        this.setSelectedValue(topSuggestionIndex);
    }

    private updateSearchInList(): void {
        this.virtualList.forEachRenderedRow((row: AgAutocompleteRow) => row.setSearchString(this.searchString));
    }

    private checkSetSelectedValue(index: number): void {
        if (index >= 0 && index < this.params.autocompleteEntries.length) {
            this.setSelectedValue(index);
        }
    }

    private setSelectedValue(index: number): void {
        const value = this.params.autocompleteEntries[index];

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
        return this.selectedValue ?? null;
    }
}
