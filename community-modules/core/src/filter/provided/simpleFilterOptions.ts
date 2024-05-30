import type { ISimpleFilterModelType } from './iSimpleFilter';

export class SimpleFilterOptions {
    public static EMPTY: ISimpleFilterModelType = 'empty';
    public static BLANK: ISimpleFilterModelType = 'blank';
    public static NOT_BLANK: ISimpleFilterModelType = 'notBlank';
    public static EQUALS: ISimpleFilterModelType = 'equals';
    public static NOT_EQUAL: ISimpleFilterModelType = 'notEqual';
    public static LESS_THAN: ISimpleFilterModelType = 'lessThan';
    public static LESS_THAN_OR_EQUAL: ISimpleFilterModelType = 'lessThanOrEqual';
    public static GREATER_THAN: ISimpleFilterModelType = 'greaterThan';
    public static GREATER_THAN_OR_EQUAL: ISimpleFilterModelType = 'greaterThanOrEqual';
    public static IN_RANGE: ISimpleFilterModelType = 'inRange';
    public static CONTAINS: ISimpleFilterModelType = 'contains';
    public static NOT_CONTAINS: ISimpleFilterModelType = 'notContains';
    public static STARTS_WITH: ISimpleFilterModelType = 'startsWith';
    public static ENDS_WITH: ISimpleFilterModelType = 'endsWith';
}
