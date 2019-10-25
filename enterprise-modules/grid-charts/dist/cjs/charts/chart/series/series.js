"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var color_1 = require("../../util/color");
var palettes_1 = require("../palettes");
var SeriesMarker = /** @class */ (function () {
    function SeriesMarker() {
        /**
         * Marker constructor function. A series will create one marker instance per data point.
         */
        this._type = undefined;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[minSize, size]` range, where the largest values will correspond to the `size`
         * and the lowest to the `minSize`.
         */
        this._size = 6;
        this._minSize = 6;
        this._enabled = true;
        // private _xOffset: number = 0;
        // set xOffset(value: number) {
        //     if (this._xOffset !== value) {
        //         this._xOffset = value;
        //         this.update();
        //     }
        // }
        // get xOffset(): number {
        //     return this._xOffset;
        // }
        // private _yOffset: number = 0;
        // set yOffset(value: number) {
        //     if (this._yOffset !== value) {
        //         this._yOffset = value;
        //         this.update();
        //     }
        // }
        // get yOffset(): number {
        //     return this._yOffset;
        // }
        this._fill = palettes_1.default.fills[0];
        this._stroke = palettes_1.default.strokes[0];
        this._strokeWidth = undefined;
        this._fillOpacity = 1;
        this._strokeOpacity = 1;
    }
    Object.defineProperty(SeriesMarker.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            if (this._type !== value) {
                this._type = value;
                if (this.onTypeChange) {
                    this.onTypeChange();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (value) {
            if (this._size !== value) {
                this._size = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "minSize", {
        get: function () {
            return this._minSize;
        },
        set: function (value) {
            if (this._minSize !== value) {
                this._minSize = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                if (value) {
                    this.stroke = color_1.Color.fromString(value).darker().toHexString();
                }
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeriesMarker.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    SeriesMarker.prototype.update = function () {
        if (this.onChange) {
            this.onChange();
        }
    };
    return SeriesMarker;
}());
exports.SeriesMarker = SeriesMarker;
var Series = /** @class */ (function () {
    function Series() {
        this.id = this.createId();
        /**
         * The group node that contains all the nodes used to render this series.
         */
        this.group = new group_1.Group();
        this._data = [];
        this._visible = true;
        this.tooltipEnabled = false;
        this.marker = new SeriesMarker();
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
