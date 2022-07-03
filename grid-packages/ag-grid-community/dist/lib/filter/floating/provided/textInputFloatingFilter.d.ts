import { IFloatingFilterParams } from '../floatingFilter';
import { IFilterOptionDef, ProvidedFilterModel } from '../../../interfaces/iFilter';
import { SimpleFloatingFilter } from './simpleFloatingFilter';
import { FilterChangedEvent } from '../../../events';
import { TextFilterModel } from '../../provided/text/textFilter';
import { NumberFilterModel } from '../../provided/number/numberFilter';
declare type ModelUnion = TextFilterModel | NumberFilterModel;
export declare abstract class TextInputFloatingFilter<M extends ModelUnion> extends SimpleFloatingFilter {
    private readonly columnModel;
    private readonly eFloatingFilterInput;
    protected params: IFloatingFilterParams;
    private applyActive;
    private postConstruct;
    private resetTemplate;
    protected getDefaultDebounceMs(): number;
    onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void;
    init(params: IFloatingFilterParams): void;
    private syncUpWithParentFilter;
    protected conditionToString(condition: M, options?: IFilterOptionDef): string;
    protected setEditable(editable: boolean): void;
}
export {};
