import { convertLegacyColor } from '../../../assets/excelLegacyConvert';
var getBorderColor = function (color) {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};
var borderFactory = {
    getTemplate: function (border) {
        var left = border.left, right = border.right, top = border.top, bottom = border.bottom, diagonal = border.diagonal;
        var leftChildren = left ? [getBorderColor(left.color)] : undefined;
        var rightChildren = right ? [getBorderColor(right.color)] : undefined;
        var topChildren = top ? [getBorderColor(top.color)] : undefined;
        var bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        var diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [{
                    name: 'left',
                    properties: { rawMap: { style: left && left.style } },
                    children: leftChildren
                }, {
                    name: 'right',
                    properties: { rawMap: { style: right && right.style } },
                    children: rightChildren
                }, {
                    name: 'top',
                    properties: { rawMap: { style: top && top.style } },
                    children: topChildren
                }, {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom && bottom.style } },
                    children: bottomChildren
                }, {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal && diagonal.style } },
                    children: diagonalChildren
                }]
        };
    }
};
export default borderFactory;
