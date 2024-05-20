const getWeightName = (value?: number): 'thin' | 'medium' | 'thick' | 'hair' => {
    switch (value) {
        case 1:
            return 'thin';
        case 2:
            return 'medium';
        case 3:
            return 'thick';
        default:
            return 'hair';
    }
};

type ColorKeyType =
    | 'None'
    | 'Solid'
    | 'Gray50'
    | 'Gray75'
    | 'Gray25'
    | 'Gray125'
    | 'Gray0625'
    | 'HorzStripe'
    | 'VertStripe'
    | 'ReverseDiagStripe'
    | 'DiagStripe'
    | 'DiagCross'
    | 'ThickDiagCross'
    | 'ThickDiagCross'
    | 'ThinHorzStripe'
    | 'ThinVertStripe'
    | 'ThinReverseDiagStripe'
    | 'ThinDiagStripe'
    | 'ThinHorzCross'
    | 'ThinDiagCross';

type ColorValueType =
    | 'none'
    | 'solid'
    | 'mediumGray'
    | 'darkGray'
    | 'lightGray'
    | 'gray125'
    | 'gray0625'
    | 'darkHorizontal'
    | 'darkVertical'
    | 'darkDown'
    | 'darkUp'
    | 'darkGrid'
    | 'darkTrellis'
    | 'lightHorizontal'
    | 'lightVertical'
    | 'lightDown'
    | 'lightUp'
    | 'lightGrid'
    | 'lightTrellis';

type BorderKeyType = 'Dot' | 'Dash';
type BorderTransformedKeyType = 'Dotted' | 'Dashed';
type BorderFixedNames = 'None' | 'Double' | 'DashDot' | 'DashDotDot' | 'SlantDashDot' | 'Continuous';
type LegacyBorderType = BorderKeyType | BorderFixedNames;
type MediumBordersType = 'Dashed' | 'DashDot' | 'DashDotDot';
type BorderType =
    | 'none'
    | 'thin'
    | 'medium'
    | 'dashed'
    | 'dotted'
    | 'thick'
    | 'double'
    | 'hair'
    | 'mediumDashed'
    | 'dashDot'
    | 'mediumDashDot'
    | 'dashDotDot'
    | 'mediumDashDotDot'
    | 'slantDashDot';

type BaseAlignmentKeyType = 'Automatic' | 'Center' | 'Justify' | 'Distributed' | 'JustifyDistributed';
type HorizontalAlignmentKeyType = BaseAlignmentKeyType | 'Left' | 'Right' | 'Fill' | 'CenterAcrossSelection';
type VerticalAlignmentKeyType = BaseAlignmentKeyType | 'Top' | 'Bottom';

type BaseAlignmentType = 'center' | 'justify' | 'distributed';
type HorizontalAlignmentType = BaseAlignmentType | 'general' | 'left' | 'right' | 'fill' | 'centerContinuous';
type VerticalAlignmentType = BaseAlignmentType | 'top' | 'bottom' | undefined;

const mappedBorderNames: { [key in BorderKeyType | BorderFixedNames]: BorderTransformedKeyType | BorderFixedNames } = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot',
    Continuous: 'Continuous',
};

const mediumBorders: MediumBordersType[] = ['Dashed', 'DashDot', 'DashDotDot'];

const colorMap: { [key in ColorKeyType]: ColorValueType } = {
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
    Gray0625: 'gray0625',
};

const horizontalAlignmentMap: { [key in HorizontalAlignmentKeyType]: HorizontalAlignmentType } = {
    Automatic: 'general',
    Left: 'left',
    Center: 'center',
    Right: 'right',
    Fill: 'fill',
    Justify: 'justify',
    CenterAcrossSelection: 'centerContinuous',
    Distributed: 'distributed',
    JustifyDistributed: 'justify',
};

const verticalAlignmentMap: { [key in VerticalAlignmentKeyType]: VerticalAlignmentType } = {
    Automatic: undefined,
    Top: 'top',
    Bottom: 'bottom',
    Center: 'center',
    Justify: 'justify',
    Distributed: 'distributed',
    JustifyDistributed: 'justify',
};

export const convertLegacyPattern = (name: ColorKeyType | undefined): (typeof colorMap)[keyof typeof colorMap] => {
    if (!name) {
        return 'none';
    }

    return colorMap[name] || name;
};

export const convertLegacyColor = (color?: string): string | undefined => {
    if (color == undefined) {
        return color;
    }

    if (color.charAt(0) === '#') {
        color = color.substring(1);
    }

    return color.length === 6 ? 'FF' + color : color;
};

export const convertLegacyBorder = (type?: LegacyBorderType, weight?: number): BorderType => {
    if (!type) {
        return 'thin';
    }

    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick

    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    const namedWeight = getWeightName(weight);

    if (type === 'Continuous') {
        return namedWeight;
    }

    const mappedName = mappedBorderNames[type];
    if (namedWeight === 'medium' && mediumBorders.some((type) => type === mappedName)) {
        return `medium${mappedName as 'Dashed' | 'DashDot' | 'DashDotDot'}`;
    }

    return `${mappedName.charAt(0).toLowerCase()}${mappedName.substring(1)}` as BorderType;
};

export const convertLegacyHorizontalAlignment = (alignment: HorizontalAlignmentKeyType): HorizontalAlignmentType => {
    return horizontalAlignmentMap[alignment] || 'general';
};

export const convertLegacyVerticalAlignment = (alignment: VerticalAlignmentKeyType): VerticalAlignmentType => {
    return verticalAlignmentMap[alignment] || undefined;
};
