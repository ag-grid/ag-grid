import { parseDateTimeFromString, serialiseDate } from "../utils/date";
import { toStringOrNull } from "../utils/generic";
import { BaseColDefOptionalDataParams, ValueFormatterParams, ValueParserParams } from "./colDef";

export type ValueParserLiteParams<TData, TValue> = Omit<ValueParserParams<TData, TValue>, 'data' | 'node' | 'oldValue'>;

export interface ValueParserLiteFunc<TData, TValue> {
    (params: ValueParserLiteParams<TData, TValue>): TValue | undefined;
}

export type ValueFormatterLiteParams<TData, TValue> = Omit<ValueFormatterParams<TData, TValue>, 'data' | 'node'>;

export interface ValueFormatterLiteFunc<TData, TValue> {
    (params: ValueFormatterLiteParams<TData, TValue>): string;
}

export type DataTypeCheckerParams<TData, TValue> = Omit<BaseColDefOptionalDataParams<TData, TValue>, 'data' | 'node'> & {
    value: TValue | undefined;
}

export interface DataTypeChecker<TData, TValue> {
    (params: DataTypeCheckerParams<TData, TValue>): boolean;
}

export type BaseCellDataType = 'text' | 'number' | 'boolean' | 'date' | 'dateString' | 'object';

interface BaseDataTypeDefinition<TValueType extends BaseCellDataType, TData = any, TValue = any> {
    baseDataType: TValueType;
    valueParser?: ValueParserLiteFunc<TData, TValue>;
	valueFormatter?: ValueFormatterLiteFunc<TData, TValue>;
    dataTypeChecker?: DataTypeChecker<TData, TValue>;
	columnTypes?: string | string[];
    extends: string;
    appendColumnTypes?: boolean;
    suppressDefaultProperties?: boolean;
}

export interface TextDataTypeDefinition<TData = any> extends BaseDataTypeDefinition<'text', TData, string> {
}

export interface NumberDataTypeDefinition<TData = any> extends BaseDataTypeDefinition<'number', TData, number> {
}

export interface BooleanDataTypeDefinition<TData = any> extends BaseDataTypeDefinition<'boolean', TData, boolean> {
}
export interface DateDataTypeDefinition<TData = any> extends BaseDataTypeDefinition<'date', TData, Date> {
}

export interface DateStringDataTypeDefinition<TData = any> extends BaseDataTypeDefinition<'dateString', TData, string> {
    dateParser?: (value: string | undefined) => Date | undefined;
    dateFormatter?: (value: Date | undefined) => string | undefined;
    dateMatcher?: (value: string) => boolean;
}

export interface ObjectDataTypeDefinition<TData, TValue> extends BaseDataTypeDefinition<'object', TData, TValue> {
}

export type DataTypeDefinition<TData = any> =
    | TextDataTypeDefinition<TData>
    | NumberDataTypeDefinition<TData>
    | BooleanDataTypeDefinition<TData>
    | DateDataTypeDefinition<TData>
    | DateStringDataTypeDefinition<TData>
    | ObjectDataTypeDefinition<TData, any>;

export type CoreDataTypeDefinition<TData = any> = 
    | Omit<TextDataTypeDefinition<TData>, 'extends'>
    | Omit<NumberDataTypeDefinition<TData>, 'extends'>
    | Omit<BooleanDataTypeDefinition<TData>, 'extends'>
    | Omit<DateDataTypeDefinition<TData>, 'extends'>
    | Omit<DateStringDataTypeDefinition<TData>, 'extends'>
    | Omit<ObjectDataTypeDefinition<TData, any>, 'extends'>;

function defaultDateFormatMatcher(value: string): boolean {
    return !!value.match('\\d{4}-\\d{2}-\\d{2}')
}

export const DEFAULT_DATA_TYPES: { [key: string]: CoreDataTypeDefinition } = {
    number: {
        baseDataType: 'number',
        valueParser: (params: ValueParserLiteParams<any, number>) => params.newValue === '' ? undefined : Number(params.newValue),
        valueFormatter: (params: ValueFormatterLiteParams<any, number>) => params.value == null ? '' : String(params.value),
        dataTypeChecker: (params: DataTypeCheckerParams<any, number>) => params.value == null || typeof params.value === 'number',
    },
    text: {
        baseDataType: 'text',
    },
    boolean: {
        baseDataType: 'boolean',
        valueParser: (params: ValueParserLiteParams<any, boolean>) => params.newValue === '' ? undefined : String(params.newValue).toLowerCase() === 'true',
        valueFormatter: (params: ValueFormatterLiteParams<any, boolean>) => params.value == null ? '' : String(params.value),
        dataTypeChecker: (params: DataTypeCheckerParams<any, boolean>) => params.value == null || typeof params.value === 'boolean',
    },
    date: {
        baseDataType: 'date',
        valueParser: (params: ValueParserLiteParams<any, Date>) => parseDateTimeFromString(params.newValue == null ? null : String(params.newValue)) ?? undefined,
        valueFormatter: (params: ValueFormatterLiteParams<any, Date>) => {
            if (params.value == null) { return ''; }
            if (!(params.value instanceof Date)) { return new Date(NaN).toString(); }
            if (isNaN(params.value.getTime())) { return params.value.toString() }
            return serialiseDate(params.value, false) ?? '';
        },
        dataTypeChecker: (params: DataTypeCheckerParams<any, Date>) => params.value == null || params.value instanceof Date,
    },
    dateString: {
        baseDataType: 'dateString',
        dateMatcher: (value: string) => defaultDateFormatMatcher(value),
        dateParser: (value: string | undefined) => parseDateTimeFromString(value) ?? undefined,
        dateFormatter: (value: Date | undefined) => serialiseDate(value ?? null, false) ?? undefined,
        valueParser: (params: ValueParserLiteParams<any, string>) => defaultDateFormatMatcher(String(params.newValue)) ? params.newValue : undefined,
        valueFormatter: (params: ValueFormatterLiteParams<any, string>) => defaultDateFormatMatcher(String(params.value)) ? params.value : '',
        dataTypeChecker: (params: DataTypeCheckerParams<any, string>) => params.value == null || (typeof params.value === 'string' && defaultDateFormatMatcher(params.value)),
    },
    object: {
        baseDataType: 'object',
        valueParser: () => undefined,
        valueFormatter: (params: ValueFormatterLiteParams<any, any>) => toStringOrNull(params.value) ?? '',
    }
}