import type { ValueGetterFunc } from '../entities/colDef';
import type { CheckDataTypes, CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { ColumnFilterService } from '../filter/columnFilterService';
import type { IDateFilterParams } from '../filter/provided/date/iDateFilter';
import type { SimpleFilterParams } from '../filter/provided/iSimpleFilter';
import type { ValueService } from '../valueService/valueService';
import type { ISetFilterParams } from './iSetFilter';

export type AdvancedFilterModel = JoinAdvancedFilterModel | ColumnAdvancedFilterModel;

/** Represents a series of filter conditions joined together. */
export interface JoinAdvancedFilterModel {
    filterType: 'join';
    /** How the conditions are joined together */
    type: 'AND' | 'OR';
    /** The filter conditions that are joined by the `type` */
    conditions: AdvancedFilterModel[];
}

export type TextAdvancedFilterModelType =
    | 'equals'
    | 'notEqual'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
    | 'blank'
    | 'notBlank';

export type ScalarAdvancedFilterModelType =
    | 'equals'
    | 'notEqual'
    | 'lessThan'
    | 'lessThanOrEqual'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'blank'
    | 'notBlank';

export type BooleanAdvancedFilterModelType = 'true' | 'false';

/** Represents a single filter condition for a text column */
export interface TextAdvancedFilterModel {
    filterType: 'text';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType;
    /** The value to filter on. This is the same value as displayed in the input. */
    filter?: string;
}

/** Represents a single filter condition for a number column */
export interface NumberAdvancedFilterModel {
    filterType: 'number';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
    /** The value to filter on. */
    filter?: number;
}

/** Represents a single filter condition for a date column */
export interface DateAdvancedFilterModel {
    filterType: 'date';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
    /** The value to filter on. This is in format `YYYY-MM-DD`. */
    filter?: string;
}

/** Represents a single filter condition for a date string column */
export interface DateStringAdvancedFilterModel {
    filterType: 'dateString';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
    /** The value to filter on. This is in format `YYYY-MM-DD`. */
    filter?: string;
}

/** Represents a single filter condition for a boolean column */
export interface BooleanAdvancedFilterModel {
    filterType: 'boolean';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: BooleanAdvancedFilterModelType;
}

/** Represents a single filter condition for an object column */
export interface ObjectAdvancedFilterModel {
    filterType: 'object';
    /** The ID of the column being filtered. */
    colId: string;
    /** The value to filter on. This is the same value as displayed in the input. */
    filter?: string;
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType;
}

export interface DateTimeAdvancedFilterModel {
    filterType: 'dateTime';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
    /** The value to filter on. This is in format `YYYY-MM-DD HH:mm:ss`. */
    filter?: string;
}

export interface DateTimeStringAdvancedFilterModel {
    filterType: 'dateTimeString';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
    /** The value to filter on. This is in format `YYYY-MM-DD HH:mm:ss`. */
    filter?: string;
}

export type FilterModelDefMap = CheckDataTypes<{
    boolean: BooleanAdvancedFilterModel;
    object: ObjectAdvancedFilterModel;
    date: DateAdvancedFilterModel;
    dateString: DateStringAdvancedFilterModel;
    dateTime: DateTimeAdvancedFilterModel;
    dateTimeString: DateTimeStringAdvancedFilterModel;
    number: NumberAdvancedFilterModel;
    text: TextAdvancedFilterModel;
}>;
type Translator = ReturnType<ColumnFilterService['getLocaleTextFunc']>;
type FilterParamsDefArgs = {
    formatValue: DataTypeFormatValueFunc;
    t: Translator;
    valueSvc: ValueService;
    usingSetFilter: boolean;
    dataTypeDefinition: CoreDataTypeDefinition;
};
export type FilterParamsDefMap = CheckDataTypes<{
    number: (args: FilterParamsDefArgs) => ISetFilterParams<any, number> | void;
    boolean: (args: FilterParamsDefArgs) => ISetFilterParams<any, boolean> | SimpleFilterParams;
    date: (args: FilterParamsDefArgs) => ISetFilterParams<any, Date> | IDateFilterParams;
    dateString: (args: FilterParamsDefArgs) => ISetFilterParams | IDateFilterParams;
    dateTime: (args: FilterParamsDefArgs) => ISetFilterParams<any, Date> | IDateFilterParams;
    dateTimeString: (args: FilterParamsDefArgs) => ISetFilterParams | IDateFilterParams;
    object: (args: FilterParamsDefArgs) => ISetFilterParams<any, any> | ValueGetterFunc;
    text: () => void;
}>;

/** Represents a single filter condition on a column */
export type ColumnAdvancedFilterModel = FilterModelDefMap[keyof FilterModelDefMap];
