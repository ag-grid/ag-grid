var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub.mjs";
import { Bean } from "../context/context.mjs";
import { Events } from "../events.mjs";
let ColumnHoverService = class ColumnHoverService extends BeanStub {
    setMouseOver(columns) {
        this.selectedColumns = columns;
        const event = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    clearMouseOver() {
        this.selectedColumns = null;
        const event = {
            type: Events.EVENT_COLUMN_HOVER_CHANGED
        };
        this.eventService.dispatchEvent(event);
    }
    isHovered(column) {
        return !!this.selectedColumns && this.selectedColumns.indexOf(column) >= 0;
    }
};
ColumnHoverService = __decorate([
    Bean('columnHoverService')
], ColumnHoverService);
export { ColumnHoverService };
