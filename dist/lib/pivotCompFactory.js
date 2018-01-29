// ag-grid-enterprise v16.0.1
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
var main_1 = require("ag-grid/main");
var pivotColumnsPanel_1 = require("./toolPanel/columnDrop/pivotColumnsPanel");
var PivotCompFactory = (function () {
    function PivotCompFactory() {
    }
    PivotCompFactory.prototype.create = function () {
        var pivotComp = new pivotColumnsPanel_1.PivotColumnsPanel(true);
        this.context.wireBean(pivotComp);
        return pivotComp;
    };
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], PivotCompFactory.prototype, "context", void 0);
    PivotCompFactory = __decorate([
        main_1.Bean('pivotCompFactory')
    ], PivotCompFactory);
    return PivotCompFactory;
}());
exports.PivotCompFactory = PivotCompFactory;
