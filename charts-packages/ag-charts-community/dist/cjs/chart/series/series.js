"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var observable_1 = require("../../util/observable");
var chartAxis_1 = require("../chartAxis");
var id_1 = require("../../util/id");
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = id_1.createId(_this);
        /**
         * The group node that contains all the nodes used to render this series.
         */
        _this.group = new group_1.Group();
        _this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        _this.tooltipEnabled = true;
        _this.data = undefined;
        _this.visible = true;
        _this.showInLegend = true;
        _this.scheduleLayout = function () {
            _this.fireEvent({ type: 'layoutChange' });
        };
        _this.scheduleData = function () {
            _this.fireEvent({ type: 'dataChange' });
        };
        return _this;
    }
    Object.defineProperty(Series.prototype, "type", {
        get: function () {
            return this.constructor.type || '';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns the actual keys used (to fetch the values from `data` items) for the given direction.
     */
    Series.prototype.getKeys = function (direction) {
        var _this = this;
        var directionKeys = this.directionKeys;
        var keys = directionKeys && directionKeys[direction];
        var values = [];
        if (keys) {
            keys.forEach(function (key) {
                var value = _this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push.apply(values, value);
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    };
    // Returns node data associated with the rendered portion of the series' data.
    Series.prototype.getNodeData = function () {
        return [];
    };
    Series.prototype.fireNodeClickEvent = function (datum) { };
    Series.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.visible = enabled;
    };
    // Each series is expected to have its own logic to efficiently update its nodes
    // on hightlight changes.
    Series.prototype.onHighlightChange = function () { };
    Series.prototype.fixNumericExtent = function (extent, type) {
        if (!extent) {
            // if (type) {
            //     console.warn(`The ${type}-domain could not be found (no valid values), using the default of [0, 1].`);
            // }
            return [0, 1];
        }
        var min = extent[0], max = extent[1];
        if (min === max) {
            min -= 1;
            max += 1;
            // if (type) {
            //     console.warn(`The ${type}-domain has zero length and has been automatically expanded`
            //         + ` by 1 in each direction (from the single valid ${type}-value: ${min}).`);
            // }
        }
        if (!isFinite(min) || !isFinite(max)) {
            min = 0;
            max = 1;
            // if (type) {
            //     console.warn(`The ${type}-domain has infinite length, using the default of [0, 1].`);
            // }
        }
        return [min, max];
    };
    __decorate([
        observable_1.reactive('dataChange')
    ], Series.prototype, "data", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], Series.prototype, "visible", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], Series.prototype, "showInLegend", void 0);
    return Series;
}(observable_1.Observable));
exports.Series = Series;
//# sourceMappingURL=series.js.map