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
var ClickableParentComponent = (function () {
    function ClickableParentComponent() {
    }
    ClickableParentComponent.prototype.agInit = function (params) {
        this.params = params;
        this.cell = { row: params.value, col: params.colDef.headerName };
    };
    ClickableParentComponent.prototype.clicked = function (cell) {
        console.log("Child Cell Clicked: " + JSON.stringify(cell));
    };
    ClickableParentComponent = __decorate([
        core_1.Component({
            selector: 'clickable-cell',
            template: "\n    <ag-clickable (onClicked)=\"clicked($event)\" [cell]=\"cell\"></ag-clickable>\n    "
        }), 
        __metadata('design:paramtypes', [])
    ], ClickableParentComponent);
    return ClickableParentComponent;
}());
exports.ClickableParentComponent = ClickableParentComponent;
//# sourceMappingURL=clickable.parent.component.js.map