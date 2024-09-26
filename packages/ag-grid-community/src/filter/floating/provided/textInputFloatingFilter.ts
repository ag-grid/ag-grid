import { KeyCode } from '../../../constants/keyCode';
import type { FilterChangedEvent } from '../../../events';
import { _clearElement } from '../../../utils/dom';
import { _debounce } from '../../../utils/function';
import { RefPlaceholder } from '../../../widgets/component';
import type { NumberFilterModel } from '../../provided/number/iNumberFilter';
import type {
    ITextInputFloatingFilterParams,
    TextFilterModel,
    TextFilterParams,
} from '../../provided/text/iTextFilter';
import { trimInputForFilter } from '../../provided/text/textFilterUtils';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';
import { getDebounceMs, isUseApplyButton } from './providedFilterUtils';
import { SimpleFloatingFilter } from './simpleFloatingFilter';

type ModelUnion = TextFilterModel | NumberFilterModel;
export abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    private readonly eFloatingFilterInputContainer: HTMLElement = RefPlaceholder;
    private floatingFilterInputService: FloatingFilterInputService;

    protected params: ITextInputFloatingFilterParams;

    private applyActive: boolean;

    protected abstract createFloatingFilterInputService(
        params: ITextInputFloatingFilterParams
    ): FloatingFilterInputService;

    public postConstruct(): void {
        this.setTemplate(/* html */ `
            <div class="ag-floating-filter-input" role="presentation" data-ref="eFloatingFilterInputContainer"></div>
        `);
    }

    protected override getDefaultDebounceMs(): number {
        return 500;
    }

    public onParentModelChanged(model: M, event: FilterChangedEvent): void {
        if (this.isEventFromFloatingFilter(event) || this.isEventFromDataChange(event)) {
            // if the floating filter triggered the change, it is already in sync.
            // Data changes also do not affect provided text floating filters
            return;
        }

        this.setLastTypeFromModel(model);
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
        this.floatingFilterInputService.setValue(this.getFilterModelFormatter().getModelAsString(model));
    }

    public override init(params: ITextInputFloatingFilterParams): void {
        this.setupFloatingFilterInputService(params);
        super.init(params);
        this.setTextInputParams(params);
    }

    private setupFloatingFilterInputService(params: ITextInputFloatingFilterParams): void {
        this.floatingFilterInputService = this.createFloatingFilterInputService(params);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
    }

    private setTextInputParams(params: ITextInputFloatingFilterParams): void {
        this.params = params;

        const autoComplete = params.browserAutoComplete ?? false;
        this.floatingFilterInputService.setParams({
            ariaLabel: this.getAriaLabel(params),
            autoComplete,
        });

        this.applyActive = isUseApplyButton(this.params.filterParams);

        if (!this.isReadOnly()) {
            const debounceMs = getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce: (e: KeyboardEvent) => void = _debounce(
                this.syncUpWithParentFilter.bind(this),
                debounceMs
            );

            this.floatingFilterInputService.setValueChangedListener(toDebounce);
        }
    }

    public override onParamsUpdated(params: ITextInputFloatingFilterParams): void {
        this.refresh(params);
    }

    public override refresh(params: ITextInputFloatingFilterParams): void {
        super.refresh(params);
        this.setTextInputParams(params);
    }

    protected recreateFloatingFilterInputService(params: ITextInputFloatingFilterParams): void {
        const value = this.floatingFilterInputService.getValue();
        _clearElement(this.eFloatingFilterInputContainer);
        this.destroyBean(this.floatingFilterInputService);
        this.setupFloatingFilterInputService(params);
        this.floatingFilterInputService.setValue(value, true);
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const isEnterKey = e.key === KeyCode.ENTER;

        if (this.applyActive && !isEnterKey) {
            return;
        }

        let value = this.floatingFilterInputService.getValue();

        if ((this.params.filterParams as TextFilterParams).trimInput) {
            value = trimInputForFilter(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }

        this.params.parentFilterInstance((filterInstance) => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, (value as never) || null);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.floatingFilterInputService.setEditable(editable);
    }
}
