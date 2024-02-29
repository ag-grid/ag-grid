import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
import {ExcelDataTable} from '../../assets/excelInterfaces';

const tableFactory: ExcelOOXMLTemplate = {
    getTemplate(dataTable: ExcelDataTable, idx: number) {
        if (
            typeof dataTable !== 'object' || !dataTable ||
            !dataTable.name || !Array.isArray(dataTable.columns) || !dataTable.columns.length ||
            !dataTable.rowCount
        ) {
            return { name: "table" };
        }

        const {
            name,
            displayName,
            columns,
            rowCount,
            headerRowIndex,
        } = dataTable;

        const firstRow = headerRowIndex + 1;
        const id: string = "1"; // We assume that there is only 1 table per sheet with id: 1
        const firstCell = `A${firstRow}`;
        const lastCell = `${String.fromCharCode(64 + columns.length)}${firstRow + rowCount}`;
        const ref = `${firstCell}:${lastCell}`;

        return {
            name: "table",
            properties: {
                rawMap: {
                    "xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
                    "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
                    "mc:Ignorable": "xr xr3",
                    "xmlns:xr": "http://schemas.microsoft.com/office/spreadsheetml/2014/revision",
                    "xmlns:xr3": "http://schemas.microsoft.com/office/spreadsheetml/2016/revision3",
                    "name": name,
                    "displayName": displayName,
                    "ref": ref,
                    "totalsRowShown": 0,
                    "id": id,
                }
            },
            children: [
                {
                    name: "autoFilter",
                    properties: {
                        rawMap: {
                            ref
                        }
                    }
                },
                {
                    name: "tableColumns",
                    properties: {
                        rawMap: {
                            count: columns.length
                        }
                    },
                    children: columns.map((col: string, idx: number) => ({
                        name: "tableColumn",
                        properties: {
                            rawMap: {
                                id: (idx + 1).toString(),
                                name: col,
                                dataCellStyle: "Normal"
                            }
                        }
                    }))
                },
                {
                    name: "tableStyleInfo",
                    properties: {
                        rawMap: {
                            name: "TableStyleLight1",
                            showFirstColumn: 0,
                            showLastColumn: 0,
                            showRowStripes: 1,
                            showColumnStripes: 0
                        }
                    }
                }
            ]
        };
    }
};

export default tableFactory;
