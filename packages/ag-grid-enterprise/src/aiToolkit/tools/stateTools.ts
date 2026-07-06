import type { AiToolName, BeanCollection, GridStateKey, StructuredSchemaParams } from 'ag-grid-community';

import { buildAggregationFeatureSchema } from '../features/aggregationFeatureSchema';
import { buildColumnSizingFeatureSchema } from '../features/columnSizingFeatureSchema';
import { buildColumnVisibilityToolSchema } from '../features/columnVisibilityFeatureSchema';
import { buildFilterFeatureSchema } from '../features/filterFeatureSchema';
import { buildPivotFeatureSchema } from '../features/pivotFeatureSchema';
import { buildRowGroupFeatureSchema } from '../features/rowGroupFeatureSchema';
import { buildSortFeatureSchema } from '../features/sortFeatureSchema';
import type { SchemaBuilder } from '../schemaBuilder';
import { applyPartialState } from './applyPartialState';
import type { AiTool } from './toolTypes';

type FeatureBuilder = (beans: BeanCollection, params?: StructuredSchemaParams) => SchemaBuilder | undefined;

// State tools mirror the grid-state schema builders 1:1: the args the LLM provides are exactly the
// `GridState[stateKey]` slice, applied as a partial `setState`.
function createStateTool(
    name: AiToolName,
    stateKey: GridStateKey,
    description: string,
    buildFeatureSchema: FeatureBuilder
): AiTool {
    return {
        name,
        description,
        build: (beans, params) => buildFeatureSchema(beans, params ? { columns: params.columns } : undefined)?.toJSON(),
        execute: (beans, args) => applyPartialState(beans, stateKey, args as object),
    };
}

export const stateTools: AiTool[] = [
    createStateTool(
        'update_sort',
        'sort',
        'Replace the grid sort model with the given ordered list of columns and directions.',
        buildSortFeatureSchema
    ),
    createStateTool(
        'update_filter',
        'filter',
        'Replace the grid filter model. Only the columns that support filtering are included.',
        buildFilterFeatureSchema
    ),
    createStateTool(
        'update_aggregation',
        'aggregation',
        'Replace the column aggregations (the aggregation function applied to each value column).',
        buildAggregationFeatureSchema
    ),
    createStateTool(
        'update_pivot',
        'pivot',
        'Replace the pivot configuration: whether pivot mode is enabled and which columns pivot.',
        buildPivotFeatureSchema
    ),
    createStateTool(
        'update_row_group',
        'rowGroup',
        'Replace the columns the grid is grouped by, in order.',
        buildRowGroupFeatureSchema
    ),
    createStateTool(
        'update_column_visibility',
        'columnVisibility',
        'Replace the set of hidden columns.',
        buildColumnVisibilityToolSchema
    ),
    createStateTool(
        'update_column_sizing',
        'columnSizing',
        'Replace column sizing: a fixed pixel width or a flex ratio per column.',
        buildColumnSizingFeatureSchema
    ),
];
