"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatingFilterMapper = void 0;
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
        group: 'agGroupColumnFloatingFilter',
        agGroupColumnFilter: 'agGroupColumnFloatingFilter',
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
