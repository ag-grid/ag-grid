/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var Environment = /** @class */ (function () {
    function Environment() {
    }
    Environment.prototype.getSassVariable = function (theme, key) {
        if (theme == 'ag-theme-material') {
            return HARD_CODED_SIZES['ag-theme-material'][key];
        }
        else if (theme == 'ag-theme-balham' || theme == 'ag-theme-balham-dark') {
            return HARD_CODED_SIZES['ag-theme-balham'][key];
        }
        return HARD_CODED_SIZES['ag-theme-classic'][key];
    };
    Environment.prototype.isThemeDark = function () {
        var theme = this.getTheme();
        return !!theme && theme.indexOf('dark') >= 0;
    };
    Environment.prototype.getTheme = function () {
        var reg = /\bag-(fresh|dark|blue|material|bootstrap|(?:theme-([\w\-]*)))\b/;
        var el = this.eGridDiv;
        var themeMatch;
        while (el) {
            themeMatch = reg.exec(el.className);
            el = el.parentElement;
            if (el == null || themeMatch) {
                break;
            }
        }
        if (!themeMatch) {
            return;
        }
        var theme = themeMatch[0];
        var usingOldTheme = themeMatch[2] === undefined;
        if (usingOldTheme) {
            var newTheme_1 = theme.replace('ag-', 'ag-theme-');
            utils_1._.doOnce(function () { return console.warn("ag-Grid: As of v19 old theme are no longer provided. Please replace " + theme + " with " + newTheme_1 + "."); }, 'using-old-theme');
        }
        return theme;
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
