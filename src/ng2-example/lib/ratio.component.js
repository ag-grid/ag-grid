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
var core_1 = require('@angular/core');
var RatioComponent = (function () {
    function RatioComponent() {
        this.topRatio = 0.67;
        this.bottomRatio = 0.50;
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], RatioComponent.prototype, "topRatio", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], RatioComponent.prototype, "bottomRatio", void 0);
    RatioComponent = __decorate([
        core_1.Component({
            selector: 'ag-ratio',
            template: "\n    <svg viewBox=\"0 0 300 100\" preserveAspectRatio=\"none\">\n      <rect x=\"0\" y=\"0\" [attr.width]=\"topRatio * 300\" height=\"50\" rx=\"4\" ry=\"4\" class=\"topBar\" />\n      <rect x=\"0\" y=\"50\" [attr.width]=\"bottomRatio * 300\" height=\"50\" rx=\"4\" ry=\"4\" class=\"bottomBar\" />\n    </svg>\n  ",
            styles: ["\n    svg {\n      width:100%;\n      height:100%;\n      pointer-events: none;\n    }\n\n    .topBar {\n      fill: #ff9933;\n    }\n\n    .bottomBar {\n      fill: #6699ff;\n    }\n  "]
        }), 
        __metadata('design:paramtypes', [])
    ], RatioComponent);
    return RatioComponent;
}());
exports.RatioComponent = RatioComponent;
//# sourceMappingURL=ratio.component.js.map