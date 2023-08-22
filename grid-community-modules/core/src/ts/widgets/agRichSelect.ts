import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { KeyCode } from "../constants/keyCode";
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { FieldPickerValueSelectedEvent } from "../events";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { setAriaControls } from "../utils/aria";
import { bindCellRendererToHtmlElement, clearElement } from "../utils/dom";
import { debounce } from "../utils/function";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { exists } from "../utils/generic";
import { isEventFromPrintableCharacter } from "../utils/keyboard";
import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { Component } from "./component";
import { VirtualList } from "./virtualList";

export interface RichSelectParams<TValue = any> extends IPickerFieldParams {
    value?: TValue;
    valueList?: TValue[]
    cellRenderer?: any;
    cellRowHeight?: number;
    searchDebounceDelay?: number;
    valueFormatter?: (value: TValue) => any;
    searchStringCreator?: (values: TValue[]) => string[]
}

export class AgRichSelect<TValue = any> extends AgPickerField<TValue, RichSelectParams<TValue>, VirtualList> {

    private searchString = '';
    private listComponent: VirtualList | undefined;
    private searchDebounceDelay: number;
    private values: TValue[];
    private highlightedItem: number = -1;
    private cellRowHeight: number;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    constructor(config?: RichSelectParams<TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            ...config,
        }, 'ag-rich-select', 'smallDown', 'combobox');

        const { cellRowHeight, value, valueList, searchDebounceDelay } = config || {};

        if (cellRowHeight) {
            this.cellRowHeight = cellRowHeight;
        }

        if (value != null) {
            this.value = value;
        }

        if (valueList != null) {
            this.setValueList(valueList);
        }

        if (searchDebounceDelay != null) {
            this.searchDebounceDelay = searchDebounceDelay;
        }
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gridOptionsService.getNum('tabIndex') ?? 0;
        this.eWrapper.classList.add('ag-rich-select-value');

        const debounceDelay = this.searchDebounceDelay ?? 300;
        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);

        this.renderSelectedValue();
    }

    private createListComponent(): void {
        this.listComponent = this.createManagedBean(new VirtualList({ cssIdentifier: 'rich-select' }))
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);

        this.addManagedListener(this.listComponent, Events.EVENT_FIELD_PICKER_VALUE_SELECTED, (e: FieldPickerValueSelectedEvent) => {
            this.onListValueSelected(e.value, e.fromEnterKey);
        });

        if (this.cellRowHeight) {
            this.listComponent.setRowHeight(this.cellRowHeight);
        }

        const eListGui = this.listComponent.getGui();
        const eListAriaEl = this.listComponent.getAriaElement();

        this.addManagedListener(eListGui, 'mousemove', this.onPickerMouseMove.bind(this));
        this.addManagedListener(eListGui, 'mousedown', e => e.preventDefault());
        eListGui.classList.add('ag-rich-select-list');

        const listId = `ag-rich-select-list-${this.listComponent.getCompId()}`;
        eListAriaEl.setAttribute('id', listId);
        setAriaControls(this.eWrapper, eListAriaEl);
    }

    private renderSelectedValue(): void {
        const { value, eDisplayField, config } = this;
        const valueFormatted = this.config.valueFormatter ? this.config.valueFormatter(value) : value;

        let userCompDetails: UserCompDetails | undefined;

        if (config.cellRenderer) {
            userCompDetails = this.userComponentFactory.getCellRendererDetails(this.config, {
                value,
                valueFormatted,
                api: this.gridOptionsService.api
            } as ICellRendererParams);
        }

        let userCompDetailsPromise: AgPromise<any> | undefined;

        if (userCompDetails) {
            userCompDetailsPromise = userCompDetails.newAgStackInstance();
        }

        if (userCompDetailsPromise) {
            clearElement(eDisplayField);
            bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        } else {
            if (exists(this.value)) {
                eDisplayField.innerText = valueFormatted;
            } else {
                clearElement(eDisplayField);
            }
        }
    }

    public setValueList(valueList: TValue[]): void {
        this.values = valueList;
        this.highlightSelectedValue();
    }

    private getCurrentValueIndex(): number {
        const { values, value } = this;

        if (value == null) { return -1; }

        for (let i = 0; i < values.length; i++) {
            if (values[i] === value) {
                return i;
            }
        }

        return -1;
    }

    private highlightSelectedValue(index?: number): void {
        if (index == null) {
            index = this.getCurrentValueIndex();
        }

        if (index === -1) { return; }

        this.highlightedItem = index;

        if (this.listComponent) {
            this.listComponent.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
                cmp.updateHighlighted(this.highlightedItem === idx);
            });
        }
    }

    public setRowHeight(height: number): void {
        if (height !== this.cellRowHeight) {
            this.cellRowHeight = height;
        }

        if (this.listComponent) {
            this.listComponent.setRowHeight(height);
        }
    }

    protected createPickerComponent() {
        const { values }  = this;

        this.listComponent!.setModel({
            getRowCount: () => values.length,
            getRow: (index: number) => values[index]
        });

        // do not create the picker every time to save state
        return this.listComponent!;
    }

    public showPicker() {
        super.showPicker();
        const currentValueIndex = this.getCurrentValueIndex();
        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            this.listComponent?.refresh();
            this.listComponent?.ensureIndexVisible(currentValueIndex);
            this.highlightSelectedValue(currentValueIndex);
        } else {
            this.listComponent?.refresh();
        }
    }

    protected beforeHidePicker(): void {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }

    public searchText(searchKey: KeyboardEvent | string) {
        if (typeof searchKey !== 'string') {
            let { key } = searchKey;

            if (key === KeyCode.BACKSPACE) {
                this.searchString = this.searchString.slice(0, -1);
                key = '';
            } else if (!isEventFromPrintableCharacter(searchKey)) {
                return;
            }

            searchKey.preventDefault();

            this.searchText(key);
            return;
        }

        this.searchString += searchKey;
        this.runSearch();
        this.clearSearchString();
    }

    private runSearch() {
        const values = this.values;
        let searchStrings: string[] | undefined;

        const { valueFormatter = (value => value), searchStringCreator } = this.config;

        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => valueFormatter(v));
        } else if (typeof values[0] === 'object' && searchStringCreator) {
            searchStrings = searchStringCreator(values);
        }

        if (!searchStrings) {
            return;
        }

        const topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];

        if (!topSuggestion) {
            return;
        }

        const topSuggestionIndex = searchStrings.indexOf(topSuggestion);

        this.selectListItem(topSuggestionIndex);
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    private selectListItem(index: number): void {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.values.length) { return; }

        this.listComponent.ensureIndexVisible(index);
        this.highlightSelectedValue(index);
    }

    public setValue(value: TValue, silent?: boolean, fromPicker?: boolean): this {
        const index = this.values.indexOf(value);

        if (index === -1) { return this; }

        this.value = value;

        if (!fromPicker) {
            this.selectListItem(index);
        }

        this.renderSelectedValue();

        return super.setValue(value, silent);
    }

    private createRowComponent(value: TValue): Component {
        const row = new RichSelectRow<TValue>(this.config, this.eWrapper);
        row.setParentComponent(this.listComponent!);

        this.getContext().createBean(row);
        row.setState(value, value === this.value);

        return row;
    }

    private getRowForMouseEvent(e: MouseEvent): number {
        const { listComponent } = this;

        if (!listComponent) { return  -1; }


        const eGui = listComponent?.getGui();
        const rect = eGui.getBoundingClientRect();
        const scrollTop = listComponent.getScrollTop();
        const mouseY = e.clientY - rect.top + scrollTop;

        return Math.floor(mouseY / listComponent.getRowHeight());
    }

    private onPickerMouseMove(e: MouseEvent): void {
        if (!this.listComponent) { return; }
        const row = this.getRowForMouseEvent(e);

        if (row !== -1) {
            this.selectListItem(row);
        }
    }

    private onNavigationKeyDown(event: any, key: string): void {
        // if we don't preventDefault the page body and/or grid scroll will move.
        event.preventDefault();

        const isDown = key === KeyCode.DOWN;

        if (!this.isPickerDisplayed && isDown) {
            this.showPicker();
            return;
        }

        const oldIndex = this.highlightedItem;

        const diff = isDown ? 1 : -1;
        const newIndex = oldIndex === - 1 ? 0 : oldIndex + diff;

        this.selectListItem(newIndex);
    }

    private onEnterKeyDown(e: KeyboardEvent): void {
        if (!this.isPickerDisplayed) { return; }
        e.preventDefault();

        this.onListValueSelected(this.values[this.highlightedItem], true);
    }

    private onListValueSelected(value: TValue, fromEnterKey: boolean): void {
        this.setValue(value, false, true);
        this.dispatchPickerEvent(value, fromEnterKey);
        this.hidePicker();
    }

    private dispatchPickerEvent(value: TValue, fromEnterKey: boolean): void {
        const event: WithoutGridCommon<FieldPickerValueSelectedEvent> = {
            type: Events.EVENT_FIELD_PICKER_VALUE_SELECTED,
            fromEnterKey,
            value
        };

        this.dispatchEvent(event);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                event.preventDefault();
                break;
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (this.isPickerDisplayed) {
                    this.hidePicker();
                }
                break;
            case KeyCode.ENTER:
                this.onEnterKeyDown(event);
                break;
            default:
                this.searchText(event);
        }
    }
}