import { createRowDataFilter } from '@components/matrix-table/utils/createRowDataFilter';
import {
    ENTERPRISE_FIELD,
    GROUP_HEADING_FIELD,
    type MatrixCellRendererDef,
    type MatrixColumns,
    type MatrixDatum,
    getColumnField,
    normalizeGroupedData,
} from '@components/matrix-table/utils/matrixData';

import { markdownTable } from './markdownTable';

/**
 * Build a `matrixTable` tag (feature comparison matrix) as a GFM table from its
 * already-loaded collection data, reusing the same data-shaping helpers the
 * on-page React table uses. Pure (no `astro:content`) so it is unit-testable; the
 * dispatcher loads the data and calls this. Tick/cross renderers map to
 * `✓` / `✗` / `N/A` / `✓ (value)`; cells with no renderer already hold markdown.
 */
export function buildMatrixTable(
    data: MatrixDatum[],
    attributes: { columns?: MatrixColumns; cellRenderer?: MatrixCellRendererDef; filter?: string }
): string {
    const columns = attributes.columns ?? {};
    const columnKeys = Object.keys(columns);
    if (columnKeys.length === 0) {
        return '';
    }
    const cellRenderer = attributes.cellRenderer ?? {};
    const filter = attributes.filter ? String(attributes.filter) : undefined;

    const normalized = normalizeGroupedData({ data, columns });
    const rows = filter ? normalized.filter(createRowDataFilter(filter)) : normalized;

    const headers = columnKeys.map((key) => columns[key]);
    const tableRows = rows.map((datum) =>
        columnKeys.map((columnField, index) => renderMatrixCell({ datum, columnField, index, cellRenderer }))
    );

    return markdownTable(headers, tableRows);
}

function renderMatrixCell({
    datum,
    columnField,
    index,
    cellRenderer,
}: {
    datum: MatrixDatum;
    columnField: string;
    index: number;
    cellRenderer: MatrixCellRendererDef;
}): string {
    const isFirstColumn = index === 0;
    // Group-heading rows show only their name in the first column (mirrors the React table).
    if (!isFirstColumn && datum[GROUP_HEADING_FIELD]) {
        return '';
    }

    const { field, value } = getColumnField({ datum, columnField });
    let cell = renderCellValue(field, value, cellRenderer);

    if (isFirstColumn) {
        if (datum[GROUP_HEADING_FIELD] && cell) {
            cell = `**${cell}**`;
        }
        if (datum[ENTERPRISE_FIELD]) {
            cell = `${cell} (Enterprise)`.trim();
        }
    }
    return cell;
}

function tickCross(value: unknown): string {
    if (value === true) {
        return '✓';
    }
    if (value === false) {
        return '✗';
    }
    if (value === 'N/A') {
        return 'N/A';
    }
    if (typeof value === 'string') {
        return `✓ (${value})`;
    }
    return '';
}

function renderCellValue(field: string | undefined, value: unknown, cellRenderer: MatrixCellRendererDef): string {
    const renderer = field ? cellRenderer[field] : undefined;
    if (renderer === 'tickCross') {
        return tickCross(value);
    }
    if (renderer === 'featuresTickCross') {
        // Missing value means the feature is present.
        return tickCross(value === undefined ? true : value);
    }
    if (value === undefined || value === null || typeof value === 'object') {
        return '';
    }
    return String(value);
}
