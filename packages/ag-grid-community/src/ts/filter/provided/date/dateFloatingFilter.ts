import { DateFilter, DateFilterModel } from "./dateFilter";
import { Autowired } from "../../../context/context";
import { UserComponentFactory } from "../../../components/framework/userComponentFactory";
import { _ } from "../../../utils";
import { IDateParams } from "../../../rendering/dateComponent";
import { IFloatingFilterParams } from "../../floating/floatingFilter";
import { DateCompWrapper } from "./dateCompWrapper";
import { RefSelector } from "../../../widgets/componentAnnotations";
import { SimpleFilter, ISimpleFilterModel } from "../simpleFilter";
import { SimpleFloatingFilter } from "../../floating/provided/simpleFloatingFilter";
import { FilterChangedEvent } from "../../../events";
import { ProvidedFilter } from "../providedFilter";

export class DateFloatingFilter extends SimpleFloatingFilter {

    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eReadOnlyText') private eReadOnlyText: HTMLInputElement;
    @RefSelector('eDateWrapper') private eDateWrapper: HTMLInputElement;

    private dateComp: DateCompWrapper;

    private params: IFloatingFilterParams;

    constructor() {
        super(
            `<div class="ag-input-wrapper">
                <input ref="eReadOnlyText" disabled="true" class="ag-floating-filter-input">
                <div ref="eDateWrapper" style="display: flex; flex: 1 1 auto; overflow: hidden;"></div>
            </div>`);
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: DateFilterModel): string {

        const isRange = condition.type == SimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.dateFrom}-${condition.dateTo}`;
        } else {
            // cater for when the type doesn't need a value
            if (condition.dateFrom != null) {
                return `${condition.dateFrom}`;
            } else {
                return `${condition.type}`;
            }
        }
    }

    public init(params: IFloatingFilterParams) {
        super.init(params);
        this.params = params;
        this.createDateComponent();
    }

    protected setEditable(editable: boolean): void {
        _.setVisible(this.eDateWrapper, editable);
        _.setVisible(this.eReadOnlyText, !editable);
    }

    public onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sycn. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) { return; }

        super.setLastTypeFromModel(model);

        const allowEditing = this.canWeEditAfterModelFromParentFilter(model);

        this.setEditable(allowEditing);

        if (allowEditing) {
            if (model) {
                const dateModel = model as DateFilterModel;
                this.dateComp.setDate(_.parseYyyyMmDdToDate(dateModel.dateFrom, '-'));
            } else {
                this.dateComp.setDate(null);
            }
            this.eReadOnlyText.value = '';
        } else {
            this.eReadOnlyText.value = this.getTextFromModel(model);
            this.dateComp.setDate(null);
        }
    }

    private onDateChanged(): void {

        const filterValueDate: Date = this.dateComp.getDate();
        const filterValueText: string = _.serializeDateToYyyyMmDd(filterValueDate, "-");

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const simpleFilter = filterInstance as SimpleFilter<ISimpleFilterModel>;
                simpleFilter.onFloatingFilterChanged(this.getLastType(), filterValueText);
            }
        });
    }

    private createDateComponent(): void {

        const debounceMs: number = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        const toDebounce: () => void = _.debounce(this.onDateChanged.bind(this), debounceMs);
        const dateComponentParams: IDateParams = {
            onDateChanged: toDebounce,
            filterParams: this.params.column.getColDef().filterParams
        };

        this.dateComp = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.eDateWrapper);

        this.addDestroyFunc(() => {
            this.dateComp.destroy();
        });
    }
}
