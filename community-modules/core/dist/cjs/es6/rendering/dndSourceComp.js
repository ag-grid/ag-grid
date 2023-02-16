/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.DndSourceComp = void 0;
const component_1 = require("../widgets/component");
const context_1 = require("../context/context");
const icon_1 = require("../utils/icon");
class DndSourceComp extends component_1.Component {
    constructor(rowNode, column, beans, eCell) {
        super(`<div class="ag-drag-handle ag-row-drag" draggable="true"></div>`);
        this.rowNode = rowNode;
        this.column = column;
        this.beans = beans;
        this.eCell = eCell;
    }
    postConstruct() {
        const eGui = this.getGui();
        eGui.appendChild(icon_1.createIconNoSpan('rowDrag', this.beans.gridOptionsService, null));
        // we need to stop the event propagation here to avoid starting a range selection while dragging
        this.addGuiEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        this.addDragSource();
        this.checkVisibility();
    }
    addDragSource() {
        this.addGuiEventListener('dragstart', this.onDragStart.bind(this));
    }
    onDragStart(dragEvent) {
        const providedOnRowDrag = this.column.getColDef().dndSourceOnRowDrag;
        dragEvent.dataTransfer.setDragImage(this.eCell, 0, 0);
        // default behaviour is to convert data to json and set into drag component
        const defaultOnRowDrag = () => {
            try {
                const jsonData = JSON.stringify(this.rowNode.data);
                dragEvent.dataTransfer.setData('application/json', jsonData);
                dragEvent.dataTransfer.setData('text/plain', jsonData);
            }
            catch (e) {
                // if we cannot convert the data to json, then we do not set the type
            }
        };
        if (providedOnRowDrag) {
            const params = {
                rowNode: this.rowNode, dragEvent: dragEvent,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            };
            providedOnRowDrag(params);
        }
        else {
            defaultOnRowDrag();
        }
    }
    checkVisibility() {
        const visible = this.column.isDndSource(this.rowNode);
        this.setDisplayed(visible);
    }
}
__decorate([
    context_1.PostConstruct
], DndSourceComp.prototype, "postConstruct", null);
exports.DndSourceComp = DndSourceComp;
