import { _warnOnce } from '../../utils/function';
import type { AgInputTextField } from '../../widgets/agInputTextField';
import type { Comparator, ScalarFilterParams } from './iScalarFilter';
import type { ISimpleFilterModel, ISimpleFilterModelType, Tuple } from './iSimpleFilter';
import { SimpleFilter } from './simpleFilter';

export abstract class ScalarFilter<M extends ISimpleFilterModel, V, E = AgInputTextField> extends SimpleFilter<
    M,
    V,
    E
> {
    private scalarFilterParams: ScalarFilterParams;

    protected abstract comparator(): Comparator<V>;

    protected override setParams(params: ScalarFilterParams): void {
        super.setParams(params);
        this.scalarFilterParams = params;
    }

    protected evaluateNullValue(filterType?: ISimpleFilterModelType | null) {
        switch (filterType) {
            case 'equals':
                if (this.scalarFilterParams.includeBlanksInEquals) {
                    return true;
                }
                break;
            case 'notEqual':
                if (this.scalarFilterParams.includeBlanksInNotEqual) {
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

                return this.scalarFilterParams.inRangeInclusive
                    ? compareResult >= 0 && compareToResult <= 0
                    : compareResult > 0 && compareToResult < 0;
            }

            case 'blank':
                return this.isBlank(cellValue);

            case 'notBlank':
                return !this.isBlank(cellValue);

            default:
                _warnOnce(
                    'Unexpected type of filter "' +
                        filterModel.type +
                        '", it looks like the filter was configured with incorrect Filter Options'
                );
                return true;
        }
    }
}
