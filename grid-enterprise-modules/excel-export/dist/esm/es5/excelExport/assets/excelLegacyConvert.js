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
export var convertLegacyPattern = function (name) {
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
export var convertLegacyColor = function (color) {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? 'FF' + color : color;
};
export var convertLegacyBorder = function (type, weight) {
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
export var convertLegacyHorizontalAlignment = function (alignment) {
    return horizontalAlignmentMap[alignment] || 'general';
};
export var convertLegacyVerticalAlignment = function (alignment) {
    return verticalAlignmentMap[alignment] || undefined;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxMZWdhY3lDb252ZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2Fzc2V0cy9leGNlbExlZ2FjeUNvbnZlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsSUFBTSxhQUFhLEdBQUcsVUFBQyxLQUFjO0lBQ2pDLFFBQVEsS0FBSyxFQUFFO1FBQ1gsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztRQUN0QixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDO1FBQ3hCLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUM7UUFDdkIsT0FBTyxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7S0FDMUI7QUFDTCxDQUFDLENBQUM7QUFFRixJQUFNLGlCQUFpQixHQUE4QjtJQUNqRCxJQUFJLEVBQUUsTUFBTTtJQUNaLEdBQUcsRUFBRSxRQUFRO0lBQ2IsSUFBSSxFQUFFLFFBQVE7SUFDZCxNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixVQUFVLEVBQUUsWUFBWTtJQUN4QixZQUFZLEVBQUUsY0FBYztDQUMvQixDQUFDO0FBRUYsSUFBTSxhQUFhLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRTFELElBQU0sUUFBUSxHQUFhO0lBQ3ZCLElBQUksRUFBRSxNQUFNO0lBQ1osS0FBSyxFQUFFLE9BQU87SUFDZCxNQUFNLEVBQUUsWUFBWTtJQUNwQixNQUFNLEVBQUUsVUFBVTtJQUNsQixNQUFNLEVBQUUsV0FBVztJQUNuQixVQUFVLEVBQUUsZ0JBQWdCO0lBQzVCLFVBQVUsRUFBRSxjQUFjO0lBQzFCLGlCQUFpQixFQUFFLFVBQVU7SUFDN0IsVUFBVSxFQUFFLFFBQVE7SUFDcEIsU0FBUyxFQUFFLFVBQVU7SUFDckIsY0FBYyxFQUFFLGFBQWE7SUFDN0IsY0FBYyxFQUFFLGlCQUFp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