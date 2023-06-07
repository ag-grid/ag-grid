var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
    var _a = __read(props, 6), pos = _a[0], schemeColor = _a[1], satMod = _a[2], lumMod = _a[3], tint = _a[4], shade = _a[5];
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
    var _a = __read(props, 5), rotWithShape = _a[0], gs1 = _a[1], gs2 = _a[2], gs3 = _a[3], lin = _a[4];
    var _b = __read(lin, 2), ang = _b[0], scaled = _b[1];
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
    var _a = __read(props, 4), w = _a[0], cap = _a[1], cmpd = _a[2], algn = _a[3];
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
        var _a = __read(shadow, 5), blurRad = _a[0], dist = _a[1], dir = _a[2], algn = _a[3], rotWithShape = _a[4];
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
        children: [Object.assign({}, {
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
export default formatScheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0U2NoZW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3RoZW1lcy9vZmZpY2UvZm9ybWF0U2NoZW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLQSxJQUFNLGNBQWMsR0FBRyxVQUFDLElBQVksRUFBRSxHQUFXLEVBQUUsUUFBdUIsSUFBaUIsT0FBQSxDQUFDO0lBQ3hGLElBQUksRUFBRSxPQUFLLElBQU07SUFDakIsVUFBVSxFQUFFO1FBQ1IsTUFBTSxFQUFFO1lBQ0osR0FBRyxLQUFBO1NBQ047S0FDSjtJQUNELFFBQVEsVUFBQTtDQUNYLENBQUMsRUFSeUYsQ0FRekYsQ0FBQztBQUVILElBQU0sS0FBSyxHQUFHLFVBQUMsS0FBYTtJQUNsQixJQUFBLEtBQUEsT0FBa0QsS0FBSyxJQUFBLEVBQXRELEdBQUcsUUFBQSxFQUFFLFdBQVcsUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLElBQUksUUFBQSxFQUFFLEtBQUssUUFBUyxDQUFDO0lBQzlELElBQU0sUUFBUSxHQUFpQixFQUFFLENBQUM7SUFFbEMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDaEQsSUFBSSxNQUFNLEVBQUU7UUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUFFO0lBQ2hFLElBQUksSUFBSSxFQUFFO1FBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FBRTtJQUMxRCxJQUFJLEtBQUssRUFBRTtRQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxD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