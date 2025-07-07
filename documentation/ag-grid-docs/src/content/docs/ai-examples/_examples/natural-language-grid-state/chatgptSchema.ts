import type { ColDef, ColGroupDef } from 'ag-grid-community';

import { type JSONSchema, createEnumSchema, createObjectSchema } from './schema';

/**
 * Column analysis result for schema generation
 */
interface ColumnAnalysis {
    allColumnIds: string[];
    sortableColumnIds: string[];
    filterableColumnIds: string[];
    groupableColumnIds: string[];
    pivotableColumnIds: string[];
    aggregatableColumnIds: string[];
    resizableColumnIds: string[];
    pinnableColumnIds: string[];
}

/**
 * Analyzes column definitions to determine which columns can be used in different contexts
 */
function analyzeColumns(columnDefs: (ColDef | ColGroupDef)[]): ColumnAnalysis {
    const analysis: ColumnAnalysis = {
        allColumnIds: [],
        sortableColumnIds: [],
        filterableColumnIds: [],
        groupableColumnIds: [],
        pivotableColumnIds: [],
        aggregatableColumnIds: [],
        resizableColumnIds: [],
        pinnableColumnIds: [],
    };

    function processColumn(colDef: ColDef | ColGroupDef) {
        if ('children' in colDef && colDef.children) {
            // Process column group children
            colDef.children.forEach(processColumn);
        } else {
            const col = colDef as ColDef;
            const colId = col.field || col.colId;
            if (!colId) return;

            analysis.allColumnIds.push(colId);

            // Check if sortable (default true unless explicitly false)
            if (col.sortable !== false) {
                analysis.sortableColumnIds.push(colId);
            }

            // Check if filterable (default true unless explicitly false)
            if (col.filter !== false && col.filter !== null) {
                analysis.filterableColumnIds.push(colId);
            }

            // Check if can be used for row grouping
            if (col.enableRowGroup !== false && col.rowGroup !== false) {
                analysis.groupableColumnIds.push(colId);
            }

            // Check if can be used for pivoting
            if (col.enablePivot !== false && col.pivot !== false) {
                analysis.pivotableColumnIds.push(colId);
            }

            // Check if can be aggregated (typically numeric columns)
            if (col.enableValue !== false && (col.aggFunc || col.type === 'number')) {
                analysis.aggregatableColumnIds.push(colId);
            }

            // Check if resizable (default true unless explicitly false)
            if (col.resizable !== false) {
                analysis.resizableColumnIds.push(colId);
            }

            // Check if pinnable (usually all columns can be pinned)
            analysis.pinnableColumnIds.push(colId);
        }
    }

    columnDefs.forEach(processColumn);
    return analysis;
}

/**
 * Generates a dynamic ChatGPT schema based on column definitions
 */
export function generateChatGPTSchema(columnDefs: (ColDef | ColGroupDef)[]): JSONSchema {
    const analysis = analyzeColumns(columnDefs);

    return createObjectSchema({
        description: 'Response for modifying AG-Grid state using natural language commands',
        $defs: {
            allColumnId: createEnumSchema({
                enum: analysis.allColumnIds,
                description: 'Valid column ID from the grid',
            }),
            sortableColumnId: createEnumSchema({
                enum: analysis.sortableColumnIds,
                description: 'Column ID that supports sorting',
            }),
            filterableColumnId: createEnumSchema({
                enum: analysis.filterableColumnIds,
                description: 'Column ID that supports filtering',
            }),
            groupableColumnId: createEnumSchema({
                enum: analysis.groupableColumnIds,
                description: 'Column ID that supports row grouping',
            }),
            pivotableColumnId: createEnumSchema({
                enum: analysis.pivotableColumnIds,
                description: 'Column ID that supports pivoting',
            }),
            aggregatableColumnId: createEnumSchema({
                enum: analysis.aggregatableColumnIds,
                description: 'Column ID that supports aggregation',
            }),
            resizableColumnId: createEnumSchema({
                enum: analysis.resizableColumnIds,
                description: 'Column ID that supports resizing',
            }),
            pinnableColumnId: createEnumSchema({
                enum: analysis.pinnableColumnIds,
                description: 'Column ID that can be pinned',
            }),
            sortDirection: createEnumSchema({
                enum: ['asc', 'desc'],
                description: 'Sort direction: ascending or descending',
            }),
            aggregationFunction: createEnumSchema({
                enum: ['sum', 'avg', 'min', 'max', 'count', 'first', 'last'],
                description: 'Aggregation function to apply to numeric columns',
            }),
            sideBarPosition: createEnumSchema({ enum: ['left', 'right'], description: 'Position of the sidebar' }),
            toolPanelId: createEnumSchema({ enum: ['columns', 'filters'], description: 'Tool panel identifier' }),
            gridStateProperty: createEnumSchema({
                enum: [
                    'aggregation',
                    'columnGroup',
                    'columnOrder',
                    'columnPinning',
                    'columnSizing',
                    'columnVisibility',
                    'filter',
                    'focusedCell',
                    'pagination',
                    'rowPinning',
                    'pivot',
                    'cellSelection',
                    'rowGroup',
                    'rowGroupExpansion',
                    'rowSelection',
                    'scroll',
                    'sideBar',
                    'sort',
                ],
                description: 'Grid state property that can be ignored when setting state',
            }),
            filterModel: createObjectSchema({
                description: 'Column filter configurations where each key is a column ID',
                properties: analysis.filterableColumnIds.reduce(
                    (prev, current) => ({ ...prev, [current]: { $ref: '#/$defs/columnFilter' } }),
                    {}
                ),
            }),
            columnFilter: {
                anyOf: [
                    { $ref: '#/$defs/textFilter' },
                    { $ref: '#/$defs/numberFilter' },
                    { $ref: '#/$defs/dateFilter' },
                    { $ref: '#/$defs/setFilter' },
                    { $ref: '#/$defs/multiFilter' },
                ],
            },
            textFilter: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['text'] },
                    type: {
                        type: 'string',
                        enum: [
                            'equals',
                            'notEqual',
                            'contains',
                            'notContains',
                            'startsWith',
                            'endsWith',
                            'blank',
                            'notBlank',
                        ],
                    },
                    filter: { type: 'string' },
                },
            }),
            numberFilter: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['number'] },
                    type: {
                        type: 'string',
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'inRange',
                            'blank',
                            'notBlank',
                        ],
                    },
                    filter: { type: 'number' },
                    filterTo: { type: 'number' },
                },
            }),
            dateFilter: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['date'] },
                    type: {
                        type: 'string',
                        enum: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange', 'blank', 'notBlank'],
                    },
                    dateFrom: { type: 'string' },
                    dateTo: { type: 'string' },
                },
            }),
            setFilter: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['set'] },
                    values: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
            }),
            multiFilter: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['multi'] },
                    operator: { type: 'string', enum: ['AND', 'OR'] },
                    conditions: {
                        type: 'array',
                        items: { $ref: '#/$defs/columnFilter' },
                    },
                },
            }),
            advancedFilterModel: {
                anyOf: [{ $ref: '#/$defs/advancedFilterCondition' }, { $ref: '#/$defs/advancedFilterJoin' }],
            },
            advancedFilterCondition: createObjectSchema({
                properties: {
                    filterType: { type: 'string' },
                    colId: { $ref: '#/$defs/filterableColumnId' },
                    type: { type: 'string' },
                    filter: { anyOf: [{ type: 'string' }, { type: 'number' }] },
                    filterTo: { anyOf: [{ type: 'string' }, { type: 'number' }] },
                },
            }),
            advancedFilterJoin: createObjectSchema({
                properties: {
                    filterType: { type: 'string', enum: ['join'] },
                    type: { type: 'string', enum: ['AND', 'OR'] },
                    conditions: {
                        type: 'array',
                        items: { $ref: '#/$defs/advancedFilterModel' },
                    },
                },
            }),
            rowPosition: createObjectSchema({
                properties: {
                    rowIndex: { type: 'number', minimum: 0 },
                    rowPinned: { anyOf: [{ type: 'string', enum: ['top', 'bottom'] }, { type: 'null' }] },
                },
            }),
            toolPanelConfig: createObjectSchema({
                properties: {
                    id: { type: 'string' },
                    labelDefault: { type: 'string' },
                    labelKey: { type: 'string' },
                    iconKey: { type: 'string' },
                    toolPanel: { type: 'string' },
                },
            }),
            serverSideRowSelection: createObjectSchema({
                properties: {
                    selectAll: { type: 'boolean' },
                    toggledNodes: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
            }),
        },
        properties: {
            gridState: createObjectSchema({
                description: 'The grid state changes to apply. Only include properties that need to be modified.',
                properties: {
                    version: {
                        type: 'string',
                        description: 'Grid state version',
                    },
                    columnOrder: {
                        type: 'object',
                        description: 'Change the order of columns in the grid',
                        properties: {
                            orderedColIds: {
                                type: 'array',
                                description: 'Array of column IDs in the desired order',
                                items: { $ref: '#/$defs/allColumnId' },
                            },
                        },
                        required: ['orderedColIds'],
                        additionalProperties: false,
                    },
                    columnPinning: {
                        type: 'object',
                        description: 'Pin or unpin columns to the left or right side of the grid',
                        properties: {
                            leftColIds: {
                                type: 'array',
                                description: 'Column IDs to pin to the left side',
                                items: { $ref: '#/$defs/pinnableColumnId' },
                            },
                            rightColIds: {
                                type: 'array',
                                description: 'Column IDs to pin to the right side',
                                items: { $ref: '#/$defs/pinnableColumnId' },
                            },
                        },
                        required: ['leftColIds', 'rightColIds'],
                        additionalProperties: false,
                    },
                    columnSizing: {
                        type: 'object',
                        description: 'Resize columns by setting width or flex values',
                        properties: {
                            columnSizingModel: {
                                type: 'array',
                                description: 'Array of column sizing configurations',
                                items: {
                                    anyOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                colId: {
                                                    $ref: '#/$defs/resizableColumnId',
                                                },
                                                width: {
                                                    type: 'number',
                                                    description: 'Fixed width in pixels',
                                                    minimum: 20,
                                                },
                                            },
                                            required: ['colId', 'width'],
                                            additionalProperties: false,
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                colId: {
                                                    $ref: '#/$defs/resizableColumnId',
                                                },
                                                flex: {
                                                    type: 'number',
                                                    description: 'Flexible sizing ratio',
                                                    minimum: 0,
                                                },
                                            },
                                            required: ['colId', 'flex'],
                                            additionalProperties: false,
                                        },
                                    ],
                                },
                            },
                        },
                        required: ['columnSizingModel'],
                        additionalProperties: false,
                    },
                    columnVisibility: {
                        type: 'object',
                        description: 'Show or hide columns in the grid',
                        properties: {
                            hiddenColIds: {
                                type: 'array',
                                description: 'Array of column IDs to hide',
                                items: { $ref: '#/$defs/allColumnId' },
                            },
                        },
                        required: ['hiddenColIds'],
                        additionalProperties: false,
                    },
                    filter: createObjectSchema({
                        description: 'Apply filters to the grid data',
                        properties: {
                            filterModel: {
                                $ref: '#/$defs/filterModel',
                            },
                            columnFilterState: createObjectSchema({
                                description: 'Column filter state information (rarely used)',
                                properties: {},
                            }),
                            advancedFilterModel: {
                                $ref: '#/$defs/advancedFilterModel',
                            },
                        },
                    }),
                    sort: {
                        type: 'object',
                        description: 'Sort the grid data by one or more columns',
                        properties: {
                            sortModel: {
                                type: 'array',
                                description: 'Array of sort configurations',
                                items: {
                                    type: 'object',
                                    properties: {
                                        colId: {
                                            $ref: '#/$defs/sortableColumnId',
                                        },
                                        sort: {
                                            $ref: '#/$defs/sortDirection',
                                        },
                                    },
                                    required: ['colId', 'sort'],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ['sortModel'],
                        additionalProperties: false,
                    },
                    rowGroup: {
                        type: 'object',
                        description: 'Group rows by one or more columns',
                        properties: {
                            groupColIds: {
                                type: 'array',
                                description: 'Array of column IDs to group by',
                                items: { $ref: '#/$defs/groupableColumnId' },
                            },
                        },
                        required: ['groupColIds'],
                        additionalProperties: false,
                    },
                    pivot: {
                        type: 'object',
                        description: 'Enable pivot mode and set pivot columns',
                        properties: {
                            pivotMode: {
                                type: 'boolean',
                                description: 'Whether pivot mode is enabled',
                            },
                            pivotColIds: {
                                type: 'array',
                                description: 'Array of column IDs to use as pivot columns',
                                items: { $ref: '#/$defs/pivotableColumnId' },
                            },
                        },
                        required: ['pivotMode', 'pivotColIds'],
                        additionalProperties: false,
                    },
                    aggregation: {
                        type: 'object',
                        description: 'Apply aggregation functions to columns',
                        properties: {
                            aggregationModel: {
                                type: 'array',
                                description: 'Array of aggregation configurations',
                                items: {
                                    type: 'object',
                                    properties: {
                                        colId: {
                                            $ref: '#/$defs/aggregatableColumnId',
                                        },
                                        aggFunc: {
                                            $ref: '#/$defs/aggregationFunction',
                                        },
                                    },
                                    required: ['colId', 'aggFunc'],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ['aggregationModel'],
                        additionalProperties: false,
                    },
                    rowSelection: {
                        anyOf: [
                            {
                                type: 'array',
                                description: 'Array of row IDs to select',
                                items: { type: 'string' },
                            },
                            {
                                $ref: '#/$defs/serverSideRowSelection',
                            },
                        ],
                    },
                    pagination: {
                        type: 'object',
                        description: 'Control pagination settings',
                        properties: {
                            page: {
                                type: 'number',
                                description: 'Current page number (0-based)',
                                minimum: 0,
                            },
                            pageSize: {
                                type: 'number',
                                description: 'Number of rows per page',
                                minimum: 1,
                            },
                        },
                        required: ['page', 'pageSize'],
                        additionalProperties: false,
                    },
                    sideBar: {
                        type: 'object',
                        description: 'Control sidebar visibility and tool panels',
                        properties: {
                            visible: {
                                type: 'boolean',
                                description: 'Whether the sidebar is visible',
                            },
                            position: {
                                $ref: '#/$defs/sideBarPosition',
                            },
                            openToolPanel: {
                                anyOf: [{ type: 'string' }, { type: 'null' }],
                            },
                            toolPanels: createObjectSchema({
                                description: 'Tool panel configurations',
                                properties: {},
                            }),
                        },
                        required: ['visible', 'position', 'openToolPanel', 'toolPanels'],
                        additionalProperties: false,
                    },
                    rowGroupExpansion: {
                        type: 'object',
                        description: 'Control which row groups are expanded',
                        properties: {
                            expandedRowGroupIds: {
                                type: 'array',
                                description: 'Array of row group IDs that should be expanded',
                                items: { type: 'string' },
                            },
                        },
                        required: ['expandedRowGroupIds'],
                        additionalProperties: false,
                    },
                    rowPinning: {
                        type: 'object',
                        description: 'Pin specific rows to top or bottom of the grid',
                        properties: {
                            top: {
                                type: 'array',
                                description: 'Array of row IDs to pin to the top',
                                items: { type: 'string' },
                            },
                            bottom: {
                                type: 'array',
                                description: 'Array of row IDs to pin to the bottom',
                                items: { type: 'string' },
                            },
                        },
                        required: ['top', 'bottom'],
                        additionalProperties: false,
                    },
                    cellSelection: {
                        type: 'object',
                        description: 'Select specific cell ranges',
                        properties: {
                            cellRanges: {
                                type: 'array',
                                description: 'Array of cell range selections',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            type: 'string',
                                            description: 'Unique identifier for the cell range',
                                        },
                                        type: {
                                            type: 'string',
                                            description: 'Type of cell range',
                                        },
                                        startRow: {
                                            $ref: '#/$defs/rowPosition',
                                        },
                                        endRow: {
                                            $ref: '#/$defs/rowPosition',
                                        },
                                        colIds: {
                                            type: 'array',
                                            description: 'Array of column IDs in the range',
                                            items: { $ref: '#/$defs/allColumnId' },
                                        },
                                        startColId: {
                                            $ref: '#/$defs/allColumnId',
                                        },
                                    },
                                    required: ['id', 'type', 'startRow', 'endRow', 'colIds', 'startColId'],
                                    additionalProperties: false,
                                },
                            },
                        },
                        required: ['cellRanges'],
                        additionalProperties: false,
                    },
                    focusedCell: {
                        type: 'object',
                        description: 'Set the currently focused cell',
                        properties: {
                            rowIndex: {
                                type: 'number',
                                description: 'Row index of the focused cell',
                                minimum: 0,
                            },
                            rowPinned: {
                                anyOf: [{ type: 'string' }, { type: 'null' }],
                            },
                            colId: {
                                $ref: '#/$defs/allColumnId',
                            },
                        },
                        required: ['rowIndex', 'rowPinned', 'colId'],
                        additionalProperties: false,
                    },
                    scroll: {
                        type: 'object',
                        description: 'Set the scroll position of the grid',
                        properties: {
                            top: {
                                type: 'number',
                                description: 'Vertical scroll position in pixels',
                                minimum: 0,
                            },
                            left: {
                                type: 'number',
                                description: 'Horizontal scroll position in pixels',
                                minimum: 0,
                            },
                        },
                        required: ['top', 'left'],
                        additionalProperties: false,
                    },
                    columnGroup: {
                        type: 'object',
                        description: 'Control which column groups are open',
                        properties: {
                            openColumnGroupIds: {
                                type: 'array',
                                description: 'Array of column group IDs that should be open',
                                items: { type: 'string' },
                            },
                        },
                        required: ['openColumnGroupIds'],
                        additionalProperties: false,
                    },
                },
            }),
            propertiesToIgnore: {
                type: 'array',
                description: 'Grid state properties to ignore when applying the state (optional)',
                items: { $ref: '#/$defs/gridStateProperty' },
            },
            explanation: {
                type: 'string',
                description: 'Human-readable explanation of what changes were made to the grid state',
            },
        },
    });
}
