import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import { buildSharedString } from '../../assets/excelUtils';

const sharedStrings: ExcelOOXMLTemplate = {
    getTemplate(strings: Map<string, number>) {
        return {
            name: 'sst',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.size,
                    uniqueCount: strings.size,
                },
            },
            children: buildSharedString(strings),
        };
    },
};

export default sharedStrings;
