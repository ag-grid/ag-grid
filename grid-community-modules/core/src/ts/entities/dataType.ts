import { ValueFormatterParams, ValueParserParams } from "./colDef";

export type ValueParserLiteParams<TData, TValue> = Omit<ValueParserParams<TData, TValue>, 'data' | 'node' | 'oldValue'>;

export interface ValueParserLiteFunc<TData, TValue> {
    (params: ValueParserLiteParams<TData, TValue>): TValue | undefined;
}

export type ValueFormatterLiteParams<TData, TValue> = Omit<ValueFormatterParams<TData, TValue>, 'data' | 'node'>;

export interface ValueFormatterLiteFunc<TData, TValue> {
    (params: ValueFormatterLiteParams<TData, TValue>): string;
}

interface BaseDataTypeDefinition<TValueType extends 'text' | 'number' | 'boolean' | 'date' | 'dateString' | 'object', TData = any, TValue = any> {
    baseDataType: TValueType;
    valueParser?: ValueParserLiteFunc<TData, TValue>;
	valueFormatter?: ValueFormatterLiteFunc<TData, TValue>;
	columnTypes?: string | string[];
    extends: string;
    appendColumnTypes?: boolean;
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
    convertToDate?: (value: string | undefined) => Date | undefined;
    matcher?: (value: string) => boolean;
}

export interface BaseObjectDataTypeDefinition<TData, TValue> extends Omit<BaseDataTypeDefinition<'object', TData, TValue>, 'extends' | 'appendColumnTypes'> {
	valueParser: ValueParserLiteFunc<TData, TValue>;
	valueFormatter: ValueFormatterLiteFunc<TData, TValue>;
}

export interface ObjectDataTypeDefinition<TData, TValue> extends BaseDataTypeDefinition<'object', TData, TValue> {
}

export type DataTypeDefinition<TData = any> =
    | TextDataTypeDefinition<TData>
    | NumberDataTypeDefinition<TData>
    | BooleanDataTypeDefinition<TData>
    | DateDataTypeDefinition<TData>
    | DateStringDataTypeDefinition<TData>
    | BaseObjectDataTypeDefinition<TData, any>
    | ObjectDataTypeDefinition<TData, any>;

export type CoreDataTypeDefinition<TData = any> = 
    | Omit<TextDataTypeDefinition<TData>, 'extends'>
    | Omit<NumberDataTypeDefinition<TData>, 'extends'>
    | Omit<BooleanDataTypeDefinition<TData>, 'extends'>
    | Omit<DateDataTypeDefinition<TData>, 'extends'>
    | Omit<DateStringDataTypeDefinition<TData>, 'extends'>
;

function padNumber(value: number): string {
    const stringValue = String(value);
    if (stringValue.length === 1) {
        return `0${stringValue}`;
    }
    return stringValue;
}

function convertStringToDate(value: string | undefined): Date | undefined {
    if (value == null) { return undefined; }
    const dateParts = value.split('-');
    if (dateParts.length < 3) { return undefined; }
    return new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );
}

export const DEFAULT_DATA_TYPES: { [key: string]: CoreDataTypeDefinition } = {
    number: {
        baseDataType: 'number',
        valueParser: (params: ValueParserLiteParams<any, number>) => params.newValue === '' ? undefined : Number(params.newValue),
        valueFormatter: (params: ValueFormatterLiteParams<any, number>) => params.value == null ? '' : String(params.value),
        columnTypes: 'agNumberColumn',
    },
    text: {
        baseDataType: 'text',
        columnTypes: 'agTextColumn',
    },
    boolean: {
        baseDataType: 'boolean',
        valueParser: (params: ValueParserLiteParams<any, boolean>) => params.newValue === '' ? undefined : String(params.newValue).toLowerCase() === 'true',
        valueFormatter: (params: ValueFormatterLiteParams<any, boolean>) => params.value == null ? '' : String(params.value),
        columnTypes: 'agBooleanColumn',
    },
    date: {
        baseDataType: 'date',
        valueParser: (params: ValueParserLiteParams<any, Date>) => convertStringToDate(params.newValue),
        valueFormatter: (params: ValueFormatterLiteParams<any, Date>) => {
            if (params.value == null) { return ''; }
            if (isNaN(params.value.getTime())) { return params.value.toString() }
            return `${params.value.getFullYear()}-${padNumber(params.value.getMonth() + 1)}-${padNumber(params.value.getDate())}`
        },
        columnTypes: 'agDateColumn',
    },
    dateString: {
        baseDataType: 'dateString',
        matcher: (value: string) => !!value.match('[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2}'),
        convertToDate: (value: string | undefined) => convertStringToDate(value),
        columnTypes: 'agDateStringColumn',
    }
}