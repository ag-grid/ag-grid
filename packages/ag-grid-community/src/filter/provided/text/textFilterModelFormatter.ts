import { translateForFilter } from '../../filterLocaleText';
import { SimpleFilterModelFormatter, TEXT_FILTER_TYPE_KEYS } from '../simpleFilterModelFormatter';
import type { ITextFilterParams, TextFilterModel } from './iTextFilter';

export class TextFilterModelFormatter extends SimpleFilterModelFormatter<
    ITextFilterParams,
    typeof TEXT_FILTER_TYPE_KEYS
> {
    protected readonly filterTypeKeys = TEXT_FILTER_TYPE_KEYS;

    protected conditionToString(
        condition: TextFilterModel,
        forToolPanel: boolean,
        isRange: boolean,
        customDisplayKey: string | undefined,
        customDisplayName: string | undefined
    ): string {
        const { filter, filterTo, type } = condition;

        if (forToolPanel) {
            const getValueFunc = (value: string) => () => translateForFilter(this, 'filterSummaryTextQuote', [value]);
            const valueForToolPanel = this.conditionForToolPanel(
                type,
                isRange,
                getValueFunc(filter!),
                getValueFunc(filterTo!),
                customDisplayKey,
                customDisplayName
            );
            if (valueForToolPanel != null) {
                return valueForToolPanel;
            }
        }

        if (isRange) {
            return `${filter}-${filterTo}`;
        }

        // cater for when the type doesn't need a value
        if (filter != null) {
            return `${filter}`;
        }

        return `${type}`;
    }
}
