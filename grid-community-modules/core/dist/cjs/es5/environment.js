/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = void 0;
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var generic_1 = require("./utils/generic");
var eventKeys_1 = require("./eventKeys");
var DEFAULT_ROW_HEIGHT = 25;
var MIN_COL_WIDTH = 10;
var MAT_GRID_SIZE = 8;
var BASE_GRID_SIZE = 4;
var BALHAM_GRID_SIZE = 4;
var ALPINE_GRID_SIZE = 6;
var HARD_CODED_SIZES = {
    // this item is required for custom themes
    'ag-theme-custom': {
        headerHeight: 25,
        headerCellMinWidth: 24,
        listItemHeight: BASE_GRID_SIZE * 5,
        rowHeight: 25,
        chartMenuPanelWidth: 220
    },
    'ag-theme-material': {
        headerHeight: MAT_GRID_SIZE * 7,
        headerCellMinWidth: 48,
        listItemHeight: MAT_GRID_SIZE * 4,
        rowHeight: MAT_GRID_SIZE * 6,
        chartMenuPanelWidth: 240
    },
    'ag-theme-balham': {
        headerHeight: BALHAM_GRID_SIZE * 8,
        headerCellMinWidth: 24,
        listItemHeight: BALHAM_GRID_SIZE * 6,
        rowHeight: BALHAM_GRID_SIZE * 7,
        chartMenuPanelWidth: 220
    },
    'ag-theme-alpine': {
        headerHeight: ALPINE_GRID_SIZE * 8,
        headerCellMinWidth: 36,
        listItemHeight: ALPINE_GRID_SIZE * 4,
        rowHeight: ALPINE_GRID_SIZE * 7,
        chartMenuPanelWidth: 240
    }
};
/**
 * this object contains a list of Sass variables and an array
 * of CSS styles required to get the correct value.
 * eg. $virtual-item-height requires a structure, so we can get its height.
 * <div class="ag-theme-balham">
 *     <div class="ag-virtual-list-container">
 *         <div class="ag-virtual-list-item"></div>
 *     </div>
 * </div>
 */
var SASS_PROPERTY_BUILDER = {
    headerHeight: ['ag-header-row'],
    headerCellMinWidth: ['ag-header-cell'],
    listItemHeight: ['ag-virtual-list-item'],
    rowHeight: ['ag-row'],
    chartMenuPanelWidth: ['ag-chart-docked-container']
};
var Environment = /** @class */ (function (_super) {
    __extends(Environment, _super);
    function Environment() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.calculatedSizes = {};
        return _this;
    }
    Environment.prototype.postConstruct = function () {
        var _this = this;
        var _a;
        var el = (_a = this.getTheme().el) !== null && _a !== void 0 ? _a : this.eGridDiv;
        this.mutationObserver = new MutationObserver(function () {
            _this.calculatedSizes = {};
            _this.fireGridStylesChangedEvent();
        });
        this.mutationObserver.observe(el || this.eGridDiv, {
            attributes: true,
            attributeFilter: ['class']
        });
    };
    Environment.prototype.fireGridStylesChangedEvent = function () {
        var event = {
            type: eventKeys_1.Events.EVENT_GRID_STYLES_CHANGED
        };
        this.eventService.dispatchEvent(event);
    };
    Environment.prototype.getSassVariable = function (key) {
        var _a = this.getTheme(), themeFamily = _a.themeFamily, el = _a.el;
        if (!themeFamily || themeFamily.indexOf('ag-theme') !== 0) {
            return;
        }
        if (!this.calculatedSizes) {
            this.calculatedSizes = {};
        }
        if (!this.calculatedSizes[themeFamily]) {
            this.calculatedSizes[themeFamily] = {};
        }
        var size = this.calculatedSizes[themeFamily][key];
        if (size != null) {
            return size;
        }
        this.calculatedSizes[themeFamily][key] = this.calculateValueForSassProperty(key, themeFamily, el);
        return this.calculatedSizes[themeFamily][key];
    };
    Environment.prototype.calculateValueForSassProperty = function (property, theme, themeElement) {
        var _a;
        var useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : theme.match('balham') ? 'balham' : theme.match('alpine') ? 'alpine' : 'custom');
        var defaultValue = HARD_CODED_SIZES[useTheme][property];
        var eDocument = this.gridOptionsService.getDocument();
        if (!themeElement) {
            themeElement = this.eGridDiv;
        }
        if (!SASS_PROPERTY_BUILDER[property]) {
            return defaultValue;
        }
        var classList = SASS_PROPERTY_BUILDER[property];
        var div = eDocument.createElement('div');
        // this will apply SASS variables that were manually added to the current theme
        var classesFromThemeElement = Array.from(themeElement.classList);
        (_a = div.classList).add.apply(_a, __spread([theme], classesFromThemeElement));
        div.style.position = 'absolute';
        var el = classList.reduce(function (prevEl, currentClass) {
            var currentDiv = eDocument.createElement('div');
            currentDiv.style.position = 'static';
            currentDiv.classList.add(currentClass);
            prevEl.appendChild(currentDiv);
            return currentDiv;
        }, div);
        var calculatedValue = 0;
        if (eDocument.body) {
            eDocument.body.appendChild(div);
            var sizeName = property.toLowerCase().indexOf('height') !== -1 ? 'height' : 'width';
            calculatedValue = parseInt(window.getComputedStyle(el)[sizeName], 10);
            eDocument.body.removeChild(div);
        }
        return calculatedValue || defaultValue;
    };
    Environment.prototype.isThemeDark = function () {
        var theme = this.getTheme().theme;
        return !!theme && theme.indexOf('dark') >= 0;
    };
    Environment.prototype.chartMenuPanelWidth = function () {
        return this.getSassVariable('chartMenuPanelWidth');
    };
    Environment.prototype.getTheme = function () {
        var reg = /\bag-(material|(?:theme-([\w\-]*)))\b/g;
        var el = this.eGridDiv;
        var themeMatch = null;
        var allThemes = [];
        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement || undefined;
            }
            else {
                var matched = el.className.match(reg);
                if (matched) {
                    allThemes = matched;
                }
                break;
            }
        }
        if (!themeMatch) {
            return { allThemes: allThemes };
        }
        var theme = themeMatch[0];
        return { theme: theme, el: el, themeFamily: theme.replace(/-dark$/, ''), allThemes: allThemes };
    };
    Environment.prototype.getFromTheme = function (defaultValue, sassVariableName) {
        var _a;
        return (_a = this.getSassVariable(sassVariableName)) !== null && _a !== void 0 ? _a : defaultValue;
    };
    Environment.prototype.getDefaultRowHeight = function () {
        return this.getFromTheme(DEFAULT_ROW_HEIGHT, 'rowHeight');
    };
    Environment.prototype.getListItemHeight = function () {
        return this.getFromTheme(20, 'listItemHeight');
    };
    Environment.prototype.setRowHeightVariable = function (height) {
        var oldRowHeight = this.eGridDiv.style.getPropertyValue('--ag-line-height').trim();
        var newRowHeight = height + "px";
        if (oldRowHeight != newRowHeight) {
            this.eGridDiv.style.setProperty('--ag-line-height', newRowHeight);
        }
    };
    Environment.prototype.getMinColWidth = function () {
        var measuredMin = this.getFromTheme(null, 'headerCellMinWidth');
        return generic_1.exists(measuredMin) ? Math.max(measuredMin, MIN_COL_WIDTH) : MIN_COL_WIDTH;
    };
    Environment.prototype.destroy = function () {
        this.calculatedSizes = null;
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        _super.prototype.destroy.call(this);
    };
    __decorate([
        context_1.Autowired('eGridDiv')
    ], Environment.prototype, "eGridDiv", void 0);
    __decorate([
        context_1.PostConstruct
    ], Environment.prototype, "postConstruct", null);
    Environment = __decorate([
        context_1.Bean('environment')
    ], Environment);
    return Environment;
}(beanStub_1.BeanStub));
exports.Environment = Environment;
