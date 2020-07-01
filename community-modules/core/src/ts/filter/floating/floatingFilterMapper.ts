export class FloatingFilterMapper {
    private static filterToFloatingFilterMapping: { [p: string]: string; } = {
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

    public static getFloatingFilterType(filterType: string): string {
        return this.filterToFloatingFilterMapping[filterType];
    }
}
