/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFilterMapper = void 0;
class FloatingFilterMapper {
    static getFloatingFilterType(filterType) {
        return this.filterToFloatingFilterMapping[filterType];
    }
}
exports.FloatingFilterMapper = FloatingFilterMapper;
FloatingFilterMapper.filterToFloatingFilterMapping = {
    set: 'agSetColumnFloatingFilter',
    agSetColumnFilter: 'agSetColumnFloatingFilter',
    multi: 'agMultiColumnFloatingFilter',
    agMultiColumnFilter: 'agMultiColumnFloatingFilter',
    number: 'agNumberColumnFloatingFilter',
    agNumberColumnFilter: 'agNumberColumnFloatingFilter',
    date: 'agDateColumnFloatingFilter',
    agDateColumnFilter: 'agDateColumnFloatingFilter',
    text: 'agTextColumnFloatingFilter',
    agTextColumnFilter: 'agTextColumnFloatingFilter'
};
