"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getWeightName = function (value) {
    switch (value) {
        case 1: return 'thin';
        case 2: return 'medium';
        case 3: return 'thick';
        default: return 'hair';
    }
};
var mappedBorderNames = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};
var mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];
var colorMap = {
    None: 'none',
    Solid: 'solid',
    Gray50: 'mediumGray',
    Gray75: 'darkGray',
    Gray25: 'lightGray',
    HorzStripe: 'darkHorizontal',
    VertStripe: 'darkVertical',
    ReverseDiagStripe: 'darkDown',
    DiagStripe: 'darkUp',
    DiagCross: 'darkGrid',
    ThickDiagCross: 'darkTrellis',
    ThinHorzStripe: 'lightHorizontal',
    ThinVertStripe: 'lightVertical',
    ThinReverseDiagStripe: 'lightDown',
    ThinDiagStripe: 'lightUp',
    ThinHorzCross: 'lightGrid',
    ThinDiagCross: 'lightTrellis',
    Gray125: 'gray125',
    Gray0625: 'gray0625'
};
var horizontalAlignmentMap = {
    Automatic: 'general',
    Left: 'left',
    Center: 'center',
    Right: 'right',
    Fill: 'fill',
    Justify: 'justify',
    CenterAcrossSelection: 'centerContinuous',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
var verticalAlignmentMap = {
    Automatic: undefined,
    Top: 'top',
    Bottom: 'bottom',
    Center: 'center',
    Justify: 'justify',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
exports.convertLegacyPattern = function (name) {
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
exports.convertLegacyColor = function (color) {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? 'FF' + color : color;
};
exports.convertLegacyBorder = function (type, weight) {
    if (!type) {
        return 'thin';
    }
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick
    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    var namedWeight = getWeightName(weight);
    var mappedName = mappedBorderNames[type];
    if (type === 'Continuous') {
        return namedWeight;
    }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) !== -1) {
        return "medium" + mappedName;
    }
    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};
exports.convertLegacyHorizontalAlignment = function (alignment) {
    return horizontalAlignmentMap[alignment] || 'general';
};
exports.convertLegacyVerticalAlignment = function (alignment) {
    return verticalAlignmentMap[alignment] || undefined;
};
