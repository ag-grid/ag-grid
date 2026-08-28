import type { CheckDataTypes } from '../entities/dataType';
import type { CustomFilterOptionKey } from '../filter/provided/iSimpleFilter';

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

export type BooleanAdvancedFilterModelType = 'true' | 'false' | 'blank' | 'notBlank';

/** Represents a single filter condition for a text column */
export interface TextAdvancedFilterModel {
    filterType: 'text';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. This is the same value as displayed in the input. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition for a number column */
export interface NumberAdvancedFilterModel {
    filterType: 'number';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. */
    filter?: number;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: number;
}

/** Represents a single filter condition for a bigint column */
interface BigIntAdvancedFilterModel {
    filterType: 'bigint';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition for a date column */
export interface DateAdvancedFilterModel {
    filterType: 'date';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. This is in format `YYYY-MM-DD`. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition for a date string column */
export interface DateStringAdvancedFilterModel {
    filterType: 'dateString';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. This is in format `YYYY-MM-DD`. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition for a boolean column */
export interface BooleanAdvancedFilterModel {
    filterType: 'boolean';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: BooleanAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. Only used by Custom Filter Options, as the built-in options take none. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition for an object column */
export interface ObjectAdvancedFilterModel {
    filterType: 'object';
    /** The ID of the column being filtered. */
    colId: string;
    /** The value to filter on. This is the same value as displayed in the input. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType | CustomFilterOptionKey;
}

export interface DateTimeAdvancedFilterModel {
    filterType: 'dateTime';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. This is in format `YYYY-MM-DDTHH:mm:ss`. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

export interface DateTimeStringAdvancedFilterModel {
    filterType: 'dateTimeString';
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType | CustomFilterOptionKey;
    /** The value to filter on. This is in format `YYYY-MM-DD HH:mm:ss`. */
    filter?: string;
    /** The second value to filter on, where the filter option takes two. */
    filterTo?: string;
}

/** Represents a single filter condition on a column */
export type ColumnAdvancedFilterModel =
    | BooleanAdvancedFilterModel
    | ObjectAdvancedFilterModel
    | DateAdvancedFilterModel
    | DateStringAdvancedFilterModel
    | DateTimeAdvancedFilterModel
    | DateTimeStringAdvancedFilterModel
    | BigIntAdvancedFilterModel
    | NumberAdvancedFilterModel
    | TextAdvancedFilterModel;

// Line below used for type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _CheckColumnAdvancedFilterModel = CheckDataTypes<{
    [K in ColumnAdvancedFilterModel['filterType']]: ColumnAdvancedFilterModel & { filterType: K };
}>;
