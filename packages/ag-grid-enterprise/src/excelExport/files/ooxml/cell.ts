import type { ExcelCell, ExcelOOXMLTemplate } from 'ag-grid-community';
import { _escapeString } from 'ag-grid-community';

import { replaceInvisibleCharacters } from '../../assets/excelUtils';
import { getStyleId } from './styles/stylesheet';

const convertLegacyType = (type: string): string => {
    const t = type.charAt(0).toLowerCase();

    return t === 's' ? 'inlineStr' : t;
};

const cellFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelCell, idx: number, currentSheet: number) {
        const { ref, data, styleId } = config;
        const { type, value } = data || { type: 'empty', value: null };
        let convertedType: string = type;

        if (type === 'f') {
            convertedType = 'str';
        } else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }

        const obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? getStyleId(styleId as string, currentSheet) : undefined,
                },
            },
        };

        if (convertedType === 'empty') {
            return obj;
        }

        let children;

        if (convertedType === 'str' && type === 'f') {
            children = [
                {
                    name: 'f',
                    textNode: _escapeString(replaceInvisibleCharacters(value), false),
                },
            ];
        } else if (convertedType === 'inlineStr') {
            children = [
                {
                    name: 'is',
                    children: [
                        {
                            name: 't',
                            textNode: _escapeString(replaceInvisibleCharacters(value), false),
                        },
                    ],
                },
            ];
        } else {
            children = [
                {
                    name: 'v',
                    textNode: value,
                },
            ];
        }

        return Object.assign({}, obj, { children });
    },
};

export default cellFactory;
