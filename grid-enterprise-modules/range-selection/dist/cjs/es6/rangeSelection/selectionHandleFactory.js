"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionHandleFactory = void 0;
const core_1 = require("@ag-grid-community/core");
const rangeHandle_1 = require("./rangeHandle");
const fillHandle_1 = require("./fillHandle");
let SelectionHandleFactory = class SelectionHandleFactory extends core_1.BeanStub {
    createSelectionHandle(type) {
        return this.createBean(type === core_1.SelectionHandleType.RANGE ? new rangeHandle_1.RangeHandle() : new fillHandle_1.FillHandle());
    }
};
SelectionHandleFactory = __decorate([
    core_1.Bean('selectionHandleFactory')
], SelectionHandleFactory);
exports.SelectionHandleFactory = SelectionHandleFactory;
