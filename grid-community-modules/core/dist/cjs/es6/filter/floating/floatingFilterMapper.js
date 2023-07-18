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
    group: 'agGroupColumnFloatingFilter',
    agGroupColumnFilter: 'agGroupColumnFloatingFilter',
    number: 'agNumberColumnFloatingFilter',
    agNumberColumnFilter: 'agNumberColumnFloatingFilter',
    date: 'agDateColumnFloatingFilter',
    agDateColumnFilter: 'agDateColumnFloatingFilter',
    text: 'agTextColumnFloatingFilter',
    agTextColumnFilter: 'agTextColumnFloatingFilter'
};
