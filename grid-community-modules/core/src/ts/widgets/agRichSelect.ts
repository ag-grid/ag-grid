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
import { AgInputTextField } from "./agInputTextField";
import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { VirtualList } from "./virtualList";

export interface RichSelectParams<TValue = any> extends IPickerFieldParams {
    value?: TValue;
    valueList?: TValue[]
    allowTyping?: boolean;
    cellRenderer?: any;
    cellRowHeight?: number;
    searchDebounceDelay?: number;

    filterList?: boolean;
    searchType?: 'match' | 'fuzzy';

    valueFormatter?: (value: TValue) => any;
    searchStringCreator?: (values: TValue[]) => string[]
}

const TEMPLATE = /* html */`
    <div class="ag-picker-field" role="presentation">
        <div ref="eLabel"></div>
            <div ref="eWrapper" class="ag-wrapper ag-picker-field-wrapper ag-picker-collapsed">
            <div ref="eDisplayField" class="ag-picker-field-display"></div>
            <ag-input-text-field ref="eInput" class="ag-rich-select-field-input"></ag-input-text-field>
            <div ref="eIcon" class="ag-picker-field-icon" aria-hidden="true"></div>
        </div>
    </div>`;

export class AgRichSelect<TValue = any> extends AgPickerField<TValue, RichSelectParams<TValue>, VirtualList> {

    private searchString = '';
    private listComponent: VirtualList | undefined;
    private searchDebounceDelay: number;
    private values: TValue[];
    private highlightedItem: number = -1;
    private cellRowHeight: number;
    private isAllowTyping: boolean = false;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @RefSelector('eInput') private eInput: AgInputTextField;
    

    constructor(config?: RichSelectParams<TValue>) {
        super({
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            className: 'ag-rich-select',
            pickerIcon: 'smallDown',
            ariaRole: 'combobox',
            template: TEMPLATE,
            modalPicker: false,
            ...config,
            // maxPickerHeight needs to be set after expanding `config`
            maxPickerHeight: config?.maxPickerHeight ?? 'calc(var(--ag-row-height) * 6.5)',
        });

        const { cellRowHeight, value, valueList, searchDebounceDelay, allowTyping } = config || {};

        if (allowTyping) {
            this.isAllowTyping = true;
        }

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

        if (this.isAllowTyping) {
            this.eDisplayField.classList.add('ag-hidden');
        } else {
            this.eInput.setDisplayed(false);
        }

        this.eWrapper.tabIndex = this.gridOptionsService.getNum('tabIndex') ?? 0;
        this.eWrapper.classList.add('ag-rich-select-value');

        const debounceDelay = this.searchDebounceDelay ?? 300;
        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);

        this.renderSelectedValue();

        if (this.isAllowTyping) {
            this.eInput.onValueChange(value => this.searchTextFromString(value));
            this.addManagedListener(this.eWrapper, 'focus', this.onWrapperFocus.bind(this));
        }
        this.addManagedListener(this.eWrapper, 'focusout', this.onWrapperFocusOut.bind(this));

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

        if (this.isAllowTyping) {
            this.eInput.setValue(valueFormatted);
            return;
        }

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

        this.highlightedItem = index;

        if (this.listComponent) {
            this.listComponent.forEachRenderedRow((cmp: RichSelectRow<TValue>, idx: number) => {
                const highlighted = index === -1 ? false : this.highlightedItem === idx;
                cmp.updateHighlighted(highlighted);
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

        if (!this.listComponent) { return; }

        if (currentValueIndex !== -1) {
            // make sure the virtual list has been sized correctly
            this.listComponent.refresh();
            this.listComponent.ensureIndexVisible(currentValueIndex);
            // this second call to refresh is necessary to force scrolled elements
            // to be rendered with the correct index info.
            this.listComponent.refresh(true);
            this.highlightSelectedValue(currentValueIndex);
        } else {
            this.listComponent.refresh();
        }
    }

    protected beforeHidePicker(): void {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }

    private onWrapperFocus(e: FocusEvent): void {
        if (this.eInput) {
            this.eInput.getFocusableElement().focus();
        }
    }

    private onWrapperFocusOut(e: FocusEvent): void {
        if (!this.eWrapper.contains(e.relatedTarget as Element)) {
            // this.hidePicker();
        }
    }

    private buildSearchStringFromKeyboardEvent(searchKey: KeyboardEvent) {
        let { key } = searchKey;

        if (key === KeyCode.BACKSPACE) {
            this.searchString = this.searchString.slice(0, -1);
            key = '';
        } else if (!isEventFromPrintableCharacter(searchKey)) {
            return;
        }

        searchKey.preventDefault();

        this.searchTextFromCharacter(key);
    }

    private searchTextFromCharacter(char: string): void {
        this.searchString += char;
        this.runSearch();
        this.clearSearchString();
    }

    public searchTextFromString(str: string | null | undefined): void {
        if (str == null) { str = ''; }
        this.searchString = str;
        this.runSearch();
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
            this.highlightSelectedValue(-1);
            return;
        }

        if (searchStrings) {
            let topSuggestion: string;

            if (this.config.searchType === 'fuzzy') {
                topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];
            } else {
                topSuggestion = fuzzySuggestions(this.searchString, searchStrings, true)[0];
            }
            
            if (topSuggestion) {
                const topSuggestionIndex = searchStrings.indexOf(topSuggestion);
                this.selectListItem(topSuggestionIndex);
                return;
            }
        }

        // no suggestion found
        this.highlightSelectedValue(-1);
        this.listComponent?.ensureIndexVisible(0);
    }

    private clearSearchString(): void {
        this.searchString = '';
    }

    private selectListItem(index: number, preventUnnecessaryScroll?: boolean): void {
        if (!this.isPickerDisplayed || !this.listComponent || index < 0 || index >= this.values.length) { return; }

        this.listComponent.ensureIndexVisible(index, !preventUnnecessaryScroll);
        this.listComponent.refresh(true);
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
        row.setState(value);

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
            this.selectListItem(row, true);
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

    public getFocusableElement(): HTMLElement {
        if (this.isAllowTyping) {
            return this.eInput.getFocusableElement();
        }

        return super.getFocusableElement();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        switch (key) {
            case KeyCode.LEFT:
            case KeyCode.RIGHT:
                if (!this.isAllowTyping) {
                    event.preventDefault();
                }
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
                if (!this.isAllowTyping) {
                    this.buildSearchStringFromKeyboardEvent(event);
                }
        }
    }

}