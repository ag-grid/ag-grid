"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const scene_1 = require("../scene/scene");
const group_1 = require("../scene/group");
const padding_1 = require("../util/padding");
const shape_1 = require("../scene/shape/shape");
const rect_1 = require("../scene/shape/rect");
const legend_1 = require("./legend");
const bbox_1 = require("../scene/bbox");
const array_1 = require("../util/array");
const sizeMonitor_1 = require("../util/sizeMonitor");
const observable_1 = require("../util/observable");
const id_1 = require("../util/id");
const labelPlacement_1 = require("../util/labelPlacement");
const defaultTooltipCss = `
.ag-chart-tooltip {
    display: table;
    position: absolute;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    z-index: 99999;
    font: 12px Verdana, sans-serif;
    color: black;
    background: rgb(244, 244, 244);
    border-radius: 5px;
    box-shadow: 0 0 1px rgba(3, 3, 3, 0.7), 0.5vh 0.5vh 1vh rgba(3, 3, 3, 0.25);
}

.ag-chart-tooltip-hidden {
    top: -10000px !important;
}

.ag-chart-tooltip-title {
    font-weight: bold;
    padding: 7px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    color: white;
    background-color: #888888;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.ag-chart-tooltip-content {
    padding: 7px;
    line-height: 1.7em;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    overflow: hidden;
}

.ag-chart-tooltip-content:empty {
    padding: 0;
    height: 7px;
}

.ag-chart-tooltip-arrow::before {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 6px solid #989898;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: #989898;
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.ag-chart-tooltip-arrow::after {
    content: "";

    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    border: 5px solid black;

    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: rgb(244, 244, 244);
    border-bottom-color: transparent;

    width: 0;
    height: 0;

    margin: 0 auto;
}

.ag-chart-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;
function toTooltipHtml(input, defaults) {
    if (typeof input === 'string') {
        return input;
    }
    defaults = defaults || {};
    const { content = defaults.content || '', title = defaults.title || undefined, color = defaults.color || 'white', backgroundColor = defaults.backgroundColor || '#888' } = input;
    const titleHtml = title ? `<div class="${Chart.defaultTooltipClass}-title"
        style="color: ${color}; background-color: ${backgroundColor}">${title}</div>` : '';
    return `${titleHtml}<div class="${Chart.defaultTooltipClass}-content">${content}</div>`;
}
exports.toTooltipHtml = toTooltipHtml;
class ChartTooltip extends observable_1.Observable {
    constructor(chart, document) {
        super();
        this.enabled = true;
        this.class = Chart.defaultTooltipClass;
        this.delay = 0;
        /**
         * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
         * Only has effect on series with markers.
         */
        this.tracking = true;
        this.showTimeout = 0;
        this.constrained = false;
        this.chart = chart;
        this.class = '';
        const tooltipRoot = document.body;
        const element = document.createElement('div');
        this.element = tooltipRoot.appendChild(element);
        // Detect when the chart becomes invisible and hide the tooltip as well.
        if (window.IntersectionObserver) {
            const target = this.chart.scene.canvas.element;
            const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (entry.target === target && entry.intersectionRatio === 0) {
                        this.toggle(false);
                    }
                }
            }, { root: tooltipRoot });
            observer.observe(target);
            this.observer = observer;
        }
    }
    destroy() {
        const { parentNode } = this.element;
        if (parentNode) {
            parentNode.removeChild(this.element);
        }
        if (this.observer) {
            this.observer.unobserve(this.chart.scene.canvas.element);
        }
    }
    isVisible() {
        const { element } = this;
        if (element.classList) { // if not IE11
            return !element.classList.contains(Chart.defaultTooltipClass + '-hidden');
        }
        // IE11 part.
        const classes = element.getAttribute('class');
        if (classes) {
            return classes.split(' ').indexOf(Chart.defaultTooltipClass + '-hidden') < 0;
        }
        return false;
    }
    updateClass(visible, constrained) {
        const classList = [Chart.defaultTooltipClass, this.class];
        if (visible !== true) {
            classList.push(`${Chart.defaultTooltipClass}-hidden`);
        }
        if (constrained !== true) {
            classList.push(`${Chart.defaultTooltipClass}-arrow`);
        }
        this.element.setAttribute('class', classList.join(' '));
    }
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta, html, instantly = false) {
        const el = this.element;
        if (html !== undefined) {
            el.innerHTML = html;
        }
        else if (!el.innerHTML) {
            return;
        }
        let left = meta.pageX - el.clientWidth / 2;
        let top = meta.pageY - el.clientHeight - 8;
        this.constrained = false;
        if (this.chart.container) {
            const tooltipRect = el.getBoundingClientRect();
            const minLeft = 0;
            const maxLeft = window.innerWidth - tooltipRect.width - 1;
            if (left < minLeft) {
                left = minLeft;
                this.updateClass(true, this.constrained = true);
            }
            else if (left > maxLeft) {
                left = maxLeft;
                this.updateClass(true, this.constrained = true);
            }
            if (top < window.pageYOffset) {
                top = meta.pageY + 20;
                this.updateClass(true, this.constrained = true);
            }
        }
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
        if (this.delay > 0 && !instantly) {
            this.toggle(false);
            this.showTimeout = window.setTimeout(() => {
                this.toggle(true);
            }, this.delay);
            return;
        }
        this.toggle(true);
    }
    toggle(visible) {
        if (!visible) {
            window.clearTimeout(this.showTimeout);
            if (this.chart.lastPick && !this.delay) {
                this.chart.dehighlightDatum();
                this.chart.lastPick = undefined;
            }
        }
        this.updateClass(visible, this.constrained);
    }
}
__decorate([
    observable_1.reactive()
], ChartTooltip.prototype, "enabled", void 0);
__decorate([
    observable_1.reactive()
], ChartTooltip.prototype, "class", void 0);
__decorate([
    observable_1.reactive()
], ChartTooltip.prototype, "delay", void 0);
__decorate([
    observable_1.reactive()
], ChartTooltip.prototype, "tracking", void 0);
exports.ChartTooltip = ChartTooltip;
class Chart extends observable_1.Observable {
    constructor(document = window.document) {
        super();
        this.id = id_1.createId(this);
        this.background = new rect_1.Rect();
        this.legend = new legend_1.Legend();
        this.legendAutoPadding = new padding_1.Padding();
        this.captionAutoPadding = 0; // top padding only
        this._container = undefined;
        this._data = [];
        this._autoSize = false;
        this.padding = new padding_1.Padding(20);
        this._axes = [];
        this._series = [];
        this._axesChanged = false;
        this._seriesChanged = false;
        this.layoutCallbackId = 0;
        this._performLayout = () => {
            this.layoutCallbackId = 0;
            this.background.width = this.width;
            this.background.height = this.height;
            this.performLayout();
            if (!this.layoutPending) {
                this.fireEvent({ type: 'layoutDone' });
            }
        };
        this.dataCallbackId = 0;
        this.nodeData = new Map();
        this.updateCallbackId = 0;
        this.legendBBox = new bbox_1.BBox(0, 0, 0, 0);
        this._onMouseDown = this.onMouseDown.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);
        this._onMouseOut = this.onMouseOut.bind(this);
        this._onClick = this.onClick.bind(this);
        this.pointerInsideLegend = false;
        this.pointerOverLegendDatum = false;
        const root = new group_1.Group();
        const background = this.background;
        background.fill = 'white';
        root.appendChild(background);
        const element = this._element = document.createElement('div');
        element.setAttribute('class', 'ag-chart-wrapper');
        const scene = new scene_1.Scene(document);
        this.scene = scene;
        this.autoSize = true; // Triggers width/height calc - needs to happen before root group assignment.
        scene.root = root;
        scene.container = element;
        this.padding.addEventListener('layoutChange', this.scheduleLayout, this);
        const { legend } = this;
        legend.addEventListener('layoutChange', this.scheduleLayout, this);
        legend.item.label.addPropertyListener('formatter', this.updateLegend, this);
        legend.addPropertyListener('position', this.onLegendPositionChange, this);
        this.tooltip = new ChartTooltip(this, document);
        this.tooltip.addPropertyListener('class', () => this.tooltip.toggle());
        if (Chart.tooltipDocuments.indexOf(document) < 0) {
            const styleElement = document.createElement('style');
            styleElement.innerHTML = defaultTooltipCss;
            // Make sure the default tooltip style goes before other styles so it can be overridden.
            document.head.insertBefore(styleElement, document.head.querySelector('style'));
            Chart.tooltipDocuments.push(document);
        }
        this.setupDomListeners(scene.canvas.element);
        this.addPropertyListener('title', this.onCaptionChange);
        this.addPropertyListener('subtitle', this.onCaptionChange);
        this.addEventListener('layoutChange', this.scheduleLayout);
    }
    set container(value) {
        if (this._container !== value) {
            const { parentNode } = this.element;
            if (parentNode != null) {
                parentNode.removeChild(this.element);
            }
            if (value) {
                value.appendChild(this.element);
            }
            this._container = value;
        }
    }
    get container() {
        return this._container;
    }
    set data(data) {
        this._data = data;
        this.series.forEach(series => series.data = data);
    }
    get data() {
        return this._data;
    }
    set width(value) {
        this.autoSize = false;
        if (this.width !== value) {
            this.scene.resize(value, this.height);
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get width() {
        return this.scene.width;
    }
    set height(value) {
        this.autoSize = false;
        if (this.height !== value) {
            this.scene.resize(this.width, value);
            this.fireEvent({ type: 'layoutChange' });
        }
    }
    get height() {
        return this.scene.height;
    }
    set autoSize(value) {
        if (this._autoSize !== value) {
            this._autoSize = value;
            const { style } = this.element;
            if (value) {
                const chart = this; // capture `this` for IE11
                sizeMonitor_1.SizeMonitor.observe(this.element, size => {
                    if (size.width !== chart.width || size.height !== chart.height) {
                        chart.scene.resize(size.width, size.height);
                        chart.fireEvent({ type: 'layoutChange' });
                    }
                });
                style.display = 'block';
                style.width = '100%';
                style.height = '100%';
            }
            else {
                sizeMonitor_1.SizeMonitor.unobserve(this.element);
                style.display = 'inline-block';
                style.width = 'auto';
                style.height = 'auto';
            }
        }
    }
    get autoSize() {
        return this._autoSize;
    }
    download(fileName) {
        this.scene.download(fileName);
    }
    destroy() {
        this.tooltip.destroy();
        sizeMonitor_1.SizeMonitor.unobserve(this.element);
        this.container = undefined;
        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.container = undefined;
    }
    onLegendPositionChange() {
        this.legendAutoPadding.clear();
        this.layoutPending = true;
    }
    onCaptionChange(event) {
        const { value, oldValue } = event;
        if (oldValue) {
            oldValue.removeEventListener('change', this.scheduleLayout, this);
            this.scene.root.removeChild(oldValue.node);
        }
        if (value) {
            value.addEventListener('change', this.scheduleLayout, this);
            this.scene.root.appendChild(value.node);
        }
    }
    get element() {
        return this._element;
    }
    set axes(values) {
        this._axes.forEach(axis => this.detachAxis(axis));
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter(a => !a.linkedTo).concat(values.filter(a => a.linkedTo));
        this._axes.forEach(axis => this.attachAxis(axis));
        this.axesChanged = true;
    }
    get axes() {
        return this._axes;
    }
    attachAxis(axis) {
        this.scene.root.insertBefore(axis.group, this.seriesRoot);
    }
    detachAxis(axis) {
        this.scene.root.removeChild(axis.group);
    }
    set series(values) {
        this.removeAllSeries();
        values.forEach(series => this.addSeries(series));
    }
    get series() {
        return this._series;
    }
    scheduleLayout() {
        this.layoutPending = true;
    }
    scheduleData() {
        // To prevent the chart from thinking the cursor is over the same node
        // after a change to data (the nodes are reused on data changes).
        this.dehighlightDatum();
        this.dataPending = true;
    }
    addSeries(series, before) {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            const beforeIndex = before ? allSeries.indexOf(before) : -1;
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
    }
    initSeries(series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('layoutChange', this.scheduleLayout, this);
        series.addEventListener('dataChange', this.scheduleData, this);
        series.addEventListener('legendChange', this.updateLegend, this);
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    }
    freeSeries(series) {
        series.chart = undefined;
        series.removeEventListener('layoutChange', this.scheduleLayout, this);
        series.removeEventListener('dataChange', this.scheduleData, this);
        series.removeEventListener('legendChange', this.updateLegend, this);
        series.removeEventListener('nodeClick', this.onSeriesNodeClick, this);
    }
    addSeriesAfter(series, after) {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            const afterIndex = after ? this.series.indexOf(after) : -1;
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
    }
    removeSeries(series) {
        const index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            this.seriesChanged = true;
            return true;
        }
        return false;
    }
    removeAllSeries() {
        this.series.forEach(series => {
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
        this.seriesChanged = true;
    }
    assignSeriesToAxes() {
        this.axes.forEach(axis => {
            const axisName = axis.direction + 'Axis';
            const boundSeries = [];
            this.series.forEach(series => {
                if (series[axisName] === axis) {
                    boundSeries.push(series);
                }
            });
            axis.boundSeries = boundSeries;
        });
        this.seriesChanged = false;
    }
    assignAxesToSeries(force = false) {
        // This method has to run before `assignSeriesToAxes`.
        const directionToAxesMap = {};
        this.axes.forEach(axis => {
            const direction = axis.direction;
            const directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
            directionAxes.push(axis);
        });
        this.series.forEach(series => {
            series.directions.forEach(direction => {
                const axisName = direction + 'Axis';
                if (!series[axisName] || force) {
                    const directionAxes = directionToAxesMap[direction];
                    if (directionAxes) {
                        const axis = this.findMatchingAxis(directionAxes, series.getKeys(direction));
                        if (axis) {
                            series[axisName] = axis;
                        }
                    }
                }
            });
        });
        this.axesChanged = false;
    }
    findMatchingAxis(directionAxes, directionKeys) {
        for (let i = 0; i < directionAxes.length; i++) {
            const axis = directionAxes[i];
            const axisKeys = axis.keys;
            if (!axisKeys.length) {
                return axis;
            }
            else if (directionKeys) {
                for (let j = 0; j < directionKeys.length; j++) {
                    if (axisKeys.indexOf(directionKeys[j]) >= 0) {
                        return axis;
                    }
                }
            }
        }
    }
    set axesChanged(value) {
        this._axesChanged = value;
    }
    get axesChanged() {
        return this._axesChanged;
    }
    set seriesChanged(value) {
        this._seriesChanged = value;
        if (value) {
            this.dataPending = true;
        }
    }
    get seriesChanged() {
        return this._seriesChanged;
    }
    set layoutPending(value) {
        if (value) {
            if (!(this.layoutCallbackId || this.dataPending)) {
                this.layoutCallbackId = requestAnimationFrame(this._performLayout);
                this.series.forEach(s => s.nodeDataPending = true);
            }
        }
        else if (this.layoutCallbackId) {
            cancelAnimationFrame(this.layoutCallbackId);
            this.layoutCallbackId = 0;
        }
    }
    /**
     * Only `true` while we are waiting for the layout to start.
     * This will be `false` if the layout has already started and is ongoing.
     */
    get layoutPending() {
        return !!this.layoutCallbackId;
    }
    set dataPending(value) {
        if (this.dataCallbackId) {
            clearTimeout(this.dataCallbackId);
            this.dataCallbackId = 0;
        }
        if (value) {
            this.dataCallbackId = window.setTimeout(() => {
                this.dataPending = false;
                this.processData();
            }, 0);
        }
    }
    get dataPending() {
        return !!this.dataCallbackId;
    }
    processData() {
        this.layoutPending = false;
        if (this.axesChanged) {
            this.assignAxesToSeries(true);
            this.assignSeriesToAxes();
        }
        if (this.seriesChanged) {
            this.assignSeriesToAxes();
        }
        this.series.forEach(s => s.processData());
        this.updateLegend(); // sets legend data which schedules a layout
        this.layoutPending = true;
    }
    createNodeData() {
        this.nodeData.clear();
        this.series.forEach(s => {
            const data = s.visible ? s.createNodeData() : [];
            this.nodeData.set(s, data);
        });
    }
    placeLabels() {
        const series = [];
        const data = [];
        this.nodeData.forEach((d, s) => {
            if (s.visible && s.label.enabled) {
                series.push(s);
                data.push(s.getLabelData());
            }
        });
        const { seriesRect } = this;
        const labels = seriesRect
            ? labelPlacement_1.placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map((l, i) => [series[i], l]));
    }
    updateLegend() {
        const legendData = [];
        this.series.filter(s => s.showInLegend).forEach(series => series.listSeriesItems(legendData));
        const { formatter } = this.legend.item.label;
        if (formatter) {
            legendData.forEach(datum => datum.label.text = formatter({
                id: datum.id,
                itemId: datum.itemId,
                value: datum.label.text
            }));
        }
        this.legend.data = legendData;
    }
    set updatePending(value) {
        if (this.updateCallbackId) {
            clearTimeout(this.updateCallbackId);
            this.updateCallbackId = 0;
        }
        if (value && !this.layoutPending) {
            this.updateCallbackId = window.setTimeout(() => {
                this.update();
            }, 0);
        }
    }
    get updatePending() {
        return !!this.updateCallbackId;
    }
    update() {
        this.updatePending = false;
        this.series.forEach(series => {
            if (series.updatePending) {
                series.update();
            }
        });
    }
    positionCaptions() {
        const { title, subtitle } = this;
        let titleVisible = false;
        let subtitleVisible = false;
        const spacing = 10;
        let paddingTop = spacing;
        if (title && title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            titleVisible = true;
            const titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
            if (titleBBox) {
                paddingTop = titleBBox.y + titleBBox.height;
            }
            if (subtitle && subtitle.enabled) {
                subtitle.node.x = this.width / 2;
                subtitle.node.y = paddingTop + spacing;
                subtitleVisible = true;
                const subtitleBBox = subtitle.node.computeBBox();
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
    }
    positionLegend() {
        if (!this.legend.enabled || !this.legend.data.length) {
            return;
        }
        const { legend, captionAutoPadding, legendAutoPadding } = this;
        const width = this.width;
        const height = this.height - captionAutoPadding;
        const legendGroup = legend.group;
        const legendSpacing = legend.spacing;
        let translationX = 0;
        let translationY = 0;
        let legendBBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.height < Math.floor((height * 0.5)); // Remove legend if it takes up more than 50% of the chart height.
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
                legendGroup.visible = legendBBox.height < Math.floor((height * 0.5));
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
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor((width * 0.5)); // Remove legend if it takes up more than 50% of the chart width.
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
                legend.performLayout(0, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor((width * 0.5));
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
    }
    setupDomListeners(chartElement) {
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseup', this._onMouseUp);
        chartElement.addEventListener('mouseout', this._onMouseOut);
        chartElement.addEventListener('click', this._onClick);
    }
    cleanupDomListeners(chartElement) {
        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
        chartElement.removeEventListener('click', this._onClick);
    }
    getSeriesRect() {
        return this.seriesRect;
    }
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    pickSeriesNode(x, y) {
        if (!(this.seriesRect && this.seriesRect.containsPoint(x, y))) {
            return undefined;
        }
        const allSeries = this.series;
        let node = undefined;
        for (let i = allSeries.length - 1; i >= 0; i--) {
            const series = allSeries[i];
            if (!series.visible || !series.group.visible) {
                continue;
            }
            node = series.pickGroup.pickNode(x, y);
            if (node) {
                return {
                    series,
                    node
                };
            }
        }
    }
    // Provided x/y are in canvas coordinates.
    pickClosestSeriesNodeDatum(x, y) {
        if (!this.seriesRect || !this.seriesRect.containsPoint(x, y)) {
            return undefined;
        }
        const allSeries = this.series;
        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
        }
        let minDistance = Infinity;
        let closestDatum;
        for (let i = allSeries.length - 1; i >= 0; i--) {
            const series = allSeries[i];
            if (!series.visible || !series.group.visible) {
                continue;
            }
            const hitPoint = series.group.transformPoint(x, y);
            series.getNodeData().forEach(datum => {
                var _a, _b;
                if (!datum.point) {
                    return;
                }
                // Ignore off-screen points when finding the closest series node datum in tracking mode.
                const { xAxis, yAxis } = series;
                const isInRange = ((_a = xAxis) === null || _a === void 0 ? void 0 : _a.inRange(datum.point.x)) && ((_b = yAxis) === null || _b === void 0 ? void 0 : _b.inRange(datum.point.y));
                if (!isInRange) {
                    return;
                }
                const distance = getDistance(hitPoint, datum.point);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDatum = datum;
                }
            });
        }
        return closestDatum;
    }
    onMouseMove(event) {
        this.handleLegendMouseMove(event);
        if (this.tooltip.enabled) {
            if (this.tooltip.delay > 0) {
                this.tooltip.toggle(false);
            }
            this.handleTooltip(event);
        }
    }
    handleTooltip(event) {
        const { lastPick, tooltip: { tracking: tooltipTracking } } = this;
        const { offsetX, offsetY } = event;
        const pick = this.pickSeriesNode(offsetX, offsetY);
        let nodeDatum;
        if (pick && pick.node instanceof shape_1.Shape) {
            const { node } = pick;
            nodeDatum = node.datum;
            if (lastPick && lastPick.datum === nodeDatum) {
                lastPick.node = node;
                lastPick.event = event;
            }
            // Marker nodes will have the `point` info in their datums.
            // Highlight if not a marker node or, if not in the tracking mode, highlight markers too.
            if ((!node.datum.point || !tooltipTracking)) {
                if (!lastPick // cursor moved from empty space to a node
                    || lastPick.node !== node) { // cursor moved from one node to another
                    this.onSeriesDatumPick(event, node.datum, node, event);
                }
                else if (pick.series.tooltip.enabled) { // cursor moved within the same node
                    this.tooltip.show(event);
                }
                // A non-marker node (takes precedence over marker nodes) was highlighted.
                // Or we are not in the tracking mode.
                // Either way, we are done at this point.
                return;
            }
        }
        let hideTooltip = false;
        // In tracking mode a tooltip is shown for the closest rendered datum.
        // This makes it easier to show tooltips when markers are small and/or plentiful
        // and also gives the ability to show tooltips even when the series were configured
        // to not render markers.
        if (tooltipTracking) {
            const closestDatum = this.pickClosestSeriesNodeDatum(offsetX, offsetY);
            if (closestDatum && closestDatum.point) {
                const { x, y } = closestDatum.point;
                const { canvas } = this.scene;
                const point = closestDatum.series.group.inverseTransformPoint(x, y);
                const canvasRect = canvas.element.getBoundingClientRect();
                this.onSeriesDatumPick({
                    pageX: Math.round(canvasRect.left + window.pageXOffset + point.x),
                    pageY: Math.round(canvasRect.top + window.pageYOffset + point.y)
                }, closestDatum, nodeDatum === closestDatum && pick ? pick.node : undefined, event);
            }
            else {
                hideTooltip = true;
            }
        }
        if (lastPick && (hideTooltip || !tooltipTracking)) {
            // Cursor moved from a non-marker node to empty space.
            this.dehighlightDatum();
            this.tooltip.toggle(false);
            this.lastPick = undefined;
        }
    }
    onMouseDown(event) { }
    onMouseUp(event) { }
    onMouseOut(event) {
        this.tooltip.toggle(false);
    }
    onClick(event) {
        if (this.checkSeriesNodeClick()) {
            return;
        }
        if (this.checkLegendClick(event)) {
            return;
        }
        this.fireEvent({
            type: 'click',
            event
        });
    }
    checkSeriesNodeClick() {
        const { lastPick } = this;
        if (lastPick && lastPick.event && lastPick.node) {
            const { event, datum } = lastPick;
            datum.series.fireNodeClickEvent(event, datum);
            return true;
        }
        return false;
    }
    onSeriesNodeClick(event) {
        this.fireEvent(Object.assign(Object.assign({}, event), { type: 'seriesNodeClick' }));
    }
    checkLegendClick(event) {
        const datum = this.legend.getDatumForPoint(event.offsetX, event.offsetY);
        if (datum) {
            const { id, itemId, enabled } = datum;
            const series = array_1.find(this.series, series => series.id === id);
            if (series) {
                series.toggleSeriesItem(itemId, !enabled);
                if (enabled) {
                    this.tooltip.toggle(false);
                }
                this.legend.fireEvent({
                    type: 'click',
                    event,
                    itemId,
                    enabled: !enabled
                });
                return true;
            }
        }
        return false;
    }
    handleLegendMouseMove(event) {
        if (!this.legend.enabled) {
            return;
        }
        const { offsetX, offsetY } = event;
        const datum = this.legend.getDatumForPoint(offsetX, offsetY);
        const pointerInsideLegend = this.legendBBox.containsPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerInsideLegend && this.pointerInsideLegend) {
            this.pointerInsideLegend = false;
            this.element.style.cursor = 'default';
            // Dehighlight if the pointer was inside the legend and is now leaving it.
            this.dehighlightDatum();
            return;
        }
        if (pointerOverLegendDatum && !this.pointerOverLegendDatum) {
            this.element.style.cursor = 'pointer';
        }
        if (!pointerOverLegendDatum && this.pointerOverLegendDatum) {
            this.element.style.cursor = 'default';
        }
        this.pointerInsideLegend = pointerInsideLegend;
        this.pointerOverLegendDatum = pointerOverLegendDatum;
        const oldHighlightedDatum = this.highlightedDatum;
        if (datum) {
            const { id, itemId, enabled } = datum;
            if (enabled) {
                const series = array_1.find(this.series, series => series.id === id);
                if (series) {
                    this.highlightedDatum = {
                        series,
                        itemId,
                        datum: undefined
                    };
                }
            }
        }
        // Careful to only schedule updates when necessary.
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (this.highlightedDatum && oldHighlightedDatum &&
                (this.highlightedDatum.series !== oldHighlightedDatum.series ||
                    this.highlightedDatum.itemId !== oldHighlightedDatum.itemId))) {
            this.series.forEach(s => s.updatePending = true);
        }
    }
    onSeriesDatumPick(meta, datum, node, event) {
        const { lastPick } = this;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
            this.dehighlightDatum();
        }
        this.lastPick = {
            datum,
            node,
            event
        };
        this.highlightDatum(datum);
        const html = datum.series.tooltip.enabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    }
    highlightDatum(datum) {
        this.element.style.cursor = datum.series.cursor;
        this.highlightedDatum = datum;
        this.series.forEach(s => s.updatePending = true);
    }
    dehighlightDatum() {
        if (this.highlightedDatum) {
            this.highlightedDatum = undefined;
            this.series.forEach(s => s.updatePending = true);
        }
    }
}
Chart.defaultTooltipClass = 'ag-chart-tooltip';
Chart.tooltipDocuments = [];
__decorate([
    observable_1.reactive('layoutChange')
], Chart.prototype, "title", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Chart.prototype, "subtitle", void 0);
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map