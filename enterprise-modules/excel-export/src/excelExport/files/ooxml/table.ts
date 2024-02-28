import { ExcelOOXMLTemplate } from '@ag-grid-community/core';

const tableFactory: ExcelOOXMLTemplate = {
    getTemplate(config: any, idx: number) {
        if (
            typeof config !== 'object' || !config ||
            !config.name || !Array.isArray(config.columns) || !config.columns.length ||
            !config.rowCount
        ) {
            return { name: "table" };
        }

        const { name, id, columns, rowCount } = config;
        const ref = `A1:${String.fromCharCode(64 + columns.length)}${rowCount}`;

        return {
            name: "table",
            properties: {
                rawMap: {
                    "xmlns": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
                    "name": name,
                    "displayName": name,
                    "ref": ref,
                    "totalsRowShown": 0,
                    "insertRow": 1,
                    "id": id,
                    "headerRowCellStyle": "Normal",
                    "dataCellStyle": "Normal",
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
