import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel } from "./simpleFilter";
import { IDoesFilterPassParams } from "../../interfaces/iFilter";

/** @deprecated in v21*/
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}

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

    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}

export interface Comparator<T> {
    (left: T, right: T): number;
}

export abstract class ScalarFilter<M extends ISimpleFilterModel, V> extends SimpleFilter<M, V> {
    private scalarFilterParams: IScalarFilterParams;

    protected abstract comparator(): Comparator<V>;

    // because the date and number filter models have different attribute names, we have to map
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): { from: V | null | undefined, to: V | null | undefined; };

    protected setParams(params: IScalarFilterParams): void {
        super.setParams(params);
        this.scalarFilterParams = params;
        this.checkDeprecatedParams();
    }

    private checkDeprecatedParams(): void {
        if (this.scalarFilterParams.nullComparator) {
            console.warn('AG Grid: Since v21.0, the property filterParams.nullComparator is deprecated. ' +
                'Please use filterParams.includeBlanksInEquals, filterParams.includeBlanksInLessThan and ' +
                'filterParams.includeBlanksInGreaterThan instead.');

            this.scalarFilterParams.includeBlanksInEquals = this.scalarFilterParams.nullComparator.equals;
            this.scalarFilterParams.includeBlanksInLessThan = this.scalarFilterParams.nullComparator.lessThan;
            this.scalarFilterParams.includeBlanksInGreaterThan = this.scalarFilterParams.nullComparator.greaterThan;
        }
    }

    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: ISimpleFilterModel) {
        const cellValue = this.scalarFilterParams.valueGetter(params.node);
        const range = this.mapRangeFromModel(filterModel);
        const filterValue = range.from;
        const filterValueTo = range.to;
        const filterType = filterModel.type;
        const customFilterOption = this.optionsFactory.getCustomOption(filterType);

        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterValue != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterValue, cellValue);
            }
        }

        if (cellValue == null) {
            switch (filterType) {
                case ScalarFilter.EQUALS:
                case ScalarFilter.NOT_EQUAL:
                    if (this.scalarFilterParams.includeBlanksInEquals) {
                        return true;
                    }
                    break;

                case ScalarFilter.GREATER_THAN:
                case ScalarFilter.GREATER_THAN_OR_EQUAL:
                    if (this.scalarFilterParams.includeBlanksInGreaterThan) {
                        return true;
                    }
                    break;

                case ScalarFilter.LESS_THAN:
                case ScalarFilter.LESS_THAN_OR_EQUAL:
                    if (this.scalarFilterParams.includeBlanksInLessThan) {
                        return true;
                    }
                    break;
                case ScalarFilter.IN_RANGE:
                    if (this.scalarFilterParams.includeBlanksInRange) {
                        return true;
                    }
                    break;
            }

            return false;
        }

        const comparator = this.comparator();
        const compareResult = comparator(filterValue!, cellValue);

        switch (filterType) {
            case ScalarFilter.EQUALS:
                return compareResult === 0;

            case ScalarFilter.NOT_EQUAL:
                return compareResult !== 0;

            case ScalarFilter.GREATER_THAN:
                return compareResult > 0;

            case ScalarFilter.GREATER_THAN_OR_EQUAL:
                return compareResult >= 0;

            case ScalarFilter.LESS_THAN:
                return compareResult < 0;

            case ScalarFilter.LESS_THAN_OR_EQUAL:
                return compareResult <= 0;

            case ScalarFilter.IN_RANGE: {
                const compareToResult = comparator(filterValueTo!, cellValue);

                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }

            default:
                console.warn('AG Grid: Unexpected type of filter "' + filterType + '", it looks like the filter was configured with incorrect Filter Options');
                return true;
        }
    }
}