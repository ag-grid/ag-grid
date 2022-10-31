/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const events_1 = require("../events");
let ColumnHoverService = class ColumnHoverService extends beanStub_1.BeanStub {
    setMouseOver(columns) {
        this.selectedColumns = columns;
        const event = {
            type: events_1.Events.EVENT_COLUMN_HOVER_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    clearMouseOver() {
        this.selectedColumns = null;
        const event = {
            type: events_1.Events.EVENT_COLUMN_HOVER_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    isHovered(column) {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }
};
ColumnHoverService = __decorate([
    context_1.Bean('columnHoverService')
], ColumnHoverService);
exports.ColumnHoverService = ColumnHoverService;
