import type {
    AgColumn,
    BeanCollection,
    ColDef,
    HeaderValueGetterParams,
    IRowNode,
    ValueGetterParams,
} from 'ag-grid-community';
import { _MONTHS, _getDateParts, _parseDateTimeFromString } from 'ag-grid-community';

const getDate = (
    { valueSvc, dataTypeSvc }: BeanCollection,
    sourceCol: AgColumn,
    node: IRowNode | null
): Date | null => {
    const innerValue = valueSvc.getValue(sourceCol, node);
    let date: Date | null = null;
    if (innerValue instanceof Date) {
        date = innerValue;
    } else if (typeof innerValue === 'string') {
        const parseDate = dataTypeSvc?.getDateParserFunction(sourceCol) ?? _parseDateTimeFromString;
        date = parseDate(innerValue) ?? null;
    }

    return date;
};

export const getDatePartValueGetter =
    (beans: BeanCollection, col: AgColumn, index: number, map?: (part: string) => string) =>
    (params: ValueGetterParams) => {
        const date = getDate(beans, col, params.node);
        const parts = _getDateParts(date);
        if (!parts) {
            return null;
        }
        return map?.(parts[index]) ?? parts[index];
    };

export const getHeaderValueGetter =
    ({ colNames }: BeanCollection, col: AgColumn, part: string) =>
    (params: HeaderValueGetterParams) => {
        const sourceName = colNames.getDisplayNameForColumn(col, params.location);
        if (sourceName) {
            return `${sourceName} (${part})`;
        }
        return '';
    };

/** Map from named month to corresponding key in provided localeText maps (in @ag-grid-community/locale) */
const MONTH_TO_LOCALE_KEY = Object.fromEntries(_MONTHS.map((m) => [m, m.toLowerCase()]));

export const numericalMonthToNamedMonth = (monthStr: string): { month: string; localeKey: string } => {
    const month = _MONTHS[Number.parseInt(monthStr, 10) - 1] ?? monthStr;
    const localeKey = MONTH_TO_LOCALE_KEY[month] ?? monthStr;
    return { month, localeKey };
};

export function _getGroupHierarchy(colDef: ColDef): ColDef['groupHierarchy'] {
    return colDef.groupHierarchy ?? colDef.rowGroupingHierarchy;
}
