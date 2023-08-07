import { UserCompDetails, UserComponentFactory } from "../components/framework/userComponentFactory";
import { KeyCode } from "../constants/keyCode";
import { Autowired } from "../context/context";
import { ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { AgPromise } from "../utils";
import { bindCellRendererToHtmlElement, clearElement } from "../utils/dom";
import { debounce } from "../utils/function";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { exists } from "../utils/generic";
import { isEventFromPrintableCharacter } from "../utils/keyboard";
import { AgPickerField, IPickerFieldParams } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { Component } from "./component";
import { VirtualList } from "./virtualList";

export type AgRichSelectValue = (object | string | number);

export interface IRichSelectParams extends IPickerFieldParams {
    value?: AgRichSelectValue;
    valueList?: AgRichSelectValue[]
    cellRenderer?: any;
    cellRowHeight?: number;
    valueFormatter?: (value: any) => any;
    searchStringCreator?: (values: AgRichSelectValue[]) => string[]
}

export class AgRichSelect extends AgPickerField<AgRichSelectValue, IRichSelectParams, VirtualList> {

    private searchString = '';
    private listComponent: VirtualList | undefined;
    private searchDebounceDelay: number;
    private values: AgRichSelectValue[];
    private highlightedItem: number = -1;
    private cellRowHeight: number;

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    constructor(config?: IRichSelectParams) {
        super({
            pickerAriaLabelKey: 'ariaLabelRichSelectField',
            pickerAriaLabelValue: 'Rich Select Field',
            pickerType: 'ag-list',
            ...config,
        }, 'ag-rich-select', 'smallDown', 'listbox');

        const { cellRowHeight, value, valueList } = config || {};

        if (cellRowHeight) {
            this.cellRowHeight = cellRowHeight;
        }

        if (value != null) {
            this.value = value;
        }

        if (valueList != null) {
            this.setValueList(valueList);
        }
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gridOptionsService.getNum('tabIndex') ?? 0;
        this.eWrapper.classList.add('ag-rich-select-value');

        const debounceDelay = exists(this.searchDebounceDelay) ? this.searchDebounceDelay : 300;
        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);

        this.renderSelectedValue();
    }

    private createListComponent(): void {
        this.listComponent = this.createManagedBean(new VirtualList({ cssIdentifier: 'rich-select' }))
        this.listComponent.getGui().classList.add('ag-rich-select-list');
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);

        if (this.cellRowHeight) {
            this.listComponent.setRowHeight(this.cellRowHeight);
        }

        const eListComponent = this.listComponent.getGui();

        this.addManagedListener(eListComponent, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(eListComponent, 'mousedown', e => e.preventDefault());
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

    public setValueList(valueList: (object | string | number)[]): void {
        this.values = valueList;
        this.highlightSelectedValue();
    }

    private highlightSelectedValue(): void {
        const { values, value } = this;

        if (value == null) { return; }

        for (let i = 0; i < values.length; i++) {
            if (values[i] === value) {
                this.highlightedItem = i;
                break;
            }
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

    protected getPickerComponent(): VirtualList {
        const { values }  = this;

        this.listComponent!.setModel({
            getRowCount: () => values.length,
            getRow: (index: number) => values[index]
        });

        return this.listComponent!;
    }

    public showPicker() {
        super.showPicker();
        this.highlightSelectedValue();
        this.listComponent!.refresh();
    }

    protected beforeHidePicker(): void {
        this.highlightedItem = -1;
        super.beforeHidePicker();
    }

    public searchText(key: KeyboardEvent | string) {
        if (typeof key !== 'string') {
            key.preventDefault();
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

        this.highlightedItem = index;
        this.listComponent.ensureIndexVisible(index);

        this.listComponent.forEachRenderedRow((cmp: RichSelectRow, idx: number) => {
            cmp.updateHighlighted(index === idx);
        });
    }

    public setValue(value: AgRichSelectValue, silent?: boolean, fromPicker?: boolean): this {
        const index = this.values.indexOf(value);

        if (index === -1) { return this; }

        this.value = value;

        if (!fromPicker) {
            this.selectListItem(index);
        }

        this.renderSelectedValue();

        return super.setValue(value, silent, fromPicker);
    }

    private createRowComponent(value: any): Component {
        const row = new RichSelectRow(this.config);
        row.setParentComponent(this);

        this.getContext().createBean(row);
        row.setState(value, value === this.value);

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
        if (!this.listComponent) { return; }

        const rect = this.listComponent.getGui().getBoundingClientRect();
        const scrollTop = this.listComponent.getScrollTop();
        const mouseY = mouseEvent.clientY - rect.top + scrollTop;
        const row = Math.floor(mouseY / this.listComponent.getRowHeight());

        this.selectListItem(row);
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
        this.setValue(this.values[this.highlightedItem], false, true);
        this.hidePicker();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const key = event.key;

        switch (key) {
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