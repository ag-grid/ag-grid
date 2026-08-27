import { _hasOwn } from 'ag-stack';

import type { AgColumn } from '../../entities/agColumn';
import type { FilterAction } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import { compileCharPattern } from './allowedCharPattern';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigInt/bigIntFilterConstants';
import type { ResolvedDateBounds } from './date/dateFilterBounds';
import { resolveDateBounds } from './date/dateFilterBounds';
import { DEFAULT_DATE_FILTER_OPTIONS } from './date/dateFilterConstants';
import type { IDateFilterParams } from './date/iDateFilter';
import type { IProvidedFilterParams } from './iProvidedFilter';
import type {
    CommonFilterOptionKey,
    FilterOptionKey,
    IFilterOptionDef,
    ISimpleFilterModelPresetType,
    ISimpleFilterParams,
    JoinOperator,
    ScalarFilterOptionKey,
    SimpleFilterType,
    TextFilterOptionKey,
} from './iSimpleFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './number/numberFilterConstants';
import { _isUseApplyButton } from './providedFilterUtils';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './text/textFilterConstants';

interface ResolvedConditionCounts {
    readonly maxNumConditions: number;
    readonly numAlwaysVisibleConditions: number;
    /** Absent where nothing was configured, so an API-set model keeps every condition it was given. */
    readonly conditionLimit: number | null;
}

interface ClassifiedFilterOptions {
    offered: Map<string, IFilterOptionDef | string>;
    customOptions: Map<string, IFilterOptionDef>;
}

/**
 * The actions a button list may name, so every producer of one is held to the same set.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const BUTTON_ACTIONS = {
    apply: 1,
    clear: 1,
    reset: 1,
    cancel: 1,
} satisfies Record<FilterAction, 1>;

/** Listed rather than tested inline, so the warning can name the property that was left out. */
const REQUIRED_OPTION_PROPERTIES: (keyof IFilterOptionDef)[] = ['displayKey', 'displayName', 'predicate'];

/** What each filter type offers when no `filterOptions` list narrows it. */
const DEFAULT_OPTIONS_BY_TYPE: Record<SimpleFilterType, string[]> = {
    text: DEFAULT_TEXT_FILTER_OPTIONS,
    number: DEFAULT_NUMBER_FILTER_OPTIONS,
    bigint: DEFAULT_BIGINT_FILTER_OPTIONS,
    date: DEFAULT_DATE_FILTER_OPTIONS,
};

/** `satisfies` completes each table both ways; a `readonly K[]` only checks each member is *a* valid key. */
const DATE_PRESET_KEYS = {
    today: 1,
    yesterday: 1,
    tomorrow: 1,
    thisWeek: 1,
    lastWeek: 1,
    nextWeek: 1,
    thisMonth: 1,
    lastMonth: 1,
    nextMonth: 1,
    thisQuarter: 1,
    lastQuarter: 1,
    nextQuarter: 1,
    thisYear: 1,
    lastYear: 1,
    nextYear: 1,
    yearToDate: 1,
    last7Days: 1,
    last30Days: 1,
    last90Days: 1,
    last6Months: 1,
    last12Months: 1,
    last24Months: 1,
} satisfies Record<ISimpleFilterModelPresetType, 1>;

const COMMON_KEYS = { empty: 1, blank: 1, notBlank: 1 } satisfies Record<CommonFilterOptionKey, 1>;

const TEXT_ONLY_KEYS = {
    equals: 1,
    notEqual: 1,
    contains: 1,
    notContains: 1,
    startsWith: 1,
    endsWith: 1,
} satisfies Record<Exclude<TextFilterOptionKey, CommonFilterOptionKey>, 1>;

const SCALAR_ONLY_KEYS = {
    equals: 1,
    notEqual: 1,
    lessThan: 1,
    lessThanOrEqual: 1,
    greaterThan: 1,
    greaterThanOrEqual: 1,
    inRange: 1,
} satisfies Record<Exclude<ScalarFilterOptionKey, CommonFilterOptionKey>, 1>;

/** Literals rather than a `new Set`: a module-scope call is one a bundler cannot prove droppable. */
type OptionKeyTable = Readonly<Record<string, 1>>;

/** Options naming a state or a period rather than taking a value, so they take no input. */
const ZERO_INPUT_KEYS: OptionKeyTable = { ...COMMON_KEYS, ...DATE_PRESET_KEYS };

/** What each type can evaluate, mirroring the `*FilterOptionKey` unions rather than the default dropdown -
 *  a date filter offers no relative range by default, yet `filterOptions` may name one. */
const TEXT_OPTION_KEYS: OptionKeyTable = { ...COMMON_KEYS, ...TEXT_ONLY_KEYS };

const SCALAR_OPTION_KEYS: OptionKeyTable = { ...COMMON_KEYS, ...SCALAR_ONLY_KEYS };

const OPTION_KEYS_BY_TYPE: Record<SimpleFilterType, OptionKeyTable> = {
    text: TEXT_OPTION_KEYS,
    number: SCALAR_OPTION_KEYS,
    bigint: SCALAR_OPTION_KEYS,
    date: { ...SCALAR_OPTION_KEYS, ...DATE_PRESET_KEYS },
};

/** The built-in lists are module constants, so every column falling back to one classifies the same array. */
const classifiedDefaults = new Map<SimpleFilterType, ClassifiedFilterOptions>();

/**
 * What the params every provided filter shares decide, so the Set, Multi and Group filters get a resolution
 * too, rather than only the four whose options can be read.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class ResolvedFilterConfig {
    /** An apply button defers the filter, which is what makes a debounce meaningless and an edit unapplied. */
    public readonly useApplyButton: boolean;
    /** Whether the column names any buttons of its own, which the Filters Tool Panel's own stand in for. */
    public readonly hasButtons: boolean;
    /** The wait a caller should use, or `undefined` to use its own default. Zero under an apply button,
     *  which already defers the filter, so a debounce would only delay what is deferred anyway. */
    public readonly debounceMs: number | undefined;

    public constructor(
        /** What this resolves for. Not the `filterParams`: a Multi Filter child's are a merge of its own over
         *  the column's, so the object a consumer is handed is not the one this was read from. */
        public readonly column: AgColumn,
        params: IProvidedFilterParams,
        /** Reports as it resolves; absent where a caller wants the resolution without the report. */
        log?: LogService
    ) {
        const colId = column.colId;
        const buttons = params.buttons;
        this.hasButtons = !!buttons?.length;
        for (let i = 0, len = buttons?.length ?? 0; i < len; ++i) {
            const type = buttons![i];
            if (!_hasOwn(BUTTON_ACTIONS, type)) {
                log?.warn(75, { type, colId }); // unknown `buttons` type
            }
        }

        const useApplyButton = _isUseApplyButton(params);
        this.useApplyButton = useApplyButton;
        this.debounceMs = useApplyButton ? 0 : params.debounceMs;
    }
}

/**
 * How an owner hands a filter the resolution it should read. Off the public filter params: which resolution
 * a child reads is the grid's business, not a caller's.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface WithFilterConfig {
    filterConfig?: ResolvedFilterConfig;
}

/**
 * What an owner handed this filter, if anything did.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _handedFilterConfig = (params: unknown): ResolvedFilterConfig | undefined =>
    (params as WithFilterConfig | null | undefined)?.filterConfig;

/**
 * A Multi Filter's own resolution, owning one per child under the index the Multi Filter knows it by. A field
 * rather than siblings in a column-wide list, so a child's resolution can only be reached through its parent.
 */
export class ResolvedMultiFilterConfig extends ResolvedFilterConfig {
    public constructor(
        column: AgColumn,
        params: IProvidedFilterParams,
        public readonly children: readonly (ResolvedFilterConfig | undefined)[],
        log?: LogService
    ) {
        super(column, params, log);
    }
}

/**
 * Everything a simple filter's `filterParams` decide. Resolving reports as it goes, so the rule a filter
 * reads and the rule that was reported cannot describe different things.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class ResolvedSimpleFilterConfig extends ResolvedFilterConfig {
    /** Which of the four this resolved as, so a consumer reads it rather than re-deriving it from a name. */
    public readonly filterType: SimpleFilterType;
    /** What the dropdown offers: the configured list minus its unusable entries, or the built-ins if none survive. */
    public readonly filterOptions: readonly (IFilterOptionDef | string)[];
    public readonly defaultOption?: string;

    public readonly conditionCounts: ResolvedConditionCounts;
    public readonly defaultJoinOperator: JoinOperator;
    /** Date filters only; the other types have no validity bounds to resolve. */
    public readonly dateBounds: ResolvedDateBounds | null;
    /** Null where none was named, or where the one named does not compile. */
    public readonly allowedCharPattern: RegExp | null;

    private readonly offeredOptions: Map<string, IFilterOptionDef | string>;
    private readonly customFilterOptions: Map<string, IFilterOptionDef>;
    /** The keys this filter can answer, or `undefined` where nothing can be sure and any key may be one. */
    private readonly evaluableKeys: OptionKeyTable | undefined;

    public constructor(column: AgColumn, params: ISimpleFilterParams, filterType: SimpleFilterType, log?: LogService) {
        super(column, params, log);
        this.filterType = filterType;
        const colId = column.colId;
        const configured = params.filterOptions as (IFilterOptionDef | string)[] | undefined;
        const evaluableKeys = getFilterOptionKeys(filterType, params);
        this.evaluableKeys = evaluableKeys;
        let classified = configured ? classifyFilterOptions(configured, colId, evaluableKeys, log) : undefined;

        // A column with nothing to offer cannot open its filter at all, so a list that keeps none falls back.
        if (!classified?.offered.size) {
            classified = classifyDefaults(filterType);
            if (configured) {
                log?.warn(74, { colId }); // the list kept nothing, so the built-in options stand in
            }
        }

        const offered = classified.offered;
        this.offeredOptions = offered;
        this.customFilterOptions = classified.customOptions;
        this.filterOptions = [...offered.values()];

        // Only an option the dropdown lists can be selected into it, so a default it lacks falls back
        // to the first one it offers.
        const defaultOption = params.defaultOption;
        if (defaultOption != null && offered.has(defaultOption)) {
            this.defaultOption = defaultOption;
        } else {
            const first = this.filterOptions[0];
            if (first != null) {
                this.defaultOption = typeof first === 'string' ? first : first.displayKey;
            }
            if (defaultOption != null) {
                log?.warn(326, { defaultOption, colId }); // `defaultOption` is not one of the offered options
            }
        }

        this.conditionCounts = resolveConditionCounts(params, log, colId);
        this.defaultJoinOperator = resolveJoinOperator(params.defaultJoinOperator);
        this.dateBounds = filterType === 'date' ? resolveDateBounds(params as IDateFilterParams, log, colId) : null;

        // Read by every text-input filter; the parameter is declared on the number and bigint params only,
        // but the shared base honours it for text as well.
        const pattern = (params as { allowedCharPattern?: string }).allowedCharPattern;
        const allowedCharPattern = pattern ? compileCharPattern(pattern) : null;
        this.allowedCharPattern = allowedCharPattern;
        if (pattern && !allowedCharPattern) {
            log?.warn(327, { pattern, colId }); // `allowedCharPattern` will not compile
        }
    }

    public hasOption(key?: string | null): boolean {
        return key != null && this.offeredOptions.has(key);
    }

    /**
     * Whether the filter can answer this key, offered or not. A model applied before the list narrowed still
     * names one, and the dropdown has to be able to show it - otherwise opening the filter rewrites the model
     * to the first offered option, losing the filter the moment the user looks at it.
     */
    public canEvaluate(key?: string | null): boolean {
        if (key == null) {
            return false;
        }
        if (this.customFilterOptions.has(key)) {
            return true;
        }
        const keys = this.evaluableKeys;
        return keys ? _hasOwn(keys, key) : true;
    }

    public getCustomOption(name?: string | null): IFilterOptionDef | undefined {
        return name == null ? undefined : this.customFilterOptions.get(name);
    }

    /** How many values the option takes: what a Custom Filter Option declares, else what the key implies. */
    public numberOfInputs(type: FilterOptionKey | null | undefined): number {
        if (type == null) {
            return 1;
        }
        const custom = this.customFilterOptions.get(type);
        if (custom) {
            return custom.numberOfInputs ?? 1;
        }
        if (_hasOwn(ZERO_INPUT_KEYS, type)) {
            return 0;
        }
        return type === 'inRange' ? 2 : 1;
    }
}

/**
 * What a `filterOptions` list offers, keyed in the order it first names them, reporting the entries it cannot
 * offer. `validKeys` is what the filter can evaluate, omitted where nothing can be sure of it.
 */
const classifyFilterOptions = (
    configuredOptions: (IFilterOptionDef | string)[],
    colId: string,
    validKeys?: OptionKeyTable,
    log?: LogService
): ClassifiedFilterOptions => {
    // A `Map` holds a key at the position it was first set in, so it dedupes without reordering the dropdown.
    const offered = new Map<string, IFilterOptionDef | string>();
    const customOptions = new Map<string, IFilterOptionDef>();
    const stringIndexes = new Map<string, number>();
    for (let i = 0, len = configuredOptions.length; i < len; ++i) {
        const option = configuredOptions[i];
        if (option == null) {
            continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
        } else if (typeof option === 'string') {
            if (!offered.has(option)) {
                offered.set(option, option); // a definition already stored outranks a bare key
                stringIndexes.set(option, i);
            }
        } else {
            const missing = REQUIRED_OPTION_PROPERTIES.filter((name) => option[name] == null);
            if (missing.length) {
                log?.warn(72, { index: i, displayKey: option.displayKey, missing, colId });
                continue;
            }
            const key = option.displayKey;
            offered.set(key, option);
            customOptions.set(key, option);
        }
    }
    if (validKeys) {
        // Judged once the list has been read through, because a key can be defined as a Custom Filter
        // Option after it is named as a string.
        stringIndexes.forEach((index, key) => {
            if (!_hasOwn(validKeys, key) && !customOptions.has(key)) {
                offered.delete(key);
                log?.warn(72, { index, displayKey: key, colId }); // named, but this filter cannot evaluate it
            }
        });
    }
    return { offered, customOptions };
};

const classifyDefaults = (filterType: SimpleFilterType): ClassifiedFilterOptions => {
    let classified = classifiedDefaults.get(filterType);
    if (!classified) {
        classified = classifyFilterOptions(DEFAULT_OPTIONS_BY_TYPE[filterType], '');
        classifiedDefaults.set(filterType, classified);
    }
    return classified;
};

/**
 * What the filter can evaluate, or `undefined` where nothing can be sure of it: a `textMatcher` is handed the
 * option key and may answer one the filter does not define, and a function cannot be inspected.
 */
const getFilterOptionKeys = (filterType: SimpleFilterType, params: ISimpleFilterParams): OptionKeyTable | undefined => {
    // Only the Text Filter declares one, but a stray matcher elsewhere should stay the hand rather than
    // narrow on a rule the column may not be playing by.
    return (params as { textMatcher?: unknown }).textMatcher ? undefined : OPTION_KEYS_BY_TYPE[filterType];
};

/** `NaN` is below it too: every comparison against it is false, so left through it would cap nothing. */
const isBelowConditionFloor = (count: number): boolean => count < 1 || Number.isNaN(count);

/** Whole counts, so what the display builds matches the limit a model is held to, under one definition. */
const resolveConditionCounts = (
    params: ISimpleFilterParams,
    log: LogService | undefined,
    colId: string
): ResolvedConditionCounts => {
    let maxNumConditions = Math.floor(params.maxNumConditions ?? 2);
    if (isBelowConditionFloor(maxNumConditions)) {
        maxNumConditions = 1;
        log?.warn(79, { colId }); // `maxNumConditions` below one
    }
    let numAlwaysVisibleConditions = Math.floor(params.numAlwaysVisibleConditions ?? 1);
    if (isBelowConditionFloor(numAlwaysVisibleConditions)) {
        numAlwaysVisibleConditions = 1;
        log?.warn(80, { colId }); // `numAlwaysVisibleConditions` below one
    }
    if (numAlwaysVisibleConditions > maxNumConditions) {
        numAlwaysVisibleConditions = maxNumConditions;
        log?.warn(81, { colId }); // `numAlwaysVisibleConditions` above `maxNumConditions`
    }
    return {
        maxNumConditions,
        numAlwaysVisibleConditions,
        conditionLimit: typeof params.maxNumConditions === 'number' ? maxNumConditions : null,
    };
};

const resolveJoinOperator = (defaultJoinOperator?: JoinOperator): JoinOperator =>
    defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
