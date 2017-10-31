/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v14.0.0
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
var themes = ['fresh', 'dark', 'blue', 'bootstrap', 'material', 'theme-material'];
var themeCLass = new RegExp("ag-(" + themes.join('|') + ")");
var Environment = (function () {
    function Environment() {
    }
    Environment.prototype.getTheme = function () {
        var themeMatch;
        var element = this.eGridDiv;
        while (element != document.documentElement && themeMatch == null) {
            themeMatch = element.className.match(themeCLass);
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
