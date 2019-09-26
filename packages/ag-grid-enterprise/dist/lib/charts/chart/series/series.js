// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var Series = /** @class */ (function () {
    function Series() {
        this.id = this.createId();
        /**
         * The group node that contains all the nodes used to render this series.
         */
        this.group = new group_1.Group();
        this._data = [];
        this._chart = undefined;
        this._visible = true;
        this.tooltipEnabled = false;
        this._showInLegend = true;
    }
    // Uniquely identify series.
    Series.prototype.createId = function () {
        var constructor = this.constructor;
        var className = constructor.className;
        if (!className) {
            throw new Error("The " + constructor + " is missing the 'className' property.");
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    Object.defineProperty(Series.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Series.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            if (this._visible !== value) {
                this._visible = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Series.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.visible = enabled;
    };
    Object.defineProperty(Series.prototype, "showInLegend", {
        get: function () {
            return this._showInLegend;
        },
        set: function (value) {
            if (this._showInLegend !== value) {
                this._showInLegend = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Series.prototype.scheduleLayout = function () {
        if (this.chart) {
            this.chart.layoutPending = true;
        }
    };
    Series.prototype.scheduleData = function () {
        if (this.chart) {
            this.chart.dataPending = true;
        }
    };
    return Series;
}());
exports.Series = Series;
