import { type Framework } from '@ag-grid-types';
import styles from '@design-system/modules/ComparisonTable.module.scss';
import classnames from 'classnames';
import React, { useMemo, useState } from 'react';
import { createRowDataFilter } from './utils/createRowDataFilter';
import { Label } from './renderers/Label';
import { Feature } from './renderers/Feature';
import { Collapsible } from '../Collapsible';

type Columns = Record<string, string>;
type Data = Record<string, any>;
type CellRenderer = 'label' | 'feature';
type CellRendererDef = Record<string, CellRenderer>;

// Added level field for rendering indentation
const LEVEL_FIELD = '_level';
const GROUP_HEADING_FIELD = '_isGroupHeading';
const GROUP_ITEMS_FIELD = 'items';

const getColumnFields = (column: string) => column.split('||').map((col) => col.trim());

/**
 * Column fields can be separated by `||` (an "or" operator)
 */
const getAllColumnFields = (columns: Columns) => Object.keys(columns).flatMap(getColumnFields);

function CellValue({
    framework,
    value,
    field,
    cellRenderer = {},
}: {
    framework: Framework;
    value: any;
    field?: string;
    cellRenderer?: CellRendererDef;
}) {
    const renderer = cellRenderer[field] as CellRenderer;

    if (renderer === 'label') {
        return <Label value={value} />;
    } else if (renderer === 'feature') {
      return <Feature value={value} />;
    }

    if (value === undefined) {
        return null;
    }

    if (typeof value === 'object') {
        console.error(`Cannot render object for cell value of field "${field}": ${JSON.stringify(value)}`);
        return null;
    }

    return value;
}

const getFieldValue = ({ columnField, datum }) => {
    const isNegated = columnField?.startsWith('!');
    const field = isNegated ? columnField.slice(1) : columnField;
    const value = datum[field];

    return isNegated ? !value : value;
};

function getColumnField({ datum, columnField }) {
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
    const isNegated = field?.startsWith('!');
    const value = getFieldValue({
        columnField: field,
        datum,
    });

    return {
        field,
        value,
    };
}

function TitleCell({ level, children}) {
    return (
        <span
            className={classnames({
                [styles.title]: level === 1,
                [styles[`level${level}`]]: level > 2,
            })}
        >
            {children}
        </span>
    );
}

function TableRows({
    framework,
    data,
    columns,
    cellRenderer,
}: {
    framework: Framework;
    data: Data;
    columns: Columns;
    cellRenderer: CellRendererDef;
}) {
    const columnFields = getAllColumnFields(columns);

    return data.map((datum: any, i: number) => {
        const [subGroupOpen, setSubGroupOpen] = useState(false);
  
        const toggleSubGroupOpen = () => setSubGroupOpen(!subGroupOpen);

        const { [LEVEL_FIELD]: level } = datum;

        const subGroup = datum.isSubGroup;

        if(!subGroup) {
            return (
                <div className={styles.row} key={i}>
                    {Object.keys(columns).map((columnField, index) => {
                        const { field, value } = getColumnField({ datum, columnField });
                        const cellValue = (
                            <CellValue framework={framework} field={field} value={value} cellRenderer={cellRenderer} />
                        );
                        const isFirstColumn = index === 0;
                        const isHeaderGroup = datum[GROUP_HEADING_FIELD];
    
                        if (!isFirstColumn && isHeaderGroup) {
                            return <td key={`column-${columnField}`}></td>;
                        }
    
                        return (
                            <div className={styles.cell} key={`column-${columnField}`}>
                                {isFirstColumn ? (
                                    <TitleCell level={level}>
                                        {cellValue}
                                    </TitleCell>
                                ) : (
                                    cellValue
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return <div className={styles.subGroup} key={i}>
                <header onClick={() => { toggleSubGroupOpen(!subGroupOpen) }}>{datum.name}</header>
                <Collapsible id={`subgroup-${i}`} isDisabled={false} isOpen={subGroupOpen}>
                    
                <ComparisonTable
                    data={datum.items}
                    columns={{
                        'label': '',
                        'community': '',
                        'enterprise': '',
                        'chartsGrid': '',
                    }}
                    cellRenderer={{
                        'label': 'label',
                        'community': "feature",
                        'enterprise': "feature",
                        'chartsGrid': "feature",
                    }}
                    />
                </Collapsible>
            </div>
        }
    });
}

function columnsGroupRendererFields({
    columns,
    cellRenderer,
}: {
    columns: Columns;
    cellRenderer?: CellRendererDef;
}): boolean {
    const allFields = getAllColumnFields(columns);

    return allFields.filter((field) => {
        return field === 'group';
    });
}

function recursivelyNormalizeData({ data, groupFields, level = 1 }) {
    return data
        .flatMap((datum) => {
            const dataFields = Object.keys(datum);
            // Take first field that is a group
            const groupFieldName = groupFields.find((field) => {
                return dataFields.includes(field);
            });
            const { [GROUP_ITEMS_FIELD]: items, ...groupData } = datum[groupFieldName] || {};

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

function normalizeGroupedData({ data, columns, cellRenderer }) {
    const groupFields = columnsGroupRendererFields({
        columns,
        cellRenderer,
    });
    if (!groupFields.length) {
        return data;
    }

    return recursivelyNormalizeData({
        data,
        groupFields,
    });
}

/**
 * This presents a matrix of information, e.g. to show which features are available with different versions of the grid.
 */
export function ComparisonTable({
    data,
    columns,
    filter,
    cellRenderer,
}: {
    data: Data;
    columns: Columns;
    filter?: string;
    cellRenderer?: CellRendererDef;
}) {
    const tableData = useMemo(() => {
        const normalizedData = normalizeGroupedData({ data, columns, cellRenderer });
        const filteredData = filter ? normalizedData.filter(createRowDataFilter(filter)) : normalizedData;

        return filteredData;
    }, [data, filter]);

    const numColumns = {"--num-columns": Object.keys(columns).length} as React.CSSProperties;

    return (
        <div className={classnames(
            styles.comparisonTable, 
            Object.keys(columns).length <= 2 ? styles.twoColumn : ""
        )} style={numColumns}>
            <TableRows data={tableData} columns={columns} cellRenderer={cellRenderer} />
        </div>
    );
}
