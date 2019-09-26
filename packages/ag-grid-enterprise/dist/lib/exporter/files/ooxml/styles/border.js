// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stylesheet_1 = require("./stylesheet");
var getBorderColor = function (color) {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: stylesheet_1.convertLegacyColor(color || '#000000')
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
exports.default = borderFactory;
var getWeightName = function (value) {
    if (value === 1) {
        return 'thin';
    }
    if (value === 2) {
        return 'medium';
    }
    if (value === 3) {
        return 'thick';
    }
    return 'hair';
};
var mappedNames = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};
var mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];
exports.convertLegacyBorder = function (type, weight) {
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick
    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    var namedWeight = getWeightName(weight);
    var mappedName = mappedNames[type];
    if (!type) {
        return 'thin';
    }
    if (type === 'Continuous') {
        return namedWeight;
    }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) > 0) {
        return "medium" + mappedName;
    }
    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};
