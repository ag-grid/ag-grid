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
import { clearElement } from '../../../utils/dom';

export interface FloatingFilterInputService {
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    setValueChangedListener(listener: (e: KeyboardEvent) => void): void;
    setParams(params: { ariaLabel: string }): void;
}

export class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private eFloatingFilterTextInput: AgInputTextField;
    private valueChangedListener: (e: KeyboardEvent) => void = () => {};

    constructor(private params?: { config?: ITextInputField }) {
        super();
    }

    public setupGui(parentElement: HTMLElement): void {
        this.eFloatingFilterTextInput = this.createManagedBean(new AgInputTextField(this.params?.config));

        const eInput = this.eFloatingFilterTextInput.getGui();

        parentElement.appendChild(eInput);

        this.addManagedListener(eInput, 'input', (e: KeyboardEvent) => this.valueChangedListener(e));
        this.addManagedListener(eInput, 'keydown', (e: KeyboardEvent) => this.valueChangedListener(e));
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

    public setValueChangedListener(listener: (e: KeyboardEvent) => void): void {
       this.valueChangedListener = listener;
    }

    public setParams(params: { ariaLabel: string }): void {
        this.setAriaLabel(params.ariaLabel);
    }

    private setAriaLabel(ariaLabel: string): void {
        this.eFloatingFilterTextInput.setInputAriaLabel(ariaLabel);
    }
}

type ModelUnion = TextFilterModel | NumberFilterModel;
export abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    @Autowired('columnModel') private readonly columnModel: ColumnModel;
    @RefSelector('eFloatingFilterInputContainer') private readonly eFloatingFilterInputContainer: HTMLElement;
    private floatingFilterInputService: FloatingFilterInputService;

    protected params: IFloatingFilterParams<TextFilter | NumberFilter>;

    private applyActive: boolean;

    protected abstract createFloatingFilterInputService(params: IFloatingFilterParams<TextFilter | NumberFilter>): FloatingFilterInputService;

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
        this.setupFloatingFilterInputService(params);
        super.init(params);
        this.setTextInputParams(params);
    }

    private setupFloatingFilterInputService(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        this.floatingFilterInputService = this.createFloatingFilterInputService(params);
        this.floatingFilterInputService.setupGui(this.eFloatingFilterInputContainer);
    }

    private setTextInputParams(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        this.params = params;

        this.floatingFilterInputService.setParams({ ariaLabel: this.getAriaLabel(params) });

        this.applyActive = ProvidedFilter.isUseApplyButton(this.params.filterParams);
        
        if (!this.isReadOnly()) {
            const debounceMs = ProvidedFilter.getDebounceMs(this.params.filterParams, this.getDefaultDebounceMs());
            const toDebounce: (e: KeyboardEvent) => void = debounce(this.syncUpWithParentFilter.bind(this), debounceMs);

            this.floatingFilterInputService.setValueChangedListener(toDebounce);
        }
    }

    public onParamsUpdated(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        super.onParamsUpdated(params);
        this.setTextInputParams(params);
    }

    protected recreateFloatingFilterInputService(params: IFloatingFilterParams<TextFilter | NumberFilter>): void {
        const value = this.floatingFilterInputService.getValue();
        clearElement(this.eFloatingFilterInputContainer);
        this.destroyBean(this.floatingFilterInputService);
        this.setupFloatingFilterInputService(params);
        this.floatingFilterInputService.setValue(value, true);
    }

    private getAriaLabel(params: IFloatingFilterParams<TextFilter | NumberFilter>): string {
        const displayName = this.columnModel.getDisplayNameForColumn(params.column, 'header', true);
        const translate = this.localeService.getLocaleTextFunc();
        return `${displayName} ${translate('ariaFilterInput', 'Filter Input')}`
    }

    private syncUpWithParentFilter(e: KeyboardEvent): void {
        const isEnterKey = e.key === KeyCode.ENTER;

        if (this.applyActive && !isEnterKey) { return; }

        let value = this.floatingFilterInputService.getValue();

        if ((this.params.filterParams as TextFilterParams).trimInput) {
            value = TextFilter.trimInput(value);
            this.floatingFilterInputService.setValue(value, true); // ensure visible value is trimmed
        }

        this.params.parentFilterInstance(filterInstance => {
            if (filterInstance) {
                // NumberFilter is typed as number, but actually receives string values
                filterInstance.onFloatingFilterChanged(this.getLastType() || null, value as never || null);
            }
        });
    }

    protected setEditable(editable: boolean): void {
        this.floatingFilterInputService.setEditable(editable);
    }
}
