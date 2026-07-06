import type { BeanCollection, StructuredSchemaParams } from 'ag-grid-community';

import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';

/**
 * Enum of every column id, with each column's optional `description` param folded into the enum
 * description as `colId: description` lines. Self-contained (no shared `$def`) so it can be inlined
 * into either the monolithic schema or an individual tool schema.
 */
export function buildAllColumnIdsEnum(beans: BeanCollection, params?: StructuredSchemaParams): SchemaBuilder {
    const colsList = beans.colModel.colsList;
    const columnParams = params?.columns ?? {};
    const ids = new Array<string>(colsList.length);
    let descriptions = '';
    for (let i = 0, len = colsList.length; i < len; ++i) {
        const colId = colsList[i].colId;
        ids[i] = colId;
        const desc = columnParams[colId]?.description;
        if (i > 0) {
            descriptions += '\n';
        }
        descriptions += desc ? `${colId}: ${desc}` : colId;
    }
    return s.enum(ids, descriptions);
}
