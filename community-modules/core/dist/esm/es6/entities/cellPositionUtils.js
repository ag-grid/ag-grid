/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "../context/context";
import { BeanStub } from "../context/beanStub";
let CellPositionUtils = class CellPositionUtils extends BeanStub {
    createId(cellPosition) {
        const { rowIndex, rowPinned, column } = cellPosition;
        return this.createIdFromValues({ rowIndex, column, rowPinned });
    }
    createIdFromValues(cellPosition) {
        const { rowIndex, rowPinned, column } = cellPosition;
        return `${rowIndex}.${rowPinned == null ? 'null' : rowPinned}.${column.getId()}`;
    }
    equals(cellA, cellB) {
        const colsMatch = cellA.column === cellB.column;
        const floatingMatch = cellA.rowPinned === cellB.rowPinned;
        const indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    }
};
CellPositionUtils = __decorate([
    Bean('cellPositionUtils')
], CellPositionUtils);
export { CellPositionUtils };
