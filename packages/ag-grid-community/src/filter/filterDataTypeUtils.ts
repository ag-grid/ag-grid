import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '../entities/colDef';
import type {
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    DateStringDataTypeDefinition,
} from '../entities/dataType';
import { _isSetFilterByDefault } from '../gridOptionsUtils';
import type { LocaleTextFunc } from '../misc/locale/localeUtils';
import { _exists } from '../utils/generic';

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

function setFilterNumberComparator(a: string, b: string): number {
    if (a == null) {
        return -1;
    }
    if (b == null) {
        return 1;
    }
    return parseFloat(a) - parseFloat(b);
}

function isValidDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

export function _setColDefPropsForDataType(
    colDef: ColDef,
    dataTypeDefinition: CoreDataTypeDefinition,
    formatValue: DataTypeFormatValueFunc,
    beans: BeanCollection,
    translate: LocaleTextFunc
): void {
    const usingSetFilter = _isSetFilterByDefault(beans.gos);
    const mergeFilterParams = (params: any) => {
        const { filterParams } = colDef;
        colDef.filterParams =
            typeof filterParams === 'object'
                ? {
                      ...filterParams,
                      ...params,
                  }
                : params;
    };
    switch (dataTypeDefinition.baseDataType) {
        case 'number': {
            if (usingSetFilter) {
                mergeFilterParams({
                    comparator: setFilterNumberComparator,
                });
            }
            break;
        }
        case 'boolean': {
            if (usingSetFilter) {
                mergeFilterParams({
                    valueFormatter: (params: ValueFormatterParams) => {
                        if (!_exists(params.value)) {
                            return translate('blanks', '(Blanks)');
                        }
                        return translate(String(params.value), params.value ? 'True' : 'False');
                    },
                });
            } else {
                mergeFilterParams({
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
                });
            }
            break;
        }
        case 'date': {
            if (usingSetFilter) {
                mergeFilterParams({
                    valueFormatter: (params: ValueFormatterParams) => {
                        const valueFormatted = formatValue(params);
                        return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                    },
                    treeList: true,
                    treeListFormatter: (pathKey: string | null, level: number) => {
                        if (pathKey === 'NaN') {
                            return translate('invalidDate', 'Invalid Date');
                        }
                        if (level === 1 && pathKey != null) {
                            const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                            return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                        }
                        return pathKey ?? translate('blanks', '(Blanks)');
                    },
                });
            } else {
                mergeFilterParams({
                    isValidDate,
                });
            }
            break;
        }
        case 'dateString': {
            const convertToDate = (dataTypeDefinition as DateStringDataTypeDefinition).dateParser!;
            if (usingSetFilter) {
                mergeFilterParams({
                    valueFormatter: (params: ValueFormatterParams) => {
                        const valueFormatted = formatValue(params);
                        return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                    },
                    treeList: true,
                    treeListPathGetter: (value: string | null) => {
                        const date = convertToDate(value ?? undefined);
                        return date
                            ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())]
                            : null;
                    },
                    treeListFormatter: (pathKey: string | null, level: number) => {
                        if (level === 1 && pathKey != null) {
                            const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                            return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                        }
                        return pathKey ?? translate('blanks', '(Blanks)');
                    },
                });
            } else {
                mergeFilterParams({
                    comparator: (filterDate: Date, cellValue: string | undefined) => {
                        const cellAsDate = convertToDate(cellValue)!;
                        if (cellValue == null || cellAsDate < filterDate) {
                            return -1;
                        }
                        if (cellAsDate > filterDate) {
                            return 1;
                        }
                        return 0;
                    },
                    isValidDate: (value: any) => typeof value === 'string' && isValidDate(convertToDate(value)),
                });
            }
            break;
        }
        case 'object': {
            if (usingSetFilter) {
                mergeFilterParams({
                    valueFormatter: (params: ValueFormatterParams) => {
                        const valueFormatted = formatValue(params);
                        return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                    },
                });
            } else {
                colDef.filterValueGetter = (params: ValueGetterParams) =>
                    formatValue({
                        column: params.column,
                        node: params.node,
                        value: beans.valueSvc.getValue(params.column as AgColumn, params.node),
                    });
            }
            break;
        }
    }
}
