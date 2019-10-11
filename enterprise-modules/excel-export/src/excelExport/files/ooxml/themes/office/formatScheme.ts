import { ExcelOOXMLTemplate, XmlElement, _ } from 'ag-grid-community';

type GsType = [string, string, string, string?, string?, string?];
type LinType = [string, string];

const getPropertyVal = (name: string, val: string, children?: XmlElement[]): XmlElement => ({
    name: `a:${name}`,
    properties: {
        rawMap: {
            val
        }
    },
    children
});

const getGs = (props: GsType): XmlElement => {
    const [pos, schemeColor, satMod, lumMod, tint, shade] = props;
    const children: XmlElement[] = [];

    children.push(getPropertyVal('satMod', satMod));
    if (lumMod) { children.push(getPropertyVal('lumMod', lumMod)); }
    if (tint) { children.push(getPropertyVal('tint', tint)); }
    if (shade) { children.push(getPropertyVal('shade', shade)); }

    return {
        name: 'a:gs',
        properties: {
            rawMap: {
                pos
            }
        },
        children: [{
            name: 'a:schemeClr',
            properties: {
                rawMap: {
                    val: schemeColor
                }
            },
            children
        }]
    };
};

const getSolidFill = (val: string, children?: XmlElement[]): XmlElement => ({
    name: 'a:solidFill',
    children: [getPropertyVal('schemeClr', val, children)]
});

const getGradFill = (props: [string, GsType, GsType, GsType, LinType]): XmlElement => {
    const [rotWithShape, gs1, gs2, gs3, lin] = props;
    const [ang, scaled] = lin;
    return {
        name: 'a:gradFill',
        properties: {
            rawMap: {
                rotWithShape
            }
        },
        children: [{
            name: 'a:gsLst',
            children: [
                getGs(gs1),
                getGs(gs2),
                getGs(gs3)
            ]
        }, {
            name: 'a:lin',
            properties: {
                rawMap: {
                    ang: ang,
                    scaled: scaled
                }
            }
        }]
    };
};

const getLine = (props: [string, string, string, string]): XmlElement => {
    const [w, cap, cmpd, algn] = props;

    return {
        name: 'a:ln',
        properties: {
            rawMap: { w, cap, cmpd, algn }
        },
        children: [
            getSolidFill('phClr'),
            getPropertyVal('prstDash', 'solid'),
            {
                name: 'a:miter',
                properties: {
                    rawMap: {
                        lim: '800000'
                    }
                }
            }
        ]
    };
};

const getEffectStyle = (shadow?: [string, string, string, string, string]): XmlElement => {
    const children: XmlElement[] = [];

    if (shadow) {
        const [blurRad, dist, dir, algn, rotWithShape] = shadow;
        children.push({
            name: 'a:outerShdw',
            properties: {
                rawMap: { blurRad, dist, dir, algn, rotWithShape }
            },
            children: [
                getPropertyVal('srgbClr', '000000', [getPropertyVal('alpha', '63000')])
            ]
        });
    }

    return {
        name: 'a:effectStyle',
        children: [_.assign({}, {
            name: 'a:effectLst'
        }, children.length ? {children} : {})]
    };
};

const getFillStyleList = (): XmlElement => ({
    name: 'a:fillStyleLst',
    children: [
        getSolidFill('phClr'),
        getGradFill([
            '1',
            ['0', 'phClr', '105000', '110000', '67000'],
            ['50000', 'phClr', '103000', '105000', '73000' ],
            ['100000', 'phClr', '109000', '105000', '81000' ],
            ['5400000', '0']
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '103000', '102000', '94000' ],
            ['50000', 'phClr', '110000', '100000', undefined, '100000' ],
            ['100000', 'phClr', '120000', '99000', undefined, '78000' ],
            ['5400000', '0' ]
        ])
    ]
});

const getLineStyleList = (): XmlElement => ({
    name: 'a:lnStyleLst',
    children: [
        getLine(['6350', 'flat', 'sng', 'ctr']),
        getLine(['12700', 'flat', 'sng', 'ctr']),
        getLine(['19050', 'flat', 'sng', 'ctr'])
    ]
});

const getEffectStyleList = (): XmlElement => ({
    name: 'a:effectStyleLst',
    children: [
        getEffectStyle(),
        getEffectStyle(),
        getEffectStyle(['57150', '19050', '5400000', 'ctr', '0'])
    ]
});

const getBgFillStyleList = (): XmlElement => ({
    name: 'a:bgFillStyleLst',
    children: [
        getSolidFill('phClr'),
        getSolidFill('phClr', [
            getPropertyVal('tint', '95000'),
            getPropertyVal('satMod', '170000'),
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '150000', '102000', '93000', '98000'],
            ['50000', 'phClr', '130000', '103000', '98000', '90000'],
            ['100000', 'phClr', '120000', undefined, undefined, '63000'],
            ['5400000', '0']
        ])
    ]
});

const formatScheme: ExcelOOXMLTemplate = {
    getTemplate() {
        return {
            name: "a:fmtScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getFillStyleList(),
                getLineStyleList(),
                getEffectStyleList(),
                getBgFillStyleList()
            ]
        };
    }
};

export default formatScheme;
