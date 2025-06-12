import { translateForFilter } from '../../filterLocaleText';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ISimpleFilterModelType } from '../iSimpleFilter';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { ITextFilterParams, TextFilterModel } from './iTextFilter';

export class TextFilterModelFormatter extends SimpleFilterModelFormatter<ITextFilterParams> {
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

    protected override getTypeKey(type: ISimpleFilterModelType | null | undefined): FilterLocaleTextKey | null {
        const addPrefix = <T extends string>(suffix: T) => `filterSummary${suffix}` as const;
        switch (type) {
            case 'contains':
                return addPrefix('Contains');
            case 'notContains':
                return addPrefix('NotContains');
            case 'equals':
                return addPrefix('TextEquals');
            case 'notEqual':
                return addPrefix('TextNotEqual');
            case 'startsWith':
                return addPrefix('StartsWith');
            case 'endsWith':
                return addPrefix('EndsWith');
            case 'inRange':
                return addPrefix('InRange');
        }
        return null;
    }
}
