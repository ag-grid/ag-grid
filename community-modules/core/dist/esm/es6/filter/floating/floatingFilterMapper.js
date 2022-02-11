/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
export class FloatingFilterMapper {
    static getFloatingFilterType(filterType) {
        return this.filterToFloatingFilterMapping[filterType];
    }
}
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
