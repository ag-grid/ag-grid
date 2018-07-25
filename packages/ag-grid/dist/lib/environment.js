/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
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
var themeNames = ['fresh', 'dark', 'blue', 'bootstrap', 'material', 'balham-dark', 'balham'];
var themes = themeNames.concat(themeNames.map(function (name) { return "theme-" + name; }));
var themeClass = new RegExp("ag-(" + themes.join('|') + ")");
var matGridSize = 8;
var freshGridSize = 4;
var balhamGridSize = 4;
var HARD_CODED_SIZES = {
    'ag-theme-material': {
        headerHeight: matGridSize * 7,
        virtualItemHeight: matGridSize * 5,
        rowHeight: matGridSize * 6
    },
    'ag-theme-classic': {
        headerHeight: 25,
        virtualItemHeight: freshGridSize * 5,
        rowHeight: 25
    },
    'ag-theme-balham': {
        headerHeight: balhamGridSize * 8,
        virtualItemHeight: balhamGridSize * 7,
        rowHeight: balhamGridSize * 7
    }
};
var Environment = (function () {
    function Environment() {
        this.sassVariables = {};
    }
    // Approach described here:
    // https://www.ofcodeandcolor.com/2017/04/02/encoding-data-in-css/
    Environment.prototype.loadSassVariables = function () {
        /*
        var element = document.createElement('div');
        element.className = 'sass-variables';
        this.eGridDiv.appendChild(element);

        var content = window.getComputedStyle(element, '::after').content;

        try {
            this.sassVariables = JSON.parse(JSON.parse(content));
        } catch (e) {
            throw new Error("Failed loading the theme sizing - check that you have the theme set up correctly.");
        }

        this.eGridDiv.removeChild(element);
        */
    };
    Environment.prototype.getSassVariable = function (theme, key) {
        if (theme == 'ag-theme-material') {
            return HARD_CODED_SIZES['ag-theme-material'][key];
        }
        else if (theme == 'ag-theme-balham' || theme == 'ag-theme-balham-dark') {
            return HARD_CODED_SIZES['ag-theme-balham'][key];
        }
        return HARD_CODED_SIZES['ag-theme-classic'][key];
        /*
        const result = parseInt(this.sassVariables[key]);
        if (!result || isNaN(result)) {
            throw new Error(`Failed loading ${key} Sass variable from ${this.sassVariables}`);
        }
        return result;
        */
    };
    Environment.prototype.getTheme = function () {
        var themeMatch;
        var element = this.eGridDiv;
        while (element != document.documentElement && themeMatch == null) {
            themeMatch = element.className.match(themeClass);
            element = element.parentElement;
            if (element == null) {
                break;
            }
        }
        if (themeMatch) {
            return themeMatch[0];
        }
        else {
            return 'ag-fresh';
        }
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
