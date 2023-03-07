import { IFloatingFilterParams } from '../floatingFilter';
import { RefSelector } from '../../../widgets/componentAnnotations';
import { debounce } from '../../../utils/function';
import { ProvidedFilter } from '../../provided/providedFilter';
import { PostConstruct, Autowired } from '../../../context/context';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { AgInputTextField, ITextInputField } from '../../../widgets/agInputTextField';
import { ColumnModel } from '../../../columns/columnModel';
import { KeyCode } from '../../../constants/keyCode';
import { TextFilterParams, TextFilter, TextFilterModel } from '../../provided/text/textFilter';
import { NumberFilter, NumberFilterModel } from '../../provided/number/numberFilter';
import { BeanStub } from '../../../context/beanStub';

export interface FloatingFilterInputService {
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    addValueChangedListener(listener: () => void): void;
}

export class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private eFloatingFilterTextInput: AgInputTextField;

    constructor(private params: { config?: ITextInputField, ariaLabel: string }) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField(this.params.config));

        this.eFloatingFilterTextInput.setInputAriaLabel(this.params.ariaLabel);

        parentElement.appendChild(this.eFloatingFilterTextInput.getGui());
    }

    public setEditable(editable: boolean): void {
        this.eFloatingFilterTextInput.setDisabled(!editable);
    }

    public getValue(): string | null | undefined {
        return this.eFloatingFilterTextInput.getValue();
    }

    public setValue(value: string | null | undefined, silent?: boolean): void {
        this.eFloatingFilterTextInput.setValue(value, silent);
    }

    public addValueChangedListener(listener: () => void): void {
        const inputGui = this.eFloatingFilterTextInput.getGui();
        this.addManagedListener(inputGui, 'input', listener);
        this.addManagedListener(inputGui, 'keypress', listener);
        this.addManagedListener(inputGui, 'keydown', listener);
    }
}

type ModelUnion = TextFilterModel | NumberFilterModel;
export abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @RefSelector('eFloatingFilterInputContainer') private readonly eFloatingFilterInputContainer: HTMLElement;
    private floatingFilterInputService: FloatingFilterInputService;

    protected params: IFloatingFilterParams<TextFilter | NumberFilter>;

    private applyActive: boolean;

    protected abstract createFloatingFilterInputService(ariaLabel: string): FloatingFilterInputService;

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(/* html */`
            <div class="ag-floating-filter-input" role="presentation" ref="eFloatingFilterInputContainer"></div>
        `);
    }

    protected getDefaultDebounceMs(): number {
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

    public init(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        this.params = params;

        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        const ariaLabel = `${displayName} ${translate('ariaFilterInput', 'Filter Input')}`

        this.floatingFilterInputService = this.createFloatingFilterInputService(ariaLabel);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);

        super.init(params);

        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        
        if (!this.isReadOnly()) {
            const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce: () => void = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);

            this.floatingFilterInputService.addValueChangedListener(toDebounce);
        }
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const enterKeyPressed = e.key === KeyCode.ENTER;

        if (this.applyActive && !enterKeyPressed) { return; }

        let value = this.floatingFilterInputService.getValue();

        if ((this.params.filterParams as TextFilterParams).trimInput) {
            value = TextFilter.trimInput(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value as any || null);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.floatingFilterInputService.setEditable(editable);
    }
}
