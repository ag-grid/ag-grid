import {SimpleFilter, ISimpleFilterParams, ISimpleFilterModel} from "./simpleFilter";
import {IDoesFilterPassParams} from "../../interfaces/iFilter";

export interface NullComparator {
    equals?: boolean;
    lessThan?: boolean;
    greaterThan?: boolean;
}

export interface IScalarFilterParams extends ISimpleFilterParams {
    inRangeInclusive?: boolean;
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
        const reducedType: string =
            type.indexOf('greater') > -1 ? 'greaterThan' :
                type.indexOf('lessThan') > -1 ? 'lessThan' :
                    'equals';

        if (this.scalarFilterParams.nullComparator && (this.scalarFilterParams.nullComparator as any)[reducedType]) {
            return (this.scalarFilterParams.nullComparator as any)[reducedType];
        }

        return (ScalerFilter.DEFAULT_NULL_COMPARATOR as any)[reducedType];
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

        if (filterType === ScalerFilter.EMPTY) {
            return false;
        }

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