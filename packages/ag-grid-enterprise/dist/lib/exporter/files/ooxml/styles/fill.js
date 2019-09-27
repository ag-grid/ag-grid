// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fillFactory = {
    getTemplate: function (fill) {
        var patternType = fill.patternType, fgTheme = fill.fgTheme, fgTint = fill.fgTint, fgRgb = fill.fgRgb, bgRgb = fill.bgRgb, bgIndexed = fill.bgIndexed;
        var pf = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType: patternType
                }
            }
        };
        if (fgTheme || fgTint || fgRgb) {
            pf.children = [{
                    name: 'fgColor',
                    properties: {
                        rawMap: {
                            theme: fgTheme,
                            tint: fgTint,
                            rgb: fgRgb
                        }
                    }
                }];
        }
        if (bgIndexed) {
            if (!pf.children) {
                pf.children = [];
            }
            pf.children.push({
                name: 'bgColor',
                properties: {
                    rawMap: {
                        indexed: bgIndexed,
                        rgb: bgRgb
                    }
                }
            });
        }
        return {
            name: "fill",
            children: [pf]
        };
    }
};
exports.default = fillFactory;
