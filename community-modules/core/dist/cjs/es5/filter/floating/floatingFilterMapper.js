/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.3.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FloatingFilterMapper = /** @class */ (function () {
    function FloatingFilterMapper() {
    }
    FloatingFilterMapper.getFloatingFilterType = function (filterType) {
        return this.filterToFloatingFilterMapping[filterType];
    };
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
    return FloatingFilterMapper;
}());
exports.FloatingFilterMapper = FloatingFilterMapper;

//# sourceMappingURL=floatingFilterMapper.js.map
