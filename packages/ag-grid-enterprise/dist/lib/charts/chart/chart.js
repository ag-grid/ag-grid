// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scene_1 = require("../scene/scene");
var group_1 = require("../scene/group");
var Chart = /** @class */ (function () {
    function Chart(parent) {
        if (parent === void 0) { parent = document.body; }
        var _this = this;
        this.scene = new scene_1.Scene();
        this._padding = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };
        this.layoutCallbackId = 0;
        this._performLayout = function () {
            _this.layoutCallbackId = 0;
            _this.performLayout();
        };
        this._series = [];
        this.scene.parent = parent;
        this.scene.root = new group_1.Group();
    }
    Object.defineProperty(Chart.prototype, "padding", {
        get: function () {
            return this._padding;
        },
        set: function (value) {
            this._padding = value;
            this.layoutPending = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "size", {
        set: function (value) {
            this.scene.size = value;
            this.layoutPending = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "width", {
        get: function () {
            return this.scene.width;
        },
        /**
         * The width of the chart in CSS pixels.
         */
        set: function (value) {
            this.scene.width = value;
            this.layoutPending = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "height", {
        get: function () {
            return this.scene.height;
        },
        /**
         * The height of the chart in CSS pixels.
         */
        set: function (value) {
            this.scene.height = value;
            this.layoutPending = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "layoutPending", {
        /**
         * Only `true` while we are waiting for the layout to start.
         * This will be `false` if the layout has already started and is ongoing.
         */
        get: function () {
            return !!this.layoutCallbackId;
        },
        set: function (value) {
            if (value) {
                if (!this.layoutCallbackId) {
                    this.layoutCallbackId = requestAnimationFrame(this._performLayout);
                }
            }
            else if (this.layoutCallbackId) {
                cancelAnimationFrame(this.layoutCallbackId);
                this.layoutCallbackId = 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "series", {
        get: function () {
            return this._series;
        },
        set: function (values) {
            this._series = values;
        },
        enumerable: true,
        configurable: true
    });
    return Chart;
}());
exports.Chart = Chart;
