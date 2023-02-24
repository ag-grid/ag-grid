import { IFloatingFilterParams } from '../floatingFilter';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { debounce } from '../../../utils/function';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { ColumnModel } from '../../../columns/columnModel';
import { KeyCode } from '../../../constants/keyCode';
import { TextFilterParams, TextFilter, TextFilterModel } from '../../provided/text/textFilter';
import { NumberFilter, NumberFilterModel, NumberFilterParams } from '../../provided/number/numberFilter';

type ModelUnion = TextFilterModel | NumberFilterModel;
export abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @RefSelector('eFloatingFilterInput') private readonly eFloatingFilterInput: AgInputTextField;

    protected params: IFloatingFilterParams<TextFilter | NumberFilter>;

    private applyActive: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.resetTemplate();
    }

    private resetTemplate(paramsMap?: any) {
        this.setTemplate(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterInput"></ag-input-text-field>
            </div>
        `, paramsMap);
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            // if the floating filter triggered the change, it is already in sync.
            // Data changes also do not affect provided text floating filters
            return;
        }

        this.setLastTypeFromModel(model);
        this.eFloatingFilterInput.setValue(this.getFilterModelFormatter().getModelAsString(model));
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
    }

    public init(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        super.init(params);

        this.params = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);

        const { allowedCharPattern } = this.params.filterParams as NumberFilterParams;
        if (allowedCharPattern != null) {
            this.resetTemplate({ eFloatingFilterInput: { allowedCharPattern } });
        }

        if (!this.isReadOnly()) {
            const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce: () => void = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
            const filterGui = this.eFloatingFilterInput.getGui();

            this.addManagedListener(filterGui, 'input', toDebounce);
            this.addManagedListener(filterGui, 'keypress', toDebounce);
            this.addManagedListener(filterGui, 'keydown', toDebounce);
        }

        const columnDef = (params.column.getDefinition() as any);

        if (this.isReadOnly() || (
            columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange')) {
            this.eFloatingFilterInput.setDisabled(true);
        }

        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        this.eFloatingFilterInput.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const enterKeyPressed = e.key === KeyCode.ENTER;

        if (this.applyActive && !enterKeyPressed) { return; }

        let value = this.eFloatingFilterInput.getValue();

        if ((this.params.filterParams as TextFilterParams).trimInput) {
            value = TextFilter.trimInput(value);
            this.eFloatingFilterInput.setValue(value, true); // ensure visible value is trimmed
        }

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value as any || null);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.eFloatingFilterInput.setDisabled(!editable);
    }
}
