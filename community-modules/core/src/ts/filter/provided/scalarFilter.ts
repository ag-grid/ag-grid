import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel } from "./simpleFilter";
import { IDoesFilterPassParams } from "../../interfaces/iFilter";

/** @deprecated in v21*/
export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}

export interface IScalarFilterParams extends ISimpleFilterParams {
    inRangeInclusive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;

    /** @deprecated in v21*/
    nullComparator?: NullComparator;
}

export interface Comparator<T> {
    (left: T, right: T): number;
}

export abstract class ScalarFilter<M extends ISimpleFilterModel, T> extends SimpleFilter<M> {
    private scalarFilterParams: IScalarFilterParams;

    protected abstract comparator(): Comparator<T>;

    // because the date and number filter models have different attribute names, we have to map
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): { from: T, to: T; };

    protected setParams(params: IScalarFilterParams): void {
        super.setParams(params);
        this.scalarFilterParams = params;
        this.checkDeprecatedParams();
    }

    private checkDeprecatedParams(): void {
        if (this.scalarFilterParams.nullComparator) {
            console.warn('ag-Grid: Since v21.0, the property filterParams.nullComparator is deprecated. ' +
                'Please use filterParams.includeBlanksInEquals, filterParams.includeBlanksInLessThan and ' +
                'filterParams.includeBlanksInGreaterThan instead.');

            this.scalarFilterParams.includeBlanksInEquals = this.scalarFilterParams.nullComparator.equals;
            this.scalarFilterParams.includeBlanksInLessThan = this.scalarFilterParams.nullComparator.lessThan;
            this.scalarFilterParams.includeBlanksInGreaterThan = this.scalarFilterParams.nullComparator.greaterThan;
        }
    }

    private nullComparator(selectedOption: string, filterValue: T, gridValue: T): number {
        if (gridValue == null) {
            switch (selectedOption) {
                case ScalarFilter.EMPTY:
                    return 0;

                case ScalarFilter.EQUALS:
                    return this.scalarFilterParams.includeBlanksInEquals ? 0 : 1;

                case ScalarFilter.NOT_EQUAL:
                    return this.scalarFilterParams.includeBlanksInEquals ? 1 : 0;

                case ScalarFilter.GREATER_THAN:
                case ScalarFilter.GREATER_THAN_OR_EQUAL:
                    return this.scalarFilterParams.includeBlanksInGreaterThan ? 1 : -1;

                case ScalarFilter.LESS_THAN:
                case ScalarFilter.LESS_THAN_OR_EQUAL:
                    return this.scalarFilterParams.includeBlanksInLessThan ? -1 : 1;
            }
        }

        return this.comparator()(filterValue, gridValue);
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

        const compareResult = this.nullComparator(filterType, filterValue, cellValue);

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
                const compareToResult = this.nullComparator(filterType, filterValueTo, cellValue);

                return this.scalarFilterParams.inRangeInclusive ?
                    compareResult >= 0 && compareToResult <= 0 :
                    compareResult > 0 && compareToResult < 0;
            }

            default:
                throw new Error('Unexpected type of filter: ' + filterType);
        }
    }
}