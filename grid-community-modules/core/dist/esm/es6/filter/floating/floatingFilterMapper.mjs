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
    group: 'agGroupColumnFloatingFilter',
    agGroupColumnFilter: 'agGroupColumnFloatingFilter',
    number: 'agNumberColumnFloatingFilter',
    agNumberColumnFilter: 'agNumberColumnFloatingFilter',
    date: 'agDateColumnFloatingFilter',
    agDateColumnFilter: 'agDateColumnFloatingFilter',
    text: 'agTextColumnFloatingFilter',
    agTextColumnFilter: 'agTextColumnFloatingFilter'
};
