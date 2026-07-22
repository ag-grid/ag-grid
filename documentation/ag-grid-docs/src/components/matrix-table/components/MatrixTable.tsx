import { type Framework } from '@ag-grid-types';
import { EnterpriseIcon } from '@ag-website-shared/components/icon/EnterpriseIcon';
import { transformMarkdoc } from '@utils/markdoc/transformMarkdoc';
import classnames from 'classnames';
import { useMemo } from 'react';

import { createRowDataFilter } from '../utils/createRowDataFilter';
import {
    type MatrixCellRendererDef as CellRendererDef,
    type MatrixColumns as Columns,
    type MatrixDatum as Data,
    ENTERPRISE_FIELD,
    GROUP_HEADING_FIELD,
    LEVEL_FIELD,
    getColumnField,
    normalizeGroupedData,
} from '../utils/matrixData';
import styles from './MatrixTable.module.scss';
import { FeaturesTickCross, TickCross } from './renderers/TickCross';

type CellRenderer = 'tickCross' | 'featuresTickCross' | 'group';

function HeaderRow({ framework, columns }: { framework: Framework; columns: Columns }) {
    return (
        <tr>
            {Object.entries(columns).map(([column, columnName]) => (
                <th key={`header-column-${column}`} scope="col">
                    <CellValue framework={framework} value={columnName} />
                </th>
            ))}
        </tr>
    );
}

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
    const renderer = cellRenderer && (cellRenderer[field] as CellRenderer);

    if (renderer === 'tickCross') {
        return <TickCross value={value} />;
    } else if (renderer === 'featuresTickCross') {
        return <FeaturesTickCross value={value} />;
    }

    if (value === undefined) {
        return null;
    }

    if (typeof value === 'object') {
        // eslint-disable-next-line no-console
        console.error(`Cannot render object for cell value of field "${field}": ${JSON.stringify(value)}`);
        return null;
    }

    const { MarkdocContent } = transformMarkdoc({ framework, markdocContent: value });

    return <MarkdocContent />;
}

function TitleCell({ level, children, isEnterprise }) {
    return (
        <span
            className={classnames({
                [styles.title]: level === 1,
                [styles[`level${level}`]]: level > 2,
            })}
        >
            {children} {isEnterprise && <EnterpriseIcon />}
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
    cellRenderer?: CellRendererDef;
}) {
    return data.map((datum: any) => {
        const { [LEVEL_FIELD]: level } = datum;
        return (
            <tr>
                {Object.keys(columns).map((columnField, index) => {
                    const { field, value } = getColumnField({ datum, columnField });
                    const cellValue = (
                        <CellValue framework={framework} field={field} value={value} cellRenderer={cellRenderer} />
                    );
                    const isFirstColumn = index === 0;
                    const isHeaderGroup = datum[GROUP_HEADING_FIELD];
                    const isEnterprise = datum[ENTERPRISE_FIELD];

                    if (!isFirstColumn && isHeaderGroup) {
                        return <td key={`column-${columnField}`}></td>;
                    }

                    return (
                        <td key={`column-${columnField}`}>
                            {isFirstColumn ? (
                                <TitleCell level={level} isEnterprise={isEnterprise}>
                                    {cellValue}
                                </TitleCell>
                            ) : (
                                cellValue
                            )}
                        </td>
                    );
                })}
            </tr>
        );
    });
}

/**
 * This presents a matrix of information, e.g. to show which features are available with different versions of the grid.
 */
export function MatrixTable({
    framework,
    data,
    columns,
    filter,
    cellRenderer,
}: {
    framework: Framework;
    data: Data;
    columns: Columns;
    filter?: string;
    cellRenderer?: CellRendererDef;
}) {
    const tableData = useMemo(() => {
        const normalizedData = normalizeGroupedData({ data, columns });
        const filteredData = filter ? normalizedData.filter(createRowDataFilter(filter)) : normalizedData;

        return filteredData;
    }, [data, filter, columns]);

    return (
        <div className={styles.outer}>
            <table className={styles.matrix}>
                <thead>
                    <HeaderRow framework={framework} columns={columns} />
                </thead>
                <tbody>
                    <TableRows framework={framework} data={tableData} columns={columns} cellRenderer={cellRenderer} />
                </tbody>
            </table>
        </div>
    );
}
