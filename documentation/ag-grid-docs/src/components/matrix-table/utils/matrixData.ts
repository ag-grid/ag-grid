// Pure data-shaping helpers for the feature matrix, extracted from MatrixTable.tsx
// so they can be reused outside React — notably by the markdown serializer's
// `matrixTable` renderer, which must run at build time without importing the
// component (React/SCSS). MatrixTable.tsx imports these; keep behaviour identical.

export type MatrixColumns = Record<string, string>;
export type MatrixDatum = Record<string, any>;
export type MatrixCellRenderer = 'tickCross' | 'featuresTickCross' | 'group';
export type MatrixCellRendererDef = Record<string, MatrixCellRenderer>;

// Added level field for rendering indentation
export const LEVEL_FIELD = '_level';
export const GROUP_HEADING_FIELD = '_isGroupHeading';
const GROUP_ITEMS_FIELD = 'items';
export const ENTERPRISE_FIELD = 'enterprise';

export const getColumnFields = (column: string) => column.split('||').map((col) => col.trim());

/**
 * Column fields can be separated by `||` (an "or" operator)
 */
const getAllColumnFields = (columns: MatrixColumns) => Object.keys(columns).flatMap(getColumnFields);

export const getFieldValue = ({ columnField, datum }: { columnField: string; datum: MatrixDatum }) => {
    const isNegated = columnField?.startsWith('!');
    const field = isNegated ? columnField.slice(1) : columnField;
    const value = datum[field];

    return isNegated ? !value : value;
};

export function getColumnField({ datum, columnField }: { datum: MatrixDatum; columnField: string }) {
    const columnFields = getColumnFields(columnField);
    if (columnFields.length === 1) {
        return {
            field: columnField,
            value: getFieldValue({
                columnField,
                datum,
            }),
        };
    }

    const field = columnFields.find((f) => datum[f]);
    const value = getFieldValue({
        columnField: field!,
        datum,
    });

    return {
        field,
        value,
    };
}

function columnsGroupRendererFields({ columns }: { columns: MatrixColumns }) {
    const allFields = getAllColumnFields(columns);

    return allFields.filter((field) => {
        return field === 'group';
    });
}

function recursivelyNormalizeData({
    data,
    groupFields,
    level = 1,
}: {
    data: MatrixDatum[];
    groupFields: string[];
    level?: number;
}): MatrixDatum[] {
    return data
        .flatMap((datum) => {
            const dataFields = Object.keys(datum);
            // Take first field that is a group
            const groupFieldName = groupFields.find((field) => {
                return dataFields.includes(field);
            });
            const { [GROUP_ITEMS_FIELD]: items, ...groupData } = datum[groupFieldName!] || {};

            if (!groupFieldName || !items) {
                return datum;
            }

            const children = recursivelyNormalizeData({ data: items, groupFields, level: level + 1 });

            return [{ [GROUP_HEADING_FIELD]: true, ...groupData }].concat(children);
        })
        .map((datum) => {
            return {
                [LEVEL_FIELD]: level,
                ...datum,
            };
        });
}

export function normalizeGroupedData({
    data,
    columns,
}: {
    data: MatrixDatum[];
    columns: MatrixColumns;
}): MatrixDatum[] {
    const groupFields = columnsGroupRendererFields({ columns });
    if (!groupFields.length) {
        return data;
    }

    return recursivelyNormalizeData({
        data,
        groupFields,
    });
}
