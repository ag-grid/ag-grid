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
var scene_1 = require("../scene/scene");
var group_1 = require("../scene/group");
var padding_1 = require("../util/padding");
var shape_1 = require("../scene/shape/shape");
var rect_1 = require("../scene/shape/rect");
var legend_1 = require("./legend");
var array_1 = require("../util/array");
var observable_1 = require("../util/observable");
var cartesianSeries_1 = require("./series/cartesian/cartesianSeries");
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this) || this;
        _this.id = _this.createId();
        _this.background = new rect_1.Rect();
        _this.legendAutoPadding = new padding_1.Padding();
        _this.captionAutoPadding = 0; // top padding only
        _this.defaultTooltipClass = 'ag-chart-tooltip';
        _this.legend = new legend_1.Legend();
        _this.tooltipOffset = [20, 20];
        _this.padding = new padding_1.Padding(20);
        _this.onLayoutChange = function () {
            _this.layoutPending = true;
        };
        _this.onLegendPositionChange = function () {
            _this.legendAutoPadding.clear();
            _this.layoutPending = true;
        };
        _this._axes = [];
        _this._series = [];
        _this.scheduleLayout = function () {
            _this.layoutPending = true;
        };
        _this.scheduleData = function () {
            _this.dataPending = true;
        };
        _this._data = [];
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
        _this.updateLegend = function () {
            var legendData = [];
            _this.series.filter(function (s) { return s.showInLegend; }).forEach(function (series) { return series.listSeriesItems(legendData); });
            _this.legend.data = legendData;
        };
        _this.onMouseMove = function (event) {
            var x = event.offsetX, y = event.offsetY;
            var pick = _this.pickSeriesNode(x, y);
            if (pick) {
                var node = pick.node;
                if (node instanceof shape_1.Shape) {
                    if (!_this.lastPick || // cursor moved from empty space to a node
                        _this.lastPick.node !== node) { // cursor moved from one node to another
                        _this.onSeriesNodePick(event, pick.series, node);
                    }
                    else if (pick.series.tooltipEnabled) { // cursor moved within the same node
                        _this.showTooltip(event);
                    }
                }
            }
            else if (_this.lastPick) { // cursor moved from a node to empty space
                _this.lastPick.series.dehighlightNode();
                _this.hideTooltip();
                _this.lastPick = undefined;
            }
        };
        _this.onMouseOut = function (_) {
            _this.toggleTooltip(false);
        };
        _this.onClick = function (event) {
            var x = event.offsetX, y = event.offsetY;
            var datum = _this.legend.datumForPoint(x, y);
            if (datum) {
                var id_1 = datum.id, itemId = datum.itemId, enabled = datum.enabled;
                var series = array_1.find(_this.series, function (series) { return series.id === id_1; });
                if (series) {
                    series.toggleSeriesItem(itemId, !enabled);
                }
            }
        };
        _this._tooltipClass = _this.defaultTooltipClass;
        var root = new group_1.Group();
        var background = _this.background;
        background.fill = 'white';
        root.appendChild(background);
        var scene = new scene_1.Scene(document);
        _this.scene = scene;
        scene.root = root;
        var legend = _this.legend;
        legend.addEventListener('layoutChange', _this.onLayoutChange);
        legend.addPropertyListener('position', _this.onLegendPositionChange);
        _this.tooltipElement = document.createElement('div');
        _this.tooltipClass = '';
        document.body.appendChild(_this.tooltipElement);
        _this.setupListeners(scene.canvas.element);
        var captionListener = (function (event) {
            var chart = event.source, caption = event.value, oldCaption = event.oldValue;
            if (oldCaption) {
                oldCaption.removeEventListener('change', chart.onLayoutChange);
                chart.scene.root.removeChild(oldCaption.node);
            }
            if (caption) {
                caption.addEventListener('change', chart.onLayoutChange);
                chart.scene.root.appendChild(caption.node);
            }
        });
        _this.addPropertyListener('title', captionListener);
        _this.addPropertyListener('subtitle', captionListener);
        _this.addEventListener('layoutChange', function () { return _this.layoutPending = true; });
        return _this;
    }
    Chart.prototype.createId = function () {
        var constructor = this.constructor;
        var className = constructor.className;
        if (!className) {
            throw new Error("The " + constructor + " is missing the 'className' property.");
        }
        return className + '-' + (constructor.id = (constructor.id || 0) + 1);
    };
    Chart.prototype.destroy = function () {
        var tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }
        this.legend.removeEventListener('layoutChange', this.onLayoutChange);
        this.cleanupListeners(this.scene.canvas.element);
        this.scene.parent = undefined;
    };
    Object.defineProperty(Chart.prototype, "element", {
        get: function () {
            return this.scene.canvas.element;
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
            var root = this.scene.root;
            this._axes.forEach(function (axis) { return root.removeChild(axis.group); });
            this._axes = values;
            this._axes.forEach(function (axis) { return root.insertBefore(axis.group, _this.seriesRoot); });
            this.axesChanged = true;
        },
        enumerable: true,
        configurable: true
    });
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
            this.seriesChanged = true;
            this.axesChanged = true;
            return true;
        }
        return false;
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        series.addEventListener('layoutChange', this.scheduleLayout);
        series.addEventListener('dataChange', this.scheduleData);
        series.addEventListener('legendChange', this.updateLegend);
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('layoutChange', this.scheduleLayout);
        series.removeEventListener('dataChange', this.scheduleData);
        series.removeEventListener('legendChange', this.updateLegend);
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
    /**
     * Finds all the series that use any given axis.
     */
    Chart.prototype.onSeriesChange = function () {
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
    // Has to run before onSeriesChange
    Chart.prototype.onAxesChange = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
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
            if (series instanceof cartesianSeries_1.CartesianSeries) {
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
            this.onAxesChange();
        }
        if (this.seriesChanged) {
            this.onSeriesChange();
        }
        this.series.filter(function (s) { return s.visible; }).forEach(function (series) { return series.processData(); });
        this.updateLegend();
        this.layoutPending = true;
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
        this.captionAutoPadding = paddingTop;
    };
    Chart.prototype.positionLegend = function () {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }
        var _a = this, legend = _a.legend, captionAutoPadding = _a.captionAutoPadding, legendAutoPadding = _a.legendAutoPadding;
        var width = this.width;
        var height = this.height - captionAutoPadding;
        var legendGroup = legend.group;
        var legendPadding = legend.padding;
        legendGroup.translationX = 0;
        legendGroup.translationY = 0;
        var legendBBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendPadding;
                legendAutoPadding.bottom = legendBBox.height;
                break;
            case 'top':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + legendPadding - legendBBox.y;
                legendAutoPadding.top = legendBBox.height;
                break;
            case 'left':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.translationX = legendPadding - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                legendAutoPadding.left = legendBBox.width;
                break;
            default: // case 'right':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.translationX = width - legendBBox.width - legendBBox.x - legendPadding;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                legendAutoPadding.right = legendBBox.width;
                break;
        }
        // Round off for pixel grid alignment to work properly.
        legendGroup.translationX = Math.floor(legendGroup.translationX);
        legendGroup.translationY = Math.floor(legendGroup.translationY);
    };
    Chart.prototype.setupListeners = function (chartElement) {
        chartElement.addEventListener('mousemove', this.onMouseMove);
        chartElement.addEventListener('mouseout', this.onMouseOut);
        chartElement.addEventListener('click', this.onClick);
    };
    Chart.prototype.cleanupListeners = function (chartElement) {
        chartElement.removeEventListener('mousemove', this.onMouseMove);
        chartElement.removeEventListener('mouseout', this.onMouseMove);
        chartElement.removeEventListener('click', this.onClick);
    };
    Chart.prototype.pickSeriesNode = function (x, y) {
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
    Chart.prototype.onSeriesNodePick = function (event, series, node) {
        if (this.lastPick) {
            this.lastPick.series.dehighlightNode();
        }
        this.lastPick = {
            series: series,
            node: node
        };
        series.highlightNode(node);
        var html = series.tooltipEnabled && series.getTooltipHtml(node.datum);
        if (html) {
            this.showTooltip(event, html);
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
        var classList = [this.defaultTooltipClass, this._tooltipClass];
        if (visible) {
            classList.push('visible');
        }
        else if (this.lastPick) {
            this.lastPick.series.dehighlightNode();
            this.lastPick = undefined;
        }
        this.tooltipElement.setAttribute('class', classList.join(' '));
    };
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    Chart.prototype.showTooltip = function (event, html) {
        var el = this.tooltipElement;
        var offset = this.tooltipOffset;
        var parent = el.parentElement;
        if (html !== undefined) {
            el.innerHTML = html;
        }
        else if (!el.innerHTML) {
            return;
        }
        if (html) {
            this.toggleTooltip(true);
        }
        var tooltipRect = el.getBoundingClientRect();
        var top = event.pageY + offset[1];
        var left = event.pageX + offset[0];
        if (tooltipRect &&
            parent &&
            parent.parentElement &&
            (left - pageXOffset + tooltipRect.width > parent.parentElement.offsetWidth)) {
            left -= tooltipRect.width + offset[0];
        }
        el.style.left = left + "px";
        el.style.top = top + "px";
    };
    Chart.prototype.hideTooltip = function () {
        this.toggleTooltip(false);
    };
    __decorate([
        observable_1.reactive([], 'scene.parent')
    ], Chart.prototype, "parent", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'])
    ], Chart.prototype, "title", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'])
    ], Chart.prototype, "subtitle", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'])
    ], Chart.prototype, "padding", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'], 'scene.size')
    ], Chart.prototype, "size", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'], 'scene.height')
    ], Chart.prototype, "height", void 0);
    __decorate([
        observable_1.reactive(['layoutChange'], 'scene.width')
    ], Chart.prototype, "width", void 0);
    return Chart;
}(observable_1.Observable));
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map