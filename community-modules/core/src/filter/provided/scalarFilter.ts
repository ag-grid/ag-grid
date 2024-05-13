import { AgInputTextField } from "../../widgets/agInputTextField";
import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel, ISimpleFilterModelType, Tuple } from "./simpleFilter";
import { IFilterParams } from "../../interfaces/iFilter";

/**
 * Parameters provided by the grid to the `init` method of a `ScalarFilter`.
 * Do not use in `colDef.filterParams` - see `IScalarFilterParams` instead.
 */
export type ScalarFilterParams<TData = any> = IScalarFilterParams & IFilterParams<TData>;

/**
 * Common parameters in `colDef.filterParams` used by all scalar filters. Extended by the specific filter types.
 */
export interface IScalarFilterParams extends ISimpleFilterParams {
    /** If `true`, the `'inRange'` filter option will include values equal to the start and end of the range. */
    inRangeInclusive?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'equals'` filter option. */
    includeBlanksInEquals?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'lessThan'` and `'lessThanOrEqual'` filter options. */
    includeBlanksInLessThan?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'greaterThan'` and `'greaterThanOrEqual'` filter options. */
    includeBlanksInGreaterThan?: boolean;
    /** If `true`, blank (`null` or `undefined`) values will pass the `'inRange'` filter option. */
    includeBlanksInRange?: boolean;
}

export interface Comparator<T> {
    (left: T, right: T): number;
}

export abstract class ScalarFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends SimpleFilter<M, V, E> {
    private scalarFilterParams: ScalarFilterParams;

    protected abstract comparator(): Comparator<V>;

    protected setParams(params: ScalarFilterParams): void {
        super.setParams(params);
        this.scalarFilterParams = params;
    }

    protected evaluateNullValue(filterType?: ISimpleFilterModelType | null) {
        switch (filterType) {
            case 'equals':
            case 'notEqual':
                if (this.scalarFilterParams.includeBlanksInEquals) {
                    return true;
                }
                break;

            case 'greaterThan':
            case 'greaterThanOrEqual':
                if (this.scalarFilterParams.includeBlanksInGreaterThan) {
                    return true;
                }
                break;

            case 'lessThan':
            case 'lessThanOrEqual':
                if (this.scalarFilterParams.includeBlanksInLessThan) {
                    return true;
                }
                break;
            case 'inRange':
                if (this.scalarFilterParams.includeBlanksInRange) {
                    return true;
                }
                break;
            case 'blank':
                return true;
            case 'notBlank':
                return false;
        }

        return false;
    }

    protected evaluateNonNullValue(values: Tuple<V>, cellValue: V, filterModel: M): boolean {
        const comparator = this.comparator();
        const compareResult = values[0] != null ? comparator(values[0]!, cellValue) : 0;

        switch (filterModel.type) {
            case 'equals':
                return compareResult === 0;

            case 'notEqual':
                return compareResult !== 0;

            case 'greaterThan':
                return compareResult > 0;

            case 'greaterThanOrEqual':
                return compareResult >= 0;

            case 'lessThan':
                return compareResult < 0;

            case 'lessThanOrEqual':
                return compareResult <= 0;

            case 'inRange': {
                const compareToResult = comparator(values[1]!, cellValue);

                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }

            case 'blank':
                return this.isBlank(cellValue);

            case 'notBlank':
                return !this.isBlank(cellValue);

            default:
                console.warn('AG Grid: Unexpected type of filter "' + filterModel.type + '", it looks like the filter was configured with incorrect Filter Options');
                return true;
        }
    }
}