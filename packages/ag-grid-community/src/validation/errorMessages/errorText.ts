import type { ClientSideRowModelStep } from '../../interfaces/iClientSideRowModel';
import type { Column } from '../../interfaces/iColumn';

/**
 * NOTES on setting console messages:
 * 1. The message is a function that returns either a string or an array of any type.
 * 2. Returning an array enables the console to log actual objects / numbers / booleans nicely as this will be spread to the underlying console call instead of being cast to a string.
 * 3. Each entry should be followed by as const so that the IDE hover shows the actual message to aid devs
 */
export const AG_GRID_ERRORS = {
    1: () => '`rowData` must be an array' as const,
    2: ({ nodeId }: { nodeId: string | undefined }) =>
        `Duplicate node id '${nodeId}' detected from getRowId callback, this could cause issues in your grid.` as const,
    3: () => 'Calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.' as const,
    4: ({ id }: { id: string }) => `Could not find row id=${id}, data item was not found for this id` as const,
    5: ({ data }: { data: any }) =>
        [
            `Could not find data item as object was not found.`,
            data,
            ' Consider using getRowId to help the Grid find matching row data',
        ] as const,
    6: () => `'groupHideOpenParents' only works when specifying specific columns for 'colDef.showRowGroup'` as const,
    7: () => 'Pivoting is not supported with aligned grids as it may produce different columns in each grid.' as const,
    8: ({ key }: { key: string }) => `Unknown key for navigation ${key}` as const,
    9: ({ variable }: { variable: { cssName: string; defaultValue: number } }) =>
        `No value for ${variable.cssName}. This usually means that the grid has been initialised before styles have been loaded. The default value of ${variable.defaultValue} will be used and updated when styles load.` as const,
    10: ({ step, stepsMapped }: { step: ClientSideRowModelStep | undefined; stepsMapped: string[] }) =>
        `Invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}` as const,
    11: () => 'No gridOptions provided to createGrid' as const,
    12: ({ colKey }: { colKey: string | Column }) => ['column ', colKey, ' not found'] as const,
    13: () =>
        'Could not find rowIndex, this means tasks are being executed on a rowNode that has been removed from the grid.' as const,
    14: ({ groupPrefix }: { groupPrefix: string }) =>
        `Row IDs cannot start with ${groupPrefix}, this is a reserved prefix for AG Grid's row grouping feature.` as const,
    15: ({ expression }: { expression: any }) => ['value should be either a string or a function', expression] as const,
    16: ({ expression, params, e }: { expression: string; params: any; e: any }) =>
        [
            'Processing of the expression failed',
            'Expression = ',
            expression,
            'Params = ',
            params,
            'Exception = ',
            e,
        ] as const,
    17: ({ rowModelType }: { rowModelType: string }) =>
        `Could not find row model for rowModelType = ${rowModelType}` as const,
    18: () => `alignedGrids contains an undefined option.` as const, // Link should be added getDocLink('aligned-grids')
    19: () => `alignedGrids - No api found on the linked grid.` as const, // Link should be added getDocLink('aligned-grids')
    20: () =>
        `You may want to configure via a callback to avoid setup race conditions:
                     "alignedGrids: () => [linkedGrid]"` as const,
    21: () =>
        'pivoting is not supported with aligned grids. You can only use one of these features at a time in a grid.' as const,
    22: ({ key }: { key: string }) => `${key} is an initial property and cannot be updated.` as const,
    23: () =>
        'The return of `getRowHeight` cannot be zero. If the intention is to hide rows, use a filter instead.' as const,
    24: () => 'row height must be a number if not using standard row model' as const,
    25: ({ id }: { id: any }) =>
        [`The getRowId callback must return a string. The ID `, id, ` is being cast to a string.`] as const,
    26: ({ fnName, preDestroyLink }: { fnName: string; preDestroyLink: string }) => {
        return `Grid API function ${fnName}() cannot be called as the grid has been destroyed.\n Either clear local references to the grid api, when it is destroyed, or check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ${preDestroyLink}` as const;
    },
    27: ({ fnName, module }: { fnName: string; module: string }) =>
        `API function '${fnName}' not registered to module '${module}'` as const,
    28: () => 'setRowCount cannot be used while using row grouping.' as const,
    29: () =>
        'tried to call sizeColumnsToFit() but the grid is coming back with zero width, maybe the grid is not visible yet on the screen?' as const,
    30: ({ toIndex }: { toIndex: number }) =>
        [
            'tried to insert columns in invalid location, toIndex = ',
            toIndex,
            'remember that you should not count the moving columns when calculating the new index',
        ] as const,
    31: () => 'infinite loop in resizeColumnSets' as const,
    32: () =>
        'applyColumnState() - the state attribute should be an array, however an array was not found. Please provide an array of items (one for each col you want to change) for state.' as const,
    33: () =>
        'stateItem.aggFunc must be a string. if using your own aggregation functions, register the functions first before using them in get/set state. This is because it is intended for the column state to be stored and retrieved as simple JSON.' as const,

    34: ({ key }: { key: string }) =>
        `the column type '${key}' is a default column type and cannot be overridden.` as const,
    35: () =>
        `Column type definitions 'columnTypes' with a 'type' attribute are not supported because a column type cannot refer to another column type. Only column definitions 'columnDefs' can use the 'type' attribute to refer to a column type.` as const,
    36: ({ t }: { t: string }) => "colDef.type '" + t + "' does not correspond to defined gridOptions.columnTypes",
    37: () => `Changing the column pinning status is not allowed with domLayout='print'` as const,
    38: () => 'autoHeight columns only work with Client Side Row Model and Server Side Row Model.' as const,
    39: () =>
        'Applying column order broke a group where columns should be married together. Applying new order has been discarded.' as const,
    40: () => 'Pivot mode not available with treeData.' as const,
    41: () => 'headerValueGetter must be a function or a string' as const,
    42: () => "if colDef.type is supplied an array it should be of type 'string[]'" as const,
    43: () => "colDef.type should be of type 'string' | 'string[]'" as const,
} as const;

export type ErrorMap = typeof AG_GRID_ERRORS;
export type ErrorId = keyof ErrorMap;

type ErrorValue<TId extends ErrorId | null> = TId extends ErrorId ? ErrorMap[TId] : never;
export type GetErrorParams<TId extends ErrorId | null> =
    ErrorValue<TId> extends (params: infer P) => any ? P : Record<string, never>;

export function getError<TId extends ErrorId, TParams extends GetErrorParams<TId>>(errorId: TId, args: TParams): any[] {
    const msgOrFunc: ErrorMap[TId] = AG_GRID_ERRORS[errorId];

    if (!msgOrFunc) {
        return [`Missing error text for error id ${errorId}!`];
    }

    const errorBody = msgOrFunc(args as any);
    return Array.isArray(errorBody) ? errorBody : [errorBody];
}
