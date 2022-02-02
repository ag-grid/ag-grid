var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from "../../scene/group";
import { Observable, reactive } from "../../util/observable";
import { ChartAxisDirection } from "../chartAxis";
import { createId } from "../../util/id";
import { Label } from "../label";
import { isNumber } from "../../util/value";
export class SeriesItemHighlightStyle {
    constructor() {
        this.fill = 'yellow';
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
}
export class SeriesHighlightStyle {
    constructor() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
    }
}
export class HighlightStyle {
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
export class SeriesTooltip extends Observable {
    constructor() {
        super(...arguments);
        this.enabled = true;
    }
}
__decorate([
    reactive('change')
], SeriesTooltip.prototype, "enabled", void 0);
export class Series extends Observable {
    constructor() {
        super(...arguments);
        this.id = createId(this);
        // The group node that contains all the nodes used to render this series.
        this.group = new Group();
        // The group node that contains all the nodes that can be "picked" (react to hover, tap, click).
        this.pickGroup = this.group.appendChild(new Group());
        this.directions = [ChartAxisDirection.X, ChartAxisDirection.Y];
        this.directionKeys = {};
        this.label = new Label();
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
    fixNumericExtent(extent, type) {
        if (!extent) {
            // if (type) {
            //     console.warn(`The ${type}-domain could not be found (no valid values), using the default of [0, 1].`);
            // }
            return [0, 1];
        }
        let [min, max] = extent;
        min = +min;
        max = +max;
        if (min === max) {
            const padding = Math.abs(min * 0.01);
            min -= padding;
            max += padding;
            // if (type) {
            //     console.warn(`The ${type}-domain has zero length and has been automatically expanded`
            //         + ` by 1 in each direction (from the single valid ${type}-value: ${min}).`);
            // }
        }
        if (!(isNumber(min) && isNumber(max))) {
            min = 0;
            max = 1;
            // if (type) {
            //     console.warn(`The ${type}-domain has infinite length, using the default of [0, 1].`);
            // }
        }
        return [min, max];
    }
}
Series.highlightedZIndex = 1000000000000;
__decorate([
    reactive('dataChange')
], Series.prototype, "data", void 0);
__decorate([
    reactive('dataChange')
], Series.prototype, "visible", void 0);
__decorate([
    reactive('layoutChange')
], Series.prototype, "showInLegend", void 0);
//# sourceMappingURL=series.js.map