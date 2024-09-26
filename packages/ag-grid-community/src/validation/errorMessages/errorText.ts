import type { ClientSideRowModelStep } from '../../interfaces/iClientSideRowModel';
import type { Column } from '../../interfaces/iColumn';
import type * as e from './errorTypeIds';

export type * as _ErrorType from './errorTypeIds';
/**
 * NOTES on setting console messages:
 * 1. The message is a function that returns either a string or an array of any type.
 * 2. Returning an array enables the console to log actual objects / numbers / booleans nicely as this will be spread to the underlying console call instead of being cast to a string.
 * 3. Each entry should be followed by as const so that the IDE hover shows the actual message to aid devs
 * 4. The number should add an ErrorType to errorCodeTypes.ts and this type must be used from the call location.
 *    This enables easy finding references of errors and also makes it clearer what the error is when reading the code.
 *    However, as it is just a type it does not add any bundle size.
 */
const errorMap = {
    [1 as e.RowDataNotAString]: () => '`rowData` must be an array' as const,
    [2 as e.DuplicateRowNode]: (nodeId: string | undefined) =>
        `Duplicate node id '${nodeId}' detected from getRowId callback, this could cause issues in your grid.` as const,
    [3 as e.NoResetHeightWithAutoHeight]: () =>
        'Calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.' as const,
    [4 as e.NotFoundRowId]: (id: string) => `Could not find row id=${id}, data item was not found for this id` as const,
    [5 as e.NotFoundDataItem]: (data: any) =>
        [
            `Could not find data item as object was not found.`,
            data,
            ' Consider using getRowId to help the Grid find matching row data',
        ] as const,
    [6 as e.GroupHideOpenParentsOnlyForShowRowGroup]: () =>
        `'groupHideOpenParents' only works when specifying specific columns for 'colDef.showRowGroup'` as const,
    [7 as e.PivotingNotSupportedAlignedGrids]: () =>
        'Pivoting is not supported with aligned grids as it may produce different columns in each grid.' as const,
    [8 as e.UnknownKeyNavigation]: (key: string) => `Unknown key for navigation ${key}` as const,
    [9 as e.NoValueForVariable]: (variable: { cssName: string; defaultValue: number }) =>
        `No value for ${variable.cssName}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${variable.defaultValue} will be used and updated when styles load.` as const,
    [10 as e.InvalidCSRMStep]: (step: ClientSideRowModelStep | undefined, stepsMapped: string[]) =>
        `Invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}` as const,
    [11 as e.NoGridOptions]: () => 'No gridOptions provided to createGrid' as const,
    [12 as e.NoColumnFoundForKey]: (colKey: string | Column) => ['column ', colKey, ' not found'] as const,
    [13 as e.NoRowIndexOnRowNode]: () =>
        'Could not find rowIndex, this means tasks are being executed on a rowNode that has been removed from the grid.' as const,
    [14 as e.RowIdCannotStartWithGroupPrefix]: (groupPrefix: string) =>
        `Row IDs cannot start with ${groupPrefix}, this is a reserved prefix for AG Grid's row grouping feature.` as const,
    [15 as e.InvalidExpressionType]: (expression: any) =>
        ['value should be either a string or a function', expression] as const,
    [16 as e.InvalidExpressionEvaluation]: (expression: string, params: any, e: any) =>
        [
            'Processing of the expression failed',
            'Expression = ',
            expression,
            'Params = ',
            params,
            'Exception = ',
            e,
        ] as const,
} as const;

export type ErrorMap = typeof errorMap;
export type ErrorId = keyof ErrorMap;

export type ErrorParams<TId extends ErrorId | null> = TId extends ErrorId ? Parameters<ErrorMap[TId]> : [never];

export function getError<TId extends ErrorId>(errorId: TId, ...args: ErrorParams<TId>): any[] {
    const msgOrFunc: ErrorMap[TId] = errorMap[errorId];

    if (!msgOrFunc) {
        return [`Missing error text for error id ${errorId}!`];
    }

    const errorBody = (msgOrFunc as any)(...args);
    if (Array.isArray(errorBody)) {
        return errorBody;
    } else {
        return [errorBody];
    }
}
