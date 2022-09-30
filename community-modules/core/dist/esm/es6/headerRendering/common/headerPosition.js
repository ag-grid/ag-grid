/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, Bean } from "../../context/context";
import { ColumnGroup } from "../../entities/columnGroup";
import { HeaderRowType } from "../row/headerRowComp";
let HeaderPositionUtils = class HeaderPositionUtils extends BeanStub {
    findHeader(focusedHeader, direction) {
        let nextColumn;
        let getGroupMethod;
        let getColMethod;
        if (focusedHeader.column instanceof ColumnGroup) {
            getGroupMethod = `getDisplayedGroup${direction}`;
            nextColumn = this.columnModel[getGroupMethod](focusedHeader.column);
        }
        else {
            getColMethod = `getDisplayedCol${direction}`;
            nextColumn = this.columnModel[getColMethod](focusedHeader.column);
        }
        if (nextColumn) {
            return {
                column: nextColumn,
                headerRowIndex: focusedHeader.headerRowIndex
            };
        }
    }
    findColAtEdgeForHeaderRow(level, position) {
        const displayedColumns = this.columnModel.getAllDisplayedColumns();
        const column = displayedColumns[position === 'start' ? 0 : displayedColumns.length - 1];
        if (!column) {
            return;
        }
        const childContainer = this.ctrlsService.getHeaderRowContainerCtrl(column.getPinned());
        const type = childContainer.getRowType(level);
        if (type == HeaderRowType.COLUMN_GROUP) {
            const columnGroup = this.columnModel.getColumnGroupAtLevel(column, level);
            return {
                headerRowIndex: level,
                column: columnGroup
            };
        }
        return {
            // if type==null, means the header level didn't exist
            headerRowIndex: type == null ? -1 : level,
            column
        };
    }
};
__decorate([
    Autowired('columnModel')
], HeaderPositionUtils.prototype, "columnModel", void 0);
__decorate([
    Autowired('ctrlsService')
], HeaderPositionUtils.prototype, "ctrlsService", void 0);
HeaderPositionUtils = __decorate([
    Bean('headerPositionUtils')
], HeaderPositionUtils);
export { HeaderPositionUtils };
