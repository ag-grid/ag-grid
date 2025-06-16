import { KeyCode } from '../../../constants/keyCode';
import type { ElementParams } from '../../../utils/dom';
import { _clearElement } from '../../../utils/dom';
import { _debounce } from '../../../utils/function';
import { RefPlaceholder } from '../../../widgets/component';
import type { NumberFilterModel } from '../../provided/number/iNumberFilter';
import { _isUseApplyButton, getDebounceMs } from '../../provided/providedFilterUtils';
import type {
    ITextInputFloatingFilterParams,
    TextFilterModel,
    TextFilterParams,
} from '../../provided/text/iTextFilter';
import { trimInputForFilter } from '../../provided/text/textFilterUtils';
import type { FloatingFilterDisplayParams } from '../floatingFilter';
import type { FloatingFilterInputService } from './iFloatingFilterInputService';
import { SimpleFloatingFilter } from './simpleFloatingFilter';

type ModelUnion = TextFilterModel | NumberFilterModel;

const TextInputFloatingFilterElement: ElementParams = {
    tag: 'div',
    ref: 'eFloatingFilterInputContainer',
    cls: 'ag-floating-filter-input',
    role: 'presentation',
};

export abstract class TextInputFloatingFilter<
    TParams extends ITextInputFloatingFilterParams,
    M extends ModelUnion,
> extends SimpleFloatingFilter<TParams> {
    private readonly eFloatingFilterInputContainer: HTMLElement = RefPlaceholder;
    private inputSvc: FloatingFilterInputService;

    private applyActive: boolean;

    protected abstract createFloatingFilterInputService(params: TParams): FloatingFilterInputService;

    public postConstruct(): void {
        this.setTemplate(TextInputFloatingFilterElement);
    }
    protected override defaultDebounceMs: number = 500;

    protected onModelUpdated(model: M): void {
        this.setLastTypeFromModel(model);
        this.setEditable(this.canWeEditAfterModelFromParentFilter(model));
        this.inputSvc.setValue(this.filterModelFormatter.getModelAsString(model));
    }

    protected override setParams(params: TParams): void {
        this.setupFloatingFilterInputService(params);
        super.setParams(params);
        this.setTextInputParams(params);
    }

    private setupFloatingFilterInputService(params: TParams): void {
        this.inputSvc = this.createFloatingFilterInputService(params);
        this.inputSvc.setupGui(this.eFloatingFilterInputContainer);
    }

    private setTextInputParams(params: TParams): void {
        const autoComplete = params.browserAutoComplete ?? false;
        const { inputSvc, defaultDebounceMs, readOnly } = this;

        inputSvc.setParams({
            ariaLabel: this.getAriaLabel(params),
            autoComplete,
        });

        this.applyActive = _isUseApplyButton(params.filterParams as TextFilterParams);

        if (!readOnly) {
            const debounceMs = getDebounceMs(params.filterParams as TextFilterParams, defaultDebounceMs);
            const toDebounce: (e: KeyboardEvent) => void = _debounce(
                this,
                this.syncUpWithParentFilter.bind(this),
                debounceMs
            );

            inputSvc.setValueChangedListener(toDebounce);
        }
    }

    protected override updateParams(params: TParams): void {
        super.updateParams(params);
        this.setTextInputParams(params);
    }

    protected recreateFloatingFilterInputService(params: TParams): void {
        const { inputSvc } = this;
        const value = inputSvc.getValue();
        _clearElement(this.eFloatingFilterInputContainer);
        this.destroyBean(inputSvc);
        this.setupFloatingFilterInputService(params);
        inputSvc.setValue(value, true);
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const isEnterKey = e.key === KeyCode.ENTER;

        const reactive = this.reactive;
        if (reactive) {
            const reactiveParams = this.params as unknown as FloatingFilterDisplayParams<any, any, M>;
            reactiveParams.onUiChange();
        }

        if (this.applyActive && !isEnterKey) {
            return;
        }

        const { inputSvc, params, lastType } = this;
        let value = inputSvc.getValue();

        if ((params.filterParams as TextFilterParams).trimInput) {
            value = trimInputForFilter(value);
            inputSvc.setValue(value, true); // ensure visible value is trimmed
        }

        if (reactive) {
            const reactiveParams = params as unknown as FloatingFilterDisplayParams<any, any, M>;
            const model = reactiveParams.model;
            const parsedValue = this.convertValue(value);
            const newModel =
                parsedValue == null
                    ? null
                    : ({
                          ...(model ?? {
                              filterType: this.filterType,
                              type: lastType ?? this.optionsFactory.defaultOption,
                          }),
                          filter: parsedValue,
                      } as M);
            reactiveParams.onModelChange(newModel, { afterFloatingFilter: true });
        } else {
            params.parentFilterInstance((filterInstance) => {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance?.onFloatingFilterChanged(lastType || null, (value as never) || null);
            });
        }
    }

    protected convertValue<TValue>(value: string | null | undefined): TValue | null {
        return (value as TValue) || null; // '' to null
    }

    protected setEditable(editable: boolean): void {
        this.inputSvc.setEditable(editable);
    }
}
