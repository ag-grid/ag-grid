import { Scene } from "../scene/scene";
import { Group } from "../scene/group";
import { Padding } from "../util/padding";
import { Shape } from "../scene/shape/shape";
import { Rect } from "../scene/shape/rect";
import { Legend } from "./legend";
import { find } from "../util/array";
var Chart = /** @class */ (function () {
    function Chart(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.background = new Rect();
        this.legend = new Legend();
        this.legendAutoPadding = new Padding();
        this.captionAutoPadding = 0; // top padding only
        this.tooltipOffset = [20, 20];
        this.defaultTooltipClass = 'ag-chart-tooltip';
        this.onLayoutChange = function () {
            _this.layoutPending = true;
        };
        this.onLegendPositionChange = function () {
            _this.legendAutoPadding.clear();
            _this.layoutPending = true;
        };
        this._title = undefined;
        this._subtitle = undefined;
        this._series = [];
        this._data = [];
        this._padding = new Padding(20);
        this.layoutCallbackId = 0;
        this._performLayout = function () {
            _this.layoutCallbackId = 0;
            _this.background.width = _this.width;
            _this.background.height = _this.height;
            _this.performLayout();
            if (_this.onLayoutDone) {
                _this.onLayoutDone();
            }
        };
        this.dataCallbackId = 0;
        this._processData = function () {
            _this.dataCallbackId = 0;
            _this.processData();
        };
        this.onMouseMove = function (event) {
            var x = event.offsetX, y = event.offsetY;
            var pick = _this.pickSeriesNode(x, y);
            if (pick) {
                var node = pick.node;
                if (node instanceof Shape) {
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
        this.onMouseOut = function (event) {
            _this.toggleTooltip(false);
        };
        this.onClick = function (event) {
            var x = event.offsetX, y = event.offsetY;
            var datum = _this.legend.datumForPoint(x, y);
            if (datum) {
                var id_1 = datum.id, itemId = datum.itemId, enabled = datum.enabled;
                var series = find(_this.series, function (series) { return series.id === id_1; });
                if (series) {
                    series.toggleSeriesItem(itemId, !enabled);
                }
            }
        };
        this._tooltipClass = this.defaultTooltipClass;
        var root = new Group();
        var background = this.background;
        var document = options.document || window.document;
        background.fill = 'white';
        root.appendChild(background);
        var scene = new Scene({ document: document });
        this.scene = scene;
        scene.parent = options.parent;
        scene.root = root;
        this.legend.onLayoutChange = this.onLayoutChange;
        this.legend.onPositionChange = this.onLegendPositionChange;
        this.tooltipElement = document.createElement('div');
        this.tooltipClass = '';
        document.body.appendChild(this.tooltipElement);
        this.setupListeners(scene.canvas.element);
    }
    Chart.prototype.destroy = function () {
        var tooltipParent = this.tooltipElement.parentNode;
        if (tooltipParent) {
            tooltipParent.removeChild(this.tooltipElement);
        }
        this.legend.onLayoutChange = undefined;
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
    Object.defineProperty(Chart.prototype, "parent", {
        get: function () {
            return this.scene.parent;
        },
        set: function (value) {
            this.scene.parent = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var oldTitle = this._title;
            if (oldTitle !== value) {
                if (oldTitle) {
                    oldTitle.onChange = undefined;
                    this.scene.root.removeChild(oldTitle.node);
                }
                if (value) {
                    value.onChange = this.onLayoutChange;
                    this.scene.root.appendChild(value.node);
                }
                this._title = value;
                this.layoutPending = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (value) {
            var oldSubtitle = this._subtitle;
            if (oldSubtitle !== value) {
                if (oldSubtitle) {
                    oldSubtitle.onChange = undefined;
                    this.scene.root.removeChild(oldSubtitle.node);
                }
                if (value) {
                    value.onChange = this.onLayoutChange;
                    this.scene.root.appendChild(value.node);
                }
                this._subtitle = value;
                this.layoutPending = true;
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
            series.chart = this;
            this.dataPending = true;
            return true;
        }
        return false;
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
                allSeries.splice(afterIndex + 1, 0, series);
            }
            else {
                if (allSeries.length > 0) {
                    seriesRoot.insertBefore(series.group, allSeries[0].group);
                }
                else {
                    seriesRoot.append(series.group);
                }
                allSeries.unshift(series);
            }
            series.chart = this;
            this.dataPending = true;
        }
        return false;
    };
    Chart.prototype.removeSeries = function (series) {
        var index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            series.chart = undefined;
            this.seriesRoot.removeChild(series.group);
            this.dataPending = true;
            return true;
        }
        return false;
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            series.chart = undefined;
            _this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
        this.dataPending = true;
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
        get: function () {
            return this.scene.size;
        },
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
            if (this.dataCallbackId) {
                clearTimeout(this.dataCallbackId);
                this.dataCallbackId = 0;
            }
            if (value) {
                // We don't want to render before the data is processed and then again after,
                // so we cancel the auto-scheduled render, if any.
                this.scene.cancelRender();
                this.dataCallbackId = window.setTimeout(this._processData, 0); // run on next tick
            }
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.processData = function () {
        this.layoutPending = false;
        var legendData = [];
        this.series.forEach(function (series) {
            if (series.visible) {
                series.processData();
            }
            if (series.showInLegend) {
                series.listSeriesItems(legendData);
            }
        });
        this.legend.data = legendData;
        this.layoutPending = true;
    };
    Chart.prototype.positionCaptions = function () {
        var _a = this, title = _a.title, subtitle = _a.subtitle;
        var titleVisible = false;
        var subtitleVisible = false;
        var spacing = 5;
        var paddingTop = 0;
        if (title && title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = 10;
            titleVisible = true;
            var bbox = title.node.getBBox();
            paddingTop += bbox ? bbox.y + bbox.height * 1.5 : 0;
            if (subtitle && subtitle.enabled) {
                var bbox_1 = subtitle.node.getBBox();
                subtitle.node.x = this.width / 2;
                subtitle.node.y = paddingTop;
                subtitleVisible = true;
                paddingTop += spacing + (bbox_1 ? bbox_1.height : 0);
            }
        }
        if (title) {
            title.node.visible = titleVisible;
        }
        if (subtitle) {
            subtitle.node.visible = subtitleVisible;
        }
        if (this.captionAutoPadding !== paddingTop) {
            this.captionAutoPadding = paddingTop;
            this.layoutPending = true;
        }
    };
    Chart.prototype.positionLegend = function () {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }
        var captionAutoPadding = this.captionAutoPadding;
        var width = this.width;
        var height = this.height - captionAutoPadding;
        var legend = this.legend;
        var legendGroup = legend.group;
        var legendPadding = this.legend.padding;
        var legendAutoPadding = this.legendAutoPadding;
        legendGroup.translationX = 0;
        legendGroup.translationY = 0;
        var legendBBox;
        switch (this.legend.position) {
            case 'bottom':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.getBBox();
                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendPadding;
                if (legendAutoPadding.bottom !== legendBBox.height) {
                    legendAutoPadding.bottom = legendBBox.height;
                    this.layoutPending = true;
                }
                break;
            case 'top':
                legend.performLayout(width - legendPadding * 2, 0);
                legendBBox = legendGroup.getBBox();
                legendGroup.translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + legendPadding - legendBBox.y;
                if (legendAutoPadding.top !== legendBBox.height) {
                    legendAutoPadding.top = legendBBox.height;
                    this.layoutPending = true;
                }
                break;
            case 'left':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.getBBox();
                legendGroup.translationX = legendPadding - legendBBox.x;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                if (legendAutoPadding.left !== legendBBox.width) {
                    legendAutoPadding.left = legendBBox.width;
                    this.layoutPending = true;
                }
                break;
            default: // case 'right':
                legend.performLayout(0, height - legendPadding * 2);
                legendBBox = legendGroup.getBBox();
                legendGroup.translationX = width - legendBBox.width - legendBBox.x - legendPadding;
                legendGroup.translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                if (legendAutoPadding.right !== legendBBox.width) {
                    legendAutoPadding.right = legendBBox.width;
                    this.layoutPending = true;
                }
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
    return Chart;
}());
export { Chart };
