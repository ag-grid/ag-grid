import { IFloatingFilterParams } from '../floatingFilter';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { ITextInputField } from '../../../widgets/agInputTextField';
import { TextFilter, TextFilterModel } from '../../provided/text/textFilter';
import { NumberFilter, NumberFilterModel } from '../../provided/number/numberFilter';
import { BeanStub } from '../../../context/beanStub';
export interface FloatingFilterInputService {
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    addValueChangedListener(listener: () => void): void;
}
export declare class FloatingFilterTextInputService extends BeanStub implements FloatingFilterInputService {
    private params;
    private eFloatingFilterTextInput;
    constructor(params: {
        config?: ITextInputField;
        ariaLabel: string;
    });
    setupGui(parentElement: HTMLElement): void;
    setEditable(editable: boolean): void;
    getValue(): string | null | undefined;
    setValue(value: string | null | undefined, silent?: boolean): void;
    addValueChangedListener(listener: () => void): void;
}
declare type ModelUnion = TextFilterModel | NumberFilterModel;
export declare abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    private readonly columnModel;
    private readonly eFloatingFilterInputContainer;
    private floatingFilterInputService;
    protected params: IFloatingFilterParams<TextFilter | NumberFilter>;
    private applyActive;
    protected abstract createFloatingFilterInputService(ariaLabel: string): FloatingFilterInputService;
    private postConstruct;
    protected getDefaultDebounceMs(): number;
    onParentModelChanged(model: M, event: FilterChangedEvent): void;
    init(params: IFloatingFilterParams<TextFilter | NumberFilter>): void;
    private syncUpWithParentFilter;
    protected setEditable(editable: boolean): void;
}
export {};
