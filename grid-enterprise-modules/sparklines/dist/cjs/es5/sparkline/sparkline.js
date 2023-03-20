"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sparkline = exports.SparklineAxis = exports.ZINDICIES = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var defaultTooltipCss_1 = require("./tooltip/defaultTooltipCss");
var extent = ag_charts_community_1._Util.extent, isNumber = ag_charts_community_1._Util.isNumber, isString = ag_charts_community_1._Util.isString, isStringObject = ag_charts_community_1._Util.isStringObject, isDate = ag_charts_community_1._Util.isDate, createId = ag_charts_community_1._Util.createId, Padding = ag_charts_community_1._Util.Padding;
var LinearScale = ag_charts_community_1._Scale.LinearScale, BandScale = ag_charts_community_1._Scale.BandScale, TimeScale = ag_charts_community_1._Scale.TimeScale;
/**
 * Constants to declare the expected nominal zIndex for nodes in a sparkline rendering.
 */
var ZINDICIES;
(function (ZINDICIES) {
    ZINDICIES[ZINDICIES["SERIES_FILL_ZINDEX"] = 50] = "SERIES_FILL_ZINDEX";
    ZINDICIES[ZINDICIES["AXIS_LINE_ZINDEX"] = 500] = "AXIS_LINE_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_STROKE_ZINDEX"] = 1000] = "SERIES_STROKE_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_LABEL_ZINDEX"] = 1500] = "SERIES_LABEL_ZINDEX";
    ZINDICIES[ZINDICIES["CROSSHAIR_ZINDEX"] = 2000] = "CROSSHAIR_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_MARKERS_ZINDEX"] = 2500] = "SERIES_MARKERS_ZINDEX";
})(ZINDICIES = exports.ZINDICIES || (exports.ZINDICIES = {}));
var SparklineAxis = /** @class */ (function () {
    function SparklineAxis() {
        this.type = 'category';
        this.stroke = 'rgb(204, 214, 235)';
        this.strokeWidth = 1;
    }
    return SparklineAxis;
}());
exports.SparklineAxis = SparklineAxis;
var Sparkline = /** @class */ (function () {
    function Sparkline() {
        this.id = createId(this);
        this.seriesRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        this._context = undefined;
        this._container = undefined;
        this._data = undefined;
        this.padding = new Padding(3);
        this.xKey = 'x';
        this.yKey = 'y';
        this.dataType = undefined;
        this.xData = [];
        this.yData = [];
        // Minimum y value in provided data.
        this.min = undefined;
        // Maximum y value in provided data.
        this.max = undefined;
        this.yScale = new LinearScale();
        this.axis = new SparklineAxis();
        this.highlightStyle = {
            size: 6,
            fill: 'yellow',
            stroke: 'silver',
            strokeWidth: 1,
        };
        this._width = 100;
        this._height = 100;
        this.smallestInterval = undefined;
        this.layoutId = 0;
        this.defaultDateFormatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseOut = this.onMouseOut.bind(this);
        var root = new ag_charts_community_1._Scene.Group();
        this.rootGroup = root;
        var element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');
        var scene = new ag_charts_community_1._Scene.Scene({ document: document });
        this.scene = scene;
        this.canvasElement = scene.canvas.element;
        scene.root = root;
        scene.container = element;
        scene.resize(this.width, this.height);
        this.seriesRect.width = this.width;
        this.seriesRect.height = this.height;
        // one style element for tooltip styles per document
        if (Sparkline.tooltipDocuments.indexOf(document) === -1) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss_1.defaultTooltipCss;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Sparkline.tooltipDocuments.push(document);
        }
        this.setupDomEventListeners(this.scene.canvas.element);
    }
    Object.defineProperty(Sparkline.prototype, "context", {
        get: function () {
            return this._context;
        },
        set: function (value) {
            if (this._context !== value) {
                this._context = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                var parentNode = this.canvasElement.parentNode;
                if (parentNode != null) {
                    parentNode.removeChild(this.canvasElement);
                }
                if (value) {
                    value.appendChild(this.canvasElement);
                }
                this._container = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            if (this._data !== value) {
                this._data = value;
                this.processData();
                if (this.mouseMoveEvent && this.highlightedDatum) {
                    this.updateHitPoint(this.mouseMoveEvent);
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.scene.resize(value, this.height);
                this.scheduleLayout();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sparkline.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.scene.resize(this.width, value);
                this.scheduleLayout();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generate node data from processed data.
     * Produce data joins.
     * Update selection's nodes using node data.
     */
    Sparkline.prototype.update = function () { };
    // Update y scale based on processed data.
    Sparkline.prototype.updateYScale = function () {
        this.updateYScaleRange();
        this.updateYScaleDomain();
    };
    // Update y scale domain based on processed data.
    Sparkline.prototype.updateYScaleDomain = function () { };
    // Update y scale range based on height and padding (seriesRect).
    Sparkline.prototype.updateYScaleRange = function () {
        var _a = this, yScale = _a.yScale, seriesRect = _a.seriesRect;
        yScale.range = [seriesRect.height, 0];
    };
    // Update x scale based on processed data.
    Sparkline.prototype.updateXScale = function () {
        var type = this.axis.type;
        this.xScale = this.getXScale(type);
        this.updateXScaleRange();
        this.updateXScaleDomain();
    };
    // Update x scale range based on width and padding (seriesRect).
    Sparkline.prototype.updateXScaleRange = function () {
        this.xScale.range = [0, this.seriesRect.width];
    };
    // Update x scale domain based on processed data and type of scale.
    Sparkline.prototype.updateXScaleDomain = function () {
        var _a = this, xData = _a.xData, xScale = _a.xScale;
        var xMinMax;
        if (xScale instanceof LinearScale || xScale instanceof TimeScale) {
            xMinMax = extent(xData);
        }
        this.xScale.domain = xMinMax ? xMinMax.slice() : xData;
    };
    /**
     * Return xScale instance based on the provided type or return a `BandScale` by default.
     * The default type is `category`.
     * @param type
     */
    Sparkline.prototype.getXScale = function (type) {
        if (type === void 0) { type = 'category'; }
        switch (type) {
            case 'number':
                return new LinearScale();
            case 'time':
                return new TimeScale();
            case 'category':
            default:
                return new BandScale();
        }
    };
    // Update axis line.
    Sparkline.prototype.updateAxisLine = function () { };
    // Update X and Y scales and the axis line.
    Sparkline.prototype.updateAxes = function () {
        this.updateYScale();
        this.updateXScale();
        this.updateAxisLine();
    };
    // Update horizontal and vertical crosshair lines.
    Sparkline.prototype.updateCrosshairs = function () {
        this.updateXCrosshairLine();
        this.updateYCrosshairLine();
    };
    // Using processed data, generate data that backs visible nodes.
    Sparkline.prototype.generateNodeData = function () {
        return [];
    };
    // Returns persisted node data associated with the sparkline's data.
    Sparkline.prototype.getNodeData = function () {
        return [];
    };
    // Update the selection's nodes.
    Sparkline.prototype.updateNodes = function () { };
    // Update the vertical crosshair line.
    Sparkline.prototype.updateXCrosshairLine = function () { };
    // Update the horizontal crosshair line.
    Sparkline.prototype.updateYCrosshairLine = function () { };
    Sparkline.prototype.highlightDatum = function (closestDatum) {
        this.updateNodes();
    };
    Sparkline.prototype.dehighlightDatum = function () {
        this.highlightedDatum = undefined;
        this.updateNodes();
        this.updateCrosshairs();
    };
    /**
     * Highlight closest datum and display tooltip if enabled.
     * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
     * or if there is no previously highlighted datum.
     * @param event
     */
    Sparkline.prototype.onMouseMove = function (event) {
        this.mouseMoveEvent = event;
        this.updateHitPoint(event);
    };
    Sparkline.prototype.updateHitPoint = function (event) {
        var closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
        if (!closestDatum) {
            return;
        }
        var oldHighlightedDatum = this.highlightedDatum;
        this.highlightedDatum = closestDatum;
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (this.highlightedDatum && oldHighlightedDatum && this.highlightedDatum !== oldHighlightedDatum)) {
            this.highlightDatum(closestDatum);
            this.updateCrosshairs();
            this.scene.render();
        }
        if (this.tooltip.enabled) {
            this.handleTooltip(event, closestDatum);
        }
    };
    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    Sparkline.prototype.onMouseOut = function (event) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
        this.scene.render();
    };
    // Fetch required values from the data object and process them.
    Sparkline.prototype.processData = function () {
        var _this = this;
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData;
        if (!data || this.invalidData(this.data)) {
            return;
        }
        yData.length = 0;
        xData.length = 0;
        var n = data.length;
        var dataType = this.getDataType(data);
        this.dataType = dataType;
        var xValueType = this.axis.type;
        var xType = xValueType !== 'number' && xValueType !== 'time' ? 'category' : xValueType;
        var isContinuousX = xType === 'number' || xType === 'time';
        var setSmallestXInterval = function (curr, prev) {
            if (_this.smallestInterval == undefined) {
                _this.smallestInterval = { x: Infinity, y: Infinity };
            }
            var x = _this.smallestInterval.x;
            var interval = Math.abs(curr - prev);
            if (interval > 0 && interval < x) {
                _this.smallestInterval.x = interval;
            }
        };
        var prevX;
        if (dataType === 'number') {
            for (var i = 0; i < n; i++) {
                var xDatum = i;
                var yDatum = data[i];
                var x = this.getDatum(xDatum, xType);
                var y = this.getDatum(yDatum, 'number');
                if (isContinuousX) {
                    setSmallestXInterval(x, prevX);
                }
                xData.push(x);
                yData.push(y);
                prevX = x;
            }
        }
        else if (dataType === 'array') {
            for (var i = 0; i < n; i++) {
                var datum = data[i];
                if (Array.isArray(datum)) {
                    var xDatum = datum[0];
                    var yDatum = datum[1];
                    var x = this.getDatum(xDatum, xType);
                    var y = this.getDatum(yDatum, 'number');
                    if (x == undefined) {
                        continue;
                    }
                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }
                    xData.push(x);
                    yData.push(y);
                    prevX = x;
                }
            }
        }
        else if (dataType === 'object') {
            var _b = this, yKey = _b.yKey, xKey = _b.xKey;
            for (var i = 0; i < n; i++) {
                var datum = data[i];
                if (typeof datum === 'object' && !Array.isArray(datum)) {
                    var xDatum = datum[xKey];
                    var yDatum = datum[yKey];
                    var x = this.getDatum(xDatum, xType);
                    var y = this.getDatum(yDatum, 'number');
                    if (x == undefined) {
                        continue;
                    }
                    if (isContinuousX) {
                        setSmallestXInterval(x, prevX);
                    }
                    xData.push(x);
                    yData.push(y);
                    prevX = x;
                }
            }
        }
        // update axes
        this.updateAxes();
        // produce data joins and update selection's nodes
        this.update();
        this.scene.render();
    };
    /**
     * Return the type of data provided to the sparkline based on the first truthy value in the data array.
     * If the value is not a number, array or object, return `undefined`.
     * @param data
     */
    Sparkline.prototype.getDataType = function (data) {
        var e_1, _a;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                if (datum != undefined) {
                    if (isNumber(datum)) {
                        return 'number';
                    }
                    else if (Array.isArray(datum)) {
                        return 'array';
                    }
                    else if (typeof datum === 'object') {
                        return 'object';
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    /**
     * Return the given value depending on the type of axis.
     * Return `undefined` if the value is invalid for the given axis type.
     * @param value
     */
    Sparkline.prototype.getDatum = function (value, type) {
        if ((type === 'number' && isNumber(value)) || (type === 'time' && (isNumber(value) || isDate(value)))) {
            return value;
        }
        else if (type === 'category') {
            if (isString(value) || isDate(value) || isNumber(value)) {
                return { toString: function () { return String(value); } };
            }
            else if (isStringObject(value)) {
                return value;
            }
        }
    };
    Object.defineProperty(Sparkline.prototype, "layoutScheduled", {
        /**
         * Only `true` while we are waiting for the layout to start.
         * This will be `false` if the layout has already started and is ongoing.
         */
        get: function () {
            return !!this.layoutId;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Execute update method on the next available screen repaint to make changes to the canvas.
     * If we are waiting for a layout to start and a new layout is requested,
     * cancel the previous layout using the non 0 integer (this.layoutId) returned from requestAnimationFrame.
     */
    Sparkline.prototype.scheduleLayout = function () {
        var _this = this;
        if (this.layoutId) {
            cancelAnimationFrame(this.layoutId);
        }
        this.layoutId = requestAnimationFrame(function () {
            _this.setSparklineDimensions();
            if (_this.invalidData(_this.data)) {
                return;
            }
            // update axes ranges
            _this.updateXScaleRange();
            _this.updateYScaleRange();
            // update axis line
            _this.updateAxisLine();
            // produce data joins and update selection's nodes
            _this.update();
            _this.scene.render();
            _this.layoutId = 0;
        });
    };
    Sparkline.prototype.setSparklineDimensions = function () {
        var _a = this, width = _a.width, height = _a.height, padding = _a.padding, seriesRect = _a.seriesRect, rootGroup = _a.rootGroup;
        var shrunkWidth = width - padding.left - padding.right;
        var shrunkHeight = height - padding.top - padding.bottom;
        seriesRect.width = shrunkWidth;
        seriesRect.height = shrunkHeight;
        seriesRect.x = padding.left;
        seriesRect.y = padding.top;
        rootGroup.translationX = seriesRect.x;
        rootGroup.translationY = seriesRect.y;
    };
    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    Sparkline.prototype.pickClosestSeriesNodeDatum = function (x, y) {
        var minDistance = Infinity;
        var closestDatum;
        var hitPoint = this.rootGroup.transformPoint(x, y);
        var nodeData = this.getNodeData();
        for (var i = 0; i < nodeData.length; i++) {
            var datum = nodeData[i];
            if (!datum.point) {
                return;
            }
            var distance = this.getDistance(hitPoint, datum.point);
            if (distance <= minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        }
        return closestDatum;
    };
    /**
     * Return the relevant distance between two points.
     * The distance will be calculated based on the x value of the points for all sparklines except bar sparkline, where the distance is based on the y values.
     * @param x
     * @param y
     */
    Sparkline.prototype.getDistance = function (p1, p2) {
        return Math.abs(p1.x - p2.x);
    };
    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    Sparkline.prototype.handleTooltip = function (event, datum) {
        var _a, _b;
        var seriesDatum = datum.seriesDatum;
        var canvasElement = this.canvasElement;
        var clientX = event.clientX, clientY = event.clientY;
        // confine tooltip to sparkline width if tooltip container not provided.
        if (((_b = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.container) == undefined && this.tooltip.container !== canvasElement) {
            this.tooltip.container = canvasElement;
        }
        var meta = {
            pageX: clientX,
            pageY: clientY,
        };
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        // check if tooltip is enabled for this specific data point
        var enabled = this.tooltip.enabled;
        if (this.tooltip.renderer) {
            var tooltipRendererResult = this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            });
            enabled =
                typeof tooltipRendererResult !== 'string' && tooltipRendererResult.enabled !== undefined
                    ? tooltipRendererResult.enabled
                    : enabled;
        }
        var html = enabled && seriesDatum.y !== undefined && this.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    };
    Sparkline.prototype.formatNumericDatum = function (datum) {
        return String(Math.round(datum * 10) / 10);
    };
    // locale.format('%m/%d/%y, %H:%M:%S');
    Sparkline.prototype.formatDatum = function (datum) {
        var type = this.axis.type || 'category';
        if (type === 'number' && typeof datum === 'number') {
            return this.formatNumericDatum(datum);
        }
        else if (type === 'time' && (datum instanceof Date || isNumber(datum))) {
            return this.defaultDateFormatter.format(datum);
        }
        else {
            return String(datum);
        }
    };
    Sparkline.prototype.setupDomEventListeners = function (chartElement) {
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseout', this._onMouseOut);
    };
    Sparkline.prototype.cleanupDomEventListeners = function (chartElement) {
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
    };
    Sparkline.prototype.invalidData = function (data) {
        return !data || !Array.isArray(data) || data.length === 0;
    };
    /**
     * Cleanup and remove canvas element from the DOM.
     */
    Sparkline.prototype.destroy = function () {
        this.scene.container = undefined;
        // remove canvas element from the DOM
        this.container = undefined;
        this.cleanupDomEventListeners(this.scene.canvas.element);
    };
    Sparkline.tooltipDocuments = [];
    return Sparkline;
}());
exports.Sparkline = Sparkline;
