import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { VirtualList } from '../../widgets/virtualList';
import { KeyCode } from '../../constants/keyCode';
import { AgAutocompleteRow } from './agAutocompleteRow';
import { fuzzySuggestions } from '../../utils/fuzzyMatch';
import { debounce } from '../../utils/function';
import { isEventFromPrintableCharacter } from '../../utils/keyboard';
import { PopupComponent } from '../../widgets/popupComponent';
import { PostConstruct } from '../../context/context';

export class AgAutocompleteList extends PopupComponent {
    private static TEMPLATE = /* html */
        `<div class="ag-popup-editor ag-ltr ag-popup-child"><div class="ag-rich-select" tabindex="-1">
            <div ref="eList" class="ag-rich-select-list"></div>
        </div><div>`;

    @RefSelector('eList') private eList: HTMLElement;

    private virtualList: VirtualList;

    private focusAfterAttached: boolean;

    // as the user moves the mouse, the selectedValue changes
    private selectedValue: any;
    // the original selection, as if the edit is not confirmed, getValue() will
    // return back the selected value. 'not confirmed' can happen if the user
    // opens the dropdown, hovers the mouse over a new value (selectedValue will
    // change to the new value) but then click on another cell (which will stop
    // the editing). in this instance, selectedValue will be a new value, however
    // the editing was effectively cancelled.
    private originalSelectedValue: any;
    private selectionConfirmed = false;
    private searchString = '';

    constructor(private values: string[]) {
        super(AgAutocompleteList.TEMPLATE);
    }

    public destroy(): void {
        super.destroy();
    }

    @PostConstruct
    protected init(): void {
        this.selectedValue = undefined; // TODO
        this.originalSelectedValue = undefined; // TODO
        this.focusAfterAttached = false; // TODO

        this.virtualList = this.createManagedBean(new VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        // if (exists(this.params.cellHeight)) {
            //     this.virtualList.setRowHeight(this.params.cellHeight);
        // }

        this.virtualList.setModel({
            getRowCount: () => this.values.length,
            getRow: (index: number) => this.values[index]
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));

        const debounceDelay = 300;

        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);

        // if (params.eventKey?.length === 1) {
        //     this.searchText(params.eventKey);
        // }
    }

    public onParentModelChanged(parentModel: any): void {
    }

    private onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        event.preventDefault();

        switch (key) {
            case KeyCode.ENTER:
                this.onEnterKeyDown();
                break;
            case KeyCode.TAB:
                this.confirmSelection();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            default:
                this.searchText(event);
        }
    }

    private confirmSelection(): void {
        this.selectionConfirmed = true;
    }

    private onEnterKeyDown(): void {
        this.confirmSelection();
    }

    private onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.values.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;

        if (newIndex >= 0 && newIndex < this.values.length) {
            const valueToSelect = this.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }

    public setSearch(searchString: string): void {
        this.searchString = searchString;
        this.runSearch();
    }

    private searchText(key: KeyboardEvent | string) {
        if (typeof key !== 'string') {
            let keyString = key.key;

            if (keyString === KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                keyString = '';
            } else if (!isEventFromPrintableCharacter(key)) {
                return;
            }

            this.searchText(keyString);
            return;
        }

        this.searchString += key;
        this.runSearch();
        this.clearSearchString();
    }

    private formatValue(value: string): string {
        return value; // TODO
    }

    private runSearch() {
        const values = this.values;
        let searchStrings: string[] | undefined;

        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => this.formatValue(v));
        }

        if (!searchStrings) {
            return;
        }

        const topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];

        if (!topSuggestion) {
            return;
        }

        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);
        const topValue = values[topSuggestionIndex];

        this.setSelectedValue(topValue);
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    private setSelectedValue(value: any): void {
        if (this.selectedValue === value) { return; }

        const index = this.values.indexOf(value);

        if (index === -1) { return; }

        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);

        this.virtualList.forEachRenderedRow((cmp: AgAutocompleteRow, idx: number) => {
            cmp.updateSelected(index === idx);
        });
    }

    private createRowComponent(value: any): Component {
        const valueFormatted = this.formatValue(value);
        const row = new AgAutocompleteRow();

        this.getContext().createBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        const rect = this.virtualList.getGui().getBoundingClientRect();
        const scrollTop = this.virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.virtualList.getRowHeight());
        const value = this.values[row];

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
        const selectedIndex = this.values.indexOf(this.selectedValue);

        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndexVisible would do nothing
        this.virtualList.refresh();

        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }

        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();

        if (this.focusAfterAttached) {
            const indexToSelect = selectedIndex !== -1 ? selectedIndex : 0;
            if (this.values.length) {
                this.virtualList.focusRow(indexToSelect);
            } else {
                this.getGui().focus();
            }
        }
    }

    public getValue(): any {
        // NOTE: we don't use valueParser for Set Filter. The user should provide values that are to be
        // set into the data. valueParser only really makese sense when the user is typing in text (not picking
        // form a set).
        return this.selectionConfirmed ? this.selectedValue : this.originalSelectedValue;
    }
}
