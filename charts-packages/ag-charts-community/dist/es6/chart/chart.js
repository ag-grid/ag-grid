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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Scene } from "../scene/scene";
import { Group } from "../scene/group";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { find } from "../util/array";
import { SizeMonitor } from "../util/sizeMonitor";
import { Observable, reactive } from "../util/observable";
import { CartesianSeries } from "./series/cartesian/cartesianSeries";
import { createId } from "../util/id";
var defaultTooltipCss = "\n.ag-chart-tooltip {\n    display: none;\n    position: absolute;\n    user-select: none;\n    pointer-events: none;\n    white-space: nowrap;\n    z-index: 99999;\n    font: 12px Verdana, sans-serif;\n    color: black;\n    background: rgb(244, 244, 244);\n    border-radius: 5px;\n    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);\n}\n\n.ag-chart-tooltip-visible {\n    display: table;\n}\n\n.ag-chart-tooltip-title {\n    font-weight: bold;\n    padding: 7px;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n    color: white;\n    background-color: #888888;\n    border-top-left-radius: 5px;\n    border-top-right-radius: 5px;\n}\n\n.ag-chart-tooltip-content {\n    padding: 7px;\n    line-height: 1.7em;\n    border-bottom-left-radius: 5px;\n    border-bottom-right-radius: 5px;\n}\n\n.ag-chart-tooltip-arrow::before {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 6px solid #989898;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: #989898;\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n\n.ag-chart-tooltip-arrow::after {\n    content: \"\";\n\n    position: absolute;\n    top: 100%;\n    left: 50%;\n    transform: translateX(-50%);\n\n    border: 5px solid black;\n\n    border-left-color: transparent;\n    border-right-color: transparent;\n    border-top-color: rgb(244, 244, 244);\n    border-bottom-color: transparent;\n\n    width: 0;\n    height: 0;\n\n    margin: 0 auto;\n}\n";
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.background = new Rect();
        _this.legend = new Legend();
        _this.legendAutoPadding = new Padding();
        _this.captionAutoPadding = 0; // top padding only
        _this._container = undefined;
        _this._data = [];
        _this._autoSize = false;
        _this.padding = new Padding(20);
        _this._axes = [];
        _this._series = [];
        _this._axesChanged = false;
        _this._seriesChanged = false;
        _this.layoutCallbackId = 0;
        _this._performLayout = function () {
            _this.layoutCallbackId = 0;
            _this.background.width = _this.width;
            _this.background.height = _this.height;
            _this.performLayout();
            if (!_this.layoutPending) {
                _this.fireEvent({ type: 'layoutDone' });
            }
        };
        _this.dataCallbackId = 0;
        _this._onMouseDown = _this.onMouseDown.bind(_this);
        _this._onMouseUp = _this.onMouseUp.bind(_this);
        _this._onMouseMove = _this.onMouseMove.bind(_this);
        _this._onMouseOut = _this.onMouseOut.bind(_this);
        _this._onClick = _this.onClick.bind(_this);
        _this._tooltipClass = Chart.defaultTooltipClass;
        /**
         * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
         * Only has effect on series with markers.
         */
        _this.tooltipTracking = true;
        var root = new Group();
        var background = _this.background;
        background.fill = 'white';
        root.appendChild(background);
        var element = _this._element = document.createElement('div');
        element.style.boxSizing = 'border-box';
        element.style.overflow = 'hidden';
        element.style.height = '100%';
        var scene = new Scene(document);
        _this.scene = scene;
        scene.root = root;
        scene.container = element;
        _this.autoSize = true;
        var legend = _this.legend;
        legend.addEventListener('layoutChange', _this.onLayoutChange, _this);
        legend.addPropertyListener('position', _this.onLegendPositionChange, _this);
        _this.tooltipElement = document.createElement('div');
        _this.tooltipClass = '';
        document.body.appendChild(_this.tooltipElement);
        if (Chart.tooltipDocuments.indexOf(document) < 0) {
            var styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Chart.tooltipDocuments.push(document);
        }
        _this.setupDomListeners(scene.canvas.element);
        _this.addPropertyListener('title', _this.onCaptionChange);
        _this.addPropertyListener('subtitle', _this.onCaptionChange);
        _this.addEventListener('layoutChange', function () { return _this.layoutPending = true; });
        return _this;
    }
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
            this.series.forEach(function (series) { return series.data = data; });
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
                this.scene.resize(value, this.height);
                this.fireEvent({ type: 'layoutChange' });
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
                this.scene.resize(this.width, value);
                this.fireEvent({ type: 'layoutChange' });
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
            if (this._autoSize !== value) {
                this._autoSize = value;
                if (value) {
                    var chart_1 = this; // capture `this` for IE11
                    SizeMonitor.observe(this.element, function (size) {
                        if (size.width !== chart_1.width || size.height !== chart_1.height) {
                            chart_1.scene.resize(size.width, size.height);
                            chart_1.fireEvent({ type: 'layoutChange' });
                        }
                    });
                    this.element.style.display = 'block';
                }
                else {
                    SizeMonitor.unobserve(this.element);
                    this.element.style.display = 'inline-block';
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.download = function (fileName) {
        this.scene.download(fileName);
    };
    Chart.prototype.destroy = function () {
        var tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }
        SizeMonitor.unobserve(this.element);
        this.container = undefined;
        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.container = undefined;
    };
    Chart.prototype.onLayoutChange = function () {
        this.layoutPending = true;
    };
    Chart.prototype.onLegendPositionChange = function () {
        this.legendAutoPadding.clear();
        this.layoutPending = true;
    };
    Chart.prototype.onCaptionChange = function (event) {
        var value = event.value, oldValue = event.oldValue;
        if (oldValue) {
            oldValue.removeEventListener('change', this.onLayoutChange, this);
            this.scene.root.removeChild(oldValue.node);
        }
        if (value) {
            value.addEventListener('change', this.onLayoutChange, this);
            this.scene.root.appendChild(value.node);
        }
    };
    Object.defineProperty(Chart.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: true,
        configurable: true
    });
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
            this.axesChanged = true;
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.attachAxis = function (axis) {
        this.scene.root.insertBefore(axis.group, this.seriesRoot);
    };
    Chart.prototype.detachAxis = function (axis) {
        this.scene.root.removeChild(axis.group);
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
    Chart.prototype.scheduleLayout = function () {
        this.layoutPending = true;
    };
    Chart.prototype.scheduleData = function () {
        // To prevent the chart from thinking the cursor is over the same node
        // after a change to data (the nodes are reused on data changes).
        this.dehighlightDatum();
        this.dataPending = true;
    };
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
            this.seriesChanged = true;
            this.axesChanged = true;
            return true;
        }
        return false;
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('layoutChange', this.scheduleLayout, this);
        series.addEventListener('dataChange', this.scheduleData, this);
        series.addEventListener('legendChange', this.updateLegend, this);
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('layoutChange', this.scheduleLayout, this);
        series.removeEventListener('dataChange', this.scheduleData, this);
        series.removeEventListener('legendChange', this.updateLegend, this);
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
            this.seriesChanged = true;
            this.axesChanged = true;
        }
        return false;
    };
    Chart.prototype.removeSeries = function (series) {
        var index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            this.seriesChanged = true;
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
        this.seriesChanged = true;
    };
    Chart.prototype.assignSeriesToAxes = function () {
        var _this = this;
        this.axes.forEach(function (axis) {
            var axisName = axis.direction + 'Axis';
            var boundSeries = [];
            _this.series.forEach(function (series) {
                if (series[axisName] === axis) {
                    boundSeries.push(series);
                }
            });
            axis.boundSeries = boundSeries;
        });
        this.seriesChanged = false;
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
                var axisName = direction + 'Axis';
                if (!series[axisName] || force) {
                    var directionAxes = directionToAxesMap[direction];
                    if (directionAxes) {
                        var axis = _this.findMatchingAxis(directionAxes, series.getKeys(direction));
                        if (axis) {
                            series[axisName] = axis;
                        }
                    }
                }
            });
            if (series instanceof CartesianSeries) {
                if (!series.xAxis) {
                    console.warn("Could not find a matching xAxis for the " + series.id + " series.");
                    return;
                }
                if (!series.yAxis) {
                    console.warn("Could not find a matching yAxis for the " + series.id + " series.");
                    return;
                }
            }
        });
        this.axesChanged = false;
    };
    Chart.prototype.findMatchingAxis = function (directionAxes, directionKeys) {
        for (var i = 0; i < directionAxes.length; i++) {
            var axis = directionAxes[i];
            var axisKeys = axis.keys;
            if (!axisKeys.length) {
                return axis;
            }
            else if (directionKeys) {
                for (var j = 0; j < directionKeys.length; j++) {
                    if (axisKeys.indexOf(directionKeys[j]) >= 0) {
                        return axis;
                    }
                }
            }
        }
    };
    Object.defineProperty(Chart.prototype, "axesChanged", {
        get: function () {
            return this._axesChanged;
        },
        set: function (value) {
            this._axesChanged = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "seriesChanged", {
        get: function () {
            return this._seriesChanged;
        },
        set: function (value) {
            this._seriesChanged = value;
            if (value) {
                this.dataPending = true;
            }
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
                if (!(this.layoutCallbackId || this.dataPending)) {
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
    Object.defineProperty(Chart.prototype, "dataPending", {
        get: function () {
            return !!this.dataCallbackId;
        },
        set: function (value) {
            var _this = this;
            if (this.dataCallbackId) {
                clearTimeout(this.dataCallbackId);
                this.dataCallbackId = 0;
            }
            if (value) {
                this.dataCallbackId = window.setTimeout(function () {
                    _this.dataPending = false;
                    _this.processData();
                }, 0);
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.processData = function () {
        this.layoutPending = false;
        if (this.axesChanged) {
            this.assignAxesToSeries(true);
            this.assignSeriesToAxes();
        }
        if (this.seriesChanged) {
            this.assignSeriesToAxes();
        }
        this.series.filter(function (s) { return s.visible; }).forEach(function (series) { return series.processData(); });
        this.updateLegend();
        this.layoutPending = true;
    };
    Chart.prototype.updateLegend = function () {
        var legendData = [];
        this.series.filter(function (s) { return s.showInLegend; }).forEach(function (series) { return series.listSeriesItems(legendData); });
        this.legend.data = legendData;
    };
    Chart.prototype.positionCaptions = function () {
        var _a = this, title = _a.title, subtitle = _a.subtitle;
        var titleVisible = false;
        var subtitleVisible = false;
        var spacing = 10;
        var paddingTop = spacing;
        if (title && title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            titleVisible = true;
            var titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
            if (titleBBox) {
                paddingTop = titleBBox.y + titleBBox.height;
            }
            if (subtitle && subtitle.enabled) {
                subtitle.node.x = this.width / 2;
                subtitle.node.y = paddingTop + spacing;
                subtitleVisible = true;
                var subtitleBBox = subtitle.node.computeBBox();
                if (subtitleBBox) {
                    paddingTop = subtitleBBox.y + subtitleBBox.height;
                }
            }
        }
        if (title) {
            title.node.visible = titleVisible;
        }
        if (subtitle) {
            subtitle.node.visible = subtitleVisible;
        }
        this.captionAutoPadding = Math.floor(paddingTop);
    };
    Chart.prototype.positionLegend = function () {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }
        var _a = this, legend = _a.legend, captionAutoPadding = _a.captionAutoPadding, legendAutoPadding = _a.legendAutoPadding;
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
                translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendSpacing;
                legendAutoPadding.bottom = legendBBox.height;
                break;
            case 'top':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                translationY = captionAutoPadding + legendSpacing - legendBBox.y;
                legendAutoPadding.top = legendBBox.height;
                break;
            case 'left':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                translationX = legendSpacing - legendBBox.x;
                translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                legendAutoPadding.left = legendBBox.width;
                break;
            default: // case 'right':
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                translationX = width - legendBBox.width - legendBBox.x - legendSpacing;
                translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                legendAutoPadding.right = legendBBox.width;
                break;
        }
        // Round off for pixel grid alignment to work properly.
        legendGroup.translationX = Math.floor(translationX + legendGroup.translationX);
        legendGroup.translationY = Math.floor(translationY + legendGroup.translationY);
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
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    Chart.prototype.pickSeriesNode = function (x, y) {
        if (!this.seriesRect || !this.seriesRect.containsPoint(x, y)) {
            return undefined;
        }
        var allSeries = this.series;
        var node = undefined;
        for (var i = allSeries.length - 1; i >= 0; i--) {
            var series = allSeries[i];
            node = series.group.pickNode(x, y);
            if (node) {
                return {
                    series: series,
                    node: node
                };
            }
        }
    };
    // Provided x/y are in canvas coordinates.
    Chart.prototype.pickClosestSeriesNodeDatum = function (x, y) {
        if (!this.seriesRect || !this.seriesRect.containsPoint(x, y)) {
            return undefined;
        }
        var allSeries = this.series;
        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        }
        var minDistance = Infinity;
        var closestDatum;
        var _loop_1 = function (i) {
            var series = allSeries[i];
            if (!series.visible) {
                return "continue";
            }
            var hitPoint = series.group.transformPoint(x, y);
            series.getNodeData().forEach(function (datum) {
                if (!datum.point) {
                    return;
                }
                var distance = getDistance(hitPoint, datum.point);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDatum = datum;
                }
            });
        };
        for (var i = allSeries.length - 1; i >= 0; i--) {
            _loop_1(i);
        }
        if (closestDatum) {
            return closestDatum;
        }
    };
    Chart.prototype.onMouseMove = function (event) {
        var _a = this, lastPick = _a.lastPick, tooltipTracking = _a.tooltipTracking;
        var pick = this.pickSeriesNode(event.offsetX, event.offsetY);
        var nodeDatum;
        if (pick && pick.node instanceof Shape) {
            var node = pick.node;
            nodeDatum = node.datum;
            if (lastPick && lastPick.datum === nodeDatum) {
                lastPick.node = node;
            }
            // Marker nodes will have the `point` info in their datums.
            // Highlight if not a marker node or, if not in the tracking mode, highlight markers too.
            if ((!node.datum.point || !tooltipTracking)) {
                if (!lastPick // cursor moved from empty space to a node
                    || lastPick.node !== node) { // cursor moved from one node to another
                    this.onSeriesDatumPick(event, node.datum, node);
                }
                else if (pick.series.tooltipEnabled) { // cursor moved within the same node
                    this.showTooltip(event);
                }
                // A non-marker node (takes precedence over marker nodes) was highlighted.
                // Or we are not in the tracking mode.
                // Either way, we are done at this point.
                return;
            }
        }
        var hideTooltip = false;
        // In tracking mode a tooltip is shown for the closest rendered datum.
        // This makes it easier to show tooltips when markers are small and/or plentiful
        // and also gives the ability to show tooltips even when the series were configured
        // to not render markers.
        if (tooltipTracking) {
            var closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
            if (closestDatum && closestDatum.point) {
                var _b = closestDatum.point, x = _b.x, y = _b.y;
                var canvas = this.scene.canvas;
                var point = closestDatum.series.group.inverseTransformPoint(x, y);
                var canvasRect = canvas.element.getBoundingClientRect();
                this.onSeriesDatumPick({
                    pageX: Math.round(canvasRect.left + window.pageXOffset + point.x),
                    pageY: Math.round(canvasRect.top + window.pageYOffset + point.y)
                }, closestDatum, nodeDatum === closestDatum ? pick.node : undefined);
            }
            else {
                hideTooltip = true;
            }
        }
        if (lastPick && (hideTooltip || !tooltipTracking)) {
            // cursor moved from a non-marker node to empty space
            this.dehighlightDatum();
            this.hideTooltip();
            this.lastPick = undefined;
        }
    };
    Chart.prototype.onMouseDown = function (event) { };
    Chart.prototype.onMouseUp = function (event) { };
    Chart.prototype.onMouseOut = function (event) {
        this.toggleTooltip(false);
    };
    Chart.prototype.onClick = function (event) {
        this.checkSeriesNodeClick();
        this.checkLegendClick(event);
    };
    Chart.prototype.checkSeriesNodeClick = function () {
        var lastPick = this.lastPick;
        if (lastPick && lastPick.node) {
            var datum = this.lastPick.datum;
            datum.series.fireNodeClickEvent(datum);
        }
    };
    Chart.prototype.onSeriesNodeClick = function (event) {
        this.fireEvent(__assign(__assign({}, event), { type: 'seriesNodeClick' }));
    };
    Chart.prototype.checkLegendClick = function (event) {
        var datum = this.legend.getDatumForPoint(event.offsetX, event.offsetY);
        if (datum) {
            var id_1 = datum.id, itemId = datum.itemId, enabled = datum.enabled;
            var series = find(this.series, function (series) { return series.id === id_1; });
            if (series) {
                series.toggleSeriesItem(itemId, !enabled);
                if (enabled) {
                    this.hideTooltip();
                }
            }
        }
    };
    Chart.prototype.onSeriesDatumPick = function (meta, datum, node) {
        if (this.lastPick) {
            // this.lastPick.datum.series.dehighlightDatum();
            this.dehighlightDatum();
        }
        this.lastPick = {
            datum: datum,
            node: node
        };
        this.highlightDatum(datum);
        var html = datum.series.tooltipEnabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.showTooltip(meta, html);
        }
    };
    Chart.prototype.highlightDatum = function (datum) {
        this.highlightedDatum = datum;
        this.series.forEach(function (s) { return s.onHighlightChange(); });
    };
    Chart.prototype.dehighlightDatum = function () {
        if (this.highlightedDatum) {
            this.highlightedDatum = undefined;
            this.series.forEach(function (s) { return s.onHighlightChange(); });
        }
    };
    Object.defineProperty(Chart.prototype, "tooltipClass", {
        get: function () {
            return this._tooltipClass;
        },
        set: function (value) {
            if (this._tooltipClass !== value) {
                this._tooltipClass = value;
                this.toggleTooltip();
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.toggleTooltip = function (visible) {
        if (!visible && this.lastPick) {
            this.dehighlightDatum();
            this.lastPick = undefined;
        }
        this.updateTooltipClass(visible);
    };
    Chart.prototype.updateTooltipClass = function (visible, constrained) {
        var classList = [Chart.defaultTooltipClass, this.tooltipClass];
        if (visible === true) {
            classList.push(Chart.defaultTooltipClass + "-visible");
        }
        if (constrained !== true) {
            classList.push(Chart.defaultTooltipClass + "-arrow");
        }
        this.tooltipElement.setAttribute('class', classList.join(' '));
    };
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    Chart.prototype.showTooltip = function (meta, html) {
        var el = this.tooltipElement;
        var container = this.container;
        if (html !== undefined) {
            el.innerHTML = html;
        }
        else if (!el.innerHTML) {
            return;
        }
        if (html) {
            this.toggleTooltip(true);
        }
        var left = meta.pageX - el.clientWidth / 2;
        var top = meta.pageY - el.clientHeight - 8;
        if (container) {
            var tooltipRect = el.getBoundingClientRect();
            var minLeft = 0;
            var maxLeft = window.innerWidth - tooltipRect.width;
            if (left < minLeft) {
                left = minLeft;
                this.updateTooltipClass(true, true);
            }
            else if (left > maxLeft) {
                left = maxLeft;
                this.updateTooltipClass(true, true);
            }
        }
        el.style.left = left + "px";
        el.style.top = top + "px";
    };
    Chart.prototype.hideTooltip = function () {
        this.toggleTooltip(false);
    };
    Chart.defaultTooltipClass = 'ag-chart-tooltip';
    Chart.tooltipDocuments = [];
    __decorate([
        reactive('layoutChange')
    ], Chart.prototype, "padding", void 0);
    __decorate([
        reactive('layoutChange')
    ], Chart.prototype, "title", void 0);
    __decorate([
        reactive('layoutChange')
    ], Chart.prototype, "subtitle", void 0);
    return Chart;
}(Observable));
export { Chart };
