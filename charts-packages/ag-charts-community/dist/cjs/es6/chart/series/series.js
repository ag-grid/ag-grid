"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../../scene/group");
const observable_1 = require("../../util/observable");
const chartAxis_1 = require("../chartAxis");
const id_1 = require("../../util/id");
const label_1 = require("../label");
const value_1 = require("../../util/value");
const timeAxis_1 = require("../axis/timeAxis");
class SeriesItemHighlightStyle {
    constructor() {
        this.fill = 'yellow';
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
}
exports.SeriesItemHighlightStyle = SeriesItemHighlightStyle;
class SeriesHighlightStyle {
    constructor() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
    }
}
exports.SeriesHighlightStyle = SeriesHighlightStyle;
class HighlightStyle {
    constructor() {
        /**
         * @deprecated Use item.fill instead.
         */
        this.fill = undefined;
        /**
         * @deprecated Use item.stroke instead.
         */
        this.stroke = undefined;
        /**
        * @deprecated Use item.strokeWidth instead.
        */
        this.strokeWidth = undefined;
        this.item = new SeriesItemHighlightStyle();
        this.series = new SeriesHighlightStyle();
    }
}
exports.HighlightStyle = HighlightStyle;
class SeriesTooltip extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.enabled = true;
    }
}
__decorate([
    observable_1.reactive('change')
], SeriesTooltip.prototype, "enabled", void 0);
exports.SeriesTooltip = SeriesTooltip;
class Series extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.id = id_1.createId(this);
        // The group node that contains all the nodes used to render this series.
        this.group = new group_1.Group();
        // The group node that contains all the nodes that can be "picked" (react to hover, tap, click).
        this.pickGroup = this.group.appendChild(new group_1.Group());
        this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        this.directionKeys = {};
        this.label = new label_1.Label();
        this.data = undefined;
        this.visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this._nodeDataPending = true;
        this._updatePending = false;
        this.highlightStyle = new HighlightStyle();
        this.scheduleLayout = () => {
            this.fireEvent({ type: 'layoutChange' });
        };
        this.scheduleData = () => {
            this.fireEvent({ type: 'dataChange' });
        };
    }
    get type() {
        return this.constructor.type || '';
    }
    set grouped(g) {
        if (g === true) {
            throw new Error(`AG Charts - grouped: true is unsupported for series of type: ${this.type}`);
        }
    }
    setColors(fills, strokes) { }
    // Returns the actual keys used (to fetch the values from `data` items) for the given direction.
    getKeys(direction) {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[direction];
        const values = [];
        if (keys) {
            keys.forEach(key => {
                const value = this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    }
    // Using processed data, create data that backs visible nodes.
    createNodeData() { return []; }
    // Returns persisted node data associated with the rendered portion of the series' data.
    getNodeData() { return []; }
    getLabelData() { return []; }
    set nodeDataPending(value) {
        if (this._nodeDataPending !== value) {
            this._nodeDataPending = value;
            this.updatePending = true;
            if (value && this.chart) {
                this.chart.updatePending = value;
            }
        }
    }
    get nodeDataPending() {
        return this._nodeDataPending;
    }
    scheduleNodeDate() {
        this.nodeDataPending = true;
    }
    set updatePending(value) {
        if (this._updatePending !== value) {
            this._updatePending = value;
            if (value && this.chart) {
                this.chart.updatePending = value;
            }
        }
    }
    get updatePending() {
        return this._updatePending;
    }
    scheduleUpdate() {
        this.updatePending = true;
    }
    getOpacity(datum) {
        const { chart, highlightStyle: { series: { dimOpacity = 1 } } } = this;
        return !chart || !chart.highlightedDatum ||
            chart.highlightedDatum.series === this &&
                (!datum || chart.highlightedDatum.itemId === datum.itemId) ? 1 : dimOpacity;
    }
    getStrokeWidth(defaultStrokeWidth, datum) {
        const { chart, highlightStyle: { series: { strokeWidth } } } = this;
        return chart && chart.highlightedDatum &&
            chart.highlightedDatum.series === this &&
            (!datum || chart.highlightedDatum.itemId === datum.itemId) &&
            strokeWidth !== undefined ? strokeWidth : defaultStrokeWidth;
    }
    fireNodeClickEvent(event, datum) { }
    toggleSeriesItem(itemId, enabled) {
        this.visible = enabled;
    }
    // Each series is expected to have its own logic to efficiently update its nodes
    // on hightlight changes.
    onHighlightChange() { }
    fixNumericExtent(extent, type, axis) {
        if (!extent) {
            return [0, 1];
        }
        let [min, max] = extent;
        min = +min;
        max = +max;
        if (min === 0 && max === 0) {
            // domain has zero length and the single valid value is 0. Use the default of [0, 1].
            return [0, 1];
        }
        if (min === max) {
            // domain has zero length, there is only a single valid value in data
            if (axis instanceof timeAxis_1.TimeAxis) { // numbers in domain correspond to Unix timestamps
                // automatically expand domain by 1 in each direction
                min -= 1;
                max += 1;
            }
            else {
                const padding = Math.abs(min * 0.01);
                min -= padding;
                max += padding;
            }
        }
        if (!(value_1.isNumber(min) && value_1.isNumber(max))) {
            return [0, 1];
        }
        return [min, max];
    }
}
Series.highlightedZIndex = 1000000000000;
__decorate([
    observable_1.reactive('dataChange')
], Series.prototype, "data", void 0);
__decorate([
    observable_1.reactive('dataChange')
], Series.prototype, "visible", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Series.prototype, "showInLegend", void 0);
exports.Series = Series;
//# sourceMappingURL=series.js.map