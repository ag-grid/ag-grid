import { SerializedFilter } from "../interfaces/iFilter";
import { Component } from "../widgets/component";
import { IDateComp, IDateParams } from "../rendering/dateComponent";
import { QuerySelector } from "../widgets/componentAnnotations";
import { BaseFilter, Comparator, FilterConditionType, IComparableFilterParams, ScalarBaseFilter } from "./baseFilter";
import { Autowired } from "../context/context";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { _ } from "../utils";

export interface IDateFilterParams extends IComparableFilterParams {
    comparator?: IDateComparatorFunc;
    browserDatePicker?: boolean;
}

export interface IDateComparatorFunc {
    (filterLocalDateAtMidnight: Date, cellValue: any): number;
}

export interface SerializedDateFilter extends SerializedFilter {
    dateFrom: string;
    dateTo: string;
    type: string;
}

export class DateFilter extends ScalarBaseFilter<Date, IDateFilterParams, SerializedDateFilter> {
    private dateToComponent: IDateComp;
    private dateFromComponent: IDateComp;

    private dateToConditionComponent: IDateComp;
    private dateFromConditionComponent: IDateComp;

    @Autowired('userComponentFactory')
    private userComponentFactory: UserComponentFactory;

    @QuerySelector('#filterDateFromPanel')
    private eDateFromPanel: HTMLElement;

    @QuerySelector('#filterDateFromConditionPanel')
    private eDateFromConditionPanel: HTMLElement;

    @QuerySelector('#filterDateToPanel')
    private eDateToPanel: HTMLElement;

    @QuerySelector('#filterDateToConditionPanel')
    private eDateToConditionPanel: HTMLElement;

    private dateFrom: Date;
    private dateTo: Date;
    private dateFromCondition: Date;
    private dateToCondition: Date;

    public modelFromFloatingFilter(from: string): SerializedDateFilter {
        return {
            dateFrom: from,
            dateTo: this.getDateTo(),
            type: this.selectedFilter,
            filterType: 'date'
        };
    }

    public getApplicableFilterTypes(): string[] {
        return [BaseFilter.EQUALS, BaseFilter.GREATER_THAN, BaseFilter.LESS_THAN, BaseFilter.NOT_EQUAL, BaseFilter.IN_RANGE];
    }

    public bodyTemplate(type:FilterConditionType): string {
        const fromPanelId = type == FilterConditionType.MAIN ? "filterDateFromPanel" : "filterDateFromConditionPanel";
        const toPanelId = type == FilterConditionType.MAIN ? "filterDateToPanel" : "filterDateToConditionPanel";

        return `<div class="ag-filter-body">
                    <div class="ag-filter-date-from" id="${fromPanelId}">
                    </div>
                    <div class="ag-filter-date-to" id="${toPanelId}">
                    </div>
                </div>`;
    }

    public initialiseFilterBodyUi(type:FilterConditionType): void {
        super.initialiseFilterBodyUi(type);
        this.createComponents(type);

        if (type === FilterConditionType.MAIN) {
            this.setDateFrom_date(this.dateFrom, FilterConditionType.MAIN);
            this.setDateTo_date(this.dateTo, FilterConditionType.MAIN);
            this.setFilterType(this.selectedFilter, FilterConditionType.MAIN);
        } else {
            this.setDateFrom_date(this.dateFromCondition, FilterConditionType.CONDITION);
            this.setDateTo_date(this.dateToCondition, FilterConditionType.CONDITION);
            this.setFilterType(this.selectedFilterCondition, FilterConditionType.CONDITION);
        }
    }

    private createComponents(type:FilterConditionType) {
        const dateComponentParams: IDateParams = {
            onDateChanged: () => { this.onDateChanged (type); },
            filterParams: this.filterParams
        };

        this.userComponentFactory.newDateComponent(dateComponentParams).then (dateToComponent => {
            if (type === FilterConditionType.MAIN) {
                this.dateToComponent = dateToComponent;
            } else {
                this.dateToConditionComponent = dateToComponent;
            }

            const dateToElement = dateToComponent.getGui();

            if (type === FilterConditionType.MAIN) {
                this.eDateToPanel.appendChild(dateToElement);
                if (this.dateToComponent.afterGuiAttached) {
                    this.dateToComponent.afterGuiAttached();
                }
            } else {
                this.eDateToConditionPanel.appendChild(dateToElement);
                if (this.dateToConditionComponent.afterGuiAttached) {
                    this.dateToConditionComponent.afterGuiAttached();
                }
            }
        });
        this.userComponentFactory.newDateComponent(dateComponentParams).then(dateComponent => {
            if (type === FilterConditionType.MAIN) {
                this.dateFromComponent = dateComponent;
            } else {
                this.dateFromConditionComponent = dateComponent;
            }

            const dateFromElement = dateComponent.getGui();

            if (type === FilterConditionType.MAIN) {
                this.eDateFromPanel.appendChild(dateFromElement);
                if (this.dateFromComponent.afterGuiAttached) {
                    this.dateFromComponent.afterGuiAttached();
                }
            } else {
                this.eDateFromConditionPanel.appendChild(dateFromElement);
                if (this.dateFromConditionComponent.afterGuiAttached) {
                    this.dateFromConditionComponent.afterGuiAttached();
                }
            }
        });
    }

    private onDateChanged(type:FilterConditionType): void {
        if (type === FilterConditionType.MAIN) {
            this.dateFrom = DateFilter.removeTimezone(this.dateFromComponent.getDate());
            this.dateTo = DateFilter.removeTimezone(this.dateToComponent.getDate());
        } else {
            this.dateFromCondition = DateFilter.removeTimezone(this.dateFromComponent.getDate());
            this.dateToCondition = DateFilter.removeTimezone(this.dateToComponent.getDate());
        }
        this.onFilterChanged();
    }

    public refreshFilterBodyUi(type:FilterConditionType): void {
        let panel: HTMLElement;
        let filterType: string;
        if (type === FilterConditionType.MAIN) {
            panel = this.eDateToPanel;
            filterType = this.selectedFilter;
        } else {
            panel = this.eDateToConditionPanel;
            filterType = this.selectedFilterCondition;
        }

        // show / hide in-range filter
        if (panel) {
            const visible = filterType === BaseFilter.IN_RANGE;
            _.setVisible(panel, visible);
        }

        // show / hide filter input, i.e. if custom filter has 'hideFilterInputField = true' or an empty filter
        const filterInput = type === FilterConditionType.MAIN ? this.eDateFromPanel : this.eDateFromConditionPanel;
        if (filterInput) {
            const showFilterInput = !this.doesFilterHaveHiddenInput(filterType) && filterType !== BaseFilter.EMPTY;
            _.setVisible(filterInput, showFilterInput);
        }
    }

    public comparator(): Comparator<Date> {
        return this.filterParams.comparator ? this.filterParams.comparator : this.defaultComparator.bind(this);
    }

    private defaultComparator(filterDate: Date, cellValue: any): number {
        //The default comparator assumes that the cellValue is a date
        const cellAsDate = cellValue as Date;
        if  (cellAsDate < filterDate) { return -1; }
        if  (cellAsDate > filterDate) { return 1; }
        return cellValue != null ? 0 : -1;
    }

    public serialize(type:FilterConditionType): SerializedDateFilter {
        const dateToComponent = type === FilterConditionType.MAIN ? this.dateToComponent : this.dateToConditionComponent;
        const dateFromComponent = type === FilterConditionType.MAIN ? this.dateFromComponent : this.dateFromConditionComponent;
        const filterType = type === FilterConditionType.MAIN ? this.selectedFilter : this.selectedFilterCondition;
        return {
            dateTo: _.serializeDateToYyyyMmDd(dateToComponent.getDate(), "-"),
            dateFrom: _.serializeDateToYyyyMmDd(dateFromComponent.getDate(), "-"),
            type: filterType ? filterType : this.defaultFilter,
            filterType: 'date'
        };
    }

    public filterValues(type:FilterConditionType): Date | Date[] {
        if (type === FilterConditionType.MAIN) {
            if (!this.dateFromComponent) { return null; }

            return this.selectedFilter !== BaseFilter.IN_RANGE ?
                this.dateFromComponent.getDate() :
                [this.dateFromComponent.getDate(), this.dateToComponent.getDate()];
        }

        if (!this.dateFromConditionComponent) { return null; }

        return this.selectedFilterCondition !== BaseFilter.IN_RANGE ?
            this.dateFromConditionComponent.getDate() :
            [this.dateFromConditionComponent.getDate(), this.dateToConditionComponent.getDate()];
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateFrom(): string {
        return _.serializeDateToYyyyMmDd(this.dateFromComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getDateTo(): string {
        return _.serializeDateToYyyyMmDd(this.dateToComponent.getDate(), "-");
    }

    // not used by ag-Grid, but exposed as part of the filter API for the client if they want it
    public getFilterType(): string {
        return this.selectedFilter;
    }

    public setDateFrom(date: string, type:FilterConditionType): void {
        const parsedDate = _.parseYyyyMmDdToDate(date, "-");
        this.setDateFrom_date(parsedDate, type);
    }

    private setDateFrom_date(parsedDate:Date, type: FilterConditionType) {
        if (type === FilterConditionType.MAIN) {
            this.dateFrom = parsedDate;

            if (!this.dateFromComponent) { return; }
            this.dateFromComponent.setDate(this.dateFrom);
        } else {
            this.dateFromCondition = parsedDate;

            if (!this.dateFromConditionComponent) { return; }
            this.dateFromConditionComponent.setDate(this.dateFromCondition);
        }
    }

    public setDateTo(date: string, type:FilterConditionType): void {
        const parsedDate = _.parseYyyyMmDdToDate(date, "-");
        this.setDateTo_date(parsedDate, type);
    }

    private setDateTo_date(parsedDate:Date, type: FilterConditionType) {
        if (type === FilterConditionType.MAIN) {
            this.dateTo = parsedDate;

            if (!this.dateToComponent) { return; }
            this.dateToComponent.setDate(this.dateTo);
        } else {
            this.dateToCondition = parsedDate;

            if (!this.dateToConditionComponent) { return; }
            this.dateToConditionComponent.setDate(this.dateToCondition);
        }
    }

    public resetState(resetConditionFilterOnly: boolean = false): void {
        if (!resetConditionFilterOnly) {
            this.setDateFrom(null, FilterConditionType.MAIN);
            this.setDateTo(null, FilterConditionType.MAIN);
            this.setFilterType(this.defaultFilter, FilterConditionType.MAIN);
        }

        this.setFilterType(this.defaultFilter, FilterConditionType.CONDITION);
        this.setDateFrom(null, FilterConditionType.CONDITION);
        this.setDateTo(null, FilterConditionType.CONDITION);
    }

    public parse(model: SerializedDateFilter, type:FilterConditionType): void {
        this.setDateFrom(model.dateFrom, type);
        this.setDateTo(model.dateTo, type);
        this.setFilterType(model.type, type);
    }

    public setType(filterType: string, type:FilterConditionType): void {
        this.setFilterType(filterType, type);
    }

    public static removeTimezone(from: Date): Date {
        if (!from) { return null; }
        return new Date (from.getFullYear(), from.getMonth(), from.getDate());
    }
}

export class DefaultDateComponent extends Component implements IDateComp {

    private eDateInput: HTMLInputElement;
    private listener: () => void;

    constructor() {
        super(`<div class="ag-input-text-wrapper"><input class="ag-filter-filter" type="text" placeholder="yyyy-mm-dd"></div>`);
    }

    public init(params: IDateParams): void {
        this.eDateInput = this.getGui().querySelector('input') as HTMLInputElement;

        if (_.isBrowserChrome() || params.filterParams.browserDatePicker) {
            if (_.isBrowserIE()) {
                console.warn('ag-grid: browserDatePicker is specified to true, but it is not supported in IE 11, reverting to plain text date picker');
            } else {
                this.eDateInput.type = 'date';
            }
        }

        this.listener = params.onDateChanged;

        this.addGuiEventListener('input', this.listener);
    }

    public getDate(): Date {
        return _.parseYyyyMmDdToDate(this.eDateInput.value, "-");
    }

    public setDate(date: Date): void {
        this.eDateInput.value = _.serializeDateToYyyyMmDd(date, "-");
    }

}