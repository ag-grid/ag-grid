import type { Comparator, IScalarFilterParams } from './iScalarFilter';
import type { FilterOptionKey, ISimpleFilterModel, Tuple } from './iSimpleFilter';
import { SimpleFilterHandler } from './simpleFilterHandler';
import { _isBlank } from './simpleFilterUtils';

export abstract class ScalarFilterHandler<
    TModel extends ISimpleFilterModel,
    TValue,
    TParams extends IScalarFilterParams,
> extends SimpleFilterHandler<TModel, TValue, TParams> {
    protected abstract comparator(): Comparator<TValue>;

    protected abstract isValid(value: TValue): boolean;

    /** A scalar has no use for a string that is empty or only whitespace, so it counts as absent. */
    protected override isNullValue(cellValue: unknown): boolean {
        return _isBlank(cellValue);
    }

    protected evaluateNullValue(filterType?: FilterOptionKey | null) {
        const {
            includeBlanksInEquals,
            includeBlanksInNotEqual,
            includeBlanksInGreaterThan,
            includeBlanksInLessThan,
            includeBlanksInRange,
        } = this.params.filterParams;
        switch (filterType) {
            case 'equals':
                if (includeBlanksInEquals) {
                    return true;
                }
                break;
            case 'notEqual':
                if (includeBlanksInNotEqual) {
                    return true;
                }
                break;
            case 'greaterThan':
            case 'greaterThanOrEqual':
                if (includeBlanksInGreaterThan) {
                    return true;
                }
                break;

            case 'lessThan':
            case 'lessThanOrEqual':
                if (includeBlanksInLessThan) {
                    return true;
                }
                break;
            case 'inRange':
                if (includeBlanksInRange) {
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

    protected evaluateNonNullValue(values: Tuple<TValue>, cellValue: TValue, filterModel: TModel): boolean {
        const type = filterModel.type;
        if (!this.isValid(cellValue)) {
            return type === 'notEqual' || type === 'notBlank';
        }

        // `isNullValue` consumed every blank before this ran, so these two need no comparator and no value.
        if (type === 'blank') {
            return false;
        }
        if (type === 'notBlank') {
            return true;
        }

        const comparator = this.comparator();

        const compareResult = values[0] != null ? comparator(values[0], cellValue) : 0;
        switch (type) {
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

                return this.params.filterParams.inRangeInclusive
                    ? compareResult >= 0 && compareToResult <= 0
                    : compareResult > 0 && compareToResult < 0;
            }

            default:
                this.warnUnexpectedFilterType(type);
                return true;
        }
    }
}
