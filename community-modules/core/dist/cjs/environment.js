/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var utils_1 = require("./utils");
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
        listItemHeight: MAT_GRID_SIZE * 5,
        rowHeight: MAT_GRID_SIZE * 6,
        chartMenuPanelWidth: 240
    },
    'ag-theme-balham': {
        headerHeight: BALHAM_GRID_SIZE * 8,
        headerCellMinWidth: 24,
        listItemHeight: BALHAM_GRID_SIZE * 7,
        rowHeight: BALHAM_GRID_SIZE * 7,
        chartMenuPanelWidth: 220
    },
    'ag-theme-alpine': {
        headerHeight: ALPINE_GRID_SIZE * 8,
        headerCellMinWidth: 36,
        listItemHeight: ALPINE_GRID_SIZE * 5,
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
var CALCULATED_SIZES = {};
var Environment = /** @class */ (function () {
    function Environment() {
    }
    Environment.prototype.getSassVariable = function (theme, key) {
        var useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : theme.match('balham') ? 'balham' : theme.match('alpine') ? 'alpine' : 'custom');
        var defaultValue = HARD_CODED_SIZES[useTheme][key];
        var calculatedValue = 0;
        if (!CALCULATED_SIZES[theme]) {
            CALCULATED_SIZES[theme] = {};
        }
        if (CALCULATED_SIZES[theme][key]) {
            return CALCULATED_SIZES[theme][key];
        }
        if (SASS_PROPERTY_BUILDER[key]) {
            var classList = SASS_PROPERTY_BUILDER[key];
            var div = document.createElement('div');
            div.style.position = 'absolute';
            var el = classList.reduce(function (el, currentClass, idx) {
                if (idx === 0) {
                    utils_1._.addCssClass(el, theme);
                }
                var div = document.createElement('div');
                div.style.position = 'static';
                utils_1._.addCssClass(div, currentClass);
                el.appendChild(div);
                return div;
            }, div);
            if (document.body) {
                document.body.appendChild(div);
                var sizeName = key.toLowerCase().indexOf('height') !== -1 ? 'height' : 'width';
                calculatedValue = parseInt(window.getComputedStyle(el)[sizeName], 10);
                document.body.removeChild(div);
            }
        }
        CALCULATED_SIZES[theme][key] = calculatedValue || defaultValue;
        return CALCULATED_SIZES[theme][key];
    };
    Environment.prototype.isThemeDark = function () {
        var theme = this.getTheme().theme;
        return !!theme && theme.indexOf('dark') >= 0;
    };
    Environment.prototype.chartMenuPanelWidth = function () {
        var theme = this.getTheme().themeFamily;
        return this.getSassVariable(theme, 'chartMenuPanelWidth');
    };
    Environment.prototype.getTheme = function () {
        var reg = /\bag-(material|(?:theme-([\w\-]*)))\b/;
        var el = this.eGridDiv;
        var themeMatch;
        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement;
            }
            else {
                break;
            }
        }
        if (!themeMatch) {
            return {};
        }
        var theme = themeMatch[0];
        var usingOldTheme = themeMatch[2] === undefined;
        if (usingOldTheme) {
            var newTheme_1 = theme.replace('ag-', 'ag-theme-');
            utils_1._.doOnce(function () { return console.warn("ag-Grid: As of v19 old theme are no longer provided. Please replace " + theme + " with " + newTheme_1 + "."); }, 'using-old-theme');
        }
        return { theme: theme, el: el, themeFamily: theme.replace(/-dark$/, '') };
    };
    __decorate([
        context_1.Autowired('eGridDiv')
    ], Environment.prototype, "eGridDiv", void 0);
    Environment = __decorate([
        context_1.Bean('environment')
    ], Environment);
    return Environment;
}());
exports.Environment = Environment;

//# sourceMappingURL=environment.js.map
