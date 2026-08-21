import type { LogService } from '../validation/logService';
import type {
    DateFilterOptionKey,
    IFilterOptionDef,
    ISimpleFilterParams,
    ScalarFilterOptionKey,
    TextFilterOptionKey,
} from './provided/iSimpleFilter';
import { _getMissingOptionProperties } from './provided/optionsFactory';
import type { ITextFilterParams } from './provided/text/iTextFilter';

/**
 * Every built-in key each filter can answer, as a `Record` so a key added to the union stops compiling until it
 * is answered here. The lists are what the dropdown may offer, so they are also what a model may name.
 */
const TEXT_OPTION_KEYS: Record<TextFilterOptionKey, true> = {
    empty: true,
    blank: true,
    notBlank: true,
    equals: true,
    notEqual: true,
    contains: true,
    notContains: true,
    startsWith: true,
    endsWith: true,
};

const SCALAR_OPTION_KEYS: Record<ScalarFilterOptionKey, true> = {
    empty: true,
    blank: true,
    notBlank: true,
    equals: true,
    notEqual: true,
    lessThan: true,
    lessThanOrEqual: true,
    greaterThan: true,
    greaterThanOrEqual: true,
    inRange: true,
};

const DATE_OPTION_KEYS: Record<DateFilterOptionKey, true> = {
    ...SCALAR_OPTION_KEYS,
    today: true,
    yesterday: true,
    tomorrow: true,
    thisWeek: true,
    lastWeek: true,
    nextWeek: true,
    thisMonth: true,
    lastMonth: true,
    nextMonth: true,
    thisQuarter: true,
    lastQuarter: true,
    nextQuarter: true,
    thisYear: true,
    lastYear: true,
    nextYear: true,
    yearToDate: true,
    last7Days: true,
    last30Days: true,
    last90Days: true,
    last6Months: true,
    last12Months: true,
    last24Months: true,
};

/** By filter name, because the filter is what evaluates the option; the data type only chooses the filter. */
const OPTION_KEYS_BY_FILTER: Record<string, Record<string, true>> = {
    agTextColumnFilter: TEXT_OPTION_KEYS,
    agNumberColumnFilter: SCALAR_OPTION_KEYS,
    agBigIntColumnFilter: SCALAR_OPTION_KEYS,
    agDateColumnFilter: DATE_OPTION_KEYS,
};

/**
 * The `filterOptions` a column can actually offer, reported and dropped where it cannot. Asked when the column
 * definition is read: a column filter is built when the user opens it, so a list checked there says nothing
 * about a misconfigured column until someone clicks it, and each layer that reads the list checks it again.
 */
export function _getUsableFilterOptions(
    log: LogService,
    filter: string,
    filterParams: ISimpleFilterParams
): (IFilterOptionDef | string)[] | undefined {
    const configuredOptions = filterParams.filterOptions;
    const supportedKeys = OPTION_KEYS_BY_FILTER[filter];
    if (!configuredOptions || !supportedKeys) {
        return configuredOptions;
    }
    // A `textMatcher` answers for itself, so it can mean any key the built-in matching cannot. Read as the
    // Text Filter's params because that is the filter the name resolved to.
    const anyKeyEvaluates = filter === 'agTextColumnFilter' && (filterParams as ITextFilterParams).textMatcher != null;

    let dropped = false;
    const usable: (IFilterOptionDef | string)[] = [];
    for (let i = 0, len = configuredOptions.length; i < len; ++i) {
        const option = configuredOptions[i];
        if (option == null) {
            continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
        }
        if (typeof option === 'string') {
            if (!anyKeyEvaluates && !supportedKeys[option]) {
                log.warn(76, { filterModelType: option });
                dropped = true;
                continue;
            }
        } else {
            const missing = _getMissingOptionProperties(option);
            if (missing) {
                log.warn(72, { keys: missing });
                dropped = true;
                continue;
            }
        }
        usable.push(option);
    }

    // Only an option the dropdown will list can be selected into it, so a `defaultOption` naming one that was
    // never offered is reported here too rather than when the filter opens.
    const defaultOption = filterParams.defaultOption;
    if (defaultOption != null && usable.length && !offersOption(usable, defaultOption)) {
        log.warn(326, { defaultOption });
    }
    return dropped ? usable : configuredOptions;
}

function offersOption(options: (IFilterOptionDef | string)[], key: string): boolean {
    for (let i = 0, len = options.length; i < len; ++i) {
        const option = options[i];
        if ((typeof option === 'string' ? option : option.displayKey) === key) {
            return true;
        }
    }
    return false;
}
