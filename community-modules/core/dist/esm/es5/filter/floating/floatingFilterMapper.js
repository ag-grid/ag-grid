/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
export { FloatingFilterMapper };
