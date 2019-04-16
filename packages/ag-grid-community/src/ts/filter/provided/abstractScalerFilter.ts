import {IDoesFilterPassParams} from "../../interfaces/iFilter";
import {Comparator, FilterConditionType, IScalarFilterParams, NullComparator} from "./abstractFilter";
import {AbstractComparableFilter} from "./abstractComparableFilter";

/**
 * Comparable filter with scalar underlying values (ie numbers and dates. Strings are not scalar so have to extend
 * ComparableBaseFilter)
 */
export abstract class AbstractScalerFilter<T, P extends IScalarFilterParams, M> extends AbstractComparableFilter<T, P, M> {
    static readonly DEFAULT_NULL_COMPARATOR: NullComparator = {
        equals: false,
        lessThan: false,
        greaterThan: false
    };

    public abstract comparator(): Comparator<T>;

    private nullComparator(type: string): Comparator<T> {
        return (filterValue: T, gridValue: T): number => {
            if (gridValue == null) {
                const nullValue = this.translateNull (type);

                if (this.selectedOption === AbstractComparableFilter.EMPTY) {
                    return 0;
                }

                if (this.selectedOption === AbstractComparableFilter.EQUALS) {
                    return nullValue ? 0 : 1;
                }

                if (this.selectedOption === AbstractComparableFilter.GREATER_THAN) {
                    return nullValue ? 1 : -1;
                }

                if (this.selectedOption === AbstractComparableFilter.GREATER_THAN_OR_EQUAL) {
                    return nullValue ? 1 : -1;
                }

                if (this.selectedOption === AbstractComparableFilter.LESS_THAN_OR_EQUAL) {
                    return nullValue ? -1 : 1;
                }

                if (this.selectedOption === AbstractComparableFilter.LESS_THAN) {
                    return nullValue ? -1 : 1;
                }

                if (this.selectedOption === AbstractComparableFilter.NOT_EQUAL) {
                    return nullValue ? 1 : 0;
                }
            }

            const actualComparator: Comparator<T> = this.comparator();
            return actualComparator (filterValue, gridValue);
        };
    }

    public getDefaultFilterOption(): string {
        return AbstractComparableFilter.EQUALS;
    }

    private translateNull(type: string): boolean {
        const reducedType: string =
            type.indexOf('greater') > -1 ? 'greaterThan' :
                type.indexOf('lessThan') > -1 ? 'lessThan' :
                    'equals';

        if (this.filterParams.nullComparator && (this.filterParams.nullComparator as any)[reducedType]) {
            return (this.filterParams.nullComparator as any)[reducedType];
        }

        return (AbstractScalerFilter.DEFAULT_NULL_COMPARATOR as any)[reducedType];
    }

    individualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType) {
        return this.doIndividualFilterPasses(params, type, type === FilterConditionType.MAIN ? this.selectedOption : this.selectedOptionCondition);
    }

    private doIndividualFilterPasses(params: IDoesFilterPassParams, type:FilterConditionType, filter: string) {
        const cellValue: any = this.filterParams.valueGetter(params.node);

        const rawFilterValues: T[] | T = this.filterValues(type);
        const filterValue: T = Array.isArray(rawFilterValues) ? rawFilterValues[0] : rawFilterValues;

        const customFilterOption = this.optionsFactory.getCustomOption(filter);
        if (customFilterOption) {
            // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
            if (filterValue != null || customFilterOption.hideFilterInput) {
                return customFilterOption.test(filterValue, cellValue);
            }
        }

        if (filterValue == null) {
            return type === FilterConditionType.MAIN ? true : this.conditionValue === 'AND';
        }

        const comparator: Comparator<T> = this.nullComparator (filter as string);
        const compareResult = comparator(filterValue, cellValue);

        if (filter === AbstractComparableFilter.EMPTY) {
            return false;
        }

        if (filter === AbstractComparableFilter.EQUALS) {
            return compareResult === 0;
        }

        if (filter === AbstractComparableFilter.GREATER_THAN) {
            return compareResult > 0;
        }

        if (filter === AbstractComparableFilter.GREATER_THAN_OR_EQUAL) {
            return compareResult >= 0;
        }

        if (filter === AbstractComparableFilter.LESS_THAN_OR_EQUAL) {
            return compareResult <= 0;
        }

        if (filter === AbstractComparableFilter.LESS_THAN) {
            return compareResult < 0;
        }

        if (filter === AbstractComparableFilter.NOT_EQUAL) {
            return compareResult != 0;
        }

        //From now on the type is a range and rawFilterValues must be an array!
        const compareToResult: number = comparator((rawFilterValues as T[])[1], cellValue);
        if (filter === AbstractComparableFilter.IN_RANGE) {
            if (!this.filterParams.inRangeInclusive) {
                return compareResult > 0 && compareToResult < 0;
            } else {
                return compareResult >= 0 && compareToResult <= 0;
            }
        }

        throw new Error('Unexpected type of filter: ' + filter);
    }
}