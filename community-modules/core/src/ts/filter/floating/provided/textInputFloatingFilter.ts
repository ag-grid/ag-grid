import { IFloatingFilterParams } from '../floatingFilter';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { debounce } from '../../../utils/function';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { ISimpleFilterModel, SimpleFilter } from '../../provided/simpleFilter';
import { FilterChangedEvent } from '../../../events';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isKeyPressed } from '../../../utils/keyboard';
import { ColumnController } from '../../../columnController/columnController';
import { KeyCode } from '../../../constants/keyCode';
import { ITextFilterParams, TextFilter } from '../../provided/text/textFilter';

export abstract class TextInputFloatingFilter extends SimpleFloatingFilter {
    @Autowired('columnController') private readonly columnController: ColumnController;
    @RefSelector('eFloatingFilterInput') private readonly eFloatingFilterInput: AgInputTextField;

    protected params: IFloatingFilterParams;

    private applyActive: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(/* html */`
            <div class="ag-floating-filter-input" role="presentation">
                <ag-input-text-field ref="eFloatingFilterInput"></ag-input-text-field>
            </div>`);
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        if (this.isEventFromFloatingFilter(event)) {
            // if the floating filter triggered the change, it is already in sync
            return;
        }

        this.setLastTypeFromModel(model);
        this.eFloatingFilterInput.setValue(this.getTextFromModel(model));
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
    }

    public init(params: IFloatingFilterParams): void {
        super.init(params);

        this.params = params;
        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);

        const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
        const toDebounce: () => void = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);
        const filterGui = this.eFloatingFilterInput.getGui();

        this.addManagedListener(filterGui, 'input', toDebounce);
        this.addManagedListener(filterGui, 'keypress', toDebounce);
        this.addManagedListener(filterGui, 'keydown', toDebounce);

        const columnDef = (params.column.getDefinition() as any);

        if (columnDef.filterParams &&
            columnDef.filterParams.filterOptions &&
            columnDef.filterParams.filterOptions.length === 1 &&
            columnDef.filterParams.filterOptions[0] === 'inRange') {
            this.eFloatingFilterInput.setDisabled(true);
        }

        const displayName = this.columnController.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eFloatingFilterInput.setInputAriaLabel(`${displayName} ${translate('ariaFilterInput', 'Filter Input')}`);
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const enterKeyPressed = isKeyPressed(e, KeyCode.ENTER);

        if (this.applyActive && !enterKeyPressed) { return; }

        let value = this.eFloatingFilterInput.getValue();

        if ((this.params.filterParams as ITextFilterParams).trimInput) {
            value = TextFilter.trimInput(value);
            this.eFloatingFilterInput.setValue(value, true); // ensure visible value is trimmed
        }

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                const simpleFilter = filterInstance as SimpleFilter<ISimpleFilterModel>;
                simpleFilter.onFloatingFilterChanged(this.getLastType(), value);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.eFloatingFilterInput.setDisabled(!editable);
    }
}
