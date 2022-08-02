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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var scene_1 = require("../scene/scene");
var group_1 = require("../scene/group");
var series_1 = require("./series/series");
var padding_1 = require("../util/padding");
var rect_1 = require("../scene/shape/rect");
var legend_1 = require("./legend");
var bbox_1 = require("../scene/bbox");
var array_1 = require("../util/array");
var sizeMonitor_1 = require("../util/sizeMonitor");
var observable_1 = require("../util/observable");
var chartAxis_1 = require("./chartAxis");
var id_1 = require("../util/id");
var labelPlacement_1 = require("../util/labelPlacement");
var render_1 = require("../util/render");
var cartesianSeries_1 = require("./series/cartesian/cartesianSeries");
var defaultTooltipCss = "\n.ag-chart-tooltip {\n    display: table;\n    position: absolute;\n    user-select: none;\n    pointer-events: none;\n    white-space: nowrap;\n    z-index: 99999;\n    font: 12px Verdana, sans-serif;\n    color: black;\n    background: rgb(244, 244, 244);\n    border-radius: 5px;\n    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);\n}\n\n.ag-chart-tooltip-hidden {\n    top: -10000px !important;\n}\n\n.ag-chart-tooltip-title {\n    font-weight: bold;\n    padding: 7px;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n    color: white;\n    background-color: #888888;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n}\n\n.ag-chart-tooltip-content {\n    padding: 7px;\n    line-height: 1.7em;\n    border-bottom-left-radius: 5px;\n    border-bottom-right-radius: 5px;\n    overflow: hidden;\n}\n\n.ag-chart-tooltip-content:empty {\n    padding: 0;\n    height: 7px;\n}\n\n.ag-chart-tooltip-arrow::before {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 6px solid #989898;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: #989898;\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-tooltip-arrow::after {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 5px solid black;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: rgb(244, 244, 244);\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-wrapper {\n    box-sizing: border-box;\n    overflow: hidden;\n}\n";
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    var _a = input.content, content = _a === void 0 ? defaults.content || '' : _a, _b = input.title, title = _b === void 0 ? defaults.title || undefined : _b, _c = input.color, color = _c === void 0 ? defaults.color || 'white' : _c, _d = input.backgroundColor, backgroundColor = _d === void 0 ? defaults.backgroundColor || '#888' : _d;
    var titleHtml = title
        ? "<div class=\"" + Chart.defaultTooltipClass + "-title\"\n        style=\"color: " + color + "; background-color: " + backgroundColor + "\">" + title + "</div>"
        : '';
    return titleHtml + "<div class=\"" + Chart.defaultTooltipClass + "-content\">" + content + "</div>";
}
exports.toTooltipHtml = toTooltipHtml;
var ChartTooltip = /** @class */ (function (_super) {
    __extends(ChartTooltip, _super);
    function ChartTooltip(chart, document) {
        var _this = _super.call(this) || this;
        _this.enabled = true;
        _this.class = Chart.defaultTooltipClass;
        _this.delay = 0;
        /**
         * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
         * Only has effect on series with markers.
         */
        _this.tracking = true;
        _this.showTimeout = 0;
        _this.constrained = false;
        _this.chart = chart;
        _this.class = '';
        var tooltipRoot = document.body;
        var element = document.createElement('div');
        _this.element = tooltipRoot.appendChild(element);
        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            var target_1 = _this.chart.scene.canvas.element;
            var observer = new IntersectionObserver(function (entries) {
                var e_1, _a;
                try {
                    for (var entries_1 = __values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                        var entry = entries_1_1.value;
                        if (entry.target === target_1 && entry.intersectionRatio === 0) {
                            _this.toggle(false);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }, { root: tooltipRoot });
            observer.observe(target_1);
            _this.observer = observer;
        }
        return _this;
    }
    ChartTooltip.prototype.destroy = function () {
        var parentNode = this.element.parentNode;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
        if (this.observer) {
            this.observer.unobserve(this.chart.scene.canvas.element);
        }
    };
    ChartTooltip.prototype.isVisible = function () {
        var element = this.element;
        if (element.classList) {
            // if not IE11
            return !element.classList.contains(Chart.defaultTooltipClass + '-hidden');
        }
        // IE11 part.
        var classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(Chart.defaultTooltipClass + '-hidden') < 0;
        }
        return false;
    };
    ChartTooltip.prototype.updateClass = function (visible, constrained) {
        var classList = [Chart.defaultTooltipClass, this.class];
        if (visible !== true) {
            classList.push(Chart.defaultTooltipClass + "-hidden");
        }
        if (constrained !== true) {
            classList.push(Chart.defaultTooltipClass + "-arrow");
        }
        this.element.setAttribute('class', classList.join(' '));
    };
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    ChartTooltip.prototype.show = function (meta, html, instantly) {
        var _this = this;
        if (instantly === void 0) { instantly = false; }
        var el = this.element;
        if (html !== undefined) {
            el.innerHTML = html;
        }
        else if (!el.innerHTML) {
            return;
        }
        var left = meta.pageX - el.clientWidth / 2;
        var top = meta.pageY - el.clientHeight - 8;
        this.constrained = false;
        if (this.chart.container) {
            var tooltipRect = el.getBoundingClientRect();
            var minLeft = 0;
            var maxLeft = window.innerWidth - tooltipRect.width - 1;
            if (left < minLeft) {
                left = minLeft;
                this.updateClass(true, (this.constrained = true));
            }
            else if (left > maxLeft) {
                left = maxLeft;
                this.updateClass(true, (this.constrained = true));
            }
            if (top < window.pageYOffset) {
                top = meta.pageY + 20;
                this.updateClass(true, (this.constrained = true));
            }
        }
        el.style.left = Math.round(left) + "px";
        el.style.top = Math.round(top) + "px";
        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(function () {
                _this.toggle(true);
            }, this.delay);
            return;
        }
        this.toggle(true);
    };
    ChartTooltip.prototype.toggle = function (visible) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
            if (this.chart.lastPick && !this.delay) {
                this.chart.changeHighlightDatum();
            }
        }
        this.updateClass(visible, this.constrained);
    };
    return ChartTooltip;
}(observable_1.Observable));
exports.ChartTooltip = ChartTooltip;
/** Types of chart-update, in pipeline execution order. */
var ChartUpdateType;
(function (ChartUpdateType) {
    ChartUpdateType[ChartUpdateType["FULL"] = 0] = "FULL";
    ChartUpdateType[ChartUpdateType["PROCESS_DATA"] = 1] = "PROCESS_DATA";
    ChartUpdateType[ChartUpdateType["PERFORM_LAYOUT"] = 2] = "PERFORM_LAYOUT";
    ChartUpdateType[ChartUpdateType["SERIES_UPDATE"] = 3] = "SERIES_UPDATE";
    ChartUpdateType[ChartUpdateType["SCENE_RENDER"] = 4] = "SCENE_RENDER";
    ChartUpdateType[ChartUpdateType["NONE"] = 5] = "NONE";
})(ChartUpdateType = exports.ChartUpdateType || (exports.ChartUpdateType = {}));
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        _this.background = new rect_1.Rect();
        _this.legend = new legend_1.Legend();
        _this.legendAutoPadding = new padding_1.Padding();
        _this._debug = false;
        _this.extraDebugStats = {};
        _this._container = undefined;
        _this._data = [];
        _this._autoSize = false;
        _this.padding = new padding_1.Padding(20);
        _this._title = undefined;
        _this._subtitle = undefined;
        _this._performUpdateType = ChartUpdateType.NONE;
        _this.firstRenderComplete = false;
        _this.firstResizeReceived = false;
        _this.seriesToUpdate = new Set();
        _this.performUpdateTrigger = render_1.debouncedCallback(function (_a) {
            var count = _a.count;
            try {
                _this.performUpdate(count);
            }
            catch (error) {
                _this._lastPerformUpdateError = error;
                console.error(error);
            }
        });
        _this._axes = [];
        _this._series = [];
        _this.legendBBox = new bbox_1.BBox(0, 0, 0, 0);
        _this._onMouseDown = _this.onMouseDown.bind(_this);
        _this._onMouseMove = _this.onMouseMove.bind(_this);
        _this._onMouseUp = _this.onMouseUp.bind(_this);
        _this._onMouseOut = _this.onMouseOut.bind(_this);
        _this._onClick = _this.onClick.bind(_this);
        _this.lastTooltipMeta = undefined;
        _this.handleTooltipTrigger = render_1.debouncedAnimationFrame(function () {
            _this.handleTooltip(_this.lastTooltipMeta);
        });
        _this.pointerInsideLegend = false;
        _this.pointerOverLegendDatum = false;
        var root = new group_1.Group({ name: 'root' });
        var background = _this.background;
        background.fill = 'white';
        root.appendChild(background);
        var element = (_this.element = document.createElement('div'));
        element.setAttribute('class', 'ag-chart-wrapper');
        element.style.position = 'relative';
        _this.scene = new scene_1.Scene({ document: document });
        _this.scene.debug.consoleLog = _this._debug;
        _this.scene.root = root;
        _this.scene.container = element;
        _this.autoSize = true;
        sizeMonitor_1.SizeMonitor.observe(_this.element, function (size) {
            var width = size.width, height = size.height;
            _this._lastAutoSize = [width, height];
            if (!_this.autoSize) {
                return;
            }
            if (width === _this.width && height === _this.height) {
                return;
            }
            _this.resize(width, height);
        });
        _this.tooltip = new ChartTooltip(_this, document);
        _this.tooltip.addPropertyListener('class', function () { return _this.tooltip.toggle(); });
        if (Chart.tooltipDocuments.indexOf(document) < 0) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Chart.tooltipDocuments.push(document);
        }
        _this.setupDomListeners(_this.scene.canvas.element);
        return _this;
    }
    Object.defineProperty(Chart.prototype, "debug", {
        get: function () {
            return this._debug;
        },
        set: function (value) {
            this._debug = value;
            this.scene.debug.consoleLog = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                var parentNode = this.element.parentNode;
                if (parentNode != null) {
                    parentNode.removeChild(this.element);
                }
                if (value) {
                    value.appendChild(this.element);
                }
                this._container = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            this.series.forEach(function (series) { return (series.data = data); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "width", {
        get: function () {
            return this.scene.width;
        },
        set: function (value) {
            this.autoSize = false;
            if (this.width !== value) {
                this.resize(value, this.height);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "height", {
        get: function () {
            return this.scene.height;
        },
        set: function (value) {
            this.autoSize = false;
            if (this.height !== value) {
                this.resize(this.width, value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "autoSize", {
        get: function () {
            return this._autoSize;
        },
        set: function (value) {
            if (this._autoSize === value) {
                return;
            }
            this._autoSize = value;
            var style = this.element.style;
            if (value) {
                style.display = 'block';
                style.width = '100%';
                style.height = '100%';
                if (!this._lastAutoSize) {
                    return;
                }
                this.resize(this._lastAutoSize[0], this._lastAutoSize[1]);
            }
            else {
                style.display = 'inline-block';
                style.width = 'auto';
                style.height = 'auto';
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.download = function (fileName) {
        this.scene.download(fileName);
    };
    Object.defineProperty(Chart.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (caption) {
            var _a, _b;
            var root = this.scene.root;
            if (this._title != null) {
                (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._title.node);
            }
            this._title = caption;
            if (this._title != null) {
                (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._title.node);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (caption) {
            var _a, _b;
            var root = this.scene.root;
            if (this._subtitle != null) {
                (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._subtitle.node);
            }
            this._subtitle = caption;
            if (this._subtitle != null) {
                (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._subtitle.node);
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.destroy = function () {
        this._performUpdateType = ChartUpdateType.NONE;
        this.tooltip.destroy();
        sizeMonitor_1.SizeMonitor.unobserve(this.element);
        this.container = undefined;
        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.container = undefined;
    };
    Object.defineProperty(Chart.prototype, "performUpdateType", {
        get: function () {
            return this._performUpdateType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "updatePending", {
        get: function () {
            return this._performUpdateType !== ChartUpdateType.NONE;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "lastPerformUpdateError", {
        get: function () {
            return this._lastPerformUpdateError;
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.update = function (type, opts) {
        var e_2, _a;
        if (type === void 0) { type = ChartUpdateType.FULL; }
        var _b = opts || {}, _c = _b.forceNodeDataRefresh, forceNodeDataRefresh = _c === void 0 ? false : _c, _d = _b.seriesToUpdate, seriesToUpdate = _d === void 0 ? this.series : _d;
        if (forceNodeDataRefresh) {
            this.series.forEach(function (series) { return series.markNodeDataDirty(); });
        }
        try {
            for (var seriesToUpdate_1 = __values(seriesToUpdate), seriesToUpdate_1_1 = seriesToUpdate_1.next(); !seriesToUpdate_1_1.done; seriesToUpdate_1_1 = seriesToUpdate_1.next()) {
                var series = seriesToUpdate_1_1.value;
                this.seriesToUpdate.add(series);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (seriesToUpdate_1_1 && !seriesToUpdate_1_1.done && (_a = seriesToUpdate_1.return)) _a.call(seriesToUpdate_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (type < this._performUpdateType) {
            this._performUpdateType = type;
            this.performUpdateTrigger.schedule();
        }
    };
    Chart.prototype.performUpdate = function (count) {
        var _a = this, performUpdateType = _a._performUpdateType, firstRenderComplete = _a.firstRenderComplete, firstResizeReceived = _a.firstResizeReceived, extraDebugStats = _a.extraDebugStats;
        var splits = [performance.now()];
        switch (performUpdateType) {
            case ChartUpdateType.FULL:
            case ChartUpdateType.PROCESS_DATA:
                this.processData();
                splits.push(performance.now());
                // Disable tooltip/highlight if the data fundamentally shifted.
                this.disableTooltip({ updateProcessing: false });
            // Fall-through to next pipeline stage.
            case ChartUpdateType.PERFORM_LAYOUT:
                if (!firstRenderComplete && !firstResizeReceived) {
                    if (this.debug) {
                        console.log({ firstRenderComplete: firstRenderComplete, firstResizeReceived: firstResizeReceived });
                    }
                    // Reschedule if canvas size hasn't been set yet to avoid a race.
                    this._performUpdateType = ChartUpdateType.PERFORM_LAYOUT;
                    this.performUpdateTrigger.schedule();
                    break;
                }
                this.performLayout();
                splits.push(performance.now());
            // Fall-through to next pipeline stage.
            case ChartUpdateType.SERIES_UPDATE:
                this.seriesToUpdate.forEach(function (series) {
                    series.update();
                });
                this.seriesToUpdate.clear();
                splits.push(performance.now());
            // Fall-through to next pipeline stage.
            case ChartUpdateType.SCENE_RENDER:
                this.scene.render({ debugSplitTimes: splits, extraDebugStats: extraDebugStats });
                this.firstRenderComplete = true;
                this.extraDebugStats = {};
            // Fall-through to next pipeline stage.
            case ChartUpdateType.NONE:
                // Do nothing.
                this._performUpdateType = ChartUpdateType.NONE;
        }
        var end = performance.now();
        if (this.debug) {
            console.log({
                chart: this,
                durationMs: Math.round((end - splits[0]) * 100) / 100,
                count: count,
                performUpdateType: ChartUpdateType[performUpdateType],
            });
        }
    };
    Object.defineProperty(Chart.prototype, "axes", {
        get: function () {
            return this._axes;
        },
        set: function (values) {
            var _this = this;
            this._axes.forEach(function (axis) { return _this.detachAxis(axis); });
            // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
            this._axes = values.filter(function (a) { return !a.linkedTo; }).concat(values.filter(function (a) { return a.linkedTo; }));
            this._axes.forEach(function (axis) { return _this.attachAxis(axis); });
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.attachAxis = function (axis) {
        this.scene.root.insertBefore(axis.gridlineGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.axisGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.crossLineGroup, this.seriesRoot);
    };
    Chart.prototype.detachAxis = function (axis) {
        this.scene.root.removeChild(axis.axisGroup);
        this.scene.root.removeChild(axis.gridlineGroup);
        this.scene.root.removeChild(axis.crossLineGroup);
    };
    Object.defineProperty(Chart.prototype, "series", {
        get: function () {
            return this._series;
        },
        set: function (values) {
            var _this = this;
            this.removeAllSeries();
            values.forEach(function (series) { return _this.addSeries(series); });
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.addSeries = function (series, before) {
        var _a = this, allSeries = _a.series, seriesRoot = _a.seriesRoot;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            var beforeIndex = before ? allSeries.indexOf(before) : -1;
            if (beforeIndex >= 0) {
                allSeries.splice(beforeIndex, 0, series);
                seriesRoot.insertBefore(series.group, before.group);
            }
            else {
                allSeries.push(series);
                seriesRoot.append(series.group);
            }
            this.initSeries(series);
            return true;
        }
        return false;
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick, this);
    };
    Chart.prototype.addSeriesAfter = function (series, after) {
        var _a = this, allSeries = _a.series, seriesRoot = _a.seriesRoot;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            var afterIndex = after ? this.series.indexOf(after) : -1;
            if (afterIndex >= 0) {
                if (afterIndex + 1 < allSeries.length) {
                    seriesRoot.insertBefore(series.group, allSeries[afterIndex + 1].group);
                }
                else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);
                allSeries.splice(afterIndex + 1, 0, series);
            }
            else {
                if (allSeries.length > 0) {
                    seriesRoot.insertBefore(series.group, allSeries[0].group);
                }
                else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);
                allSeries.unshift(series);
            }
        }
        return false;
    };
    Chart.prototype.removeSeries = function (series) {
        var index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            return true;
        }
        return false;
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            _this.freeSeries(series);
            _this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
    };
    Chart.prototype.assignSeriesToAxes = function () {
        var _this = this;
        this.axes.forEach(function (axis) {
            axis.boundSeries = _this.series.filter(function (s) {
                var seriesAxis = axis.direction === chartAxis_1.ChartAxisDirection.X ? s.xAxis : s.yAxis;
                return seriesAxis === axis;
            });
        });
    };
    Chart.prototype.assignAxesToSeries = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        // This method has to run before `assignSeriesToAxes`.
        var directionToAxesMap = {};
        this.axes.forEach(function (axis) {
            var direction = axis.direction;
            var directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
            directionAxes.push(axis);
        });
        this.series.forEach(function (series) {
            series.directions.forEach(function (direction) {
                var currentAxis = direction === chartAxis_1.ChartAxisDirection.X ? series.xAxis : series.yAxis;
                if (currentAxis && !force) {
                    return;
                }
                var directionAxes = directionToAxesMap[direction];
                if (!directionAxes) {
                    console.warn("AG Charts - no available axis for direction [" + direction + "]; check series and axes configuration.");
                    return;
                }
                var seriesKeys = series.getKeys(direction);
                var newAxis = _this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    console.warn("AG Charts - no matching axis for direction [" + direction + "] and keys [" + seriesKeys + "]; check series and axes configuration.");
                    return;
                }
                if (direction === chartAxis_1.ChartAxisDirection.X) {
                    series.xAxis = newAxis;
                }
                else {
                    series.yAxis = newAxis;
                }
            });
        });
    };
    Chart.prototype.findMatchingAxis = function (directionAxes, directionKeys) {
        var e_3, _a, e_4, _b;
        try {
            for (var directionAxes_1 = __values(directionAxes), directionAxes_1_1 = directionAxes_1.next(); !directionAxes_1_1.done; directionAxes_1_1 = directionAxes_1.next()) {
                var axis = directionAxes_1_1.value;
                var axisKeys = axis.keys;
                if (!axisKeys.length) {
                    return axis;
                }
                if (!directionKeys) {
                    continue;
                }
                try {
                    for (var directionKeys_1 = (e_4 = void 0, __values(directionKeys)), directionKeys_1_1 = directionKeys_1.next(); !directionKeys_1_1.done; directionKeys_1_1 = directionKeys_1.next()) {
                        var directionKey = directionKeys_1_1.value;
                        if (axisKeys.indexOf(directionKey) >= 0) {
                            return axis;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (directionKeys_1_1 && !directionKeys_1_1.done && (_b = directionKeys_1.return)) _b.call(directionKeys_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (directionAxes_1_1 && !directionAxes_1_1.done && (_a = directionAxes_1.return)) _a.call(directionAxes_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    Chart.prototype.resize = function (width, height) {
        if (this.scene.resize(width, height)) {
            this.firstResizeReceived = true;
            this.background.width = this.width;
            this.background.height = this.height;
            this.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    };
    Chart.prototype.processData = function () {
        if (this.axes.length > 0 || this.series.some(function (s) { return s instanceof cartesianSeries_1.CartesianSeries; })) {
            this.assignAxesToSeries(true);
            this.assignSeriesToAxes();
        }
        this.series.forEach(function (s) { return s.processData(); });
        this.updateLegend();
    };
    Chart.prototype.placeLabels = function () {
        var e_5, _a;
        var visibleSeries = [];
        var data = [];
        try {
            for (var _b = __values(this.series), _c = _b.next(); !_c.done; _c = _b.next()) {
                var series = _c.value;
                if (!series.visible || !series.label.enabled) {
                    continue;
                }
                var labelData = series.getLabelData();
                if (!(labelData && labelPlacement_1.isPointLabelDatum(labelData[0]))) {
                    continue;
                }
                data.push(labelData);
                visibleSeries.push(series);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var seriesRect = this.seriesRect;
        var labels = seriesRect && data.length > 0
            ? labelPlacement_1.placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map(function (l, i) { return [visibleSeries[i], l]; }));
    };
    Chart.prototype.updateLegend = function () {
        var legendData = [];
        this.series.filter(function (s) { return s.showInLegend; }).forEach(function (series) { return series.listSeriesItems(legendData); });
        var formatter = this.legend.item.label.formatter;
        if (formatter) {
            legendData.forEach(function (datum) {
                return (datum.label.text = formatter({
                    id: datum.id,
                    itemId: datum.itemId,
                    value: datum.label.text,
                }));
            });
        }
        this.legend.data = legendData;
    };
    Chart.prototype.positionCaptions = function () {
        var _a = this, title = _a._title, subtitle = _a._subtitle;
        var spacing = 10;
        var paddingTop = spacing;
        if (!title) {
            return {};
        }
        title.node.visible = title.enabled;
        if (title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            var titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
            if (titleBBox) {
                paddingTop = titleBBox.y + titleBBox.height;
            }
        }
        if (!subtitle) {
            return {};
        }
        subtitle.node.visible = title.enabled && subtitle.enabled;
        if (title.enabled && subtitle.enabled) {
            subtitle.node.x = this.width / 2;
            subtitle.node.y = paddingTop + spacing;
            var subtitleBBox = subtitle.node.computeBBox();
            if (subtitleBBox) {
                paddingTop = subtitleBBox.y + subtitleBBox.height;
            }
        }
        return { captionAutoPadding: Math.floor(paddingTop) };
    };
    Chart.prototype.positionLegend = function (captionAutoPadding) {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }
        var _a = this, legend = _a.legend, legendAutoPadding = _a.legendAutoPadding;
        var width = this.width;
        var height = this.height - captionAutoPadding;
        var legendGroup = legend.group;
        var legendSpacing = legend.spacing;
        var translationX = 0;
        var translationY = 0;
        var legendBBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.height < Math.floor(height * 0.5); // Remove legend if it takes up more than 50% of the chart height.
                if (legendGroup.visible) {
                    translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                    translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendSpacing;
                    legendAutoPadding.bottom = legendBBox.height;
                }
                else {
                    legendAutoPadding.bottom = 0;
                }
                break;
            case 'top':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.height < Math.floor(height * 0.5);
                if (legendGroup.visible) {
                    translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                    translationY = captionAutoPadding + legendSpacing - legendBBox.y;
                    legendAutoPadding.top = legendBBox.height;
                }
                else {
                    legendAutoPadding.top = 0;
                }
                break;
            case 'left':
                legend.performLayout(width, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor(width * 0.5); // Remove legend if it takes up more than 50% of the chart width.
                if (legendGroup.visible) {
                    translationX = legendSpacing - legendBBox.x;
                    translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                    legendAutoPadding.left = legendBBox.width;
                }
                else {
                    legendAutoPadding.left = 0;
                }
                break;
            default: // case 'right':
                legend.performLayout(width, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor(width * 0.5);
                if (legendGroup.visible) {
                    translationX = width - legendBBox.width - legendBBox.x - legendSpacing;
                    translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                    legendAutoPadding.right = legendBBox.width;
                }
                else {
                    legendAutoPadding.right = 0;
                }
                break;
        }
        if (legendGroup.visible) {
            // Round off for pixel grid alignment to work properly.
            legendGroup.translationX = Math.floor(translationX + legendGroup.translationX);
            legendGroup.translationY = Math.floor(translationY + legendGroup.translationY);
            this.legendBBox = legendGroup.computeBBox();
        }
    };
    Chart.prototype.setupDomListeners = function (chartElement) {
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseup', this._onMouseUp);
        chartElement.addEventListener('mouseout', this._onMouseOut);
        chartElement.addEventListener('click', this._onClick);
    };
    Chart.prototype.cleanupDomListeners = function (chartElement) {
        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
        chartElement.removeEventListener('click', this._onClick);
    };
    Chart.prototype.getSeriesRect = function () {
        return this.seriesRect;
    };
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    Chart.prototype.pickSeriesNode = function (x, y) {
        var e_6, _a;
        var _b, _c;
        var tracking = this.tooltip.tracking;
        var start = performance.now();
        // Disable 'nearest match' options if tooltip.tracking is enabled.
        var pickModes = tracking ? undefined : [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH];
        var result = undefined;
        try {
            for (var _d = __values(this.series), _e = _d.next(); !_e.done; _e = _d.next()) {
                var series = _e.value;
                if (!series.visible || !series.group.visible) {
                    continue;
                }
                var _f = (_b = series.pickNode(x, y, pickModes), (_b !== null && _b !== void 0 ? _b : {})), match = _f.match, distance = _f.distance;
                if (!match || distance == null) {
                    continue;
                }
                if (!result || result.distance > distance) {
                    result = { series: series, distance: distance, datum: match };
                }
                if (distance === 0) {
                    break;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.extraDebugStats['pickSeriesNode'] = Math.round((_c = this.extraDebugStats['pickSeriesNode'], (_c !== null && _c !== void 0 ? _c : 0)) + (performance.now() - start));
        return result;
    };
    Chart.prototype.onMouseMove = function (event) {
        this.handleLegendMouseMove(event);
        if (this.tooltip.enabled) {
            if (this.tooltip.delay > 0) {
                this.tooltip.toggle(false);
            }
            this.lastTooltipMeta = {
                pageX: event.pageX,
                pageY: event.pageY,
                offsetX: event.offsetX,
                offsetY: event.offsetY,
                event: event,
            };
            this.handleTooltipTrigger.schedule();
        }
    };
    Chart.prototype.disableTooltip = function (_a) {
        var _b = (_a === void 0 ? {} : _a).updateProcessing, updateProcessing = _b === void 0 ? true : _b;
        this.changeHighlightDatum(undefined, { updateProcessing: updateProcessing });
        this.tooltip.toggle(false);
    };
    Chart.prototype.handleTooltip = function (meta) {
        var _this = this;
        var lastPick = this.lastPick;
        var offsetX = meta.offsetX, offsetY = meta.offsetY;
        var disableTooltip = function () {
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                _this.disableTooltip();
            }
        };
        if (!(this.seriesRect && this.seriesRect.containsPoint(offsetX, offsetY))) {
            disableTooltip();
            return;
        }
        var pick = this.pickSeriesNode(offsetX, offsetY);
        if (!pick) {
            disableTooltip();
            return;
        }
        if (!lastPick || lastPick.datum !== pick.datum) {
            this.onSeriesDatumPick(meta, pick.datum);
            return;
        }
        lastPick.event = meta.event;
        this.tooltip.show(this.mergeTooltipDatum(meta, pick.datum));
    };
    Chart.prototype.onMouseDown = function (_event) {
        // Override point for subclasses.
    };
    Chart.prototype.onMouseUp = function (_event) {
        // Override point for subclasses.
    };
    Chart.prototype.onMouseOut = function (_event) {
        this.tooltip.toggle(false);
    };
    Chart.prototype.onClick = function (event) {
        if (this.checkSeriesNodeClick()) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        if (this.checkLegendClick(event)) {
            this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
            return;
        }
        this.fireEvent({
            type: 'click',
            event: event,
        });
    };
    Chart.prototype.checkSeriesNodeClick = function () {
        var lastPick = this.lastPick;
        // TODO: verify if it's safe to remove `lastPick.node` check
        // if (lastPick && lastPick.event && lastPick.node) {
        if (lastPick && lastPick.event) {
            var event_1 = lastPick.event, datum = lastPick.datum;
            datum.series.fireNodeClickEvent(event_1, datum);
            return true;
        }
        return false;
    };
    Chart.prototype.onSeriesNodeClick = function (event) {
        this.fireEvent(__assign(__assign({}, event), { type: 'seriesNodeClick' }));
    };
    Chart.prototype.checkLegendClick = function (event) {
        var _a;
        var _b = this, legend = _b.legend, legendItemClick = _b.legend.listeners.legendItemClick;
        var datum = legend.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return false;
        }
        var id = datum.id, itemId = datum.itemId, enabled = datum.enabled;
        var series = array_1.find(this.series, function (s) { return s.id === id; });
        if (!series) {
            return false;
        }
        series.toggleSeriesItem(itemId, !enabled);
        if (enabled) {
            this.tooltip.toggle(false);
        }
        if (enabled && ((_a = this.highlightedDatum) === null || _a === void 0 ? void 0 : _a.series) === series) {
            this.highlightedDatum = undefined;
        }
        if (!enabled) {
            this.highlightedDatum = {
                series: series,
                itemId: itemId,
                datum: undefined,
            };
        }
        legendItemClick({ enabled: !enabled, itemId: itemId });
        return true;
    };
    Chart.prototype.handleLegendMouseMove = function (event) {
        if (!this.legend.enabled) {
            return;
        }
        var offsetX = event.offsetX, offsetY = event.offsetY;
        var datum = this.legend.getDatumForPoint(offsetX, offsetY);
        var pointerInsideLegend = this.legendBBox.containsPoint(offsetX, offsetY);
        var pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerInsideLegend && this.pointerInsideLegend) {
            this.pointerInsideLegend = false;
            this.element.style.cursor = 'default';
            // Dehighlight if the pointer was inside the legend and is now leaving it.
            this.changeHighlightDatum();
            return;
        }
        if (pointerOverLegendDatum && !this.pointerOverLegendDatum) {
            this.element.style.cursor = 'pointer';
            if (datum && this.legend.truncatedItems.has(datum.itemId || datum.id)) {
                this.element.title = datum.label.text;
            }
            else {
                this.element.title = '';
            }
        }
        if (!pointerOverLegendDatum && this.pointerOverLegendDatum) {
            this.element.style.cursor = 'default';
        }
        this.pointerInsideLegend = pointerInsideLegend;
        this.pointerOverLegendDatum = pointerOverLegendDatum;
        var oldHighlightedDatum = this.highlightedDatum;
        if (datum) {
            var id_2 = datum.id, itemId = datum.itemId, enabled = datum.enabled;
            if (enabled) {
                var series = array_1.find(this.series, function (series) { return series.id === id_2; });
                if (series) {
                    this.highlightedDatum = {
                        series: series,
                        itemId: itemId,
                        datum: undefined,
                    };
                }
            }
            else {
                this.highlightedDatum = undefined;
            }
        }
        // Careful to only schedule updates when necessary.
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (!this.highlightedDatum && oldHighlightedDatum) ||
            (this.highlightedDatum &&
                oldHighlightedDatum &&
                (this.highlightedDatum.series !== oldHighlightedDatum.series ||
                    this.highlightedDatum.itemId !== oldHighlightedDatum.itemId))) {
            this.update(ChartUpdateType.SERIES_UPDATE);
        }
    };
    Chart.prototype.onSeriesDatumPick = function (meta, datum) {
        var lastPick = this.lastPick;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
        }
        this.changeHighlightDatum({
            datum: datum,
            event: meta.event,
        });
        if (datum) {
            meta = this.mergeTooltipDatum(meta, datum);
        }
        var html = datum.series.tooltip.enabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    };
    Chart.prototype.mergeTooltipDatum = function (meta, datum) {
        if (datum.point) {
            var _a = datum.point, x = _a.x, y = _a.y;
            var canvas = this.scene.canvas;
            var point = datum.series.group.inverseTransformPoint(x, y);
            var canvasRect = canvas.element.getBoundingClientRect();
            return __assign(__assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(canvasRect.left + point.y), offsetY: Math.round(canvasRect.top + point.y) });
        }
        return meta;
    };
    Chart.prototype.changeHighlightDatum = function (newPick, opts) {
        var _a = (opts !== null && opts !== void 0 ? opts : {}).updateProcessing, updateProcessing = _a === void 0 ? true : _a;
        var seriesToUpdate = new Set();
        var _b = newPick || {}, _c = _b.datum, _d = (_c === void 0 ? {} : _c).series, newSeries = _d === void 0 ? undefined : _d, _e = _b.datum, datum = _e === void 0 ? undefined : _e;
        var _f = this.lastPick, _g = (_f === void 0 ? {} : _f).datum, _h = (_g === void 0 ? {} : _g).series, lastSeries = _h === void 0 ? undefined : _h;
        if (lastSeries) {
            seriesToUpdate.add(lastSeries);
        }
        if (newSeries) {
            seriesToUpdate.add(newSeries);
            this.element.style.cursor = newSeries.cursor;
        }
        this.lastPick = newPick;
        this.highlightedDatum = datum;
        if (!updateProcessing) {
            return;
        }
        var updateAll = newSeries == null || lastSeries == null;
        if (updateAll) {
            this.update(ChartUpdateType.SERIES_UPDATE);
        }
        else {
            this.update(ChartUpdateType.SERIES_UPDATE, { seriesToUpdate: seriesToUpdate });
        }
    };
    Chart.defaultTooltipClass = 'ag-chart-tooltip';
    Chart.tooltipDocuments = [];
    return Chart;
}(observable_1.Observable));
exports.Chart = Chart;
