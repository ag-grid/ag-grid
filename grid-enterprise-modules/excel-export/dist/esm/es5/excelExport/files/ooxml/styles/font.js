var fontFactory = {
    getTemplate: function (font) {
        var size = font.size, colorTheme = font.colorTheme, _a = font.color, color = _a === void 0 ? 'FF000000' : _a, _b = font.fontName, fontName = _b === void 0 ? 'Calibri' : _b, family = font.family, scheme = font.scheme, italic = font.italic, bold = font.bold, strikeThrough = font.strikeThrough, outline = font.outline, shadow = font.shadow, underline = font.underline, verticalAlign = font.verticalAlign;
        var children = [
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
        return { name: "font", children: children };
    }
};
export default fontFactory;
