"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chartTheme_1 = require("./chartTheme");
class DarkTheme extends chartTheme_1.ChartTheme {
    getDefaults() {
        const fontColor = 'rgb(200, 200, 200)';
        const mutedFontColor = 'rgb(150, 150, 150)';
        const axisDefaults = {
            title: {
                color: fontColor
            },
            label: {
                color: fontColor
            },
            gridStyle: [{
                    stroke: 'rgb(88, 88, 88)',
                    lineDash: [4, 2]
                }]
        };
        const seriesLabelDefaults = {
            label: {
                color: fontColor
            }
        };
        const chartDefaults = {
            background: {
                fill: 'rgb(34, 38, 41)'
            },
            title: {
                color: fontColor
            },
            subtitle: {
                color: mutedFontColor
            },
            axes: {
                number: Object.assign({}, axisDefaults),
                category: Object.assign({}, axisDefaults),
                time: Object.assign({}, axisDefaults)
            },
            legend: {
                item: {
                    label: {
                        color: fontColor
                    }
                }
            }
        };
        return this.mergeWithParentDefaults({
            cartesian: Object.assign(Object.assign({}, chartDefaults), { series: {
                    bar: Object.assign({}, seriesLabelDefaults),
                    column: Object.assign({}, seriesLabelDefaults),
                    histogram: Object.assign({}, seriesLabelDefaults)
                } }),
            polar: Object.assign(Object.assign({}, chartDefaults), { series: {
                    pie: Object.assign(Object.assign({}, seriesLabelDefaults), { title: {
                            color: fontColor
                        } })
                } })
        });
    }
    constructor(options) {
        super(options);
    }
}
exports.DarkTheme = DarkTheme;
//# sourceMappingURL=darkTheme.js.map