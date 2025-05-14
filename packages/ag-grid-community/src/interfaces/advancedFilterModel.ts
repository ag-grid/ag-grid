import type { BaseCellDataType } from '../entities/dataType';

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

interface BaseAdvancedFilterModel {
    filterType: BaseCellDataType;
    /** The ID of the column being filtered. */
    colId: string;
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType | ScalarAdvancedFilterModelType | BooleanAdvancedFilterModelType;
}

interface WithOptionalStringFilter {
    /** The value to filter on. This is the same value as displayed in the input. */
    filter?: string;
}

interface BaseScalarAdvancedFilterModel extends BaseAdvancedFilterModel {
    /** The filter option that is being applied. */
    type: ScalarAdvancedFilterModelType;
}

/** Represents a single filter condition for a text column */
export interface TextAdvancedFilterModel extends BaseAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'text';
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType;
}

/** Represents a single filter condition for a number column */
export interface NumberAdvancedFilterModel extends BaseScalarAdvancedFilterModel {
    filterType: 'number';
    /** The value to filter on. */
    filter?: number;
}

/** Represents a single filter condition for a date column */
export interface DateAdvancedFilterModel extends BaseScalarAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'date';
}

/** Represents a single filter condition for a date string column */
export interface DateStringAdvancedFilterModel extends BaseScalarAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'dateString';
}

/** Represents a single filter condition for a boolean column */
export interface BooleanAdvancedFilterModel extends BaseAdvancedFilterModel {
    filterType: 'boolean';
    /** The filter option that is being applied. */
    type: BooleanAdvancedFilterModelType;
}

/** Represents a single filter condition for an object column */
export interface ObjectAdvancedFilterModel extends BaseAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'object';
    /** The filter option that is being applied. */
    type: TextAdvancedFilterModelType;
}

interface DateTimeAdvancedFilterModel extends BaseScalarAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'dateTime';
}

interface DateTimeStringAdvancedFilterModel extends BaseScalarAdvancedFilterModel, WithOptionalStringFilter {
    filterType: 'dateTimeString';
}

export abstract class BaseAdvancedFilterModelDefMap implements Record<BaseCellDataType, BaseAdvancedFilterModel> {
    boolean: BooleanAdvancedFilterModel;
    object: ObjectAdvancedFilterModel;
    date: DateAdvancedFilterModel;
    dateString: DateStringAdvancedFilterModel;
    dateTime: DateTimeAdvancedFilterModel;
    dateTimeString: DateTimeStringAdvancedFilterModel;
    number: NumberAdvancedFilterModel;
    text: TextAdvancedFilterModel;
}

/** Represents a single filter condition on a column */
export type ColumnAdvancedFilterModel = BaseAdvancedFilterModelDefMap[keyof BaseAdvancedFilterModelDefMap];
