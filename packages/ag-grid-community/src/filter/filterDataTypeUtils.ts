import type { BeanCollection, UserComponentName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ValueFormatterParams, ValueGetterFunc, ValueGetterParams } from '../entities/colDef';
import type {
    BaseCellDataType,
    CheckDataTypes,
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    DateStringDataTypeDefinition,
} from '../entities/dataType';
import type { ISetFilterParams } from '../interfaces/iSetFilter';
import type { LocaleTextFunc } from '../misc/locale/localeUtils';
import { _getDateParts } from '../utils/date';
import { _exists } from '../utils/generic';
import type { IDateFilterParams } from './provided/date/iDateFilter';
import type { ISimpleFilterParams } from './provided/iSimpleFilter';
import type { INumberFilterParams } from './provided/number/iNumberFilter';
import type { ITextFilterParams } from './provided/text/iTextFilter';

const MONTH_LOCALE_TEXT = {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
};
const MONTH_KEYS: (keyof typeof MONTH_LOCALE_TEXT)[] = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

function setFilterNumberComparator<TValue = any>(a: TValue | null, b: TValue | null): number {
    if (a == null) {
        return -1;
    }
    if (b == null) {
        return 1;
    }
    return parseFloat(a as string) - parseFloat(b as string);
}

function isValidDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

type FilterParamsDefArgs = {
    formatValue: DataTypeFormatValueFunc;
    t: LocaleTextFunc;
    dataTypeDefinition: CoreDataTypeDefinition;
};

type FilterParamCallback<P extends ISimpleFilterParams, V = string> = (
    args: FilterParamsDefArgs
) => ISetFilterParams<any, V> | P | undefined;

type FilterParamsDefMap = CheckDataTypes<{
    number: FilterParamCallback<INumberFilterParams, number>;
    boolean: FilterParamCallback<ITextFilterParams, boolean>;
    date: FilterParamCallback<IDateFilterParams, Date>;
    dateString: FilterParamCallback<IDateFilterParams>;
    dateTime: FilterParamCallback<IDateFilterParams, Date>;
    dateTimeString: FilterParamCallback<IDateFilterParams>;
    text: FilterParamCallback<ITextFilterParams>;
    object: FilterParamCallback<ITextFilterParams, any>;
}>;

// using an object here to enforce dev to not forget to implement new types as they are added
const filterParamsForEachDataType: FilterParamsDefMap = {
    number: () => undefined,
    boolean: () => ({
        maxNumConditions: 1,
        debounceMs: 0,
        filterOptions: [
            'empty',
            {
                displayKey: 'true',
                displayName: 'True',
                predicate: (_filterValues: any[], cellValue: any) => cellValue,
                numberOfInputs: 0,
            },
            {
                displayKey: 'false',
                displayName: 'False',
                predicate: (_filterValues: any[], cellValue: any) => cellValue === false,
                numberOfInputs: 0,
            },
        ],
    }),
    date: () => ({ isValidDate }),
    dateString: ({ dataTypeDefinition }) => ({
        comparator: (filterDate: Date, cellValue: string | undefined) => {
            const cellAsDate = (dataTypeDefinition as DateStringDataTypeDefinition).dateParser!(cellValue)!;
            if (cellValue == null || cellAsDate < filterDate) {
                return -1;
            }
            if (cellAsDate > filterDate) {
                return 1;
            }
            return 0;
        },
        isValidDate: (value: any) =>
            typeof value === 'string' &&
            isValidDate((dataTypeDefinition as DateStringDataTypeDefinition).dateParser!(value)),
    }),
    dateTime: (args) => filterParamsForEachDataType.date(args),
    dateTimeString: (args) => filterParamsForEachDataType.dateString(args),
    object: () => undefined,
    text: () => undefined,
};

// using an object here to enforce dev to not forget to implement new types as they are added
const setFilterParamsForEachDataType: FilterParamsDefMap = {
    number: () => ({ comparator: setFilterNumberComparator }),
    boolean: ({ t }) => ({
        valueFormatter: (params: ValueFormatterParams<any, boolean>) =>
            _exists(params.value) ? t(String(params.value), params.value ? 'True' : 'False') : t('blanks', '(Blanks)'),
    }),
    date: ({ formatValue, t }) => ({
        valueFormatter: (params: ValueFormatterParams) => {
            const valueFormatted = formatValue(params);
            return _exists(valueFormatted) ? valueFormatted : t('blanks', '(Blanks)');
        },
        treeList: true,
        treeListFormatter: (pathKey: string | null, level: number) => {
            if (pathKey === 'NaN') {
                return t('invalidDate', 'Invalid Date');
            }
            if (level === 1 && pathKey != null) {
                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                return t(monthKey, MONTH_LOCALE_TEXT[monthKey]);
            }
            return pathKey ?? t('blanks', '(Blanks)');
        },
        treeListPathGetter: (date: Date | null) => _getDateParts(date, false),
    }),
    dateString: ({ formatValue, dataTypeDefinition, t }) => ({
        valueFormatter: (params: ValueFormatterParams) => {
            const valueFormatted = formatValue(params);
            return _exists(valueFormatted) ? valueFormatted : t('blanks', '(Blanks)');
        },
        treeList: true,
        treeListPathGetter: (value: string | null) =>
            _getDateParts((dataTypeDefinition as DateStringDataTypeDefinition).dateParser!(value ?? undefined), false),
        treeListFormatter: (pathKey: string | null, level: number) => {
            if (level === 1 && pathKey != null) {
                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                return t(monthKey, MONTH_LOCALE_TEXT[monthKey]);
            }
            return pathKey ?? t('blanks', '(Blanks)');
        },
    }),
    dateTime: (args) => {
        const params = setFilterParamsForEachDataType.date(args) as ISetFilterParams<any, Date>;
        params.treeListPathGetter = _getDateParts;
        return params;
    },
    dateTimeString(args) {
        const convertToDate = (args.dataTypeDefinition as DateStringDataTypeDefinition).dateParser!;
        const params = setFilterParamsForEachDataType.dateString(args) as ISetFilterParams;
        params.treeListPathGetter = (value: string | null) => _getDateParts(convertToDate(value ?? undefined));
        return params;
    },
    object: ({ formatValue, t }) => ({
        valueFormatter: (params: ValueFormatterParams) => {
            const valueFormatted = formatValue(params);
            return _exists(valueFormatted) ? valueFormatted : t('blanks', '(Blanks)');
        },
    }),
    text: () => undefined,
};

export function _getFilterParamsForDataType(
    filter: string,
    existingFilterParams: any,
    existingFilterValueGetter: string | ValueGetterFunc | undefined,
    dataTypeDefinition: CoreDataTypeDefinition,
    formatValue: DataTypeFormatValueFunc,
    beans: BeanCollection,
    translate: LocaleTextFunc
): { filterParams?: any; filterValueGetter?: string | ValueGetterFunc } {
    let filterParams: any = existingFilterParams;
    let filterValueGetter: string | ValueGetterFunc | undefined = existingFilterValueGetter;
    const usingSetFilter = filter === 'agSetColumnFilter';
    if (!filterValueGetter && dataTypeDefinition.baseDataType === 'object' && !usingSetFilter) {
        filterValueGetter = ({ column, node }: ValueGetterParams) =>
            formatValue({ column, node, value: beans.valueSvc.getValue(column as AgColumn, node) });
    }
    const filterParamsMap = usingSetFilter ? setFilterParamsForEachDataType : filterParamsForEachDataType;
    const filterParamsGetter = filterParamsMap[dataTypeDefinition.baseDataType];
    const newFilterParams = filterParamsGetter({ dataTypeDefinition, formatValue, t: translate });
    filterParams =
        typeof existingFilterParams === 'object'
            ? {
                  ...newFilterParams,
                  ...existingFilterParams,
              }
            : newFilterParams;
    return { filterParams, filterValueGetter };
}

const defaultFilters: Record<BaseCellDataType, UserComponentName> = {
    boolean: 'agTextColumnFilter',
    date: 'agDateColumnFilter',
    dateString: 'agDateColumnFilter',
    dateTime: 'agDateColumnFilter',
    dateTimeString: 'agDateColumnFilter',
    number: 'agNumberColumnFilter',
    object: 'agTextColumnFilter',
    text: 'agTextColumnFilter',
};

const defaultFloatingFilters: Record<BaseCellDataType, UserComponentName> = {
    boolean: 'agTextColumnFloatingFilter',
    date: 'agDateColumnFloatingFilter',
    dateString: 'agDateColumnFloatingFilter',
    dateTime: 'agDateColumnFloatingFilter',
    dateTimeString: 'agDateColumnFloatingFilter',
    number: 'agNumberColumnFloatingFilter',
    object: 'agTextColumnFloatingFilter',
    text: 'agTextColumnFloatingFilter',
};

export function _getDefaultSimpleFilter(cellDataType?: BaseCellDataType, isFloating: boolean = false): string {
    const filterSet = isFloating ? defaultFloatingFilters : defaultFilters;
    return filterSet[cellDataType ?? 'text'];
}
