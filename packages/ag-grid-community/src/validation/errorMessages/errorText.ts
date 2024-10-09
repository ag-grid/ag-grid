import { BASE_URL } from '../../baseUrl';
import type { UserComponentName } from '../../context/context';
import type { ClientSideRowModelStep } from '../../interfaces/iClientSideRowModel';
import type { Column } from '../../interfaces/iColumn';
import type { ModuleName } from '../../interfaces/iModule';
import { _fuzzySuggestions } from '../../utils/fuzzyMatch';
import { getErrorLink } from '../logging';

const missingModule = ({
    reason,
    moduleName,
    gridScoped,
    gridId,
    isEnterprise,
}: {
    reason: string;
    moduleName: ModuleName;
    gridScoped: boolean;
    gridId: string;
    isEnterprise?: boolean;
}) =>
    `Unable to use ${reason} as ${moduleName} is not registered${gridScoped ? ' for gridId: ' + gridId : ''}. Check if you have registered the module:
import { ModuleRegistry } from 'ag-grid-community';
import { ${moduleName} } from '${isEnterprise ? 'ag-grid-enterprise' : 'ag-grid-community'}';

ModuleRegistry.registerModules([ ${moduleName} ]);

For more info see: ${BASE_URL}/javascript-grid/modules/`;

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
    // 17: () => '' as const,
    18: () => `alignedGrids contains an undefined option.` as const,
    19: () => `alignedGrids - No api found on the linked grid.` as const,
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
    // 38: () => '' as const,
    39: () =>
        'Applying column order broke a group where columns should be married together. Applying new order has been discarded.' as const,
    // 40: () => '' as const,
    // 41: () => '' as const,
    // 42: () => '' as const,
    // 43: () => '' as const,
    44: () =>
        'Data type definition hierarchies (via the "extendsDataType" property) cannot contain circular references.' as const,
    45: ({ parentCellDataType }: { parentCellDataType: string }) =>
        `The data type definition ${parentCellDataType} does not exist.` as const,
    46: () => 'The "baseDataType" property of a data type definition must match that of its parent.' as const,
    47: ({ cellDataType }: { cellDataType: string }) => `Missing data type definition - "${cellDataType}"` as const,
    48: ({ property }: { property: string }) =>
        `Cell data type is "object" but no Value ${property} has been provided. Please either provide an object data type definition with a Value ${property}, or set "colDef.value${property}"` as const,
    49: ({ methodName }: { methodName: string }) =>
        `Framework component is missing the method ${methodName}()` as const,
    50: ({ compName }: { compName: string | undefined }) =>
        `Could not find component ${compName}, did you forget to configure this component?` as const,
    51: () => `Export cancelled. Export is not allowed as per your configuration.` as const,
    52: () => 'There is no `window` associated with the current `document`' as const,
    53: () => `unknown value type during csv conversion` as const,
    54: () => 'Could not find document body, it is needed for drag and drop.' as const,
    55: () => 'addRowDropZone - A container target needs to be provided' as const,
    56: () =>
        'addRowDropZone - target already exists in the list of DropZones. Use `removeRowDropZone` before adding it again.' as const,
    // 57: () => '' as const,
    58: () => 'no values found for select cellEditor' as const,
    59: () => 'cannot select pinned rows' as const,
    60: () => 'cannot select node until id for node is known' as const,
    61: () =>
        'since version v32.2.0, rowNode.isFullWidthCell() has been deprecated. Instead check `rowNode.detail` followed by the user provided `isFullWidthRow` grid option.' as const,
    62: ({ colId }: { colId: string }) => `setFilterModel() - no column found for colId: ${colId}` as const,
    63: ({ colId }: { colId: string }) =>
        `setFilterModel() - unable to fully apply model, filtering disabled for colId: ${colId}` as const,
    64: ({ colId }: { colId: string }) =>
        `setFilterModel() - unable to fully apply model, unable to create filter for colId: ${colId}` as const,
    65: () => 'filter missing setModel method, which is needed for setFilterModel' as const,
    66: () => 'filter API missing getModel method, which is needed for getFilterModel' as const,
    67: () => 'Filter is missing isFilterActive() method' as const,
    68: () => 'Column Filter API methods have been disabled as Advanced Filters are enabled.' as const,
    69: ({ guiFromFilter }: { guiFromFilter: any }) =>
        `getGui method from filter returned ${guiFromFilter}; it should be a DOM element.` as const,
    70: ({ newFilter }: { newFilter: any }) =>
        `Grid option quickFilterText only supports string inputs, received: ${typeof newFilter}` as const,
    71: () => 'debounceMs is ignored when apply button is present' as const,
    72: ({ keys }: { keys: string[] }) => [`ignoring FilterOptionDef as it doesn't contain one of `, keys] as const,
    73: () => `invalid FilterOptionDef supplied as it doesn't contain a 'displayKey'` as const,
    74: () => 'no filter options for filter' as const,
    75: () => 'Unknown button type specified' as const,
    76: ({ filterModelType }: { filterModelType: any }) =>
        [
            'Unexpected type of filter "',
            filterModelType,
            '", it looks like the filter was configured with incorrect Filter Options',
        ] as const,
    77: () => `Filter model is missing 'conditions'` as const,
    78: () =>
        'Filter Model contains more conditions than "filterParams.maxNumConditions". Additional conditions have been ignored.' as const,
    79: () => '"filterParams.maxNumConditions" must be greater than or equal to zero.' as const,
    80: () => '"filterParams.numAlwaysVisibleConditions" must be greater than or equal to zero.' as const,
    81: () =>
        '"filterParams.numAlwaysVisibleConditions" cannot be greater than "filterParams.maxNumConditions".' as const,
    82: ({ param }: { param: any }) => `DateFilter ${param} is not a number` as const,
    83: () => `DateFilter minValidYear should be <= maxValidYear` as const,
    84: () => `DateFilter minValidDate should be <= maxValidDate` as const,
    85: () =>
        'DateFilter should not have both minValidDate and minValidYear parameters set at the same time! minValidYear will be ignored.' as const,
    86: () =>
        'DateFilter should not have both maxValidDate and maxValidYear parameters set at the same time! maxValidYear will be ignored.' as const,
    87: () =>
        'DateFilter parameter minValidDate should always be lower than or equal to parameter maxValidDate.' as const,
    88: ({ index }: { index: number }) => `Invalid row index for ensureIndexVisible: ${index}` as const,
    89: () =>
        `A template was provided for Header Group Comp - templates are only supported for Header Comps (not groups)` as const,
    90: () => `datasource is missing getRows method` as const,
    // 91: () => '' as const,
    92: ({ methodName }: { methodName: string }) =>
        `AnimationFrameService.${methodName} called but animation frames are off` as const,
    93: () => 'cannot add multiple ranges when `cellSelection.suppressMultiRanges = true`' as const,
    94: ({
        paginationPageSizeOption,
        pageSizeSet,
        pageSizesSet,
        pageSizeOptions,
    }: {
        paginationPageSizeOption: number;
        pageSizeSet: boolean;
        pageSizesSet: any;
        pageSizeOptions: any[];
    }) =>
        `'paginationPageSize=${paginationPageSizeOption}'${pageSizeSet ? '' : ' (default value)'}, but ${paginationPageSizeOption} is not included in${pageSizesSet ? '' : ' the default'} paginationPageSizeSelector=[${pageSizeOptions.join(', ')}].` as const,
    95: ({
        paginationPageSizeOption,
        paginationPageSizeSelector,
    }: {
        paginationPageSizeOption: number;
        paginationPageSizeSelector: string;
    }) =>
        `Either set '${paginationPageSizeSelector}' to an array that includes ${paginationPageSizeOption} or to 'false' to disable the page size selector.` as const,
    96: ({ id, data }: { id: string; data: any }) =>
        [
            'Duplicate ID',
            id,
            'found for pinned row with data',
            data,
            'When `getRowId` is defined, it must return unique IDs for all pinned rows. Use the `rowPinned` parameter.',
        ] as const,
    97: ({ colId }: { colId: string }) => `cellEditor for column ${colId} is missing getGui() method` as const,
    98: () =>
        'popup cellEditor does not work with fullRowEdit - you cannot use them both - either turn off fullRowEdit, or stop using popup editors.' as const,
    99: () =>
        'Since v32, `api.hideOverlay()` does not hide the loading overlay when `loading=true`. Set `loading=false` instead.' as const,
    // 100: () => '' as const,
    101: ({
        propertyName,
        componentName,
        agGridDefaults,
        jsComps,
    }: {
        propertyName: string;
        componentName: string;
        agGridDefaults: { [key in UserComponentName]?: any };
        jsComps: { [key: string]: any };
    }) => {
        const textOutput: string[] = [];
        const validComponents = [
            // Don't include the old names / internals in potential suggestions
            ...Object.keys(agGridDefaults).filter(
                (k) => !['agCellEditor', 'agGroupRowRenderer', 'agSortIndicator'].includes(k)
            ),
            ...Object.keys(jsComps),
        ];
        const suggestions = _fuzzySuggestions({
            inputValue: componentName,
            allSuggestions: validComponents,
            hideIrrelevant: true,
            filterByPercentageOfBestMatch: 0.8,
        }).values;

        textOutput.push(
            `Could not find '${componentName}' component. It was configured as "${propertyName}: '${componentName}'" but it wasn't found in the list of registered components.\n`
        );
        if (suggestions.length > 0) {
            textOutput.push(`         Did you mean: [${suggestions.slice(0, 3)}]?\n`);
        }
        textOutput.push(`If using a custom component check it has been registered correctly.`);
        return textOutput;
    },
    102: () => "selecting just filtered only works when gridOptions.rowModelType='clientSide'" as const,
    103: () =>
        'Invalid selection state. When using client-side row model, the state must conform to `string[]`.' as const,
    104: ({ value, param }: { value: number; param: string }) =>
        `Numeric value ${value} passed to ${param} param will be interpreted as ${value} seconds. If this is intentional use "${value}s" to silence this warning.` as const,
    105: ({ e }: { e: any }) => [`chart rendering failed`, e] as const,
    106: () => 'both Theming API and the ag-grid.css are used on the same page, styling will be incorrect' as const,
    107: ({ key, value }: { key: string; value: string }) => `Invalid value for param ${key} - ${value}` as const,
    108: ({ e }: { e: any }) => ['chart update failed', e] as const,
    109: ({ aggFuncOrString }: { aggFuncOrString: any }) =>
        `unrecognised aggregation function ${aggFuncOrString}` as const,
    110: () => 'groupHideOpenParents only works when specifying specific columns for colDef.showRowGroup' as const,
    111: () =>
        'Invalid selection state. When `groupSelectsChildren` is enabled, the state must conform to `IServerSideGroupSelectionState`.' as const,
    112: ({ googleFont, googleFontsDomain }: { googleFont: string; googleFontsDomain: string }) =>
        `theme uses google font ${googleFont} but no value for loadThemeGoogleFonts was provided. Pass true to load fonts from ${googleFontsDomain} or false to silence this warning.` as const,
    113: () =>
        'Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values' as const,
    114: ({ component }: { component: string }) =>
        `Could not find component with name of ${component}. Is it in Vue.components?` as const,
    115: () => 'The provided selection state should be an object.' as const,
    116: () => 'Invalid selection state. The state must conform to `IServerSideSelectionState`.' as const,
    117: () => 'selectAll must be of boolean type.' as const,
    118: () => 'Infinite scrolling must be enabled in order to set the row count.' as const,
    119: () => '' as const,
    120: () => '' as const,
    121: () => '' as const,

    200: missingModule,
    201: ({ rowModelType }: { rowModelType: string }) => `Could not find row model for rowModelType = ${rowModelType}`,
} as const;

export type ErrorMap = typeof AG_GRID_ERRORS;
export type ErrorId = keyof ErrorMap;

type ErrorValue<TId extends ErrorId | null> = TId extends ErrorId ? ErrorMap[TId] : never;
export type GetErrorParams<TId extends ErrorId> =
    ErrorValue<TId> extends (params: infer P) => any ? (P extends Record<string, any> ? P : undefined) : never;

export function getError<TId extends ErrorId, TParams extends GetErrorParams<TId>>(errorId: TId, args: TParams): any[] {
    const msgOrFunc: ErrorMap[TId] = AG_GRID_ERRORS[errorId];

    if (!msgOrFunc) {
        return [`Missing error text for error id ${errorId}!`];
    }

    const errorBody = msgOrFunc(args as any);
    const errorLink = getErrorLink(errorId, args);
    const errorSuffix = `\nSee ${errorLink}`;
    return Array.isArray(errorBody) ? (errorBody.concat(errorSuffix) as string[]) : [errorBody, errorSuffix];
}
