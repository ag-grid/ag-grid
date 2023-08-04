import { UserCompDetails } from "../components/framework/userComponentFactory";
import { KeyCode } from "../constants/keyCode";
import { Autowired } from "../context/context";
import { AgPromise } from "../utils";
import { setAriaExpanded } from "../utils/aria";
import { bindCellRendererToHtmlElement, clearElement, getAbsoluteWidth, getInnerHeight, setElementWidth } from "../utils/dom";
import { debounce } from "../utils/function";
import { fuzzySuggestions } from "../utils/fuzzyMatch";
import { exists } from "../utils/generic";
import { isEventFromPrintableCharacter } from "../utils/keyboard";
import { IAgLabel } from "./agAbstractLabel";
import { AgPickerField } from "./agPickerField";
import { RichSelectRow } from "./agRichSelectRow";
import { Component } from "./component";
import { PopupService } from "./popupService";
import { VirtualList } from "./virtualList";

export type AgRichSelectValue = (object | string | number);

interface IRichSelectParams extends IAgLabel {
    valueList?: AgRichSelectValue[]
    userCompDetails?: UserCompDetails;
    valueFormatter?: (value: any) => any;
    searchStringCreator?: (values: AgRichSelectValue[]) => string[]
}

export class AgRichSelect extends AgPickerField<HTMLSelectElement, string> {

    private searchString = '';
    private listComponent: VirtualList;
    private searchDebounceDelay: number;
    private values: AgRichSelectValue[];
    private userCompDetails: UserCompDetails | undefined;
    private valueFormatter: (value: any) => any;
    private searchStringCreator: ((values: AgRichSelectValue[]) => string[]) | undefined;
    private hideList: ((event?: any) => void) | null;
    private highlightedItem: number = -1;

    @Autowired('popupService') private popupService: PopupService;

    constructor(config?: IRichSelectParams) {
        super(config, 'ag-rich-select', 'smallDown', 'listbox');

        if (!config) {
            this.valueFormatter = value => value;
            return;
        }

        const { userCompDetails, valueFormatter, searchStringCreator, valueList } = config;
        this.userCompDetails = userCompDetails;

        if (valueFormatter) {
            this.valueFormatter = this.valueFormatter;
        }

        if (searchStringCreator) {
            this.searchStringCreator = searchStringCreator
        }

        if (valueList) {
            this.setValueList(valueList);
        }
    }

    protected postConstruct(): void {
        super.postConstruct();
        this.createListComponent();
        this.eWrapper.tabIndex = this.gridOptionsService.getNum('tabIndex') ?? 0;

        const debounceDelay = exists(this.searchDebounceDelay) ? this.searchDebounceDelay : 300;
        this.clearSearchString = debounce(this.clearSearchString, debounceDelay);

        this.renderSelectedValue();
    }

    private createListComponent(): void {
        this.listComponent = this.createManagedBean(new VirtualList({ cssIdentifier: 'rich-select' }));
        this.listComponent.getGui().classList.add('ag-rich-select-list');
        this.listComponent.setComponentCreator(this.createRowComponent.bind(this));
        this.listComponent.setParentComponent(this);

        const eListComponent = this.listComponent.getGui();

        this.addManagedListener(eListComponent, 'mousemove', this.onMouseMove.bind(this));
        this.addManagedListener(eListComponent, 'mousedown', e => e.preventDefault());
    }

    private renderSelectedValue(): void {
        const { value, eDisplayField } = this;

        let userCompDetailsPromise: AgPromise<any> | undefined;

        if (this.userCompDetails) {
            userCompDetailsPromise = this.userCompDetails.newAgStackInstance();
        }

        if (userCompDetailsPromise) {
            bindCellRendererToHtmlElement(userCompDetailsPromise, eDisplayField);
            userCompDetailsPromise.then(renderer => {
                this.addDestroyFunc(() => this.getContext().destroyBean(renderer));
            });
        } else {
            if (exists(this.value)) {
                eDisplayField.innerText = value;
            } else {
                clearElement(eDisplayField);
            }
        }
    }

    public setValueList(valueList: (object | string | number)[]): void {
        this.values = valueList;
    }

    public setRowHeight(height: number): void {
        this.listComponent.setRowHeight(height);
    }

    public showPicker(): Component {
        const { values }  = this;

        this.listComponent.setModel({
            getRowCount: () => values.length,
            getRow: (index: number) => values[index]
        });

        const listGui = this.listComponent.getGui();
        const eDocument = this.gridOptionsService.getDocument();

        const destroyMouseWheelFunc = this.addManagedListener(eDocument.body, 'wheel', (e: MouseEvent) => {
            if (!listGui.contains(e.target as HTMLElement) && this.hideList) {
                this.hideList();
            }
        });

        const translate = this.localeService.getLocaleTextFunc();

        this.listComponent.refresh();

        const addPopupRes = this.popupService.addPopup({
            modal: true,
            eChild: listGui,
            closeOnEsc: true,
            closedCallback: () => {
                this.hideList = null;
                this.highlightedItem = -1;
                this.isPickerDisplayed = false;
                destroyMouseWheelFunc!();

                if (this.isAlive()) {
                    setAriaExpanded(this.eWrapper, false);
                    this.getFocusableElement().focus();
                }
            },
            ariaLabel: translate('ariaLabelSelectField', 'Select Field')
        });

        if (addPopupRes) {
            this.hideList = addPopupRes.hideFunc;
        }
        this.isPickerDisplayed = true;

        setElementWidth(listGui, getAbsoluteWidth(this.eWrapper));
        setAriaExpanded(this.eWrapper, true);

        listGui.style.maxHeight = getInnerHeight(this.popupService.getPopupParent()) + 'px';
        listGui.style.position = 'absolute';

        this.popupService.positionPopupByComponent({
            type: 'ag-list',
            eventSource: this.eWrapper,
            ePopup: listGui,
            position: 'under',
            keepWithinBounds: true
        });

        return this.listComponent;
    }

    public searchText(key: KeyboardEvent | string) {
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

    private runSearch() {
        const values = this.values;
        let searchStrings: string[] | undefined;

        if (typeof values[0] === 'number' || typeof values[0] === 'string') {
            searchStrings = values.map(v => this.valueFormatter(v));
        }

        if (typeof values[0] === 'object' && this.searchStringCreator) {
            searchStrings = this.searchStringCreator(values);
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
        if (!this.isPickerDisplayed || index < 0 || index >= this.values.length) { return; }

        this.highlightedItem = index;
        this.listComponent.ensureIndexVisible(index);

        this.listComponent.forEachRenderedRow((cmp: RichSelectRow, idx: number) => {
            cmp.updateHighlighted(index === idx);
        });
    }

    public setValue(value?: any, silent?: boolean, fromPicker?: boolean): this {
        if (this.value === value) { return this; }

        const index = this.values.indexOf(value);

        if (index === -1) { return this; }

        this.value = value;

        if (fromPicker && this.hideList) {
            this.hideList();
        } else {
            this.selectListItem(index);
        }

        this.renderSelectedValue();

        return super.setValue(value, silent);
    }

    private createRowComponent(value: any): Component {
        const displayValue = this.valueFormatter(value);
        const row = new RichSelectRow();
        row.setParentComponent(this);

        this.getContext().createBean(row);
        row.setState(value, displayValue, value === this.value);

        return row;
    }

    private onMouseMove(mouseEvent: MouseEvent): void {
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

    private onEnterKeyDown(): void {
        if (!this.isPickerDisplayed) { return; }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        event.preventDefault();

        switch (key) {
            case KeyCode.DOWN:
            case KeyCode.UP:
                this.onNavigationKeyDown(event, key);
                break;
            case KeyCode.ESCAPE:
                if (this.hideList) {
                    this.hideList();
                    this.hideList = null;
                }
                break;
            case KeyCode.ENTER:
                this.onEnterKeyDown();
                break;
            default:
                this.searchText(event);
        }
    }
}