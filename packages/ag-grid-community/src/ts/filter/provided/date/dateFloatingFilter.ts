import {Component} from "../../../widgets/component";
import {DateFilter, DateFilterModel} from "./dateFilter";
import {Autowired} from "../../../context/context";
import {UserComponentFactory} from "../../../components/framework/userComponentFactory";
import {_, Promise} from "../../../utils";
import {IDateComp, IDateParams} from "../../../rendering/dateComponent";
import {IFloatingFilter, IFloatingFilterParams} from "../../floating/floatingFilter";
import {AbstractProvidedFilter} from "../abstractProvidedFilter";
import {DateCompWrapper} from "./dateCompWrapper";
import {DateFilter2, DateFilter2Model} from "./dateFilter2";
import {RefSelector} from "../../../widgets/componentAnnotations";
import {AbstractSimpleFloatingFilter} from "../../floating/abstractTextInputFloatingFilter";
import {AbstractSimpleFilter, IAbstractSimpleModel} from "../abstractSimpleFilter";

export class DateFloatingFilterComp extends AbstractSimpleFloatingFilter {

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eReadOnlyText') private eReadOnlyText: HTMLInputElement;
    @RefSelector('eDateWrapper') private eDateWrapper: HTMLInputElement;

    private dateComp: DateCompWrapper;

    private params: IFloatingFilterParams;

    constructor() {
        super(
            `<div class="ag-input-text-wrapper">
                <input ref="eReadOnlyText" class="ag-floating-filter-input">
                <span ref="eDateWrapper" style="width: 100%; height: 100%;"></span>
            </div>`);
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter2.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: DateFilter2Model): string {

        const isRange = condition.type == AbstractSimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.dateFrom}-${condition.dateTo}`;
        } else {
            // cater for when the type doesn't need a value
            if (condition.dateFrom!=null) {
                return `${condition.dateFrom}`;
            } else {
                return `${condition.type}`;
            }
        }
    }

    public init(params: IFloatingFilterParams) {
        this.params = params;
        this.createDateComponent();
        this.checkInRangeOnlyOption();
        this.showReadOnly(false);
        this.eReadOnlyText.disabled = true;
    }

    private showReadOnly(show: boolean): void {
        _.setVisible(this.eReadOnlyText, show);
        _.setVisible(this.eDateWrapper, !show);
    }

    public onParentModelChanged(model: IAbstractSimpleModel): void {
        if (!model) {
            this.dateComp.setDate(null);
            this.showReadOnly(false);
            this.eReadOnlyText.value = '';
            return;
        }

        const allowEditing = this.allowEditing(model);

        if (allowEditing) {
            this.showReadOnly(false);
            const dateModel = model as DateFilter2Model;
            this.dateComp.setDate(_.parseYyyyMmDdToDate(dateModel.dateFrom, '-'));
            this.eReadOnlyText.value = '';
        } else {
            this.showReadOnly(true);
            this.eReadOnlyText.value = this.getTextFromModel(model);
            this.dateComp.setDate(null);
        }
    }

    private onDateChanged(): void {

        const filterValueDate: Date = this.dateComp.getDate();
        const filterValueText: string = _.serializeDateToYyyyMmDd(DateFilter.removeTimezone(filterValueDate), "-");

        const model: DateFilter2Model = {
            type: null,
            dateFrom: filterValueText,
            dateTo: null,
            filterType: 'date'
        };

        this.params.parentFilterInstance( filterInstance => {
            if (filterInstance) {
                const providedFilter = <AbstractProvidedFilter> filterInstance;
                providedFilter.onFloatingFilterChanged({
                    model: model,
                    apply: true
                })
            }
        });
    }

    private checkInRangeOnlyOption(): void {
        // disable the filter if inRange is the only configured option
        const columnDef = (this.params.column.getDefinition() as any);
        const inRangeIsOnlyOption = (columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange');

        if (inRangeIsOnlyOption) {
            // disable the component somehow
        }
    }

    private createDateComponent(): void {

        const debounceMs: number = this.params.debounceMs != null ? this.params.debounceMs : 500;
        const toDebounce: () => void = _.debounce(this.onDateChanged.bind(this), debounceMs);
        const dateComponentParams: IDateParams = {
            onDateChanged: toDebounce,
            filterParams: this.params.column.getColDef().filterParams
        };

        this.dateComp = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.eDateWrapper);

        this.addDestroyFunc( () => {
            this.dateComp.destroy();
        });
    }
}

export class DateFloatingFilterComp_Old extends Component
    implements IFloatingFilter {

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    private dateComponentPromise: Promise<IDateComp>;

    private currentParentModelFunc: () => DateFilterModel;
    private lastKnownModel: DateFilterModel = null;

    private params: IFloatingFilterParams;

    private init(params: IFloatingFilterParams) {

        this.params = params;

        this.currentParentModelFunc = params.currentParentModel;

        const debounceMs: number = params.debounceMs != null ? params.debounceMs : 500;
        const toDebounce: () => void = _.debounce(this.onDateChanged.bind(this), debounceMs);
        const dateComponentParams: IDateParams = {
            onDateChanged: toDebounce,
            filterParams: params.column.getColDef().filterParams
        };
        this.dateComponentPromise = this.userComponentFactory.newDateComponent(dateComponentParams);

        const body = _.loadTemplate('<div></div>');
        this.dateComponentPromise.then(dateComponent => {
            body.appendChild(dateComponent.getGui());

            // disable the filter if inRange is the only configured option
            const columnDef = (params.column.getDefinition() as any);
            const inRangeIsOnlyOption = (columnDef.filterParams &&
                columnDef.filterParams.filterOptions &&
                columnDef.filterParams.filterOptions.length === 1 &&
                columnDef.filterParams.filterOptions[0] === 'inRange');

            if (dateComponent.eDateInput) {
                dateComponent.eDateInput.disabled = inRangeIsOnlyOption;
            }
        });

        body.style.width = '100%';
        body.style.height = '100%';

        this.setTemplateFromElement(body);
    }

    private onDateChanged(): void {
        const model = this.asParentModel();

        this.params.parentFilterInstance( filterInstance => {
            if (filterInstance) {
                const providedFilter = <AbstractProvidedFilter> filterInstance;
                providedFilter.onFloatingFilterChanged({
                    model: model,
                    apply: true
                })
            }
        });

        // this.lastKnownModel = model;
    }

    equalModels(left: DateFilterModel, right: DateFilterModel): boolean {
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

    asParentModel(): DateFilterModel {
        const filterValueDate: Date = this.dateComponentPromise.resolveNow(null, dateComponent => dateComponent.getDate());
        const filterValueText: string = _.serializeDateToYyyyMmDd(DateFilter.removeTimezone(filterValueDate), "-");

        return {
            type: null,
            dateFrom: filterValueText,
            dateTo: null,
            filterType: 'date'
        };
    }

    public onParentModelChanged(parentModel: DateFilterModel): void {
        this.lastKnownModel = parentModel;
        this.dateComponentPromise.then(dateComponent => {
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
                dateComponent.eDateInput.disabled = false;
            }
        }
    }
}
