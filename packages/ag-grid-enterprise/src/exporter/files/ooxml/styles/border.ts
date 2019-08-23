import { ExcelOOXMLTemplate, XmlElement } from 'ag-grid-community';
import { convertLegacyColor } from './stylesheet';

const getBorderColor = (color?: string): XmlElement => {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};

const borderFactory: ExcelOOXMLTemplate = {
    getTemplate(border: BorderSet) {
        const {left, right, top, bottom, diagonal} = border;
        const leftChildren = left ? [getBorderColor(left.color)] : undefined;
        const rightChildren = right ? [getBorderColor(right.color)] : undefined;
        const topChildren = top ? [getBorderColor(top.color)] : undefined;
        const bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        const diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
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

const getWeightName = (value: number | undefined): string => {
    if (value === 1) { return 'thin'; }
    if (value === 2) { return 'medium'; }
    if (value === 3) { return 'thick'; }
    return 'hair';
};

const mappedNames: {[key: string]: string} = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};

const mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];

export const convertLegacyBorder = (type: string, weight: number): string => {
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick

    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    const namedWeight = getWeightName(weight);
    const mappedName = mappedNames[type];

    if (!type) { return 'thin'; }
    if (type === 'Continuous') { return namedWeight; }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) > 0) { return `medium${mappedName}`; }

    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};

export interface Border {
    style: string | undefined;
    color: string | undefined;
}

export interface BorderSet {
    left: Border | undefined;
    right: Border | undefined;
    top: Border | undefined;
    bottom: Border | undefined;
    diagonal: Border | undefined;
}
