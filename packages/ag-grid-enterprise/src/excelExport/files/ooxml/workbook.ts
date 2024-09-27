import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import sheetsFactory from './sheets';

const workbookFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[], activeTab: number) {
        return {
            name: 'workbook',
            properties: {
                prefixedAttributes: [
                    {
                        prefix: 'xmlns:',
                        map: {
                            r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
                        },
                    },
                ],
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                },
            },
            children: [
                {
                    name: 'bookViews',
                    children: [
                        {
                            name: 'workbookView',
                            properties: {
                                rawMap: {
                                    activeTab,
                                },
                            },
                        },
                    ],
                },
                sheetsFactory.getTemplate(names),
            ],
        };
    },
};

export default workbookFactory;
