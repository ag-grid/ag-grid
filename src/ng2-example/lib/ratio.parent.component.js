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
// both this and the parent component could be folded into one component as they're both simple, but it illustrates how
// a fuller example could work
var RatioParentComponent = (function () {
    function RatioParentComponent() {
        this.params = {
            value: { top: 0.25, bottom: 0.75 }
        };
    }
    RatioParentComponent.prototype.agInit = function (params) {
        this.params = params;
    };
    RatioParentComponent = __decorate([
        core_1.Component({
            selector: 'ratio-cell',
            template: "\n    <ag-ratio style=\"height:20px\" [topRatio]=\"params?.value?.top\" [bottomRatio]=\"params?.value?.bottom\">\n    </ag-ratio>\n    ",
            styles: ["\n        ag-ratio {\n          display: block;\n          overflow:hidden;\n          border:1px solid #ccc;\n          border-radius:6px;\n          background: #fff;\n        }\n    "]
        }), 
        __metadata('design:paramtypes', [])
    ], RatioParentComponent);
    return RatioParentComponent;
}());
exports.RatioParentComponent = RatioParentComponent;
//# sourceMappingURL=ratio.parent.component.js.map