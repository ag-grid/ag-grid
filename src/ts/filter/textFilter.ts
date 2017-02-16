import {Utils as _} from "../utils";
import {IFilterParams, IDoesFilterPassParams, IFilterComp} from "../interfaces/iFilter";
import {Autowired} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export class TextFilter implements IFilterComp {

    public static CONTAINS = 'contains';//1;
    public static NOT_CONTAINS = 'notContains';//1;
    public static EQUALS = 'equals';//2;
    public static NOT_EQUALS = 'notEquals';//3;
    public static STARTS_WITH = 'startsWith';//4;
    public static ENDS_WITH = 'endsWith';//5;

    private filterParams: IFilterParams;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private filterText: string;
    private filterType: string;

    private applyActive: boolean;
    private newRowsActionKeep: boolean;

    private eGui: HTMLElement;
    private eFilterTextField: HTMLInputElement;
    private eTypeSelect: HTMLSelectElement;
    private eApplyButton: HTMLButtonElement;

    public init(params: IFilterParams): void {
        this.filterParams = params;
        this.applyActive = (<any>params).apply === true;
        this.newRowsActionKeep = (<any>params).newRowsAction === 'keep';

        this.filterText = null;
        this.filterType = TextFilter.CONTAINS;

        this.createGui();
    }

    public onNewRowsLoaded() {
        if (!this.newRowsActionKeep) {
            this.setType(TextFilter.CONTAINS);
            this.setFilter(null);
        }
    }

    public afterGuiAttached() {
        this.eFilterTextField.focus();
    }

    public doesFilterPass(params: IDoesFilterPassParams) {
        if (!this.filterText) {
            return true;
        }
        var value = this.filterParams.valueGetter(params.node);
        if (!value) {
            if (this.filterType === TextFilter.NOT_EQUALS) {
                // if there is no value, but the filter type was 'not equals',
                // then it should pass, as a missing value is not equal whatever
                // the user is filtering on
                return true;
            } else {
                // otherwise it's some type of comparison, to which empty value
                // will always fail
                return false;
            }
        }
        var filterTextLoweCase = this.filterText.toLowerCase();
        var valueLowerCase = value.toString().toLowerCase();
        switch (this.filterType) {
            case TextFilter.CONTAINS:
                return valueLowerCase.indexOf(filterTextLoweCase) >= 0;
            case TextFilter.NOT_CONTAINS:
                return valueLowerCase.indexOf(filterTextLoweCase) === -1;
            case TextFilter.EQUALS:
                return valueLowerCase === filterTextLoweCase;
            case TextFilter.NOT_EQUALS:
                return valueLowerCase != filterTextLoweCase;
            case TextFilter.STARTS_WITH:
                return valueLowerCase.indexOf(filterTextLoweCase) === 0;
            case TextFilter.ENDS_WITH:
                var index = valueLowerCase.lastIndexOf(filterTextLoweCase);
                return index >= 0 && index === (valueLowerCase.length - filterTextLoweCase.length);
            default:
                // should never happen
                console.warn('invalid filter type ' + this.filterType);
                return false;
        }
    }

    public getGui() {
        return this.eGui;
    }

    public isFilterActive() {
        return this.filterText !== null;
    }

    private createTemplate() {
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();

        return `<div>
                    <div>
                        <select class="ag-filter-select" id="filterType">
                        <option value="${TextFilter.CONTAINS}">${translate('contains', 'Contains')}</option>
                        <option value="${TextFilter.NOT_CONTAINS}">${translate('notContains', 'Not contains')}</option>
                        <option value="${TextFilter.EQUALS}">${translate('equals', 'Equals')}</option>
                        <option value="${TextFilter.NOT_EQUALS}">${translate('notEquals', 'Not equals')}</option>
                        <option value="${TextFilter.STARTS_WITH}">${translate('startsWith', 'Starts with')}</option>
                        <option value="${TextFilter.ENDS_WITH}">${translate('endsWith', 'Ends with')}</option>
                        </select>
                    </div>
                    <div>
                        <input class="ag-filter-filter" id="filterText" type="text" placeholder="${translate('filterOoo', 'Filter...')}"/>
                    </div>
                    <div class="ag-filter-apply-panel" id="applyPanel">
                        <button type="button" id="applyButton">${translate('applyFilter', 'Apply Filter')}</button>
                    </div>
                </div>`;
    }

    private createGui() {
        this.eGui = _.loadTemplate(this.createTemplate());
        this.eFilterTextField = <HTMLInputElement> this.eGui.querySelector("#filterText");
        this.eTypeSelect = <HTMLSelectElement> this.eGui.querySelector("#filterType");

        _.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
        this.setupApply();
    }

    private setupApply() {
        if (this.applyActive) {
            this.eApplyButton = <HTMLInputElement> this.eGui.querySelector('#applyButton');
            this.eApplyButton.addEventListener('click', () => {
                this.filterParams.filterChangedCallback();
            });
        } else {
            _.removeElement(this.eGui, '#applyPanel');
        }
    }

    private onTypeChanged() {
        this.filterType = this.eTypeSelect.value;
        this.filterChanged();
    }

    private onFilterChanged() {
        var filterText = _.makeNull(this.eFilterTextField.value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }

        if (this.filterText !== filterText) {
            let newLowerCase = filterText ? filterText.toLowerCase() : null;
            let previousLowerCase = this.filterText ? this.filterText.toLowerCase() : null;
            this.filterText = filterText;
            if (previousLowerCase !== newLowerCase) {
                this.filterChanged();
            }
        }
    }

    private filterChanged() {
        this.filterParams.filterModifiedCallback();
        if (!this.applyActive) {
            this.filterParams.filterChangedCallback();
        }
    }

    public setType(type: string): void {
        this.filterType = type;
        this.eTypeSelect.value = type;
    }

    public setFilter(filter: string): void {
        filter = _.makeNull(filter);

        if (filter) {
            this.filterText = filter;
            this.eFilterTextField.value = filter;
        } else {
            this.filterText = null;
            this.eFilterTextField.value = null;
        }
    }

    public getType(): string {
        return this.filterType;
    }

    public getFilter(): string {
        return this.filterText;
    }

    public getModel(): any {
        if (this.isFilterActive()) {
            return {
                type: this.filterType,
                filter: this.filterText
            };
        } else {
            return null;
        }
    }

    public setModel(model: any): void {
        if (model) {
            this.setType(model.type);
            this.setFilter(model.filter);
        } else {
            this.setFilter(null);
        }
    }

}
