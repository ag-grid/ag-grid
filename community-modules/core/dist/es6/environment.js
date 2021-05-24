/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { Bean, Autowired } from './context/context';
import { BeanStub } from "./context/beanStub";
import { addCssClass } from './utils/dom';
import { doOnce } from './utils/function';
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
var CALCULATED_SIZES = {};
var Environment = /** @class */ (function (_super) {
    __extends(Environment, _super);
    function Environment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Environment.prototype.getSassVariable = function (theme, key) {
        var useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : theme.match('balham') ? 'balham' : theme.match('alpine') ? 'alpine' : 'custom');
        var defaultValue = HARD_CODED_SIZES[useTheme][key];
        var calculatedValue = 0;
        if (!CALCULATED_SIZES[theme]) {
            CALCULATED_SIZES[theme] = {};
        }
        var size = CALCULATED_SIZES[theme][key];
        if (size != null) {
            return size;
        }
        if (SASS_PROPERTY_BUILDER[key]) {
            var classList = SASS_PROPERTY_BUILDER[key];
            var div = document.createElement('div');
            addCssClass(div, theme);
            div.style.position = 'absolute';
            var el = classList.reduce(function (prevEl, currentClass) {
                var currentDiv = document.createElement('div');
                currentDiv.style.position = 'static';
                addCssClass(currentDiv, currentClass);
                prevEl.appendChild(currentDiv);
                return currentDiv;
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
        var themeMatch = null;
        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement || undefined;
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
            doOnce(function () { return console.warn("AG Grid: As of v19 old theme are no longer provided. Please replace " + theme + " with " + newTheme_1 + "."); }, 'using-old-theme');
        }
        return { theme: theme, el: el, themeFamily: theme.replace(/-dark$/, '') };
    };
    __decorate([
        Autowired('eGridDiv')
    ], Environment.prototype, "eGridDiv", void 0);
    Environment = __decorate([
        Bean('environment')
    ], Environment);
    return Environment;
}(BeanStub));
export { Environment };
