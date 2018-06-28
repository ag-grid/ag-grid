import {Autowired} from "../context/context";
import {SerializedTextFilter} from "./textFilter";
import {DateFilter, SerializedDateFilter} from "./dateFilter";
import {SerializedNumberFilter} from "./numberFilter";
import {IComponent} from "../interfaces/iComponent";
import {RefSelector} from "../widgets/componentAnnotations";
import {_, Promise} from "../utils";
import {IDateComp, IDateParams} from "../rendering/dateComponent";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {Component} from "../widgets/component";
import {Constants} from "../constants";
import {Column} from "../entities/column";
import {GridApi} from "../gridApi";
import {SerializedSetFilter} from "../interfaces/iSerializedSetFilter";
import {CombinedFilter} from "./baseFilter";

export interface FloatingFilterChange {
}

export interface IFloatingFilterParams<M, F extends FloatingFilterChange> {
    column: Column;
    onFloatingFilterChanged: (change: F | M) => boolean;
    currentParentModel: () => M;
    suppressFilterButton: boolean;
    debounceMs?: number;
    api: GridApi;
}

export interface IFloatingFilter<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> {
    onParentModelChanged(parentModel: M, combinedModel?:CombinedFilter<M>): void;
}

export interface IFloatingFilterComp<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> extends IFloatingFilter<M, F, P>, IComponent<P> {
}

export interface BaseFloatingFilterChange<M> extends FloatingFilterChange {
    model: M;
    apply: boolean;
}

export abstract class InputTextFloatingFilterComp<M, P extends IFloatingFilterParams<M, BaseFloatingFilterChange<M>>> extends Component implements IFloatingFilter <M, BaseFloatingFilterChange<M>, P> {
    @RefSelector('eColumnFloatingFilter')
    eColumnFloatingFilter: HTMLInputElement;

    onFloatingFilterChanged: (change: BaseFloatingFilterChange<M>) => boolean;
    currentParentModel: () => M;
    lastKnownModel: M = null;

    constructor() {
        super(`<div><input ref="eColumnFloatingFilter" class="ag-floating-filter-input"></div>`);
    }

    init(params: P): void {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        let debounceMs: number = params.debounceMs != null ? params.debounceMs : 500;
        let toDebounce: () => void = _.debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'input', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keypress', toDebounce);
        this.addDestroyableEventListener(this.eColumnFloatingFilter, 'keydown', toDebounce);
        let columnDef = (<any>params.column.getDefinition());
        if (columnDef.filterParams && columnDef.filterParams.filterOptions && columnDef.filterParams.filterOptions.length === 1 && columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eColumnFloatingFilter.disabled = true;
        }

    }

    abstract asParentModel(): M;

    abstract asFloatingFilterText(parentModel: M): string;
    abstract parseAsText(model: M): string;

    onParentModelChanged(parentModel: M,combinedFilter?: CombinedFilter<M>): void {
        if (combinedFilter!=null) {
            this.eColumnFloatingFilter.value = `${this.parseAsText(combinedFilter.condition1)} ${combinedFilter.operator} ${this.parseAsText(combinedFilter.condition2)}`;
            this.eColumnFloatingFilter.disabled = true;
            this.lastKnownModel = null;
            this.eColumnFloatingFilter.title = this.eColumnFloatingFilter.value;
            this.eColumnFloatingFilter.style.cursor = 'default';
            return;
        } else {
            this.eColumnFloatingFilter.disabled = false;
        }

        if (this.equalModels(this.lastKnownModel, parentModel)) {
            // ensure column floating filter text is blanked out when both ranges are empty
            if(!this.lastKnownModel && !parentModel) {
                this.eColumnFloatingFilter.value = '';
            }
            return;
        }
        this.lastKnownModel = parentModel;
        let incomingTextValue = this.asFloatingFilterText(parentModel);
        if (incomingTextValue === this.eColumnFloatingFilter.value) { return; }

        this.eColumnFloatingFilter.value = incomingTextValue;
        this.eColumnFloatingFilter.title = ''
    }

    syncUpWithParentFilter(e: KeyboardEvent): void {
        let model = this.asParentModel();
        if (this.equalModels(this.lastKnownModel, model)) { return; }

        let modelUpdated: boolean = null;
        if (_.isKeyPressed(e, Constants.KEY_ENTER)) {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: true
            });
        } else {
            modelUpdated = this.onFloatingFilterChanged({
                model: model,
                apply: false
            });
        }

        if (modelUpdated) {
            this.lastKnownModel = model;
        }
    }

    equalModels(left: any, right: any): boolean {
        if (_.referenceCompare(left, right)) { return true; }
        if (!left || !right) { return false; }

        if (Array.isArray(left) || Array.isArray(right)) { return false; }

        return (
            _.referenceCompare(left.type, right.type) &&
            _.referenceCompare(left.filter, right.filter) &&
            _.referenceCompare(left.filterTo, right.filterTo) &&
            _.referenceCompare(left.filterType, right.filterType)
        );
    }
}

export class TextFloatingFilterComp extends InputTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter, BaseFloatingFilterChange<SerializedTextFilter>>> {
    asFloatingFilterText(parentModel: SerializedTextFilter): string {
        if (!parentModel) { return ''; }
        return parentModel.filter;
    }

    asParentModel(): SerializedTextFilter {
        let currentParentModel = this.currentParentModel();
        return {
            type: currentParentModel.type,
            filter: this.eColumnFloatingFilter.value,
            filterType: 'text'
        };
    }

    parseAsText(model: SerializedTextFilter): string {
        return this.asFloatingFilterText(model);
    }
}

export class DateFloatingFilterComp extends Component implements IFloatingFilter <SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>, IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>> {
    @Autowired('componentRecipes')
    private componentRecipes: ComponentRecipes;
    private dateComponentPromise: Promise<IDateComp>;

    onFloatingFilterChanged: (change: BaseFloatingFilterChange<SerializedDateFilter>) => void;
    currentParentModel: () => SerializedDateFilter;
    lastKnownModel: SerializedDateFilter = null;

    init(params: IFloatingFilterParams<SerializedDateFilter, BaseFloatingFilterChange<SerializedDateFilter>>) {
        this.onFloatingFilterChanged = params.onFloatingFilterChanged;
        this.currentParentModel = params.currentParentModel;
        let debounceMs: number = params.debounceMs != null ? params.debounceMs : 500;
        let toDebounce: () => void = _.debounce(this.onDateChanged.bind(this), debounceMs);
        let dateComponentParams: IDateParams = {
            onDateChanged: toDebounce,
            filterParams: params.column.getColDef().filterParams
        };
        this.dateComponentPromise = this.componentRecipes.newDateComponent(dateComponentParams);

        let body: HTMLElement = _.loadTemplate(`<div></div>`);
        this.dateComponentPromise.then(dateComponent=> {
            body.appendChild(dateComponent.getGui());

            const columnDef = (<any>params.column.getDefinition());
            const isInRange = (columnDef.filterParams &&
                columnDef.filterParams.filterOptions &&
                columnDef.filterParams.filterOptions.length === 1 &&
                columnDef.filterParams.filterOptions[0] === 'inRange');

            if(dateComponent.eDateInput) {
                dateComponent.eDateInput.disabled = isInRange;
            }
        });
        this.setTemplateFromElement(body);
        }

    private onDateChanged(): void {
        let parentModel: SerializedDateFilter = this.currentParentModel();
        let model = this.asParentModel();

        if (this.equalModels(parentModel, model)) { return; }

        this.onFloatingFilterChanged({
            model: model,
            apply: true
        });

        this.lastKnownModel = model;
    }

    equalModels(left: SerializedDateFilter, right: SerializedDateFilter): boolean {
        if (_.referenceCompare(left, right)) { return true; }
        if (!left || !right) { return false; }

        if (Array.isArray(left) || Array.isArray(right)) { return false; }

        return (
            _.referenceCompare(left.type, right.type) &&
            _.referenceCompare(left.dateFrom, right.dateFrom) &&
            _.referenceCompare(left.dateTo, right.dateTo) &&
            _.referenceCompare(left.filterType, right.filterType)
        );
    }

    asParentModel(): SerializedDateFilter {
        let currentParentModel = this.currentParentModel();
        let filterValueDate: Date = this.dateComponentPromise.resolveNow(null, dateComponent=>dateComponent.getDate());
        let filterValueText: string = _.serializeDateToYyyyMmDd(DateFilter.removeTimezone(filterValueDate), "-");

        return {
            type: currentParentModel.type,
            dateFrom: filterValueText,
            dateTo: currentParentModel ? currentParentModel.dateTo : null,
            filterType: 'date'
        };
    }

    onParentModelChanged(parentModel: SerializedDateFilter): void {
        this.lastKnownModel = parentModel;
        this.dateComponentPromise.then(dateComponent=> {
            if (!parentModel || !parentModel.dateFrom) {
                dateComponent.setDate(null);
                return;
            }

            this.enrichDateInput(parentModel.type,
                parentModel.dateFrom,
                parentModel.dateTo,
                dateComponent);

            dateComponent.setDate(_.parseYyyyMmDdToDate(parentModel.dateFrom, '-'));
        });
    }

    private enrichDateInput(type: string,
                            dateFrom: string,
                            dateTo: string,
                            dateComponent: any) {
        if (dateComponent.eDateInput) {
            if (type === 'inRange') {
                dateComponent.eDateInput.title = `${dateFrom} to ${dateTo}`;
                dateComponent.eDateInput.disabled = true;
            } else {
                dateComponent.eDateInput.title = '';
                dateComponent.eDateInput.disabled = true;
            }
        }
    }
}

export class NumberFloatingFilterComp extends InputTextFloatingFilterComp<SerializedNumberFilter, IFloatingFilterParams<SerializedNumberFilter, BaseFloatingFilterChange<SerializedNumberFilter>>> {

    asFloatingFilterText(toParse: SerializedNumberFilter): string {
        let currentParentModel = this.currentParentModel();
        if (toParse == null && currentParentModel == null) { return ''; }
        if (toParse == null && currentParentModel != null && currentParentModel.type !== 'inRange') {
            this.eColumnFloatingFilter.disabled = false;
            return '';
        }

        if (currentParentModel != null && currentParentModel.type === 'inRange') {
            this.eColumnFloatingFilter.disabled = true;
            return this.parseAsText(currentParentModel);
        }

        this.eColumnFloatingFilter.disabled = false;
        return this.parseAsText(toParse);

    }

    parseAsText(model: SerializedNumberFilter): string {
        if (model.type && model.type === 'inRange'){
            let number: number = this.asNumber(model.filter);
            let numberTo: number = this.asNumber(model.filterTo);
            return (number ? number + '' : '') +
                '-' +
                (numberTo ? numberTo + '' : '');
        }

        let number: number = this.asNumber(model.filter);
        return number != null ? number + '' : '';
    }

    asParentModel(): SerializedNumberFilter {
        let currentParentModel = this.currentParentModel();
        let filterValueNumber = this.asNumber(this.eColumnFloatingFilter.value);
        let filterValueText: string = this.eColumnFloatingFilter.value;

        let modelFilterValue: number = null;
        if (filterValueNumber == null && filterValueText === '') {
            modelFilterValue = null;
        } else if (filterValueNumber == null) {
            modelFilterValue = currentParentModel.filter;
        } else {
            modelFilterValue = filterValueNumber;
        }

        return {
            type: currentParentModel.type,
            filter: modelFilterValue,
            filterTo: !currentParentModel ? null : currentParentModel.filterTo,
            filterType: 'number'
        };
    }

    private asNumber(value: any): number {
        if (value == null) { return null; }
        if (value === '') { return null; }

        let asNumber = Number(value);
        let invalidNumber = !_.isNumeric(asNumber);
        return invalidNumber ? null : asNumber;
    }
}

export class SetFloatingFilterComp extends InputTextFloatingFilterComp<SerializedSetFilter, IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>> {
    init(params: IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    asFloatingFilterText(parentModel: string[] | SerializedSetFilter): string {
        this.eColumnFloatingFilter.disabled = true;
        if(!parentModel) return '';

        // also supporting old filter model for backwards compatibility
        let values: string[] = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (values.length === 0) { return ''; }

        let arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        return `(${values.length}) ${arrayToDisplay.join(",")}`;
    }

    parseAsText(model: SerializedSetFilter): string {
        return this.asFloatingFilterText(model);
    }

    asParentModel(): SerializedSetFilter {
        if (this.eColumnFloatingFilter.value == null || this.eColumnFloatingFilter.value === '') {
            return {
                values: [],
                filterType: 'set'
            };
        }
        return {
            values: this.eColumnFloatingFilter.value.split(","),
            filterType: 'set'
        }
    }

    equalModels(left: SerializedSetFilter, right: SerializedSetFilter): boolean {
        return false;
    }
}

export class ReadModelAsStringFloatingFilterComp extends InputTextFloatingFilterComp<string, IFloatingFilterParams<string, BaseFloatingFilterChange<string>>> {
    init(params: IFloatingFilterParams<string, BaseFloatingFilterChange<string>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    onParentModelChanged(parentModel: any): void {
        this.eColumnFloatingFilter.value = this.asFloatingFilterText(this.currentParentModel());
    }

    asFloatingFilterText(parentModel: string): string {
        return parentModel;
    }

    parseAsText(model: string): string {
        return model;
    }

    asParentModel(): string {
        return null;
    }
}