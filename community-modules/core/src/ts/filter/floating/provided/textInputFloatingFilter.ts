import { IFloatingFilterParams } from '../floatingFilter';
import { ProvidedFilterModel } from '../../../interfaces/iFilter';
import { debounce } from '../../../utils/function';
import { Constants } from '../../../constants';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { ISimpleFilterModel, SimpleFilter } from '../../provided/simpleFilter';
import { FilterChangedEvent } from '../../../events';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isKeyPressed } from '../../../utils/keyboard';
import { ColumnController } from '../../../columnController/columnController';

export abstract class TextInputFloatingFilter extends SimpleFloatingFilter {
    @Autowired('columnController') private columnController: ColumnController;
    protected eFloatingFilterInput: AgInputTextField;

    protected params: IFloatingFilterParams;

    private applyActive: boolean;

   

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        // we don't want to update the floating filter if the floating filter caused the change.
        // as if it caused the change, the ui is already in sync. if we didn't do this, the UI
        // would behave strange as it would be updating as the user is typing
        if (this.isEventFromFloatingFilter(event)) { return; }

        this.setLastTypeFromModel(model);
        const modelString = this.getTextFromModel(model);
        this.eFloatingFilterInput.setValue(modelString);
        const editable = this.canWeEditAfterModelFromParentFilter(model);
        this.setEditable(editable);
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
        this.eFloatingFilterInput.setInputAriaLabel(`${displayName} Filter Input`);
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const value = this.eFloatingFilterInput.getValue();
        const enterKeyPressed = isKeyPressed(e, Constants.KEY_ENTER);

        if (this.applyActive && !enterKeyPressed) { return; }

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
