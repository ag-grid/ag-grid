import { ExcelOOXMLTemplate, ExcelCell, _ } from '@ag-grid-community/core';
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
                    s: styleId ? getStyleId(styleId, currentSheet) : undefined
                }
            }
        };

        if (convertedType === 'empty') { return obj; }

        let children;

        if (convertedType === 'str' && type === 'f') {
            children = [{
                name: 'f',
                textNode: _.escapeString(_.utf8_encode(value))
            }];
        } else if (convertedType === 'inlineStr') {
            children = [{
                name: 'is',
                children: [{
                    name: 't',
                    textNode: _.escapeString(_.utf8_encode(value))
                }]
            }];
        } else {
            children = [{
                name: 'v',
                textNode: value
            }];
        }

        return Object.assign({}, obj, { children });
    }
};

export default cellFactory;
