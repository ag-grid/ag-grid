export type AdvancedFilterModel = JoinAdvancedFilterModel | ColumnAdvancedFilterModel;

export interface JoinAdvancedFilterModel {
    filterType: 'join';
    type: 'AND' | 'OR';
    conditions: AdvancedFilterModel[];
}

export type ColumnAdvancedFilterModel = 
    | TextAdvancedFilterModel
    | NumberAdvancedFilterModel
    | BooleanAdvancedFilterModel
    | DateAdvancedFilterModel
    | DateStringAdvancedFilterModel
    | ObjectAdvancedFilterModel;

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

export type BooleanAdvancedFilterModelType =
    | 'true'
    | 'false';

export interface TextAdvancedFilterModel {
    filterType: 'text';
    colId: string;
    type: TextAdvancedFilterModelType;
    filter?: string;
}

export interface NumberAdvancedFilterModel {
    filterType: 'number';
    colId: string;
    type: ScalarAdvancedFilterModelType;
    filter?: number;
}

export interface DateAdvancedFilterModel {
    filterType: 'date';
    colId: string;
    type: ScalarAdvancedFilterModelType;
    filter?: Date;
}

export interface DateStringAdvancedFilterModel {
    filterType: 'dateString';
    colId: string;
    type: ScalarAdvancedFilterModelType;
    filter?: string;
}

export interface BooleanAdvancedFilterModel {
    filterType: 'boolean';
    colId: string;
    type: BooleanAdvancedFilterModelType;
}

export interface ObjectAdvancedFilterModel<TValue = any> {
    filterType: 'object';
    colId: string;
    type: TextAdvancedFilterModelType;
    filter?: TValue;
}
