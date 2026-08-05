import type { BeanCollection } from 'ag-grid-community';

import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';

export const buildPaginationFeatureSchema = (beans: BeanCollection) => {
    const { pagination, gos } = beans;
    // The service is present whenever its module is registered, so the grid option is what decides
    // whether a page can actually be changed.
    if (!pagination || !gos.get('pagination')) {
        return;
    }

    const properties: Record<string, SchemaBuilder> = {
        page: s.number('Zero-based index of the page to display').minimum(0),
    };

    // Page size is discarded when the grid derives it from the viewport height, so it is only
    // offered when setting it can actually take effect.
    if (!gos.get('paginationAutoPageSize')) {
        properties.pageSize = s.number('Number of rows per page').minimum(1).nullable();
    }

    return s.object(properties, 'Pagination configuration for the grid');
};
