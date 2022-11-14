import {
    Autowired,
    Component,
    ICellEditor,
    ICellRendererParams,
    IRichCellEditorParams,
    PopupComponent,
    UserComponentFactory,
    RefSelector,
    VirtualList,
    KeyCode,
    KeyCreatorParams,
    _,
} from "@ag-grid-community/core";
import { RichSelectRow } from "./richSelectRow";
import { bindCellRendererToHtmlElement } from "./utils";

export class RichSelectCellEditor extends PopupComponent implements ICellEditor {

    // tab index is needed so we can focus, which is needed for keyboard events
    private static TEMPLATE = /* html */
        `<div class="ag-rich-select" tabindex="-1">
            <div ref="eValue" class="ag-rich-select-value"></div>
            <div ref="eList" class="ag-rich-select-list"></div>
        </div>`;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eValue') private eValue: HTMLElement;
    @RefSelector('eList') private eList: HTMLElement;

    private params: IRichCellEditorParams;
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

    constructor() {
        super(RichSelectCellEditor.TEMPLATE);
    }

    public init(params: IRichCellEditorParams): void {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;

        const icon = _.createIconNoSpan('smallDown', this.gridOptionsWrapper);
        icon!.classList.add('ag-rich-select-value-icon');
        this.eValue.appendChild(icon!);

        this.virtualList = this.createManagedBean(new VirtualList('rich-select'));
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.eList.appendChild(this.virtualList.getGui());

        if (_.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }

        this.renderSelectedValue();

        if (_.missing(params.values)) {
            console.warn('AG Grid: richSelectCellEditor requires values for it to work');
            return;
        }

        const values = params.values;

        this.virtualList.setModel({
            getRowCount: () => values.length,
            getRow: (index: number) => values[index]
        });

        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));

        const virtualListGui = this.virtualList.getGui();

        this.addManagedListener(virtualListGui, 'click', this.onClick.bind(this));
        this.addManagedListener(virtualListGui, 'mousemove', this.onMouseMove.bind(this));

        const debounceDelay = _.exists(params.searchDebounceDelay) ? params.searchDebounceDelay : 300;

        this.clearSearchString = _.debounce(this.clearSearchString, debounceDelay);

        if (_.exists(params.charPress)) {
            this.searchText(params.charPress);
        }
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
                this.onNavigationKeyPressed(event, key);
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
        this.params.stopEditing();
    }

    private onNavigationKeyPressed(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();
        const oldIndex = this.params.values.indexOf(this.selectedValue);
        const newIndex = key === KeyCode.UP ? oldIndex - 1 : oldIndex + 1;

        if (newIndex >= 0 && newIndex < this.params.values.length) {
            const valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    }

    private searchText(key: KeyboardEvent | string) {
        if (typeof key !== 'string') {
            let keyString = key.key;

            if (keyString === KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                keyString = '';
            } else if (!_.isEventFromPrintableCharacter(key)) {
                return;
            }

            this.searchText(keyString);
            return;
        }

        this.searchString += key;
        this.runSearch();
        this.clearSearchString();
    }

    private runSearch() {
        const values = this.params.values;
        let searchStrings: string[] | undefined;

        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(String);
        }

        if (typeof values[0] === 'object' && this.params.colDef.keyCreator) {
            searchStrings = values.map(value => {
                const keyParams: KeyCreatorParams = {
                    value: value,
                    colDef: this.params.colDef,
                    column: this.params.column,
                    node: this.params.node,
                    data: this.params.data,
                    api: this.gridOptionsWrapper.getApi()!,
                    columnApi: this.gridOptionsWrapper.getColumnApi()!,
                    context: this.gridOptionsWrapper.getContext()
                };
                return this.params.colDef.keyCreator!(keyParams);
            });

        }

        if (!searchStrings) {
            return;
        }

        const topSuggestion = _.fuzzySuggestions(this.searchString, searchStrings, true, true)[0];

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

    private renderSelectedValue(): void {
        const valueFormatted = this.params.formatValue(this.selectedValue);
        const eValue = this.eValue;

        const params = {
            value: this.selectedValue,
            valueFormatted: valueFormatted,
            api: this.gridOptionsWrapper.getApi(),
        } as ICellRendererParams;

        const compDetails = this.userComponentFactory.getCellRendererDetails(this.params, params);
        const promise = compDetails ? compDetails.newAgStackInstance() : undefined;

        if (promise) {
            bindCellRendererToHtmlElement(promise, eValue);
            promise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        } else {
            if (_.exists(this.selectedValue)) {
                eValue.innerText = valueFormatted;
            } else {
                _.clearElement(eValue);
            }
        }
    }

    private setSelectedValue(value: any): void {
        if (this.selectedValue === value) { return; }

        const index = this.params.values.indexOf(value);

        if (index === -1) { return; }

        this.selectedValue = value;
        this.virtualList.ensureIndexVisible(index);

        this.virtualList.forEachRenderedRow((cmp: RichSelectRow, idx: number) => {
            cmp.updateSelected(index === idx);
        });
        this.virtualList.focusRow(index);
    }

    private createRowComponent(value: any): Component {
        const valueFormatted = this.params.formatValue(value);
        const row = new RichSelectRow(this.params);

        this.getContext().createBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        const rect = this.virtualList.getGui().getBoundingClientRect();
        const scrollTop = this.virtualList.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.virtualList.getRowHeight());
        const value = this.params.values[row];

        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    }

    private onClick(): void {
        this.confirmSelection();
        this.params.stopEditing();
    }

    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    public afterGuiAttached(): void {
        const selectedIndex = this.params.values.indexOf(this.selectedValue);

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
            if (this.params.values.length) {
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
