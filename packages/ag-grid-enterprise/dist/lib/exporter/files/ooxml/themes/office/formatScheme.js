// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var getPropertyVal = function (name, val, children) { return ({
    name: "a:" + name,
    properties: {
        rawMap: {
            val: val
        }
    },
    children: children
}); };
var getGs = function (props) {
    var pos = props[0], schemeColor = props[1], satMod = props[2], lumMod = props[3], tint = props[4], shade = props[5];
    var children = [];
    children.push(getPropertyVal('satMod', satMod));
    if (lumMod) {
        children.push(getPropertyVal('lumMod', lumMod));
    }
    if (tint) {
        children.push(getPropertyVal('tint', tint));
    }
    if (shade) {
        children.push(getPropertyVal('shade', shade));
    }
    return {
        name: 'a:gs',
        properties: {
            rawMap: {
                pos: pos
            }
        },
        children: [{
                name: 'a:schemeClr',
                properties: {
                    rawMap: {
                        val: schemeColor
                    }
                },
                children: children
            }]
    };
};
var getSolidFill = function (val, children) { return ({
    name: 'a:solidFill',
    children: [getPropertyVal('schemeClr', val, children)]
}); };
var getGradFill = function (props) {
    var rotWithShape = props[0], gs1 = props[1], gs2 = props[2], gs3 = props[3], lin = props[4];
    var ang = lin[0], scaled = lin[1];
    return {
        name: 'a:gradFill',
        properties: {
            rawMap: {
                rotWithShape: rotWithShape
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
var getLine = function (props) {
    var w = props[0], cap = props[1], cmpd = props[2], algn = props[3];
    return {
        name: 'a:ln',
        properties: {
            rawMap: { w: w, cap: cap, cmpd: cmpd, algn: algn }
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
var getEffectStyle = function (shadow) {
    var children = [];
    if (shadow) {
        var blurRad = shadow[0], dist = shadow[1], dir = shadow[2], algn = shadow[3], rotWithShape = shadow[4];
        children.push({
            name: 'a:outerShdw',
            properties: {
                rawMap: { blurRad: blurRad, dist: dist, dir: dir, algn: algn, rotWithShape: rotWithShape }
            },
            children: [
                getPropertyVal('srgbClr', '000000', [getPropertyVal('alpha', '63000')])
            ]
        });
    }
    return {
        name: 'a:effectStyle',
        children: [ag_grid_community_1._.assign({}, {
                name: 'a:effectLst'
            }, children.length ? { children: children } : {})]
    };
};
var getFillStyleList = function () { return ({
    name: 'a:fillStyleLst',
    children: [
        getSolidFill('phClr'),
        getGradFill([
            '1',
            ['0', 'phClr', '105000', '110000', '67000'],
            ['50000', 'phClr', '103000', '105000', '73000'],
            ['100000', 'phClr', '109000', '105000', '81000'],
            ['5400000', '0']
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '103000', '102000', '94000'],
            ['50000', 'phClr', '110000', '100000', undefined, '100000'],
            ['100000', 'phClr', '120000', '99000', undefined, '78000'],
            ['5400000', '0']
        ])
    ]
}); };
var getLineStyleList = function () { return ({
    name: 'a:lnStyleLst',
    children: [
        getLine(['6350', 'flat', 'sng', 'ctr']),
        getLine(['12700', 'flat', 'sng', 'ctr']),
        getLine(['19050', 'flat', 'sng', 'ctr'])
    ]
}); };
var getEffectStyleList = function () { return ({
    name: 'a:effectStyleLst',
    children: [
        getEffectStyle(),
        getEffectStyle(),
        getEffectStyle(['57150', '19050', '5400000', 'ctr', '0'])
    ]
}); };
var getBgFillStyleList = function () { return ({
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
}); };
var formatScheme = {
    getTemplate: function () {
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
exports.default = formatScheme;
