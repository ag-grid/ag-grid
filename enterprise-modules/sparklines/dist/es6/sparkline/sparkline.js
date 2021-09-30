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
import { Group } from '../scene/group';
import { Scene } from '../scene/scene';
import { Observable } from '../util/observable';
import { createId } from "../util/id";
import { Padding } from '../util/padding';
import { defaultTooltipCss } from './tooltip/defaultTooltipCss';
import { isContinuous, isDate, isNumber, isString, isStringObject } from '../util/value';
import { LinearScale } from '../scale/linearScale';
import { TimeScale } from '../scale/timeScale';
import { BandScale } from '../scale/bandScale';
import { extent } from '../util/array';
import { locale } from "../util/time/format/defaultLocale";
var SparklineAxis = /** @class */ (function (_super) {
    __extends(SparklineAxis, _super);
    function SparklineAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'category';
        _this.stroke = 'rgb(204, 214, 235)';
        _this.strokeWidth = 1;
        return _this;
    }
    return SparklineAxis;
}(Observable));
export { SparklineAxis };
var Sparkline = /** @class */ (function (_super) {
    __extends(Sparkline, _super);
    function Sparkline() {
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.seriesRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        _this._context = undefined;
        _this._container = undefined;
        _this._data = undefined;
        _this.padding = new Padding(3);
        _this.xKey = 'x';
        _this.yKey = 'y';
        _this.dataType = undefined;
        _this.xData = [];
        _this.yData = [];
        _this.skipInvalidYs = false;
        // Minimum y value in provided data.
        _this.min = undefined;
        // Maximum y value in provided data.
        _this.max = undefined;
        _this.yScale = new LinearScale();
        _this.axis = new SparklineAxis();
        _this.highlightStyle = {
            size: 6,
            fill: 'yellow',
            stroke: 'silver',
            strokeWidth: 1
        };
        _this._width = 100;
        _this._height = 100;
        _this.layoutId = 0;
        _this.defaultDateFormatter = locale.format('%m/%d/%y, %H:%M:%S');
        _this._onMouseMove = _this.onMouseMove.bind(_this);
        _this._onMouseOut = _this.onMouseOut.bind(_this);
        var root = new Group();
        _this.rootGroup = root;
        var element = document.createElement('div');
        element.setAttribute('class', 'ag-sparkline-wrapper');
        var scene = new Scene(document);
        _this.scene = scene;
        _this.canvasElement = scene.canvas.element;
        scene.root = root;
        scene.container = element;
        scene.resize(_this.width, _this.height);
        _this.seriesRect.width = _this.width;
        _this.seriesRect.height = _this.height;
        // one style element for tooltip styles per document
        if (Sparkline.tooltipDocuments.indexOf(document) === -1) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Sparkline.tooltipDocuments.push(document);
        }
        _this.setupDomEventListeners(_this.scene.canvas.element);
        return _this;
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
        enumerable: true,
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
        enumerable: true,
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
            }
        },
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
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
        var seriesRect = this.seriesRect;
        this.xScale.range = [0, seriesRect.width];
    };
    // Update x scale domain based on processed data and type of scale.
    Sparkline.prototype.updateXScaleDomain = function () {
        var _a = this, xData = _a.xData, xScale = _a.xScale;
        var xMinMax;
        if (xScale instanceof LinearScale) {
            xMinMax = extent(xData, isNumber);
        }
        else if (xScale instanceof TimeScale) {
            xMinMax = extent(xData, isContinuous);
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
    // Update x axis line.
    Sparkline.prototype.updateXAxisLine = function () { };
    Sparkline.prototype.updateAxes = function () {
        this.updateYScale();
        this.updateXScale();
        this.updateXAxisLine();
    };
    // Using processed data, generate data that backs visible nodes.
    Sparkline.prototype.generateNodeData = function () { return []; };
    // Returns persisted node data associated with the sparkline's data.
    Sparkline.prototype.getNodeData = function () { return []; };
    // Update the selection's nodes.
    Sparkline.prototype.updateNodes = function () { };
    Sparkline.prototype.highlightDatum = function (closestDatum) {
        this.updateNodes();
    };
    Sparkline.prototype.dehighlightDatum = function () {
        this.highlightedDatum = undefined;
        this.updateNodes();
    };
    /**
     * Highlight closest datum and display tooltip if enabled.
     * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
     * or if there is no previously highlighted datum.
     * @param event
     */
    Sparkline.prototype.onMouseMove = function (event) {
        var closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
        if (!closestDatum) {
            return;
        }
        var oldHighlightedDatum = this.highlightedDatum;
        this.highlightedDatum = closestDatum;
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (this.highlightedDatum && oldHighlightedDatum && this.highlightedDatum !== oldHighlightedDatum)) {
            this.highlightDatum(closestDatum);
            if (this.tooltip.enabled) {
                this.handleTooltip(closestDatum);
            }
        }
    };
    /**
     * Dehighlight all nodes and remove tooltip.
     * @param event
     */
    Sparkline.prototype.onMouseOut = function (event) {
        this.dehighlightDatum();
        this.tooltip.toggle(false);
    };
    // Fetch required values from the data object and process them.
    Sparkline.prototype.processData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData;
        if (!data) {
            return;
        }
        yData.length = 0;
        xData.length = 0;
        var n = data.length;
        var dataType = this.getDataType(data);
        this.dataType = dataType;
        var xValueType = this.axis.type;
        var xType = xValueType !== 'number' && xValueType !== 'time' ? 'category' : xValueType;
        if (dataType === 'number') {
            for (var i = 0; i < n; i++) {
                var xDatum = i;
                var yDatum = data[i];
                var x = this.getDatum(xDatum, xType);
                var y = this.getDatum(yDatum, 'number');
                if (y == undefined && this.skipInvalidYs) {
                    continue;
                }
                xData.push(x);
                yData.push(y);
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
                    if (y == undefined && this.skipInvalidYs || x == undefined) {
                        continue;
                    }
                    xData.push(x);
                    yData.push(y);
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
                    if (y == undefined && this.skipInvalidYs || x == undefined) {
                        continue;
                    }
                    xData.push(x);
                    yData.push(y);
                }
            }
        }
        // update axes
        this.updateAxes();
        // produce data joins and update selection's nodes
        this.update();
    };
    /**
    * Return the type of data provided to the sparkline based on the first truthy value in the data array.
    * If the value is not a number, array or object, return `undefined`.
    * @param data
    */
    Sparkline.prototype.getDataType = function (data) {
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var datum = data_1[_i];
            if (datum) {
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
    };
    /**
    * Return the given value depending on the type of axis.
    * Return `undefined` if the value is invalid for the given axis type.
    * @param value
    */
    Sparkline.prototype.getDatum = function (value, type) {
        if (type === 'number' && isNumber(value) || type === 'time' && (isNumber(value) || isDate(value))) {
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
        enumerable: true,
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
            var _a = _this, width = _a.width, height = _a.height, padding = _a.padding, seriesRect = _a.seriesRect, rootGroup = _a.rootGroup;
            var shrunkWidth = width - padding.left - padding.right;
            var shrunkHeight = height - padding.top - padding.bottom;
            seriesRect.width = shrunkWidth;
            seriesRect.height = shrunkHeight;
            seriesRect.x = padding.left;
            seriesRect.y = padding.top;
            rootGroup.translationX = seriesRect.x;
            rootGroup.translationY = seriesRect.y;
            // update axes ranges
            _this.updateXScaleRange();
            _this.updateYScaleRange();
            // update x-axis line
            _this.updateXAxisLine();
            // produce data joins and update selection's nodes
            _this.update();
            _this.layoutId = 0;
        });
    };
    /**
     * Return the closest data point to x/y canvas coordinates.
     * @param x
     * @param y
     */
    Sparkline.prototype.pickClosestSeriesNodeDatum = function (x, y) {
        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        }
        var minDistance = Infinity;
        var closestDatum;
        var hitPoint = this.rootGroup.transformPoint(x, y);
        this.getNodeData().forEach(function (datum) {
            if (!datum.point) {
                return;
            }
            var distance = getDistance(hitPoint, datum.point);
            if (distance < minDistance) {
                minDistance = distance;
                closestDatum = datum;
            }
        });
        return closestDatum;
    };
    /**
     * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
     * @param datum
     */
    Sparkline.prototype.handleTooltip = function (datum) {
        var seriesDatum = datum.seriesDatum;
        var canvasElement = this.canvasElement;
        var canvasRect = canvasElement.getBoundingClientRect();
        var pageXOffset = window.pageXOffset, pageYOffset = window.pageYOffset;
        // pickClosestSeriesNodeDatum only returns datum with point
        var point = this.rootGroup.inverseTransformPoint(datum.point.x, datum.point.y);
        var meta = {
            pageX: (point.x + canvasRect.left + pageXOffset),
            pageY: (point.y + canvasRect.top + pageYOffset)
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
            enabled = typeof tooltipRendererResult !== 'string' && tooltipRendererResult.enabled !== undefined ? tooltipRendererResult.enabled : enabled;
        }
        var html = enabled && seriesDatum.y !== undefined && this.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    };
    Sparkline.prototype.formatNumericDatum = function (datum) {
        return String(Math.round(datum * 10) / 10);
    };
    Sparkline.prototype.formatDatum = function (datum) {
        var type = this.axis.type || 'category';
        if (type === 'number' && typeof datum === 'number') {
            return this.formatNumericDatum(datum);
        }
        else if (type === 'time' && (datum instanceof Date || isNumber(datum))) {
            return this.defaultDateFormatter(datum);
        }
        else
            return String(datum);
    };
    Sparkline.prototype.setupDomEventListeners = function (chartElement) {
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseout', this._onMouseOut);
    };
    Sparkline.prototype.cleanupDomEventListerners = function (chartElement) {
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
    };
    /**
     * Cleanup and remove canvas element from the DOM.
     */
    Sparkline.prototype.destroy = function () {
        this.scene.container = undefined;
        // remove canvas element from the DOM
        this.container = undefined;
        this.cleanupDomEventListerners(this.scene.canvas.element);
    };
    /**
     * @returns this.scene.canvas.element
     */
    Sparkline.prototype.getCanvasElement = function () {
        return this.canvasElement;
    };
    Sparkline.tooltipDocuments = [];
    return Sparkline;
}(Observable));
export { Sparkline };
