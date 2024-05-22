import type { ExcelOOXMLTemplate } from '@ag-grid-community/core';

import type { ExcelDataTable } from '../../assets/excelInterfaces';

const tableFactory: ExcelOOXMLTemplate = {
    getTemplate(dataTable: ExcelDataTable, idx: number) {
        const {
            name,
            columns,
            rowCount,
            displayName,
            headerRowIndex,
            showRowStripes,
            showColumnStripes,
            showFilterButtons,
            highlightFirstColumn,
            highlightLastColumn,
        } = dataTable || {};

        if (!dataTable || !name || !Array.isArray(columns) || !columns.length || !rowCount) {
            return { name: 'table' };
        }

        const filterColumns = columns.map((col: string, idx: number) => ({
            name: 'filterColumn',
            properties: {
                rawMap: {
                    colId: idx.toString(), // For filters, this should start with 0
                    hiddenButton: showFilterButtons[idx] ? 0 : 1,
                },
            },
        }));

        const firstRow = headerRowIndex + 1;
        const id: string = (idx + 1).toString();
        const firstCell = `A${firstRow}`;
        const lastCell = `${String.fromCharCode(64 + columns.length)}${firstRow + rowCount}`;
        const ref = `${firstCell}:${lastCell}`;
        const displayNameToUse = idx ? `${displayName}_${idx + 1}` : displayName;

        return {
            name: 'table',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                    'mc:Ignorable': 'xr xr3',
                    'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision',
                    'xmlns:xr3': 'http://schemas.microsoft.com/office/spreadsheetml/2016/revision3',
                    name: name,
                    displayName: displayNameToUse,
                    ref: ref,
                    totalsRowShown: 0,
                    id: id,
                },
            },
            children: [
                {
                    name: 'autoFilter',
                    properties: {
                        rawMap: {
                            ref,
                        },
                    },
                    children: filterColumns,
                },
                {
                    name: 'tableColumns',
                    properties: {
                        rawMap: {
                            count: columns.length,
                        },
                    },
                    children: columns.map((col: string, idx: number) => ({
                        name: 'tableColumn',
                        properties: {
                            rawMap: {
                                id: (idx + 1).toString(),
                                name: col,
                                dataCellStyle: 'Normal',
                            },
                        },
                    })),
                },
                {
                    name: 'tableStyleInfo',
                    properties: {
                        rawMap: {
                            name: 'TableStyleLight1',
                            showFirstColumn: highlightFirstColumn ? 1 : 0,
                            showLastColumn: highlightLastColumn ? 1 : 0,
                            showRowStripes: showRowStripes ? 1 : 0,
                            showColumnStripes: showColumnStripes ? 1 : 0,
                        },
                    },
                },
            ],
        };
    },
};

export default tableFactory;
