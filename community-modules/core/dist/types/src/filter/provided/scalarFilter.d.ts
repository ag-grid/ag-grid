import type { AgInputTextField } from '../../widgets/agInputTextField';
import type { Comparator, ScalarFilterParams } from './iScalarFilter';
import type { ISimpleFilterModel, ISimpleFilterModelType, Tuple } from './iSimpleFilter';
import { SimpleFilter } from './simpleFilter';
export declare abstract class ScalarFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends SimpleFilter<M, V, E> {
    private scalarFilterParams;
    protected abstract comparator(): Comparator<V>;
    protected setParams(params: ScalarFilterParams): void;
    protected evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;
    protected evaluateNonNullValue(values: Tuple<V>, cellValue: V, filterModel: M): boolean;
}
