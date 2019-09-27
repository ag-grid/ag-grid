// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fontFactory = {
    getTemplate: function (font) {
        var _a = font.size, size = _a === void 0 ? 14 : _a, colorTheme = font.colorTheme, _b = font.color, color = _b === void 0 ? '00000000' : _b, _c = font.name, name = _c === void 0 ? 'Calibri' : _c, family = font.family, scheme = font.scheme, italic = font.italic, bold = font.bold, strike = font.strike, outline = font.outline, shadow = font.shadow, underline = font.underline;
        var children = [
            { name: 'sz', properties: { rawMap: { val: size } } },
            { name: 'color', properties: { rawMap: { theme: colorTheme, rgb: color } } },
            { name: 'name', properties: { rawMap: { val: name } } }
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
        if (strike) {
            children.push({ name: 'strike' });
        }
        if (outline) {
            children.push({ name: 'outline' });
        }
        if (shadow) {
            children.push({ name: 'shadow' });
        }
        if (underline) {
            var lUnder = underline.toLocaleLowerCase();
            children.push({ name: 'u', properties: { rawMap: { val: lUnder === 'double' ? 'double' : 'single' } } });
        }
        return {
            name: "font",
            children: children
        };
    }
};
exports.default = fontFactory;
exports.getFamilyId = function (name) {
    var families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    var pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
