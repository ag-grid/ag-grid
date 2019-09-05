/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var utils_1 = require("./utils");
var MAT_GRID_SIZE = 8;
var FRESH_GRID_SIZE = 4;
var BALHAM_GRID_SIZE = 4;
var HARD_CODED_SIZES = {
    'ag-theme-material': {
        headerHeight: MAT_GRID_SIZE * 7,
        virtualItemHeight: MAT_GRID_SIZE * 5,
        rowHeight: MAT_GRID_SIZE * 6
    },
    'ag-theme-classic': {
        headerHeight: 25,
        virtualItemHeight: FRESH_GRID_SIZE * 5,
        rowHeight: 25
    },
    'ag-theme-balham': {
        headerHeight: BALHAM_GRID_SIZE * 8,
        virtualItemHeight: BALHAM_GRID_SIZE * 7,
        rowHeight: BALHAM_GRID_SIZE * 7
    }
};
/**
 * this object contains a list of Sass variables and an array
 * of CSS styles required to get the correct value.
 * eg. $virtual-item-height requires a structure, so we can get it's height.
 * <div class="ag-theme-balham">
 *     <div class="ag-virtual-list-container">
 *         <div class="ag-virtual-list-item"></div>
 *     </div>
 */
var SASS_PROPERTY_BUILDER = {
    headerHeight: ['ag-header-row'],
    virtualItemHeight: ['ag-virtual-list-container', 'ag-virtual-list-item'],
    rowHeight: ['ag-row']
};
var CALCULATED_SIZES = {};
var Environment = /** @class */ (function () {
    function Environment() {
    }
    Environment.prototype.getSassVariable = function (theme, key) {
        var useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : (theme.match('balham') ? 'balham' : 'classic'));
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
            var el = classList.reduce(function (el, currentClass, idx) {
                if (idx === 0) {
                    utils_1._.addCssClass(el, theme);
                }
                var div = document.createElement('div');
                utils_1._.addCssClass(div, currentClass);
                el.appendChild(div);
                return div;
            }, div);
            if (document.body) {
                document.body.appendChild(div);
                calculatedValue = parseInt(window.getComputedStyle(el).height, 10);
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
    Environment.prototype.getTheme = function () {
        var reg = /\bag-(fresh|dark|blue|material|bootstrap|(?:theme-([\w\-]*)))\b/;
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
        return { theme: theme, el: el };
    };
    __decorate([
        context_1.Autowired('eGridDiv'),
        __metadata("design:type", HTMLElement)
    ], Environment.prototype, "eGridDiv", void 0);
    Environment = __decorate([
        context_1.Bean('environment')
    ], Environment);
    return Environment;
}());
exports.Environment = Environment;
