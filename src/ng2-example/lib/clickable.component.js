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
var ClickableComponent = (function () {
    function ClickableComponent() {
        this.onClicked = new core_1.EventEmitter();
    }
    ClickableComponent.prototype.click = function () {
        this.onClicked.emit(this.cell);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], ClickableComponent.prototype, "cell", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], ClickableComponent.prototype, "onClicked", void 0);
    ClickableComponent = __decorate([
        core_1.Component({
            selector: 'ag-clickable',
            template: "\n    <button (click)=\"click()\">Click Me</button>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], ClickableComponent);
    return ClickableComponent;
}());
exports.ClickableComponent = ClickableComponent;
//# sourceMappingURL=clickable.component.js.map