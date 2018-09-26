import {ExcelOOXMLTemplate, ExcelCell, _} from 'ag-grid-community';

const convertLegacyType = (type: string): string => {
    const t = type.charAt(0).toLowerCase();

    return t === 's' ? 'inlineStr' : t;
};

const cellFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelCell) {
        const {ref, data, styleId} = config;
        const {type, value} = data;
        let convertedType:string = type;

        if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }

        const obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType,
                    //s: styleId
                }
            }
        };

        let children;

        if (convertedType === 'inlineStr') {
            children = [{
                name: 'is',
                children: [{
                    name: 't',
                    textNode: value
                }]
            }];
        } else {
            children = [{
                name: 'v',
                textNode: value
            }];
        }

        return _.assign({}, obj, { children });
    }
};

export default cellFactory;