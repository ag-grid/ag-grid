"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fontFactory = {
    getTemplate(font) {
        const { size, colorTheme, color = 'FF000000', fontName = 'Calibri', family, scheme, italic, bold, strikeThrough, outline, shadow, underline, verticalAlign } = font;
        const children = [
            { name: 'sz', properties: { rawMap: { val: size } } },
            { name: 'color', properties: { rawMap: { theme: colorTheme, rgb: color } } },
            { name: 'name', properties: { rawMap: { val: fontName } } }
        ];
        if (family) {
            children.push({ name: 'family', properties: { rawMap: { val: family } } });
        }
        if (scheme) {
            children.push({ name: 'scheme', properties: { rawMap: { val: scheme } } });
        }
        if (italic) {
            children.push({ name: 'i' });
        }
        if (bold) {
            children.push({ name: 'b' });
        }
        if (strikeThrough) {
            children.push({ name: 'strike' });
        }
        if (outline) {
            children.push({ name: 'outline' });
        }
        if (shadow) {
            children.push({ name: 'shadow' });
        }
        if (underline) {
            children.push({ name: 'u', properties: { rawMap: { val: underline } } });
        }
        if (verticalAlign) {
            children.push({ name: 'vertAlign', properties: { rawMap: { val: verticalAlign } } });
        }
        return { name: "font", children };
    }
};
exports.default = fontFactory;
