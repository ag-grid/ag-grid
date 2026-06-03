import { _escapeString } from 'ag-stack';

import type { ExcelCustomMetadata, ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';

import { replaceInvisibleCharacters } from '../../assets/excelUtils';

const DEFAULT_FMTID = '{D5CDD505-2E9C-101B-9397-08002B2CF9AE}';

const buildPropertyElements = (metadata: ExcelCustomMetadata): XmlElement[] => {
    const keys = Object.keys(metadata).filter((name) => name && metadata[name] != null);

    return keys.map((name, index) => ({
        name: 'property',
        properties: {
            rawMap: {
                fmtid: DEFAULT_FMTID,
                pid: (index + 2).toString(),
                name: _escapeString(name) ?? '',
            },
        },
        children: [
            {
                name: 'vt:lpwstr',
                textNode: _escapeString(replaceInvisibleCharacters(String(metadata[name]))) ?? '',
            },
        ],
    }));
};

const customPropertiesFactory: ExcelOOXMLTemplate = {
    getTemplate(metadata: ExcelCustomMetadata) {
        return {
            name: 'Properties',
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
                    'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
                },
            },
            children: buildPropertyElements(metadata),
        };
    },
};

export default customPropertiesFactory;
