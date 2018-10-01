import {ExcelOOXMLTemplate, XmlElement} from 'ag-grid-community';

const fontFactory: ExcelOOXMLTemplate = {
    getTemplate(font: Font) {
        const {size = 14, colorTheme, color, name, family, scheme} = font;
        const children: XmlElement[] = [{
                name: 'sz',
                properties: { rawMap: { val: size } }
            },{
                name: 'color',
                properties: { rawMap: { theme: colorTheme, rgb: color } }
            },{
                name: 'name',
                properties: { rawMap: { val: name } }
            }
        ];

        if (family) {
            children.push({
                name: 'family',
                properties: { rawMap: { val: family } }
            });
        }

        if (scheme) {
            children.push({
                name: 'scheme',
                properties: { rawMap: { val: scheme } }
            });
        }

        return {
            name: "font",
            children
        };
    }
};

export default fontFactory;

export interface Font {
    name: string;
    size?: string;
    color?: string;
    colorTheme?: string;
    family?: string;
    scheme?: string;
}