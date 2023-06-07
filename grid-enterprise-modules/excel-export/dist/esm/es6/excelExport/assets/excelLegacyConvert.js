const getWeightName = (value) => {
    switch (value) {
        case 1: return 'thin';
        case 2: return 'medium';
        case 3: return 'thick';
        default: return 'hair';
    }
};
const mappedBorderNames = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};
const mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];
const colorMap = {
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
const horizontalAlignmentMap = {
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
const verticalAlignmentMap = {
    Automatic: undefined,
    Top: 'top',
    Bottom: 'bottom',
    Center: 'center',
    Justify: 'justify',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
export const convertLegacyPattern = (name) => {
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
export const convertLegacyColor = (color) => {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? 'FF' + color : color;
};
export const convertLegacyBorder = (type, weight) => {
    if (!type) {
        return 'thin';
    }
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick
    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    const namedWeight = getWeightName(weight);
    const mappedName = mappedBorderNames[type];
    if (type === 'Continuous') {
        return namedWeight;
    }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) !== -1) {
        return `medium${mappedName}`;
    }
    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};
export const convertLegacyHorizontalAlignment = (alignment) => {
    return horizontalAlignmentMap[alignment] || 'general';
};
export const convertLegacyVerticalAlignment = (alignment) => {
    return verticalAlignmentMap[alignment] || undefined;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxMZWdhY3lDb252ZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2Fzc2V0cy9leGNlbExlZ2FjeUNvbnZlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFjLEVBQVUsRUFBRTtJQUM3QyxRQUFRLEtBQUssRUFBRTtRQUNYLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7UUFDdEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQztRQUN4QixLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDO0tBQzFCO0FBQ0wsQ0FBQyxDQUFDO0FBRUYsTUFBTSxpQkFBaUIsR0FBOEI7SUFDakQsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsUUFBUTtJQUNiLElBQUksRUFBRSxRQUFRO0lBQ2QsTUFBTSxFQUFFLFFBQVE7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsVUFBVSxFQUFFLFlBQVk7SUFDeEIsWUFBWSxFQUFFLGNBQWM7Q0FDL0IsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUUxRCxNQUFNLFFBQVEsR0FBYTtJQUN2QixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxPQUFPO0lBQ2QsTUFBTSxFQUFFLFlBQVk7SUFDcEIsTUFBTSxFQUFFLFVBQVU7SUFDbEIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsVUFBVSxFQUFFLGdCQUFnQjtJQUM1QixVQUFVLEVBQUUsY0FBYztJQUMxQixpQkFBaUIsRUFBRSxVQUFVO0lBQzdCLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLFNBQVMsRUFBRSxVQUFVO0lBQ3JCLGNBQWMsRUFBRSxhQUFhO0lBQzdCLGNBQWMs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