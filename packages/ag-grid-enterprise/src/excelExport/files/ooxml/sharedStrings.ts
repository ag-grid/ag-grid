import { buildSharedString } from '../../assets/excelUtils';
import type { XmlFactoryElement } from '../../assets/xmlFactory';

const sharedStrings = {
    getTemplate(strings: Map<string, number>): XmlFactoryElement {
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
