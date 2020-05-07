import { DateFilter, DateFilterModel } from './dateFilter';
import { Autowired } from '../../../context/context';
import { UserComponentFactory } from '../../../components/framework/userComponentFactory';
import { IDateParams } from '../../../rendering/dateComponent';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
import { DateCompWrapper } from './dateCompWrapper';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { SimpleFilter, ISimpleFilterModel } from '../simpleFilter';
import { SimpleFloatingFilter } from '../../floating/provided/simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { ProvidedFilter } from '../providedFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { setDisplayed } from '../../../utils/dom';
import { parseDateTimeFromString, serialiseDate } from '../../../utils/date';
import { debounce } from '../../../utils/function';

export class DateFloatingFilter extends SimpleFloatingFilter {
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    @RefSelector('eReadOnlyText') private eReadOnlyText: AgInputTextField;
    @RefSelector('eDateWrapper') private eDateWrapper: HTMLInputElement;

    private dateComp: DateCompWrapper;
    private params: IFloatingFilterParams;

    constructor() {
        super(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eReadOnlyText"></ag-input-text-field>
                <div ref="eDateWrapper" style="display: flex; overflow: hidden;"></div>
            </div>`);
    }

    protected getDefaultFilterOptions(): string[] {
        return DateFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: DateFilterModel): string {
        if (condition.type === SimpleFilter.IN_RANGE) {
            return `${condition.dateFrom}-${condition.dateTo}`;
        }

        // cater for when the type doesn't need a value
        if (condition.dateFrom != null) {
            return `${condition.dateFrom}`;
        }

        return `${condition.type}`;
    }

    public init(params: IFloatingFilterParams) {
        super.init(params);
        this.params = params;
        this.createDateComponent();
        this.eReadOnlyText.setDisabled(true);
    }

    protected setEditable(editable: boolean): void {
        setDisplayed(this.eDateWrapper, editable);
        setDisplayed(this.eReadOnlyText.getGui(), !editable);
    }

    public onParentModelChanged(model: ISimpleFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) { return; }

        super.setLastTypeFromModel(model);

        const allowEditing = this.canWeEditAfterModelFromParentFilter(model);

        this.setEditable(allowEditing);

        if (allowEditing) {
            if (model) {
                const dateModel = model as DateFilterModel;

                this.dateComp.setDate(parseDateTimeFromString(dateModel.dateFrom));
            } else {
                this.dateComp.setDate(null);
            }

            this.eReadOnlyText.setValue('');
        } else {
            this.eReadOnlyText.setValue(this.getTextFromModel(model));
            this.dateComp.setDate(null);
        }
    }

    private onDateChanged(): void {
        const filterValueDate = this.dateComp.getDate();
        const filterValueText = serialiseDate(filterValueDate);

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const simpleFilter = filterInstance as SimpleFilter<ISimpleFilterModel>;
                simpleFilter.onFloatingFilterChanged(this.getLastType(), filterValueText);
            }
        });
    }

    private createDateComponent(): void {
        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        const dateComponentParams: IDateParams = {
            onDateChanged: debounce(this.onDateChanged.bind(this), debounceMs),
            filterParams: this.params.column.getColDef().filterParams
        };

        this.dateComp = new DateCompWrapper(this.userComponentFactory, dateComponentParams, this.eDateWrapper);

        this.addDestroyFunc(() => this.dateComp.destroy());
    }
}
