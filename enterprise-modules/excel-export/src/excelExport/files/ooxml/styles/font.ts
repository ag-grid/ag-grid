import { ExcelOOXMLTemplate, XmlElement } from '@ag-grid-community/core';

const fontFactory: ExcelOOXMLTemplate = {
    getTemplate(font: Font) {
        const {
            size, colorTheme, color = '00000000', name = 'Calibri', family, scheme,
            italic, bold, strike, outline, shadow, underline, verticalAlign
        } = font;

        const children: XmlElement[] = [
            { name: 'sz', properties: { rawMap: { val: size } }},
            { name: 'color', properties: { rawMap: { theme: colorTheme, rgb: color } }},
            { name: 'name', properties: { rawMap: { val: name } }}
        ];

        if (family) {
            children.push({ name: 'family', properties: { rawMap: { val: family } }});
        }

        if (scheme) {
            children.push({ name: 'scheme', properties: { rawMap: { val: scheme } }});
        }

        if (italic) { children.push({ name: 'i' }); }
        if (bold) { children.push({ name: 'b' }); }
        if (strike) { children.push({ name: 'strike' }); }
        if (outline) { children.push({name: 'outline' }); }
        if (shadow) { children.push({ name: 'shadow' }); }
        if (underline) {
            children.push({name: 'u', properties: { rawMap: { val: underline } }});
        }
        if (verticalAlign) {
            children.push({name: 'vertAlign', properties: { rawMap: { val: verticalAlign } }});
        }

        return { name: "font", children };
    }
};

export default fontFactory;

export const getFamilyId = (name?: string): number => {
    const families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    const pos = families.indexOf(name || 'Automatic');

    return Math.max(pos, 0);
};

export interface Font {
    name: string;
    size?: number;
    color?: string;
    colorTheme?: string;
    family?: number;
    scheme?: string;
    italic?: boolean;
    bold?: boolean;
    strike?: boolean;
    outline?: boolean;
    shadow?: boolean;
    underline?: 'single' | 'double';
    verticalAlign?: 'superscript' | 'subscript';
}
