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
import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { defaultTooltipCss } from './tooltip/defaultTooltipCss';
var extent = _Util.extent, isNumber = _Util.isNumber, isString = _Util.isString, isStringObject = _Util.isStringObject, isDate = _Util.isDate, createId = _Util.createId, Padding = _Util.Padding;
var LinearScale = _Scale.LinearScale, BandScale = _Scale.BandScale, TimeScale = _Scale.TimeScale;
/**
 * Constants to declare the expected nominal zIndex for nodes in a sparkline rendering.
 */
export var ZINDICIES;
(function (ZINDICIES) {
    ZINDICIES[ZINDICIES["SERIES_FILL_ZINDEX"] = 50] = "SERIES_FILL_ZINDEX";
    ZINDICIES[ZINDICIES["AXIS_LINE_ZINDEX"] = 500] = "AXIS_LINE_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_STROKE_ZINDEX"] = 1000] = "SERIES_STROKE_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_LABEL_ZINDEX"] = 1500] = "SERIES_LABEL_ZINDEX";
    ZINDICIES[ZINDICIES["CROSSHAIR_ZINDEX"] = 2000] = "CROSSHAIR_ZINDEX";
    ZINDICIES[ZINDICIES["SERIES_MARKERS_ZINDEX"] = 2500] = "SERIES_MARKERS_ZINDEX";
})(ZINDICIES || (ZINDICIES = {}));
var SparklineAxis = /** @class */ (function () {
    function SparklineAxis() {
        this.type = 'category';
        this.stroke = 'rgb(204, 214, 235)';
        this.strokeWidth = 1;
    }
    return SparklineAxis;
}());
export { SparklineAxis };
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
        var root = new _Scene.Group();
        this.rootGroup = root;
        var element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');
        var scene = new _Scene.Scene({ document: document });
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
            styleElement.innerHTML = defaultTooltipCss;
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
        var _a, _b, _c;
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
        var tooltipEnabled = (_c = (_b = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.enabled) !== null && _c !== void 0 ? _c : true;
        if (tooltipEnabled) {
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
        var tooltipOptions = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip;
        var meta = {
            pageX: clientX,
            pageY: clientY,
            position: {
                xOffset: tooltipOptions === null || tooltipOptions === void 0 ? void 0 : tooltipOptions.xOffset,
                yOffset: tooltipOptions === null || tooltipOptions === void 0 ? void 0 : tooltipOptions.yOffset,
            },
            container: tooltipOptions === null || tooltipOptions === void 0 ? void 0 : tooltipOptions.container,
        };
        // confine tooltip to sparkline width if tooltip container not provided.
        if (meta.container == undefined) {
            meta.container = canvasElement;
        }
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        // check if tooltip is enabled for this specific data point
        var enabled = (_b = tooltipOptions === null || tooltipOptions === void 0 ? void 0 : tooltipOptions.enabled) !== null && _b !== void 0 ? _b : true;
        var tooltipRenderer = tooltipOptions === null || tooltipOptions === void 0 ? void 0 : tooltipOptions.renderer;
        if (tooltipRenderer) {
            var tooltipRendererResult = tooltipRenderer({
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
export { Sparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9zcGFya2xpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUc1RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUd4RCxJQUFBLE1BQU0sR0FBb0UsS0FBSyxPQUF6RSxFQUFFLFFBQVEsR0FBMEQsS0FBSyxTQUEvRCxFQUFFLFFBQVEsR0FBZ0QsS0FBSyxTQUFyRCxFQUFFLGNBQWMsR0FBZ0MsS0FBSyxlQUFyQyxFQUFFLE1BQU0sR0FBd0IsS0FBSyxPQUE3QixFQUFFLFFBQVEsR0FBYyxLQUFLLFNBQW5CLEVBQUUsT0FBTyxHQUFLLEtBQUssUUFBVixDQUFXO0FBQ2hGLElBQUEsV0FBVyxHQUEyQixNQUFNLFlBQWpDLEVBQUUsU0FBUyxHQUFnQixNQUFNLFVBQXRCLEVBQUUsU0FBUyxHQUFLLE1BQU0sVUFBWCxDQUFZO0FBRXJEOztHQUVHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNqQixzRUFBdUIsQ0FBQTtJQUN2QixtRUFBc0IsQ0FBQTtJQUN0Qiw0RUFBMkIsQ0FBQTtJQUMzQiwwRUFBMEIsQ0FBQTtJQUMxQixvRUFBdUIsQ0FBQTtJQUN2Qiw4RUFBNEIsQ0FBQTtBQUNoQyxDQUFDLEVBUFcsU0FBUyxLQUFULFNBQVMsUUFPcEI7QUF5QkQ7SUFBQTtRQUNJLFNBQUksR0FBYyxVQUFVLENBQUM7UUFDN0IsV0FBTSxHQUFXLG9CQUFvQixDQUFDO1FBQ3RDLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFBRCxvQkFBQztBQUFELENBQUMsQUFKRCxJQUlDOztBQUNEO0lBMkZJO1FBMUZTLE9BQUUsR0FBVyxRQUFRLENBQUMs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