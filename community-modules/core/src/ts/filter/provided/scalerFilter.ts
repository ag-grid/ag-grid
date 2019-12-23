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

export abstract class ScalerFilter<M extends ISimpleFilterModel, T> extends SimpleFilter<M> {

    static readonly DEFAULT_NULL_COMPARATOR: NullComparator = {
        equals: false,
        lessThan: false,
        greaterThan: false
    };

    private scalarFilterParams: IScalarFilterParams;

    protected abstract comparator(): Comparator<T>;

    // because the date and number filter models have different attribute names, we have to map
    protected abstract mapRangeFromModel(filterModel: ISimpleFilterModel): {from: T, to: T};

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
            const nullValue = this.canNullsPassFilter(selectedOption);

            if (selectedOption === ScalerFilter.EMPTY) {
                return 0;
            }

            if (selectedOption === ScalerFilter.EQUALS) {
                return nullValue ? 0 : 1;
            }

            if (selectedOption === ScalerFilter.GREATER_THAN) {
                return nullValue ? 1 : -1;
            }

            if (selectedOption === ScalerFilter.GREATER_THAN_OR_EQUAL) {
                return nullValue ? 1 : -1;
            }

            if (selectedOption === ScalerFilter.LESS_THAN_OR_EQUAL) {
                return nullValue ? -1 : 1;
            }

            if (selectedOption === ScalerFilter.LESS_THAN) {
                return nullValue ? -1 : 1;
            }

            if (selectedOption === ScalerFilter.NOT_EQUAL) {
                return nullValue ? 1 : 0;
            }
        }

        const actualComparator: Comparator<T> = this.comparator();
        return actualComparator(filterValue, gridValue);
    }

    private canNullsPassFilter(type: string): boolean {
        switch (type) {
            case SimpleFilter.GREATER_THAN:
            case SimpleFilter.GREATER_THAN_OR_EQUAL:
                return this.scalarFilterParams.includeBlanksInGreaterThan;

            case SimpleFilter.LESS_THAN:
            case SimpleFilter.LESS_THAN_OR_EQUAL:
                return this.scalarFilterParams.includeBlanksInLessThan;

            case SimpleFilter.EQUALS:
                return this.scalarFilterParams.includeBlanksInEquals;
        }
    }

    protected individualConditionPasses(params: IDoesFilterPassParams, filterModel: ISimpleFilterModel) {

        const cellValue: any = this.scalarFilterParams.valueGetter(params.node);

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

        // why this? looks like logic that should be in parent class????
        // if (filterValue == null) {
        //     return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        // }

        const compareResult = this.nullComparator(filterType, filterValue, cellValue);

        if (filterType === ScalerFilter.EQUALS) {
            return compareResult === 0;
        }

        if (filterType === ScalerFilter.GREATER_THAN) {
            return compareResult > 0;
        }

        if (filterType === ScalerFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }

        if (filterType === ScalerFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }

        if (filterType === ScalerFilter.LESS_THAN) {
            return compareResult < 0;
        }

        if (filterType === ScalerFilter.NOT_EQUAL) {
            return compareResult != 0;
        }

        // From now on the type is a range and rawFilterValues must be an array!
        const compareToResult = this.nullComparator(filterType, filterValueTo, cellValue);
        if (filterType === ScalerFilter.IN_RANGE) {
            if (!this.scalarFilterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            } else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }

        throw new Error('Unexpected type of filter: ' + filterType);
    }
}