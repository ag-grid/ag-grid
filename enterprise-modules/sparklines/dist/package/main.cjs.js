var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// enterprise-modules/sparklines/src/main.ts
var main_exports = {};
__export(main_exports, {
  SparklinesModule: () => SparklinesModule
});
module.exports = __toCommonJS(main_exports);

// enterprise-modules/sparklines/src/sparklinesModule.ts
var import_core3 = require("@ag-grid-community/core");
var import_core4 = require("@ag-grid-enterprise/core");

// enterprise-modules/sparklines/src/sparklineCellRenderer.ts
var import_core = require("@ag-grid-community/core");

// enterprise-modules/sparklines/src/sparkline/area/areaSparkline.ts
var import_ag_charts_community3 = require("ag-charts-community");

// enterprise-modules/sparklines/src/sparkline/sparkline.ts
var import_ag_charts_community = require("ag-charts-community");

// enterprise-modules/sparklines/src/sparkline/tooltip/defaultTooltipCss.ts
var defaultTooltipCss = `
.ag-sparkline-tooltip-wrapper {
    position: absolute;
    user-select: none;
    pointer-events: none;
}

.ag-sparkline-tooltip {
    position: relative;
    font: 12px arial,sans-serif;
    border-radius: 2px;
    box-shadow: 0 1px 3px rgb(0 0 0 / 20%), 0 1px 1px rgb(0 0 0 / 14%);
    line-height: 1.7em;
    overflow: hidden;
    white-space: nowrap;
    z-index: 99999;
    background-color: rgb(255, 255, 255);
    color: rgba(0,0,0, 0.67);
}

.ag-sparkline-tooltip-content {
    padding: 0 7px;
    opacity: 1;
}

.ag-sparkline-tooltip-title {
    padding-left: 7px;
    opacity: 1;
}

.ag-sparkline-tooltip-wrapper-hidden {
    top: -10000px !important;
}

.ag-sparkline-wrapper {
    box-sizing: border-box;
    overflow: hidden;
}
`;

// enterprise-modules/sparklines/src/sparkline/sparkline.ts
var { extent, isNumber, isString, isStringObject, isDate, createId, Padding } = import_ag_charts_community._Util;
var { LinearScale, BandScale, TimeScale } = import_ag_charts_community._Scale;
var SparklineAxis = class {
  constructor() {
    this.type = "category";
    this.stroke = "rgb(204, 214, 235)";
    this.strokeWidth = 1;
  }
};
var _Sparkline = class _Sparkline {
  constructor() {
    this.id = createId(this);
    this.seriesRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this._context = void 0;
    this._container = void 0;
    this._data = void 0;
    this.padding = new Padding(3);
    this.xKey = "x";
    this.yKey = "y";
    this.dataType = void 0;
    this.xData = [];
    this.yData = [];
    // Minimum y value in provided data.
    this.min = void 0;
    // Maximum y value in provided data.
    this.max = void 0;
    this.yScale = new LinearScale();
    this.axis = new SparklineAxis();
    this.highlightStyle = {
      size: 6,
      fill: "yellow",
      stroke: "silver",
      strokeWidth: 1
    };
    this._width = 100;
    this._height = 100;
    this.smallestInterval = void 0;
    this.layoutId = 0;
    this.defaultDateFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    this._onMouseMove = this.onMouseMove.bind(this);
    this._onMouseOut = this.onMouseOut.bind(this);
    const root = new import_ag_charts_community._Scene.Group();
    this.rootGroup = root;
    const element = document.createElement("div");
    element.setAttribute("class", "ag-sparkline-wrapper");
    const scene = new import_ag_charts_community._Scene.Scene({});
    this.scene = scene;
    this.canvasElement = scene.canvas.element;
    scene.setRoot(root);
    scene.setContainer(element);
    this.resizeAndSetDimensions(this.width, this.height);
    if (!_Sparkline.tooltipDocuments.includes(document)) {
      this.initialiseTooltipStyles();
    }
    this.setupDomEventListeners(this.canvasElement);
  }
  set context(value) {
    if (this._context !== value) {
      this._context = value;
    }
  }
  get context() {
    return this._context;
  }
  set container(value) {
    if (this._container !== value) {
      const { parentNode } = this.canvasElement;
      if (parentNode != null) {
        parentNode.removeChild(this.canvasElement);
      }
      if (value) {
        value.appendChild(this.canvasElement);
      }
      this._container = value;
    }
  }
  get container() {
    return this._container;
  }
  set data(value) {
    if (this._data !== value) {
      this._data = value;
      this.processData();
      if (this.mouseMoveEvent && this.highlightedDatum) {
        this.updateHitPoint(this.mouseMoveEvent);
      }
    }
  }
  get data() {
    return this._data;
  }
  resizeAndSetDimensions(width, height) {
    this.scene.resize(width, height);
    this.seriesRect.width = width;
    this.seriesRect.height = height;
  }
  initialiseTooltipStyles() {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = defaultTooltipCss;
    document.head.insertBefore(styleElement, document.head.querySelector("style"));
    _Sparkline.tooltipDocuments.push(document);
  }
  set width(value) {
    if (this._width !== value) {
      this._width = value;
      this.scene.resize(value, this.height);
      this.scheduleLayout();
    }
  }
  get width() {
    return this._width;
  }
  set height(value) {
    if (this._height !== value) {
      this._height = value;
      this.scene.resize(this.width, value);
      this.scheduleLayout();
    }
  }
  get height() {
    return this._height;
  }
  /**
   * Generate node data from processed data.
   * Produce data joins.
   * Update selection's nodes using node data.
   */
  update() {
  }
  // Update y scale based on processed data.
  updateYScale() {
    this.updateYScaleRange();
    this.updateYScaleDomain();
  }
  // Update y scale domain based on processed data.
  updateYScaleDomain() {
  }
  // Update y scale range based on height and padding (seriesRect).
  updateYScaleRange() {
    const { yScale, seriesRect } = this;
    yScale.range = [seriesRect.height, 0];
  }
  // Update x scale based on processed data.
  updateXScale() {
    const { type } = this.axis;
    this.xScale = this.getXScale(type);
    this.updateXScaleRange();
    this.updateXScaleDomain();
  }
  // Update x scale range based on width and padding (seriesRect).
  updateXScaleRange() {
    this.xScale.range = [0, this.seriesRect.width];
  }
  // Update x scale domain based on processed data and type of scale.
  updateXScaleDomain() {
    const { xData, xScale } = this;
    let xMinMax;
    if (xScale instanceof LinearScale || xScale instanceof TimeScale) {
      xMinMax = extent(xData);
    }
    this.xScale.domain = xMinMax ? xMinMax.slice() : xData;
  }
  /**
   * Return xScale instance based on the provided type or return a `BandScale` by default.
   * The default type is `category`.
   * @param type
   */
  getXScale(type = "category") {
    switch (type) {
      case "number":
        return new LinearScale();
      case "time":
        return new TimeScale();
      case "category":
      default:
        return new BandScale();
    }
  }
  // Update axis line.
  updateAxisLine() {
  }
  // Update X and Y scales and the axis line.
  updateAxes() {
    this.updateYScale();
    this.updateXScale();
    this.updateAxisLine();
  }
  // Update horizontal and vertical crosshair lines.
  updateCrosshairs() {
    this.updateXCrosshairLine();
    this.updateYCrosshairLine();
  }
  // Using processed data, generate data that backs visible nodes.
  generateNodeData() {
    return [];
  }
  // Returns persisted node data associated with the sparkline's data.
  getNodeData() {
    return [];
  }
  // Update the selection's nodes.
  updateNodes() {
  }
  // Update the vertical crosshair line.
  updateXCrosshairLine() {
  }
  // Update the horizontal crosshair line.
  updateYCrosshairLine() {
  }
  highlightDatum(closestDatum) {
    this.updateNodes();
  }
  dehighlightDatum() {
    this.highlightedDatum = void 0;
    this.updateNodes();
    this.updateCrosshairs();
  }
  /**
   * Highlight closest datum and display tooltip if enabled.
   * Only update if necessary, i.e. only update if the highlighted datum is different from previously highlighted datum,
   * or if there is no previously highlighted datum.
   * @param event
   */
  onMouseMove(event) {
    this.mouseMoveEvent = event;
    this.updateHitPoint(event);
  }
  updateHitPoint(event) {
    var _a, _b, _c;
    const closestDatum = this.pickClosestSeriesNodeDatum(event.offsetX, event.offsetY);
    if (!closestDatum) {
      return;
    }
    const oldHighlightedDatum = this.highlightedDatum;
    this.highlightedDatum = closestDatum;
    if (this.highlightedDatum && !oldHighlightedDatum || this.highlightedDatum && oldHighlightedDatum && this.highlightedDatum !== oldHighlightedDatum) {
      this.highlightDatum(closestDatum);
      this.updateCrosshairs();
      this.scene.render().catch((e) => console.error(`AG Grid - chart rendering failed`, e));
    }
    const tooltipEnabled = (_c = (_b = (_a = this.processedOptions) == null ? void 0 : _a.tooltip) == null ? void 0 : _b.enabled) != null ? _c : true;
    if (tooltipEnabled) {
      this.handleTooltip(event, closestDatum);
    }
  }
  /**
   * Dehighlight all nodes and remove tooltip.
   * @param event
   */
  onMouseOut(event) {
    this.dehighlightDatum();
    this.tooltip.toggle(false);
    this.scene.render().catch((e) => console.error(`AG Grid - chart rendering failed`, e));
  }
  // Fetch required values from the data object and process them.
  processData() {
    const { data, yData, xData } = this;
    if (!data || this.invalidData(this.data)) {
      return;
    }
    yData.length = 0;
    xData.length = 0;
    const n = data.length;
    const dataType = this.getDataType(data);
    this.dataType = dataType;
    const { type: xValueType } = this.axis;
    const xType = xValueType !== "number" && xValueType !== "time" ? "category" : xValueType;
    const isContinuousX = xType === "number" || xType === "time";
    const setSmallestXInterval = (curr, prev) => {
      if (this.smallestInterval == void 0) {
        this.smallestInterval = { x: Infinity, y: Infinity };
      }
      const { x } = this.smallestInterval;
      const interval = Math.abs(curr - prev);
      if (interval > 0 && interval < x) {
        this.smallestInterval.x = interval;
      }
    };
    let prevX;
    if (dataType === "number") {
      for (let i = 0; i < n; i++) {
        const xDatum = i;
        const yDatum = data[i];
        const x = this.getDatum(xDatum, xType);
        const y = this.getDatum(yDatum, "number");
        if (isContinuousX) {
          setSmallestXInterval(x, prevX);
        }
        xData.push(x);
        yData.push(y);
        prevX = x;
      }
    } else if (dataType === "array") {
      for (let i = 0; i < n; i++) {
        const datum = data[i];
        if (Array.isArray(datum)) {
          const xDatum = datum[0];
          const yDatum = datum[1];
          const x = this.getDatum(xDatum, xType);
          const y = this.getDatum(yDatum, "number");
          if (x == void 0) {
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
    } else if (dataType === "object") {
      const { yKey, xKey } = this;
      for (let i = 0; i < n; i++) {
        const datum = data[i];
        if (typeof datum === "object" && !Array.isArray(datum)) {
          const xDatum = datum[xKey];
          const yDatum = datum[yKey];
          const x = this.getDatum(xDatum, xType);
          const y = this.getDatum(yDatum, "number");
          if (x == void 0) {
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
    this.updateAxes();
    this.immediateLayout();
  }
  /**
   * Return the type of data provided to the sparkline based on the first truthy value in the data array.
   * If the value is not a number, array or object, return `undefined`.
   * @param data
   */
  getDataType(data) {
    for (const datum of data) {
      if (datum != void 0) {
        if (isNumber(datum)) {
          return "number";
        } else if (Array.isArray(datum)) {
          return "array";
        } else if (typeof datum === "object") {
          return "object";
        }
      }
    }
  }
  /**
   * Return the given value depending on the type of axis.
   * Return `undefined` if the value is invalid for the given axis type.
   * @param value
   */
  getDatum(value, type) {
    if (type === "number" && isNumber(value) || type === "time" && (isNumber(value) || isDate(value))) {
      return value;
    } else if (type === "category") {
      if (isString(value) || isDate(value) || isNumber(value)) {
        return { toString: () => String(value) };
      } else if (isStringObject(value)) {
        return value;
      }
    }
  }
  /**
   * Only `true` while we are waiting for the layout to start.
   * This will be `false` if the layout has already started and is ongoing.
   */
  get layoutScheduled() {
    return !!this.layoutId;
  }
  /**
   * Execute update method on the next available screen repaint to make changes to the canvas.
   * If we are waiting for a layout to start and a new layout is requested,
   * cancel the previous layout using the non 0 integer (this.layoutId) returned from requestAnimationFrame.
   */
  scheduleLayout() {
    if (this.layoutId) {
      cancelAnimationFrame(this.layoutId);
    }
    this.layoutId = requestAnimationFrame(() => {
      this.immediateLayout();
      this.layoutId = 0;
    });
  }
  immediateLayout() {
    this.setSparklineDimensions();
    if (this.invalidData(this.data)) {
      return;
    }
    this.updateXScaleRange();
    this.updateYScaleRange();
    this.updateAxisLine();
    this.update();
    this.scene.render().catch((e) => console.error(`AG Grid - chart rendering failed`, e));
  }
  setSparklineDimensions() {
    const { width, height, padding, seriesRect, rootGroup } = this;
    const shrunkWidth = width - padding.left - padding.right;
    const shrunkHeight = height - padding.top - padding.bottom;
    seriesRect.width = shrunkWidth;
    seriesRect.height = shrunkHeight;
    seriesRect.x = padding.left;
    seriesRect.y = padding.top;
    rootGroup.translationX = seriesRect.x;
    rootGroup.translationY = seriesRect.y;
  }
  /**
   * Return the closest data point to x/y canvas coordinates.
   * @param x
   * @param y
   */
  pickClosestSeriesNodeDatum(x, y) {
    let minDistance = Infinity;
    let closestDatum;
    const hitPoint = this.rootGroup.transformPoint(x, y);
    const nodeData = this.getNodeData();
    for (let i = 0; i < nodeData.length; i++) {
      const datum = nodeData[i];
      if (!datum.point) {
        return;
      }
      const distance = this.getDistance(hitPoint, datum.point);
      if (distance <= minDistance) {
        minDistance = distance;
        closestDatum = datum;
      }
    }
    return closestDatum;
  }
  /**
   * Return the relevant distance between two points.
   * The distance will be calculated based on the x value of the points for all sparklines except bar sparkline, where the distance is based on the y values.
   * @param x
   * @param y
   */
  getDistance(p1, p2) {
    return Math.abs(p1.x - p2.x);
  }
  /**
   * calculate x/y coordinates for tooltip based on coordinates of highlighted datum, position of canvas and page offset.
   * @param datum
   */
  handleTooltip(event, datum) {
    var _a, _b;
    const { seriesDatum } = datum;
    const { canvasElement } = this;
    const { clientX, clientY } = event;
    const tooltipOptions = (_a = this.processedOptions) == null ? void 0 : _a.tooltip;
    const meta = {
      pageX: clientX,
      pageY: clientY,
      position: {
        xOffset: tooltipOptions == null ? void 0 : tooltipOptions.xOffset,
        yOffset: tooltipOptions == null ? void 0 : tooltipOptions.yOffset
      },
      container: tooltipOptions == null ? void 0 : tooltipOptions.container
    };
    if (meta.container == void 0) {
      meta.container = canvasElement;
    }
    const yValue = seriesDatum.y;
    const xValue = seriesDatum.x;
    let enabled = (_b = tooltipOptions == null ? void 0 : tooltipOptions.enabled) != null ? _b : true;
    const tooltipRenderer = tooltipOptions == null ? void 0 : tooltipOptions.renderer;
    if (tooltipRenderer) {
      const tooltipRendererResult = tooltipRenderer({
        context: this.context,
        datum: seriesDatum,
        yValue,
        xValue
      });
      enabled = typeof tooltipRendererResult !== "string" && tooltipRendererResult.enabled !== void 0 ? tooltipRendererResult.enabled : enabled;
    }
    const html = enabled && seriesDatum.y !== void 0 && this.getTooltipHtml(datum);
    if (html) {
      this.tooltip.show(meta, html);
    }
  }
  formatNumericDatum(datum) {
    return String(Math.round(datum * 10) / 10);
  }
  // locale.format('%m/%d/%y, %H:%M:%S');
  formatDatum(datum) {
    const type = this.axis.type || "category";
    if (type === "number" && typeof datum === "number") {
      return this.formatNumericDatum(datum);
    } else if (type === "time" && (datum instanceof Date || isNumber(datum))) {
      return this.defaultDateFormatter.format(datum);
    } else {
      return String(datum);
    }
  }
  setupDomEventListeners(chartElement) {
    chartElement.addEventListener("mousemove", this._onMouseMove);
    chartElement.addEventListener("mouseout", this._onMouseOut);
  }
  cleanupDomEventListeners(chartElement) {
    chartElement.removeEventListener("mousemove", this._onMouseMove);
    chartElement.removeEventListener("mouseout", this._onMouseOut);
  }
  invalidData(data) {
    return !data || !Array.isArray(data);
  }
  /**
   * Cleanup and remove canvas element from the DOM.
   */
  destroy() {
    this.cleanupDomEventListeners(this.canvasElement);
    this.scene.destroy();
    this.container = void 0;
  }
};
_Sparkline.tooltipDocuments = [];
var Sparkline = _Sparkline;

// enterprise-modules/sparklines/src/sparkline/tooltip/sparklineTooltip.ts
function toTooltipHtml(input, defaults) {
  var _a, _b, _c;
  if (typeof input === "string") {
    return input;
  }
  defaults = defaults != null ? defaults : {};
  const {
    content = (_a = defaults.content) != null ? _a : "",
    title = (_b = defaults.title) != null ? _b : void 0,
    color = defaults.color,
    backgroundColor = defaults.backgroundColor,
    opacity = (_c = defaults.opacity) != null ? _c : 1
  } = input;
  let titleHtml;
  let contentHtml;
  if (color) {
    titleHtml = title ? `<span class="${SparklineTooltip.class}-title"; style="color: ${color}">${title}</span>` : "";
    contentHtml = `<span class="${SparklineTooltip.class}-content" style="color: ${color}">${content}</span>`;
  } else {
    titleHtml = title ? `<span class="${SparklineTooltip.class}-title">${title}</span>` : "";
    contentHtml = `<span class="${SparklineTooltip.class}-content">${content}</span>`;
  }
  let style = `opacity: ${opacity}`;
  if (backgroundColor) {
    style += `; background-color: ${backgroundColor.toLowerCase()}`;
  }
  return `<div class="${SparklineTooltip.class}" style="${style}">
                ${titleHtml}
                ${contentHtml}
            </div>`;
}
var _SparklineTooltip = class _SparklineTooltip {
  constructor() {
    this.element = document.createElement("div");
    const tooltipRoot = document.body;
    tooltipRoot.appendChild(this.element);
  }
  isVisible() {
    const { element } = this;
    if (element.classList) {
      return !element.classList.contains(`${_SparklineTooltip.class}-wrapper-hidden`);
    }
    const classes = element.getAttribute("class");
    if (classes) {
      return classes.split(" ").indexOf(`${_SparklineTooltip.class}-wrapper-hidden`) < 0;
    }
    return false;
  }
  updateClass(visible) {
    const classList = [`${_SparklineTooltip.class}-wrapper`];
    if (visible !== true) {
      classList.push(`${_SparklineTooltip.class}-wrapper-hidden`);
    }
    this.element.setAttribute("class", classList.join(" "));
  }
  show(meta, html) {
    var _a, _b, _c, _d;
    this.toggle(false);
    const { element } = this;
    if (html !== void 0) {
      element.innerHTML = html;
    } else if (!element.innerHTML) {
      return;
    }
    const xOffset = (_b = (_a = meta.position) == null ? void 0 : _a.xOffset) != null ? _b : 10;
    const yOffset = (_d = (_c = meta.position) == null ? void 0 : _c.yOffset) != null ? _d : 0;
    let left = meta.pageX + xOffset;
    let top = meta.pageY + yOffset;
    const tooltipRect = element.getBoundingClientRect();
    let maxLeft = window.innerWidth - tooltipRect.width;
    if (meta.container) {
      const containerRect = meta.container.getBoundingClientRect();
      maxLeft = containerRect.left + (containerRect.width - tooltipRect.width);
    }
    if (left > maxLeft) {
      left = meta.pageX - element.clientWidth - xOffset;
    }
    if (typeof scrollX !== "undefined") {
      left += scrollX;
    }
    if (typeof scrollY !== "undefined") {
      top += scrollY;
    }
    element.style.left = `${Math.round(left)}px`;
    element.style.top = `${Math.round(top)}px`;
    this.toggle(true);
  }
  toggle(visible) {
    this.updateClass(visible);
  }
  destroy() {
    const { parentNode } = this.element;
    if (parentNode) {
      parentNode.removeChild(this.element);
    }
  }
};
_SparklineTooltip.class = "ag-sparkline-tooltip";
var SparklineTooltip = _SparklineTooltip;

// enterprise-modules/sparklines/src/sparkline/marker/markerFactory.ts
var import_ag_charts_community2 = require("ag-charts-community");
function getMarker(shape) {
  switch (shape) {
    case "circle":
      return import_ag_charts_community2._Scene.Circle;
    case "square":
      return import_ag_charts_community2._Scene.Square;
    case "diamond":
      return import_ag_charts_community2._Scene.Diamond;
    default:
      return import_ag_charts_community2._Scene.Circle;
  }
}

// enterprise-modules/sparklines/src/util/lineDash.ts
function getLineDash(lineCap, lineDash = "solid") {
  const buttOrNull = {
    solid: [],
    dash: [4, 3],
    dot: [1, 3],
    dashDot: [4, 3, 1, 3],
    dashDotDot: [4, 3, 1, 3, 1, 3],
    shortDot: [1, 1],
    shortDash: [3, 1],
    shortDashDot: [3, 1, 1, 1],
    shortDashDotDot: [3, 1, 1, 1, 1, 1],
    longDash: [8, 3],
    longDashDot: [8, 3, 1, 3],
    longDashDotDot: [8, 3, 1, 3, 1, 3]
  };
  const roundOrSquare = {
    solid: [],
    dash: [3, 3],
    dot: [0, 3],
    dashDot: [3, 3, 0, 3],
    dashDotDot: [3, 3, 0, 3, 0, 3],
    shortDot: [0, 2],
    shortDash: [2, 2],
    shortDashDot: [2, 2, 0, 2],
    shortDashDotDot: [2, 2, 0, 2, 0, 2],
    longDash: [7, 3],
    longDashDot: [7, 3, 0, 3],
    longDashDotDot: [7, 3, 0, 3, 0, 3]
  };
  if (lineCap === "round" || lineCap === "square") {
    if (roundOrSquare[lineDash] == void 0) {
      console.warn(`'${lineDash}' is not a valid 'lineDash' option.`);
      return roundOrSquare.solid;
    }
    return roundOrSquare[lineDash];
  }
  if (buttOrNull[lineDash] == void 0) {
    console.warn(`'${lineDash}' is not a valid 'lineDash' option.`);
    return buttOrNull.solid;
  }
  return buttOrNull[lineDash];
}

// enterprise-modules/sparklines/src/sparkline/area/areaSparkline.ts
var { extent: extent2 } = import_ag_charts_community3._Util;
var { BandScale: BandScale2 } = import_ag_charts_community3._Scale;
var SparklineMarker = class {
  constructor() {
    this.enabled = true;
    this.shape = "circle";
    this.size = 0;
    this.fill = "rgb(124, 181, 236)";
    this.stroke = "rgb(124, 181, 236)";
    this.strokeWidth = 1;
    this.formatter = void 0;
  }
};
var SparklineLine = class {
  constructor() {
    this.stroke = "rgb(124, 181, 236)";
    this.strokeWidth = 1;
  }
};
var SparklineCrosshairs = class {
  constructor() {
    this.xLine = {
      enabled: true,
      stroke: "rgba(0,0,0, 0.54)",
      strokeWidth: 1,
      lineDash: "solid",
      lineCap: void 0
    };
    this.yLine = {
      enabled: false,
      stroke: "rgba(0,0,0, 0.54)",
      strokeWidth: 1,
      lineDash: "solid",
      lineCap: void 0
    };
  }
};
var AreaSparkline = class extends Sparkline {
  constructor() {
    super();
    this.fill = "rgba(124, 181, 236, 0.25)";
    this.strokePath = new import_ag_charts_community3._Scene.Path();
    this.fillPath = new import_ag_charts_community3._Scene.Path();
    this.xCrosshairLine = new import_ag_charts_community3._Scene.Line();
    this.yCrosshairLine = new import_ag_charts_community3._Scene.Line();
    this.areaSparklineGroup = new import_ag_charts_community3._Scene.Group();
    this.xAxisLine = new import_ag_charts_community3._Scene.Line();
    this.markers = new import_ag_charts_community3._Scene.Group();
    this.markerSelection = import_ag_charts_community3._Scene.Selection.select(
      this.markers,
      () => this.markerFactory()
    );
    this.markerSelectionData = [];
    this.marker = new SparklineMarker();
    this.line = new SparklineLine();
    this.crosshairs = new SparklineCrosshairs();
    this.rootGroup.append(this.areaSparklineGroup);
    this.xAxisLine.zIndex = 500 /* AXIS_LINE_ZINDEX */;
    this.fillPath.zIndex = 50 /* SERIES_FILL_ZINDEX */;
    this.strokePath.zIndex = 1e3 /* SERIES_STROKE_ZINDEX */;
    this.xCrosshairLine.zIndex = 2e3 /* CROSSHAIR_ZINDEX */;
    this.yCrosshairLine.zIndex = 2e3 /* CROSSHAIR_ZINDEX */;
    this.markers.zIndex = 2500 /* SERIES_MARKERS_ZINDEX */;
    this.areaSparklineGroup.append([
      this.fillPath,
      this.xAxisLine,
      this.strokePath,
      this.xCrosshairLine,
      this.yCrosshairLine,
      this.markers
    ]);
  }
  markerFactory() {
    const { shape } = this.marker;
    const MarkerShape = getMarker(shape);
    return new MarkerShape();
  }
  getNodeData() {
    return this.markerSelectionData;
  }
  update() {
    const data = this.generateNodeData();
    if (!data) {
      return;
    }
    const { nodeData, fillData, strokeData } = data;
    this.markerSelectionData = nodeData;
    this.updateSelection(nodeData);
    this.updateNodes();
    this.updateStroke(strokeData);
    this.updateFill(fillData);
  }
  updateYScaleDomain() {
    const { yData, yScale } = this;
    const yMinMax = extent2(yData);
    let yMin = 0;
    let yMax = 1;
    if (yMinMax !== void 0) {
      yMin = this.min = yMinMax[0];
      yMax = this.max = yMinMax[1];
    }
    yMin = yMin < 0 ? yMin : 0;
    yMax = yMax < 0 ? 0 : yMax;
    yScale.domain = [yMin, yMax];
  }
  generateNodeData() {
    const { data, yData, xData, xScale, yScale } = this;
    if (!data) {
      return;
    }
    const continuous = !(xScale instanceof BandScale2);
    const offsetX = !continuous ? xScale.bandwidth / 2 : 0;
    const n = yData.length;
    const nodeData = [];
    const fillData = [];
    const strokeData = [];
    let firstValidX;
    let lastValidX;
    let previousX;
    let nextX;
    const yZero = yScale.convert(0);
    for (let i = 0; i < n; i++) {
      const yDatum = yData[i];
      const xDatum = xData[i];
      const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
      const y = yDatum === void 0 ? NaN : yScale.convert(yDatum);
      if (i + 1 < n) {
        nextX = xScale.convert(continuous ? xScale.toDomain(xData[i + 1]) : xData[i + 1]) + offsetX;
      }
      strokeData.push({
        seriesDatum: { x: xDatum, y: yDatum },
        point: { x, y }
      });
      if (yDatum === void 0 && previousX !== void 0) {
        fillData.push({ seriesDatum: void 0, point: { x: previousX, y: yZero } });
        if (nextX !== void 0) {
          fillData.push({ seriesDatum: void 0, point: { x: nextX, y: yZero } });
        }
      } else if (yDatum !== void 0) {
        fillData.push({
          seriesDatum: { x: xDatum, y: yDatum },
          point: { x, y }
        });
        nodeData.push({
          seriesDatum: { x: xDatum, y: yDatum },
          point: { x, y }
        });
        firstValidX = firstValidX !== void 0 ? firstValidX : x;
        lastValidX = x;
      }
      previousX = x;
    }
    fillData.push(
      { seriesDatum: void 0, point: { x: lastValidX, y: yZero } },
      { seriesDatum: void 0, point: { x: firstValidX, y: yZero } }
    );
    return { nodeData, fillData, strokeData };
  }
  updateAxisLine() {
    const { xScale, yScale, axis, xAxisLine } = this;
    xAxisLine.x1 = xScale.range[0];
    xAxisLine.x2 = xScale.range[1];
    xAxisLine.y1 = xAxisLine.y2 = 0;
    xAxisLine.stroke = axis.stroke;
    xAxisLine.strokeWidth = axis.strokeWidth;
    const yZero = yScale.convert(0);
    xAxisLine.translationY = yZero;
  }
  updateSelection(selectionData) {
    this.markerSelection.update(selectionData);
  }
  updateNodes() {
    const { highlightedDatum, highlightStyle, marker } = this;
    const {
      size: highlightSize,
      fill: highlightFill,
      stroke: highlightStroke,
      strokeWidth: highlightStrokeWidth
    } = highlightStyle;
    const markerFormatter = marker.formatter;
    this.markerSelection.each((node, datum, index) => {
      const { point, seriesDatum } = datum;
      if (!point) {
        return;
      }
      const highlighted = datum === highlightedDatum;
      const markerFill = highlighted && highlightFill !== void 0 ? highlightFill : marker.fill;
      const markerStroke = highlighted && highlightStroke !== void 0 ? highlightStroke : marker.stroke;
      const markerStrokeWidth = highlighted && highlightStrokeWidth !== void 0 ? highlightStrokeWidth : marker.strokeWidth;
      const markerSize = highlighted && highlightSize !== void 0 ? highlightSize : marker.size;
      let markerFormat;
      if (markerFormatter) {
        const first = index === 0;
        const last = index === this.markerSelectionData.length - 1;
        const min = seriesDatum.y === this.min;
        const max = seriesDatum.y === this.max;
        markerFormat = markerFormatter({
          datum,
          xValue: seriesDatum.x,
          yValue: seriesDatum.y,
          min,
          max,
          first,
          last,
          fill: markerFill,
          stroke: markerStroke,
          strokeWidth: markerStrokeWidth,
          size: markerSize,
          highlighted
        });
      }
      node.size = markerFormat && markerFormat.size != void 0 ? markerFormat.size : markerSize;
      node.fill = markerFormat && markerFormat.fill != void 0 ? markerFormat.fill : markerFill;
      node.stroke = markerFormat && markerFormat.stroke != void 0 ? markerFormat.stroke : markerStroke;
      node.strokeWidth = markerFormat && markerFormat.strokeWidth != void 0 ? markerFormat.strokeWidth : markerStrokeWidth;
      node.translationX = point.x;
      node.translationY = point.y;
      node.visible = markerFormat && markerFormat.enabled != void 0 ? markerFormat.enabled : marker.enabled && node.size > 0;
    });
  }
  updateStroke(strokeData) {
    const { strokePath, yData, line } = this;
    const path = strokePath.path;
    path.clear();
    if (yData.length < 2) {
      return;
    }
    const n = strokeData.length;
    let moveTo = true;
    for (let i = 0; i < n; i++) {
      const { point, seriesDatum } = strokeData[i];
      const x = point.x;
      const y = point.y;
      if (seriesDatum.y == void 0) {
        moveTo = true;
      } else {
        if (moveTo) {
          path.moveTo(x, y);
          moveTo = false;
        } else {
          path.lineTo(x, y);
        }
      }
    }
    strokePath.lineJoin = strokePath.lineCap = "round";
    strokePath.fill = void 0;
    strokePath.stroke = line.stroke;
    strokePath.strokeWidth = line.strokeWidth;
  }
  updateFill(areaData) {
    const { fillPath, yData, fill } = this;
    const path = fillPath.path;
    const n = areaData.length;
    path.clear();
    if (yData.length < 2) {
      return;
    }
    for (let i = 0; i < n; i++) {
      const { point } = areaData[i];
      const x = point.x;
      const y = point.y;
      if (i > 0) {
        path.lineTo(x, y);
      } else {
        path.moveTo(x, y);
      }
    }
    path.closePath();
    fillPath.lineJoin = "round";
    fillPath.stroke = void 0;
    fillPath.fill = fill;
  }
  updateXCrosshairLine() {
    var _a;
    const {
      yScale,
      xCrosshairLine,
      highlightedDatum,
      crosshairs: { xLine }
    } = this;
    if (!xLine.enabled || highlightedDatum == void 0) {
      xCrosshairLine.strokeWidth = 0;
      return;
    }
    xCrosshairLine.y1 = yScale.range[0];
    xCrosshairLine.y2 = yScale.range[1];
    xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
    xCrosshairLine.stroke = xLine.stroke;
    xCrosshairLine.strokeWidth = (_a = xLine.strokeWidth) != null ? _a : 1;
    xCrosshairLine.lineCap = xLine.lineCap === "round" || xLine.lineCap === "square" ? xLine.lineCap : void 0;
    const { lineDash } = xLine;
    xCrosshairLine.lineDash = Array.isArray(lineDash) ? lineDash : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
    xCrosshairLine.translationX = highlightedDatum.point.x;
  }
  updateYCrosshairLine() {
    var _a;
    const {
      xScale,
      yCrosshairLine,
      highlightedDatum,
      crosshairs: { yLine }
    } = this;
    if (!yLine.enabled || highlightedDatum == void 0) {
      yCrosshairLine.strokeWidth = 0;
      return;
    }
    yCrosshairLine.x1 = xScale.range[0];
    yCrosshairLine.x2 = xScale.range[1];
    yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
    yCrosshairLine.stroke = yLine.stroke;
    yCrosshairLine.strokeWidth = (_a = yLine.strokeWidth) != null ? _a : 1;
    yCrosshairLine.lineCap = yLine.lineCap === "round" || yLine.lineCap === "square" ? yLine.lineCap : void 0;
    const { lineDash } = yLine;
    yCrosshairLine.lineDash = Array.isArray(lineDash) ? lineDash : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
    yCrosshairLine.translationY = highlightedDatum.point.y;
  }
  getTooltipHtml(datum) {
    var _a, _b;
    const { dataType } = this;
    const { seriesDatum } = datum;
    const yValue = seriesDatum.y;
    const xValue = seriesDatum.x;
    const content = this.formatNumericDatum(yValue);
    const title = dataType === "array" || dataType === "object" ? this.formatDatum(xValue) : void 0;
    const defaults = {
      content,
      title
    };
    const tooltipRenderer = (_b = (_a = this.processedOptions) == null ? void 0 : _a.tooltip) == null ? void 0 : _b.renderer;
    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          context: this.context,
          datum: seriesDatum,
          yValue,
          xValue
        }),
        defaults
      );
    }
    return toTooltipHtml(defaults);
  }
};
AreaSparkline.className = "AreaSparkline";

// enterprise-modules/sparklines/src/sparkline/line/lineSparkline.ts
var import_ag_charts_community4 = require("ag-charts-community");
var { extent: extent3 } = import_ag_charts_community4._Util;
var { BandScale: BandScale3 } = import_ag_charts_community4._Scale;
var SparklineMarker2 = class {
  constructor() {
    this.enabled = true;
    this.shape = "circle";
    this.size = 0;
    this.fill = "rgb(124, 181, 236)";
    this.stroke = "rgb(124, 181, 236)";
    this.strokeWidth = 1;
    this.formatter = void 0;
  }
};
var SparklineLine2 = class {
  constructor() {
    this.stroke = "rgb(124, 181, 236)";
    this.strokeWidth = 1;
  }
};
var SparklineCrosshairs2 = class {
  constructor() {
    this.xLine = {
      enabled: true,
      stroke: "rgba(0,0,0, 0.54)",
      strokeWidth: 1,
      lineDash: "solid",
      lineCap: void 0
    };
    this.yLine = {
      enabled: false,
      stroke: "rgba(0,0,0, 0.54)",
      strokeWidth: 1,
      lineDash: "solid",
      lineCap: void 0
    };
  }
};
var LineSparkline = class extends Sparkline {
  constructor() {
    super();
    this.linePath = new import_ag_charts_community4._Scene.Path();
    this.xCrosshairLine = new import_ag_charts_community4._Scene.Line();
    this.yCrosshairLine = new import_ag_charts_community4._Scene.Line();
    this.lineSparklineGroup = new import_ag_charts_community4._Scene.Group();
    this.markers = new import_ag_charts_community4._Scene.Group();
    this.markerSelection = import_ag_charts_community4._Scene.Selection.select(
      this.markers,
      () => this.markerFactory()
    );
    this.markerSelectionData = [];
    this.marker = new SparklineMarker2();
    this.line = new SparklineLine2();
    this.crosshairs = new SparklineCrosshairs2();
    this.rootGroup.append(this.lineSparklineGroup);
    this.linePath.zIndex = 1e3 /* SERIES_STROKE_ZINDEX */;
    this.xCrosshairLine.zIndex = 2e3 /* CROSSHAIR_ZINDEX */;
    this.yCrosshairLine.zIndex = 2e3 /* CROSSHAIR_ZINDEX */;
    this.markers.zIndex = 2500 /* SERIES_MARKERS_ZINDEX */;
    this.lineSparklineGroup.append([this.linePath, this.xCrosshairLine, this.yCrosshairLine, this.markers]);
  }
  getNodeData() {
    return this.markerSelectionData;
  }
  markerFactory() {
    const { shape } = this.marker;
    const MarkerShape = getMarker(shape);
    return new MarkerShape();
  }
  /**
   * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
   */
  onMarkerShapeChange() {
    this.markerSelection = this.markerSelection.clear();
    this.scheduleLayout();
  }
  update() {
    const nodeData = this.generateNodeData();
    if (!nodeData) {
      return;
    }
    this.markerSelectionData = nodeData;
    this.updateSelection(nodeData);
    this.updateNodes();
    this.updateLine();
  }
  updateYScaleDomain() {
    const { yData, yScale } = this;
    const yMinMax = extent3(yData);
    let yMin = 0;
    let yMax = 1;
    if (yMinMax !== void 0) {
      yMin = this.min = yMinMax[0];
      yMax = this.max = yMinMax[1];
    }
    if (yMin === yMax) {
      const padding = Math.abs(yMin * 0.01);
      yMin -= padding;
      yMax += padding;
    }
    yScale.domain = [yMin, yMax];
  }
  generateNodeData() {
    const { data, yData, xData, xScale, yScale } = this;
    if (!data) {
      return;
    }
    const continuous = !(xScale instanceof BandScale3);
    const offsetX = !continuous ? xScale.bandwidth / 2 : 0;
    const nodeData = [];
    for (let i = 0; i < yData.length; i++) {
      const yDatum = yData[i];
      const xDatum = xData[i];
      if (yDatum == void 0) {
        continue;
      }
      const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
      const y = yDatum === void 0 ? NaN : yScale.convert(yDatum);
      nodeData.push({
        seriesDatum: { x: xDatum, y: yDatum },
        point: { x, y }
      });
    }
    return nodeData;
  }
  updateSelection(selectionData) {
    this.markerSelection.update(selectionData);
  }
  updateNodes() {
    const { highlightedDatum, highlightStyle, marker } = this;
    const {
      size: highlightSize,
      fill: highlightFill,
      stroke: highlightStroke,
      strokeWidth: highlightStrokeWidth
    } = highlightStyle;
    const markerFormatter = marker.formatter;
    this.markerSelection.each((node, datum, index) => {
      const highlighted = datum === highlightedDatum;
      const markerFill = highlighted && highlightFill !== void 0 ? highlightFill : marker.fill;
      const markerStroke = highlighted && highlightStroke !== void 0 ? highlightStroke : marker.stroke;
      const markerStrokeWidth = highlighted && highlightStrokeWidth !== void 0 ? highlightStrokeWidth : marker.strokeWidth;
      const markerSize = highlighted && highlightSize !== void 0 ? highlightSize : marker.size;
      let markerFormat;
      const { seriesDatum, point } = datum;
      if (markerFormatter) {
        const first = index === 0;
        const last = index === this.markerSelectionData.length - 1;
        const min = seriesDatum.y === this.min;
        const max = seriesDatum.y === this.max;
        markerFormat = markerFormatter({
          datum,
          xValue: seriesDatum.x,
          yValue: seriesDatum.y,
          min,
          max,
          first,
          last,
          fill: markerFill,
          stroke: markerStroke,
          strokeWidth: markerStrokeWidth,
          size: markerSize,
          highlighted
        });
      }
      node.size = markerFormat && markerFormat.size != void 0 ? markerFormat.size : markerSize;
      node.fill = markerFormat && markerFormat.fill != void 0 ? markerFormat.fill : markerFill;
      node.stroke = markerFormat && markerFormat.stroke != void 0 ? markerFormat.stroke : markerStroke;
      node.strokeWidth = markerFormat && markerFormat.strokeWidth != void 0 ? markerFormat.strokeWidth : markerStrokeWidth;
      node.translationX = point.x;
      node.translationY = point.y;
      node.visible = markerFormat && markerFormat.enabled != void 0 ? markerFormat.enabled : marker.enabled && node.size > 0;
    });
  }
  updateLine() {
    const { linePath, yData, xData, xScale, yScale, line } = this;
    const path = linePath.path;
    path.clear();
    if (yData.length < 2) {
      return;
    }
    const continuous = !(xScale instanceof BandScale3);
    const n = yData.length;
    const offsetX = !continuous ? xScale.bandwidth / 2 : 0;
    let moveTo = true;
    for (let i = 0; i < n; i++) {
      const xDatum = xData[i];
      const yDatum = yData[i];
      const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
      const y = yDatum === void 0 ? NaN : yScale.convert(yDatum);
      if (yDatum == void 0) {
        moveTo = true;
      } else {
        if (moveTo) {
          path.moveTo(x, y);
          moveTo = false;
        } else {
          path.lineTo(x, y);
        }
      }
    }
    linePath.fill = void 0;
    linePath.stroke = line.stroke;
    linePath.strokeWidth = line.strokeWidth;
  }
  updateXCrosshairLine() {
    var _a;
    const {
      yScale,
      xCrosshairLine,
      highlightedDatum,
      crosshairs: { xLine }
    } = this;
    if (!xLine.enabled || highlightedDatum == void 0) {
      xCrosshairLine.strokeWidth = 0;
      return;
    }
    xCrosshairLine.y1 = yScale.range[0];
    xCrosshairLine.y2 = yScale.range[1];
    xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
    xCrosshairLine.stroke = xLine.stroke;
    xCrosshairLine.strokeWidth = (_a = xLine.strokeWidth) != null ? _a : 1;
    xCrosshairLine.lineCap = xLine.lineCap === "round" || xLine.lineCap === "square" ? xLine.lineCap : void 0;
    const { lineDash } = xLine;
    xCrosshairLine.lineDash = Array.isArray(lineDash) ? lineDash : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
    xCrosshairLine.translationX = highlightedDatum.point.x;
  }
  updateYCrosshairLine() {
    var _a;
    const {
      xScale,
      yCrosshairLine,
      highlightedDatum,
      crosshairs: { yLine }
    } = this;
    if (!yLine.enabled || highlightedDatum == void 0) {
      yCrosshairLine.strokeWidth = 0;
      return;
    }
    yCrosshairLine.x1 = xScale.range[0];
    yCrosshairLine.x2 = xScale.range[1];
    yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
    yCrosshairLine.stroke = yLine.stroke;
    yCrosshairLine.strokeWidth = (_a = yLine.strokeWidth) != null ? _a : 1;
    yCrosshairLine.lineCap = yLine.lineCap === "round" || yLine.lineCap === "square" ? yLine.lineCap : void 0;
    const { lineDash } = yLine;
    yCrosshairLine.lineDash = Array.isArray(lineDash) ? lineDash : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
    yCrosshairLine.translationY = highlightedDatum.point.y;
  }
  getTooltipHtml(datum) {
    var _a, _b;
    const { dataType } = this;
    const { seriesDatum } = datum;
    const yValue = seriesDatum.y;
    const xValue = seriesDatum.x;
    const content = this.formatNumericDatum(yValue);
    const title = dataType === "array" || dataType === "object" ? this.formatDatum(xValue) : void 0;
    const defaults = {
      content,
      title
    };
    const tooltipRenderer = (_b = (_a = this.processedOptions) == null ? void 0 : _a.tooltip) == null ? void 0 : _b.renderer;
    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          context: this.context,
          datum: seriesDatum,
          yValue,
          xValue
        }),
        defaults
      );
    }
    return toTooltipHtml(defaults);
  }
};
LineSparkline.className = "LineSparkline";

// enterprise-modules/sparklines/src/sparkline/bar-column/barSparkline.ts
var import_ag_charts_community6 = require("ag-charts-community");

// enterprise-modules/sparklines/src/sparkline/bar-column/barColumnSparkline.ts
var import_ag_charts_community5 = require("ag-charts-community");

// enterprise-modules/sparklines/src/sparkline/label/label.ts
var Label = class {
  constructor() {
    this.enabled = true;
    this.fontSize = 8;
    this.fontFamily = "Verdana, sans-serif";
    this.fontStyle = void 0;
    this.fontWeight = void 0;
    this.color = "rgba(70, 70, 70, 1)";
  }
};

// enterprise-modules/sparklines/src/sparkline/bar-column/barColumnSparkline.ts
var { extent: extent4 } = import_ag_charts_community5._Util;
var BarColumnLabel = class extends Label {
  constructor() {
    super(...arguments);
    this.formatter = void 0;
    this.placement = "insideEnd" /* InsideEnd */;
  }
};
var BarColumnSparkline = class extends Sparkline {
  constructor() {
    super();
    this.fill = "rgb(124, 181, 236)";
    this.stroke = "silver";
    this.strokeWidth = 0;
    this.paddingInner = 0.1;
    this.paddingOuter = 0.2;
    this.valueAxisDomain = void 0;
    this.formatter = void 0;
    this.axisLine = new import_ag_charts_community5._Scene.Line();
    this.bandWidth = 0;
    this.sparklineGroup = new import_ag_charts_community5._Scene.Group();
    this.rectGroup = new import_ag_charts_community5._Scene.Group();
    this.labelGroup = new import_ag_charts_community5._Scene.Group();
    this.rectSelection = import_ag_charts_community5._Scene.Selection.select(
      this.rectGroup,
      import_ag_charts_community5._Scene.Rect
    );
    this.labelSelection = import_ag_charts_community5._Scene.Selection.select(
      this.labelGroup,
      import_ag_charts_community5._Scene.Text
    );
    this.nodeSelectionData = [];
    this.label = new BarColumnLabel();
    this.rootGroup.append(this.sparklineGroup);
    this.rectGroup.zIndex = 50 /* SERIES_FILL_ZINDEX */;
    this.axisLine.zIndex = 500 /* AXIS_LINE_ZINDEX */;
    this.labelGroup.zIndex = 1500 /* SERIES_LABEL_ZINDEX */;
    this.sparklineGroup.append([this.rectGroup, this.axisLine, this.labelGroup]);
    this.axisLine.lineCap = "round";
    this.label.enabled = false;
  }
  getNodeData() {
    return this.nodeSelectionData;
  }
  update() {
    this.updateSelections();
    this.updateNodes();
  }
  updateSelections() {
    const nodeData = this.generateNodeData();
    if (!nodeData) {
      return;
    }
    this.nodeSelectionData = nodeData;
    this.updateRectSelection(nodeData);
    this.updateLabelSelection(nodeData);
  }
  updateNodes() {
    this.updateRectNodes();
    this.updateLabelNodes();
  }
  calculateStep(range) {
    var _a;
    const { xScale, paddingInner, paddingOuter, smallestInterval } = this;
    let domainLength = xScale.domain[1] - xScale.domain[0];
    let intervals = domainLength / ((_a = smallestInterval == null ? void 0 : smallestInterval.x) != null ? _a : 1) + 1;
    const maxBands = 50;
    const bands = Math.min(intervals, maxBands);
    const gaps = bands - 1;
    const step = range / Math.max(1, 2 * paddingOuter + gaps * paddingInner + bands);
    return step;
  }
  updateYScaleDomain() {
    const { yScale, yData, valueAxisDomain } = this;
    const yMinMax = extent4(yData);
    let yMin = 0;
    let yMax = 1;
    if (yMinMax !== void 0) {
      yMin = this.min = yMinMax[0];
      yMax = this.max = yMinMax[1];
    }
    yMin = yMin < 0 ? yMin : 0;
    yMax = yMax < 0 ? 0 : yMax;
    if (valueAxisDomain) {
      if (valueAxisDomain[1] < yMax) {
        valueAxisDomain[1] = yMax;
      }
      if (valueAxisDomain[0] > yMin) {
        valueAxisDomain[0] = yMin;
      }
    }
    yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
  }
  updateRectSelection(selectionData) {
    this.rectSelection.update(selectionData);
  }
  updateRectNodes() {
    const { highlightedDatum, formatter: nodeFormatter, fill, stroke, strokeWidth } = this;
    const { fill: highlightFill, stroke: highlightStroke, strokeWidth: highlightStrokeWidth } = this.highlightStyle;
    this.rectSelection.each((node, datum, index) => {
      const highlighted = datum === highlightedDatum;
      const nodeFill = highlighted && highlightFill !== void 0 ? highlightFill : fill;
      const nodeStroke = highlighted && highlightStroke !== void 0 ? highlightStroke : stroke;
      const nodeStrokeWidth = highlighted && highlightStrokeWidth !== void 0 ? highlightStrokeWidth : strokeWidth;
      let nodeFormat;
      const { x, y, width, height, seriesDatum } = datum;
      if (nodeFormatter) {
        const first = index === 0;
        const last = index === this.nodeSelectionData.length - 1;
        const min = seriesDatum.y === this.min;
        const max = seriesDatum.y === this.max;
        nodeFormat = nodeFormatter({
          datum,
          xValue: seriesDatum.x,
          yValue: seriesDatum.y,
          width,
          height,
          min,
          max,
          first,
          last,
          fill: nodeFill,
          stroke: nodeStroke,
          strokeWidth: nodeStrokeWidth,
          highlighted
        });
      }
      node.fill = nodeFormat && nodeFormat.fill || nodeFill;
      node.stroke = nodeFormat && nodeFormat.stroke || nodeStroke;
      node.strokeWidth = nodeFormat && nodeFormat.strokeWidth || nodeStrokeWidth;
      node.x = node.y = 0;
      node.width = width;
      node.height = height;
      node.visible = node.height > 0;
      node.translationX = x;
      node.translationY = y;
    });
  }
  updateLabelSelection(selectionData) {
    this.labelSelection.update(selectionData, (text) => {
      text.tag = 1 /* Label */;
      text.pointerEvents = import_ag_charts_community5._Scene.PointerEvents.None;
    });
  }
  updateLabelNodes() {
    const {
      label: { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color }
    } = this;
    this.labelSelection.each((text, datum) => {
      const label = datum.label;
      if (label && labelEnabled) {
        text.fontStyle = fontStyle;
        text.fontWeight = fontWeight;
        text.fontSize = fontSize;
        text.fontFamily = fontFamily;
        text.textAlign = label.textAlign;
        text.textBaseline = label.textBaseline;
        text.text = label.text;
        text.x = label.x;
        text.y = label.y;
        text.fill = color;
        text.visible = true;
      } else {
        text.visible = false;
      }
    });
  }
  getTooltipHtml(datum) {
    var _a, _b;
    const { dataType } = this;
    const { seriesDatum } = datum;
    const yValue = seriesDatum.y;
    const xValue = seriesDatum.x;
    const content = this.formatNumericDatum(yValue);
    const title = dataType === "array" || dataType === "object" ? this.formatDatum(xValue) : void 0;
    const defaults = {
      content,
      title
    };
    const tooltipRenderer = (_b = (_a = this.processedOptions) == null ? void 0 : _a.tooltip) == null ? void 0 : _b.renderer;
    if (tooltipRenderer) {
      return toTooltipHtml(
        tooltipRenderer({
          context: this.context,
          datum: seriesDatum,
          yValue,
          xValue
        }),
        defaults
      );
    }
    return toTooltipHtml(defaults);
  }
  formatLabelValue(value) {
    return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
  }
};

// enterprise-modules/sparklines/src/sparkline/bar-column/barSparkline.ts
var { isNumber: isNumber2 } = import_ag_charts_community6._Util;
var { BandScale: BandScale4 } = import_ag_charts_community6._Scale;
var BarSparkline = class extends BarColumnSparkline {
  updateYScaleRange() {
    const { seriesRect, yScale } = this;
    yScale.range = [0, seriesRect.width];
  }
  updateXScaleRange() {
    const { xScale, seriesRect, paddingOuter, paddingInner } = this;
    if (xScale instanceof BandScale4) {
      xScale.range = [0, seriesRect.height];
      xScale.paddingInner = paddingInner;
      xScale.paddingOuter = paddingOuter;
    } else {
      const step = this.calculateStep(seriesRect.height);
      const padding = step * paddingOuter;
      this.bandWidth = step * (1 - paddingInner);
      xScale.range = [padding, seriesRect.height - padding - this.bandWidth];
    }
  }
  updateAxisLine() {
    const { yScale, axis, axisLine, seriesRect } = this;
    const { strokeWidth } = axis;
    axisLine.x1 = 0;
    axisLine.x2 = 0;
    axisLine.y1 = 0;
    axisLine.y2 = seriesRect.height;
    axisLine.stroke = axis.stroke;
    axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
    const yZero = yScale.convert(0);
    axisLine.translationX = yZero;
  }
  generateNodeData() {
    const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth, label } = this;
    if (!data) {
      return;
    }
    const {
      fontStyle: labelFontStyle,
      fontWeight: labelFontWeight,
      fontSize: labelFontSize,
      fontFamily: labelFontFamily,
      color: labelColor,
      formatter: labelFormatter,
      placement: labelPlacement
    } = label;
    const nodeData = [];
    const yZero = yScale.convert(0);
    const continuous = !(xScale instanceof BandScale4);
    for (let i = 0, n = yData.length; i < n; i++) {
      let yDatum = yData[i];
      const xDatum = xData[i];
      const invalidDatum = yDatum === void 0;
      if (invalidDatum) {
        yDatum = 0;
      }
      const y = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
      const x = Math.min(yDatum === void 0 ? NaN : yScale.convert(yDatum), yZero);
      const bottom = Math.max(yDatum === void 0 ? NaN : yScale.convert(yDatum), yZero);
      const height = !continuous ? xScale.bandwidth : this.bandWidth;
      const width = bottom - x;
      const midPoint = {
        x: yZero,
        y
      };
      let labelText;
      if (labelFormatter) {
        labelText = labelFormatter({ value: yDatum });
      } else {
        labelText = yDatum !== void 0 && isNumber2(yDatum) ? this.formatLabelValue(yDatum) : "";
      }
      const labelY = y + height / 2;
      let labelX;
      const labelTextBaseline = "middle";
      let labelTextAlign;
      const isPositiveY = yDatum !== void 0 && yDatum >= 0;
      const labelPadding = 4;
      if (labelPlacement === "center" /* Center */) {
        labelX = x + width / 2;
        labelTextAlign = "center";
      } else if (labelPlacement === "outsideEnd" /* OutsideEnd */) {
        labelX = x + (isPositiveY ? width + labelPadding : -labelPadding);
        labelTextAlign = isPositiveY ? "start" : "end";
      } else if (labelPlacement === "insideEnd" /* InsideEnd */) {
        labelX = x + (isPositiveY ? width - labelPadding : labelPadding);
        labelTextAlign = isPositiveY ? "end" : "start";
        const textSize = import_ag_charts_community6._Scene.Text.getTextSize(labelText, labelFontFamily);
        const textWidth = textSize.width || 20;
        const positiveBoundary = yZero + textWidth;
        const negativeBoundary = yZero - textWidth;
        const exceedsBoundaries = isPositiveY && labelX < positiveBoundary || !isPositiveY && labelX > negativeBoundary;
        if (exceedsBoundaries) {
          labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
          labelTextAlign = isPositiveY ? "start" : "end";
        }
      } else {
        labelX = yZero + labelPadding * (isPositiveY ? 1 : -1);
        labelTextAlign = isPositiveY ? "start" : "end";
      }
      nodeData.push({
        x,
        y,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        seriesDatum: { x: xDatum, y: invalidDatum ? void 0 : yDatum },
        point: midPoint,
        label: {
          x: labelX,
          y: labelY,
          text: labelText,
          fontStyle: labelFontStyle,
          fontWeight: labelFontWeight,
          fontSize: labelFontSize,
          fontFamily: labelFontFamily,
          textAlign: labelTextAlign,
          textBaseline: labelTextBaseline,
          fill: labelColor
        }
      });
    }
    return nodeData;
  }
  getDistance(p1, p2) {
    return Math.abs(p1.y - p2.y);
  }
};
BarSparkline.className = "BarSparkline";

// enterprise-modules/sparklines/src/sparkline/bar-column/columnSparkline.ts
var import_ag_charts_community7 = require("ag-charts-community");
var { isNumber: isNumber3 } = import_ag_charts_community7._Util;
var { BandScale: BandScale5 } = import_ag_charts_community7._Scale;
var ColumnSparkline = class extends BarColumnSparkline {
  updateYScaleRange() {
    const { seriesRect, yScale } = this;
    yScale.range = [seriesRect.height, 0];
  }
  updateXScaleRange() {
    const { xScale, seriesRect, paddingOuter, paddingInner } = this;
    if (xScale instanceof BandScale5) {
      xScale.range = [0, seriesRect.width];
      xScale.paddingInner = paddingInner;
      xScale.paddingOuter = paddingOuter;
    } else {
      const step = this.calculateStep(seriesRect.width);
      const padding = step * paddingOuter;
      this.bandWidth = step * (1 - paddingInner);
      xScale.range = [padding, seriesRect.width - padding - this.bandWidth];
    }
  }
  updateAxisLine() {
    const { yScale, axis, axisLine, seriesRect } = this;
    const { strokeWidth } = axis;
    axisLine.x1 = 0;
    axisLine.x2 = seriesRect.width;
    axisLine.y1 = 0;
    axisLine.y2 = 0;
    axisLine.stroke = axis.stroke;
    axisLine.strokeWidth = strokeWidth + (strokeWidth % 2 === 1 ? 1 : 0);
    const yZero = yScale.convert(0);
    axisLine.translationY = yZero;
  }
  generateNodeData() {
    const { data, yData, xData, xScale, yScale, fill, stroke, strokeWidth, label } = this;
    if (!data) {
      return;
    }
    const {
      fontStyle: labelFontStyle,
      fontWeight: labelFontWeight,
      fontSize: labelFontSize,
      fontFamily: labelFontFamily,
      color: labelColor,
      formatter: labelFormatter,
      placement: labelPlacement
    } = label;
    const nodeData = [];
    const yZero = yScale.convert(0);
    const continuous = !(xScale instanceof BandScale5);
    for (let i = 0, n = yData.length; i < n; i++) {
      let yDatum = yData[i];
      const xDatum = xData[i];
      const invalidDatum = yDatum === void 0;
      if (invalidDatum) {
        yDatum = 0;
      }
      const y = Math.min(yDatum === void 0 ? NaN : yScale.convert(yDatum), yZero);
      const x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum);
      const bottom = Math.max(yDatum === void 0 ? NaN : yScale.convert(yDatum), yZero);
      const width = !continuous ? xScale.bandwidth : this.bandWidth;
      const height = bottom - y;
      const midPoint = {
        x: x + width / 2,
        y: yZero
      };
      let labelText;
      if (labelFormatter) {
        labelText = labelFormatter({ value: yDatum });
      } else {
        labelText = yDatum !== void 0 && isNumber3(yDatum) ? this.formatLabelValue(yDatum) : "";
      }
      const labelX = x + width / 2;
      let labelY;
      const labelTextAlign = "center";
      let labelTextBaseline;
      const isPositiveY = yDatum !== void 0 && yDatum >= 0;
      const labelPadding = 2;
      if (labelPlacement === "center" /* Center */) {
        labelY = y + height / 2;
        labelTextBaseline = "middle";
      } else if (labelPlacement === "outsideEnd" /* OutsideEnd */) {
        labelY = y + (isPositiveY ? -labelPadding : height + labelPadding);
        labelTextBaseline = isPositiveY ? "bottom" : "top";
      } else if (labelPlacement === "insideEnd" /* InsideEnd */) {
        labelY = y + (isPositiveY ? labelPadding : height - labelPadding);
        labelTextBaseline = isPositiveY ? "top" : "bottom";
        const textSize = import_ag_charts_community7._Scene.Text.getTextSize(labelText, labelFontFamily);
        const textHeight = textSize.height || 10;
        const positiveBoundary = yZero - textHeight;
        const negativeBoundary = yZero + textHeight;
        const exceedsBoundaries = isPositiveY && labelY > positiveBoundary || !isPositiveY && labelY < negativeBoundary;
        if (exceedsBoundaries) {
          labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
          labelTextBaseline = isPositiveY ? "bottom" : "top";
        }
      } else {
        labelY = yZero + labelPadding * (isPositiveY ? -1 : 1);
        labelTextBaseline = isPositiveY ? "bottom" : "top";
      }
      nodeData.push({
        x,
        y,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        seriesDatum: { x: xDatum, y: invalidDatum ? void 0 : yDatum },
        point: midPoint,
        label: {
          x: labelX,
          y: labelY,
          text: labelText,
          fontStyle: labelFontStyle,
          fontWeight: labelFontWeight,
          fontSize: labelFontSize,
          fontFamily: labelFontFamily,
          textAlign: labelTextAlign,
          textBaseline: labelTextBaseline,
          fill: labelColor
        }
      });
    }
    return nodeData;
  }
};
ColumnSparkline.className = "ColumnSparkline";

// enterprise-modules/sparklines/src/sparkline/agSparkline.ts
var import_ag_charts_community8 = require("ag-charts-community");
var { isNumber: isNumber4 } = import_ag_charts_community8._Util;
var AgSparkline = class {
  static create(options, tooltip) {
    options = import_ag_charts_community8._Util.deepClone(options);
    const sparkline = getSparklineInstance(options.type);
    if (tooltip) {
      sparkline.tooltip = tooltip;
    }
    initSparkline(sparkline, options);
    initSparklineByType(sparkline, options);
    if (options.data) {
      sparkline.data = options.data;
    }
    sparkline.processedOptions = options;
    return sparkline;
  }
};
function getSparklineInstance(type = "line") {
  switch (type) {
    case "column":
      return new ColumnSparkline();
    case "bar":
      return new BarSparkline();
    case "area":
      return new AreaSparkline();
    case "line":
    default:
      return new LineSparkline();
  }
}
function initSparklineByType(sparkline, options) {
  switch (options.type) {
    case "bar":
      initBarColumnSparkline(sparkline, options);
      break;
    case "column":
      initBarColumnSparkline(sparkline, options);
      break;
    case "area":
      initAreaSparkline(sparkline, options);
      break;
    case "line":
    default:
      initLineSparkline(sparkline, options);
      break;
  }
}
function initSparkline(sparkline, options) {
  setValueIfPropertyExists(sparkline, "context", options.context, options);
  setValueIfPropertyExists(sparkline, "width", options.width, options);
  setValueIfPropertyExists(sparkline, "height", options.height, options);
  setValueIfPropertyExists(sparkline, "container", options.container, options);
  setValueIfPropertyExists(sparkline, "xKey", options.xKey, options);
  setValueIfPropertyExists(sparkline, "yKey", options.yKey, options);
  if (options.padding) {
    initPaddingOptions(sparkline.padding, options.padding);
  }
  if (options.axis) {
    initAxisOptions(sparkline.axis, options.axis);
  }
  if (options.highlightStyle) {
    initHighlightStyleOptions(sparkline.highlightStyle, options.highlightStyle);
  }
}
function initLineSparkline(sparkline, options) {
  if (options.marker) {
    initMarkerOptions(sparkline.marker, options.marker);
  }
  if (options.line) {
    initLineOptions(sparkline.line, options.line);
  }
  if (options.crosshairs) {
    initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
  }
}
function initAreaSparkline(sparkline, options) {
  setValueIfPropertyExists(sparkline, "fill", options.fill, options);
  if (options.marker) {
    initMarkerOptions(sparkline.marker, options.marker);
  }
  if (options.line) {
    initLineOptions(sparkline.line, options.line);
  }
  if (options.crosshairs) {
    initCrosshairsOptions(sparkline.crosshairs, options.crosshairs);
  }
}
function initBarColumnSparkline(sparkline, options) {
  setValueIfPropertyExists(sparkline, "valueAxisDomain", options.valueAxisDomain, options);
  setValueIfPropertyExists(sparkline, "fill", options.fill, options);
  setValueIfPropertyExists(sparkline, "stroke", options.stroke, options);
  setValueIfPropertyExists(sparkline, "strokeWidth", options.strokeWidth, options);
  setValueIfPropertyExists(sparkline, "paddingInner", options.paddingInner, options);
  setValueIfPropertyExists(sparkline, "paddingOuter", options.paddingOuter, options);
  setValueIfPropertyExists(sparkline, "formatter", options.formatter, options);
  if (options.label) {
    initLabelOptions(sparkline.label, options.label);
  }
}
function initPaddingOptions(target, options) {
  setValueIfPropertyExists(target, "top", options.top, options);
  setValueIfPropertyExists(target, "right", options.right, options);
  setValueIfPropertyExists(target, "bottom", options.bottom, options);
  setValueIfPropertyExists(target, "left", options.left, options);
}
function initMarkerOptions(target, options) {
  setValueIfPropertyExists(target, "enabled", options.enabled, options);
  setValueIfPropertyExists(target, "size", options.size, options);
  setValueIfPropertyExists(target, "shape", options.shape, options);
  setValueIfPropertyExists(target, "fill", options.fill, options);
  setValueIfPropertyExists(target, "stroke", options.stroke, options);
  setValueIfPropertyExists(target, "strokeWidth", options.strokeWidth, options);
  setValueIfPropertyExists(target, "formatter", options.formatter, options);
}
function initLabelOptions(target, options) {
  setValueIfPropertyExists(target, "enabled", options.enabled, options);
  setValueIfPropertyExists(target, "fontStyle", options.fontStyle, options);
  setValueIfPropertyExists(target, "fontWeight", options.fontWeight, options);
  setValueIfPropertyExists(target, "fontSize", options.fontSize, options);
  setValueIfPropertyExists(target, "fontFamily", options.fontFamily, options);
  setValueIfPropertyExists(target, "textAlign", options.textAlign, options);
  setValueIfPropertyExists(target, "textBaseline", options.textBaseline, options);
  setValueIfPropertyExists(target, "color", options.color, options);
  setValueIfPropertyExists(target, "formatter", options.formatter, options);
  setValueIfPropertyExists(target, "placement", options.placement, options);
}
function initLineOptions(target, options) {
  setValueIfPropertyExists(target, "stroke", options.stroke, options);
  setValueIfPropertyExists(target, "strokeWidth", options.strokeWidth, options);
}
function initAxisOptions(target, options) {
  setValueIfPropertyExists(target, "type", options.type, options);
  setValueIfPropertyExists(target, "stroke", options.stroke, options);
  setValueIfPropertyExists(target, "strokeWidth", options.strokeWidth, options);
}
function initHighlightStyleOptions(target, options) {
  setValueIfPropertyExists(target, "fill", options.fill, options);
  setValueIfPropertyExists(target, "size", options.size, options);
  setValueIfPropertyExists(target, "stroke", options.stroke, options);
  setValueIfPropertyExists(target, "strokeWidth", options.strokeWidth, options);
}
function initCrosshairsOptions(target, options) {
  if (target.xLine && options.xLine) {
    initCrosshairLineOptions(target.xLine, options.xLine);
  }
  if (target.yLine && options.yLine) {
    initCrosshairLineOptions(target.yLine, options.yLine);
  }
}
function initCrosshairLineOptions(target, options) {
  setValueIfPropertyExists(target, "enabled", options.enabled, options);
  setValueIfPropertyExists(target, "stroke", options.stroke, options);
  setValueIfPropertyExists(target, "strokeWidth", options.strokeWidth, options);
  setValueIfPropertyExists(target, "lineDash", options.lineDash, options);
  setValueIfPropertyExists(target, "lineCap", options.lineCap, options);
}
var doOnceFlags = {};
function doOnce(func, key) {
  if (doOnceFlags[key]) {
    return;
  }
  func();
  doOnceFlags[key] = true;
}
var offsetValidator = (property, value, defaultOffset) => {
  if (isNumber4(value)) {
    return true;
  }
  const message = `AG Charts: ${property} must be a number, the value you provided is not a valid number. Using the default of ${defaultOffset}px.`;
  doOnce(() => console.warn(message), `${property} not a number`);
  return false;
};
var validators = {
  xOffset: offsetValidator,
  yOffset: offsetValidator
};
function setValueIfPropertyExists(target, property, value, options) {
  if (property in options) {
    if (property in target) {
      const validator = validators[property];
      const isValid = validator ? validator(property, value, target[property]) : true;
      if (isValid && target[property] !== value) {
        target[property] = value;
      }
    } else {
      console.warn(`Property ${property} does not exist on the target object.`);
    }
  }
}

// enterprise-modules/sparklines/src/sparklineCellRenderer.ts
var _SparklineCellRenderer = class _SparklineCellRenderer extends import_core.Component {
  constructor() {
    super(_SparklineCellRenderer.TEMPLATE);
  }
  init(params) {
    let firstTimeIn = true;
    const updateSparkline = () => {
      const { clientWidth, clientHeight } = this.getGui();
      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }
      if (firstTimeIn) {
        const options = __spreadValues({
          data: params.value,
          width: clientWidth,
          height: clientHeight,
          context: {
            data: params.data
          }
        }, params.sparklineOptions);
        this.sparkline = AgSparkline.create(options, this.sparklineTooltipSingleton.getSparklineTooltip());
        this.eSparkline.appendChild(this.sparkline.canvasElement);
        firstTimeIn = false;
      } else {
        this.sparkline.width = clientWidth;
        this.sparkline.height = clientHeight;
      }
    };
    const unsubscribeFromResize = this.resizeObserverService.observeResize(this.getGui(), updateSparkline);
    this.addDestroyFunc(() => unsubscribeFromResize());
  }
  refresh(params) {
    if (this.sparkline) {
      this.sparkline.data = params.value;
      return true;
    }
    return false;
  }
  destroy() {
    if (this.sparkline) {
      this.sparkline.destroy();
    }
    super.destroy();
  }
};
_SparklineCellRenderer.TEMPLATE = `<div class="ag-sparkline-wrapper">
            <span ref="eSparkline"></span>
        </div>`;
__decorateClass([
  (0, import_core.RefSelector)("eSparkline")
], _SparklineCellRenderer.prototype, "eSparkline", 2);
__decorateClass([
  (0, import_core.Autowired)("resizeObserverService")
], _SparklineCellRenderer.prototype, "resizeObserverService", 2);
__decorateClass([
  (0, import_core.Autowired)("sparklineTooltipSingleton")
], _SparklineCellRenderer.prototype, "sparklineTooltipSingleton", 2);
var SparklineCellRenderer = _SparklineCellRenderer;

// enterprise-modules/sparklines/src/tooltip/sparklineTooltipSingleton.ts
var import_core2 = require("@ag-grid-community/core");
var SparklineTooltipSingleton = class extends import_core2.BeanStub {
  postConstruct() {
    this.tooltip = new SparklineTooltip();
  }
  getSparklineTooltip() {
    return this.tooltip;
  }
  destroyTooltip() {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
  }
};
__decorateClass([
  import_core2.PostConstruct
], SparklineTooltipSingleton.prototype, "postConstruct", 1);
__decorateClass([
  import_core2.PreDestroy
], SparklineTooltipSingleton.prototype, "destroyTooltip", 1);
SparklineTooltipSingleton = __decorateClass([
  (0, import_core2.Bean)("sparklineTooltipSingleton")
], SparklineTooltipSingleton);

// enterprise-modules/sparklines/src/version.ts
var VERSION = "31.3.4";

// enterprise-modules/sparklines/src/sparklinesModule.ts
var SparklinesModule = {
  version: VERSION,
  moduleName: import_core3.ModuleNames.SparklinesModule,
  beans: [SparklineTooltipSingleton],
  userComponents: [{ componentName: "agSparklineCellRenderer", componentClass: SparklineCellRenderer }],
  dependantModules: [import_core4.EnterpriseCoreModule]
};
